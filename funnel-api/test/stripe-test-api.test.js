import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/stripe-test-worker.js";

class MemoryD1 {
  constructor(){this.orders=[];this.sessions=[];this.events=[];}
  prepare(sql){
    const db=this;
    return {bind(...args){return{
      async first(){
        if(sql.startsWith("SELECT id, funnel, stage, total_cents, created_at")) {
          const row=db.orders.find(x=>x.token_hash===args[0]);return row?{...row}:null;
        }
        if(sql.startsWith("SELECT state, checkout_url FROM stripe_test_sessions")) {
          return db.sessions.find(x=>x.order_id===args[0]&&x.offer_stage===args[1])||null;
        }
        if(sql.startsWith("SELECT state,stripe_session_id,checkout_url,amount_cents")) {
          return db.sessions.find(x=>x.order_id===args[0]&&x.offer_stage===args[1])||null;
        }
        if(sql.startsWith("SELECT o.funnel,o.stage AS order_stage")) {
          const order=db.orders.find(x=>x.id===args[0]);
          const session=db.sessions.find(x=>x.order_id===args[0]&&x.offer_stage===args[1]);
          return order&&session?{funnel:order.funnel,order_stage:order.stage,amount_cents:session.amount_cents,state:session.state,stripe_session_id:session.stripe_session_id}:null;
        }
        throw Error("Unexpected SELECT "+sql);
      },
      async run(){
        if(sql.startsWith("INSERT INTO stripe_test_orders")) {
          const [id,token_hash,funnel,created_at,updated_at,expires_at]=args;
          db.orders.push({id,token_hash,funnel,stage:"primary_pending",total_cents:0,created_at,updated_at,expires_at});
          return {meta:{changes:1}};
        }
        if(sql.startsWith("INSERT OR IGNORE INTO stripe_test_sessions")) {
          const [stage,amount_cents,created_at,orderId,expectedStage,now]=args;
          const o=db.orders.find(x=>x.id===orderId&&x.stage===expectedStage&&x.expires_at>now);
          if(!o||db.sessions.some(x=>x.order_id===orderId&&x.offer_stage===stage))return {meta:{changes:0}};
          db.sessions.push({order_id:orderId,offer_stage:stage,amount_cents,created_at,state:"reserved",stripe_session_id:null,checkout_url:null});
          return {meta:{changes:1}};
        }
        if(sql.startsWith("UPDATE stripe_test_sessions SET stripe_session_id")) {
          const [id,url,orderId,stage,checkId]=args;
          const s=db.sessions.find(x=>x.order_id===orderId&&x.offer_stage===stage&&x.state==="reserved"&&(!x.stripe_session_id||x.stripe_session_id===checkId));
          if(!s)return {meta:{changes:0}};
          Object.assign(s,{stripe_session_id:id,checkout_url:url,state:"open"});
          return {meta:{changes:1}};
        }
        if(sql.startsWith("INSERT OR IGNORE INTO stripe_test_events")) {
          const [event_id,session_id,received_at]=args;
          if(db.events.some(x=>x.event_id===event_id))return {meta:{changes:0}};
          db.events.push({event_id,session_id,received_at});
          return {meta:{changes:1}};
        }
        if(sql.startsWith("UPDATE stripe_test_sessions SET state='paid'")) {
          const [id,paid_at,orderId,stage,checkId]=args;
          const s=db.sessions.find(x=>x.order_id===orderId&&x.offer_stage===stage&&["open","reserved"].includes(x.state)&&(!x.stripe_session_id||x.stripe_session_id===checkId));
          if(!s)return {meta:{changes:0}};
          Object.assign(s,{state:"paid",stripe_session_id:id,paid_at});
          return {meta:{changes:1}};
        }
        if(sql.startsWith("UPDATE stripe_test_orders SET stage=?, total_cents")) {
          const [stage,increment,updated_at,orderId,expected,checkOrder,checkStage,checkSession]=args;
          const o=db.orders.find(x=>x.id===orderId&&x.stage===expected);
          const s=db.sessions.find(x=>x.order_id===checkOrder&&x.offer_stage===checkStage&&x.stripe_session_id===checkSession&&x.state==="paid");
          if(!o||!s)return {meta:{changes:0}};
          Object.assign(o,{stage,total_cents:o.total_cents+increment,updated_at});
          return {meta:{changes:1}};
        }
        if(sql.startsWith("UPDATE stripe_test_orders SET stage=?,updated_at")) {
          const [stage,updated_at,orderId,expected,now,checkOrder,checkStage]=args;
          const o=db.orders.find(x=>x.id===orderId&&x.stage===expected&&x.expires_at>now);
          if(!o||db.sessions.some(x=>x.order_id===checkOrder&&x.offer_stage===checkStage))return {meta:{changes:0}};
          Object.assign(o,{stage,updated_at});return {meta:{changes:1}};
        }
        throw Error("Unexpected UPDATE/INSERT "+sql);
      }
    }}}
  }
  async batch(statements){const out=[];for(const st of statements)out.push(await st.run());return out;}
}
const env=()=>({
  STRIPE_TEST_ENABLED:"true",STRIPE_SECRET_KEY:"sk_test_fake",STRIPE_WEBHOOK_SECRET:"whsec_unit_test",
  DEMO_API_KEY:"dev-only-test",STRIPE_TEST_RETURN_BASE:"https://test-checkout.example.com",DB:new MemoryD1()
});
function request(path,body,header="dev-only-test"){
 const headers={"content-type":"application/json"};
 if(header!==null)headers["x-demo-key"]=header;
 return new Request("https://test-checkout.example.com"+path,{method:"POST",headers,body:JSON.stringify(body)});
}
async function call(e,path,data,header="dev-only-test",fetcher) {
 const req=request(path,data,header);
 const r=await app.fetch(req,{...e, _fakeFetch:fetcher});
 return {status:r.status,data:await r.json()};
}
// Route is tested with a controllable global fetch, never the Stripe network.
function stripeMock(){
  let count=0;
  const calls=[];
  return {calls,fetch:async(url,init)=>{
    const form=new URLSearchParams(init.body);
    const cents=Number(form.get("line_items[0][price_data][unit_amount]"));
    const id="cs_test_mock_"+(++count);
    calls.push({url,form,id,init});
    return new Response(JSON.stringify({
      id,livemode:false,amount_total:cents,currency:"eur",
      url:"https://checkout.stripe.com/c/pay/"+id
    }),{status:200,headers:{"content-type":"application/json"}});
  }};
}
async function post(e,path,data,fetcher,header="dev-only-test") {
 const response=await app.fetch(request(path,data,header),e,undefined,fetcher);
 return {status:response.status,data:await response.json()};
}
async function signature(raw,secret) {
 const ts=Math.floor(Date.now()/1000);
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),"HMAC",{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const bytes=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(ts+"."+raw));
 const hex=Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,"0")).join("");
 return "t="+ts+",v1="+hex;
}
async function paidWebhook(e,order,session,amount,eventId) {
 const body=JSON.stringify({
  id:eventId, type:"checkout.session.completed",
  data:{object:{
   id:session.id,livemode:false,mode:"payment",payment_status:"paid",
   currency:"eur",amount_total:amount,client_reference_id:order.id,
   metadata:{order_id:order.id,offer_stage:session.offer_stage,environment:"test"}
  }}
 });
 const req=new Request("https://test-checkout.example.com/api/stripe-test/webhook",{
   method:"POST",headers:{"Stripe-Signature":await signature(body,e.STRIPE_WEBHOOK_SECRET)},
   body
 });
 const response=await app.fetch(req,e);
 return {status:response.status,data:await response.json()};
}
test("test checkout remains locked without sk_test key or flag",async()=>{
 const e=env();
 assert.equal((await post({...e,STRIPE_TEST_ENABLED:"false"},"/api/stripe-test/start",{funnel:"mental"})).status,503);
 assert.equal((await post({...e,STRIPE_SECRET_KEY:"sk_live_fake"},"/api/stripe-test/start",{funnel:"mental"})).status,503);
 assert.equal((await post(e,"/api/stripe-test/start",{funnel:"mental"},undefined,null)).status,401);
});
test("acceptance only after signed paid webhook, sequential test checkout upsell",async()=>{
 const e=env();const fake=stripeMock();
 // Import the handler directly with fetch injection, bypassing Worker entry for mocking.
 const {handleStripeTest}=await import("../src/stripe-test.js");
 const send=async(p,b,key)=>{const r=await handleStripeTest(request(p,b,key),e,fake.fetch);return {status:r.status,data:await r.json()};};
 const start=await send("/api/stripe-test/start",{funnel:"mental"},"dev-only-test");
 assert.equal(start.status,201);
 assert.match(start.data.checkoutUrl,/checkout\.stripe\.com/);
 const token=start.data.token;
 let state=await send("/api/stripe-test/state",{token},null);
 assert.equal(state.data.stage,"primary_pending");
 assert.equal(state.data.totalCents,0);
 assert.equal((await send("/api/stripe-test/decide",{token,stage:"upsell1",accept:true},null)).status,409);
 const order=e.DB.orders[0],primary=e.DB.sessions[0];
 const event=await paidWebhook(e,order,primary,4700,"evt_test_primary");
 assert.equal(event.status,200);assert.equal(event.data.processed,true);
 const again=await paidWebhook(e,order,primary,4700,"evt_test_primary");
 assert.equal(again.status,200);assert.equal(again.data.duplicate,true);
 state=await send("/api/stripe-test/state",{token},null);
 assert.equal(state.data.stage,"upsell1");assert.equal(state.data.totalCents,4700);
 const yes=await send("/api/stripe-test/decide",{token,stage:"upsell1",accept:true},null);
 assert.equal(yes.status,201);
 assert.equal(fake.calls[1].form.get("line_items[0][price_data][unit_amount]"),"7000");
 const twice=await send("/api/stripe-test/decide",{token,stage:"upsell1",accept:true},null);
 assert.equal(twice.data.checkoutUrl,yes.data.checkoutUrl);
 assert.equal(fake.calls.length,2);
 assert.equal((await send("/api/stripe-test/decide",{token,stage:"upsell1",accept:false},null)).status,409);
 const upsell=e.DB.sessions[1];
 const event2=await paidWebhook(e,order,upsell,7000,"evt_test_upsell");
 assert.equal(event2.data.processed,true);
 state=await send("/api/stripe-test/state",{token},null);
 assert.equal(state.data.stage,"upsell2");assert.equal(state.data.totalCents,11700);
 const no=await send("/api/stripe-test/decide",{token,stage:"upsell2",accept:false},null);
 assert.equal(no.data.stage,"done");
 state=await send("/api/stripe-test/state",{token},null);
 assert.equal(state.data.totalCents,11700);
});
test("invalid amount or unsigned webhook never updates the order",async()=>{
 const e=env(),fake=stripeMock();
 const {handleStripeTest}=await import("../src/stripe-test.js");
 const r=await handleStripeTest(request("/api/stripe-test/start",{funnel:"mental"}),e,fake.fetch);
 assert.equal(r.status,201);
 const order=e.DB.orders[0],session=e.DB.sessions[0];
 const bad=await paidWebhook(e,order,session,999,"evt_bad_amount");
 assert.equal(bad.status,400);assert.equal(order.total_cents,0);
 const raw='{"id":"evt_fake","type":"checkout.session.completed","data":{"object":{}}}';
 const forged=await handleStripeTest(new Request("https://test-checkout.example.com/api/stripe-test/webhook",{method:"POST",headers:{"stripe-signature":"t=1111111111,v1=bad"},body:raw}),e,fake.fetch);
 assert.equal(forged.status,400);assert.equal(order.stage,"primary_pending");
});
