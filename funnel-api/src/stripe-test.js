import html from "./test-return.html";
import { FUNNELS } from "./flow.js";
import {
  createStripeTestSession, makeToken, sha256, paymentOffer,
  nextAfterPaid, nextAfterDecline, stripeSignedEvent, testReady
} from "./stripe-test-core.js";

function json(value,status=200){
  return new Response(JSON.stringify(value),{
    status,headers:{
      "Content-Type":"application/json; charset=utf-8",
      "Cache-Control":"no-store",
      "Referrer-Policy":"no-referrer",
      "X-Content-Type-Options":"nosniff",
      "Content-Security-Policy":"default-src 'none'"
    }
  });
}
async function bodyJson(request){
  if(!(request.headers.get("content-type")||"").toLowerCase().startsWith("application/json"))throw new Error("Expected JSON");
  const s=await request.text();
  if(s.length>2048)throw new Error("Body too large");
  const body=JSON.parse(s);
  if(!body || typeof body!=="object" || Array.isArray(body))throw new Error("Bad body");
  return body;
}
async function find(db,token){
  if(typeof token!=="string" || !/^[a-f0-9]{64}$/.test(token))return null;
  const row=await db.prepare(
    "SELECT id, funnel, stage, total_cents, created_at, updated_at, expires_at FROM stripe_test_orders WHERE token_hash=?"
  ).bind(await sha256(token)).first();
  return row && row.expires_at>Date.now() ? row : null;
}
async function maybePending(db,row){
  if(row.stage==="primary_pending")return null;
  const session=await db.prepare(
    "SELECT state, checkout_url FROM stripe_test_sessions WHERE order_id=? AND offer_stage=?"
  ).bind(row.id,row.stage).first();
  return session?.state==="open" && typeof session.checkout_url==="string" ? session.checkout_url : null;
}
async function summarize(env,row){
  return {
    testOnly:true,stage:row.stage,funnel:row.funnel,totalCents:row.total_cents,
    offer:row.stage==="primary_pending"||row.stage==="done"?null:paymentOffer(row.funnel,row.stage),
    pendingUrl:await maybePending(env.DB,row)
  };
}
async function sessionFor(env,row,stage,token,fetcher){
  const offer=paymentOffer(row.funnel,stage);
  if(!offer) return json({error:"Il prodotto non ha ancora un prezzo confermato"},422);
  const now=Date.now();
  const inserted=await env.DB.prepare(
    "INSERT OR IGNORE INTO stripe_test_sessions (order_id,offer_stage,amount_cents,state,created_at) SELECT id, ?, ?, 'reserved', ? FROM stripe_test_orders WHERE id=? AND stage=? AND expires_at>?"
  ).bind(stage,offer.cents,now,row.id,stage==="primary"?"primary_pending":stage,now).run();
  const prior=await env.DB.prepare(
    "SELECT state,stripe_session_id,checkout_url,amount_cents FROM stripe_test_sessions WHERE order_id=? AND offer_stage=?"
  ).bind(row.id,stage).first();
  if(!prior || prior.amount_cents!==offer.cents)return json({error:"Offerta non più disponibile"},409);
  if(prior.state==="paid")return json({error:"Offerta già pagata"},409);
  if(prior.state==="open" && typeof prior.checkout_url==="string")return json({checkoutUrl:prior.checkout_url,stage,alreadyCreated:true,testOnly:true});
  try{
    const checkout=await createStripeTestSession(env,{
      orderId:row.id,funnel:row.funnel,stage,token
    },fetcher);
    await env.DB.prepare(
      "UPDATE stripe_test_sessions SET stripe_session_id=?, checkout_url=?, state='open' WHERE order_id=? AND offer_stage=? AND state='reserved' AND (stripe_session_id IS NULL OR stripe_session_id=?)"
    ).bind(checkout.sessionId,checkout.url,row.id,stage,checkout.sessionId).run();
    return json({checkoutUrl:checkout.url,stage,testOnly:true},201);
  }catch(e){
    console.error("Stripe test session creation failed",e?.name||"Error");
    return json({error:"Impossibile creare il checkout di prova. Riprova senza effettuare addebiti."},502);
  }
}
async function webHook(request,env){
  const length=Number(request.headers.get("content-length")||0);
  if(length>256000)return json({error:"Payload too large"},413);
  const raw=await request.text();
  let event;
  try {event=await stripeSignedEvent(raw,request.headers.get("stripe-signature"),env.STRIPE_WEBHOOK_SECRET);}
  catch{return json({error:"Firma Stripe non valida"},400);}
  if(!["checkout.session.completed","checkout.session.async_payment_succeeded"].includes(event.type)){
    return json({received:true,ignored:true});
  }
  const s=event.data.object;
  if(!s||s.livemode!==false||s.payment_status!=="paid"||s.mode!=="payment"||
     !/^cs_test_/.test(s.id||"")||s.metadata?.environment!=="test"||
     s.currency!=="eur" || typeof s.amount_total!=="number") {
    return json({error:"Evento non corrispondente a un pagamento test riuscito"},400);
  }
  const orderId=s.metadata?.order_id, stage=s.metadata?.offer_stage;
  if(typeof orderId!=="string" || typeof stage!=="string" || s.client_reference_id!==orderId){
    return json({error:"Riferimento ordine assente"},400);
  }
  const row=await env.DB.prepare(
    "SELECT o.funnel,o.stage AS order_stage,c.amount_cents,c.state,c.stripe_session_id FROM stripe_test_orders o JOIN stripe_test_sessions c ON o.id=c.order_id WHERE o.id=? AND c.offer_stage=?"
  ).bind(orderId,stage).first();
  if(!row)return json({received:true,ignored:true});
  const expected=paymentOffer(row.funnel,stage);
  if(!expected || s.amount_total!==expected.cents || row.amount_cents!==expected.cents ||
     (row.stripe_session_id && row.stripe_session_id!==s.id)){
    return json({error:"Importo o riferimento sessione non corrispondente"},400);
  }
  const nextStage=nextAfterPaid(stage);
  if(!nextStage) return json({error:"Fase inattesa"},400);
  const expectedStage=stage==="primary"?"primary_pending":stage;
  if(row.order_stage!==expectedStage){
    // Duplicate/replayed events must not update the order a second time.
    if(row.state==="paid")return json({received:true,duplicate:true});
    return json({error:"Stato ordine incompatibile"},409);
  }
  const now=Date.now();
  const result=await env.DB.batch([
    env.DB.prepare(
      "INSERT OR IGNORE INTO stripe_test_events (event_id,session_id,received_at) VALUES (?,?,?)"
    ).bind(event.id,s.id,now),
    env.DB.prepare(
      "UPDATE stripe_test_sessions SET state='paid', stripe_session_id=?, paid_at=? WHERE order_id=? AND offer_stage=? AND state IN ('reserved','open') AND (stripe_session_id IS NULL OR stripe_session_id=?)"
    ).bind(s.id,now,orderId,stage,s.id),
    env.DB.prepare(
      "UPDATE stripe_test_orders SET stage=?, total_cents=total_cents+?, updated_at=? WHERE id=? AND stage=? AND EXISTS (SELECT 1 FROM stripe_test_sessions WHERE order_id=? AND offer_stage=? AND stripe_session_id=? AND state='paid')"
    ).bind(nextStage,expected.cents,now,orderId,expectedStage,orderId,stage,s.id)
  ]);
  return json({received:true,processed:result[2]?.meta?.changes===1});
}

export async function handleStripeTest(request,env,fetcher=fetch){
  const path=new URL(request.url).pathname;
  if(path==="/api/stripe-test/return" && request.method==="GET"){
    if(!testReady(env))return json({error:"Checkout test disabilitato"},503);
    return new Response(html,{
      headers:{
        "Content-Type":"text/html; charset=utf-8",
        "Cache-Control":"no-store",
        "Referrer-Policy":"no-referrer",
        "X-Frame-Options":"DENY",
        "Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
      }
    });
  }
  if(request.method!=="POST")return json({error:"Metodo non consentito"},405);
  if(!testReady(env))return json({error:"Stripe TEST disabilitato o non configurato"},503);
  if(path==="/api/stripe-test/webhook")return webHook(request,env);
  let data;
  try{data=await bodyJson(request);}catch{return json({error:"JSON non valido"},400);}
  if(path==="/api/stripe-test/start"){
    if(request.headers.get("x-demo-key")!==env.DEMO_API_KEY){
      return json({error:"Solo ambiente di sviluppo autorizzato"},401);
    }
    if(typeof data.funnel!=="string"||!Object.hasOwn(FUNNELS,data.funnel))return json({error:"Funnel sconosciuto"},400);
    const offer=paymentOffer(data.funnel,"primary");
    if(!offer)return json({error:"Prodotto ancora senza prezzo"},422);
    const token=makeToken(),orderId=crypto.randomUUID(),now=Date.now();
    await env.DB.prepare(
      "INSERT INTO stripe_test_orders (id,token_hash,funnel,stage,total_cents,created_at,updated_at,expires_at) VALUES (?,?,?,'primary_pending',0,?,?,?)"
    ).bind(orderId,await sha256(token),data.funnel,now,now,now+7200000).run();
    return sessionFor(env,{id:orderId,funnel:data.funnel,stage:"primary_pending"},"primary",token,fetcher)
      .then(async response=>{
        const body=await response.json();
        return json({...body,token},response.status);
      });
  }
  const row=await find(env.DB,data.token);
  if(!row)return json({error:"Sessione scaduta o inesistente"},404);
  if(path==="/api/stripe-test/state"){
    return json(await summarize(env,row));
  }
  if(path==="/api/stripe-test/decide"){
    if(typeof data.stage!=="string"||data.stage!==row.stage || typeof data.accept!=="boolean"){
      return json({error:"Scelta non valida o offerta superata"},409);
    }
    const next=nextAfterDecline(data.stage);
    if(!next)return json({error:"Nessuna offerta modificabile"},409);
    if(data.accept===true)return sessionFor(env,row,data.stage,data.token,fetcher);
    const now=Date.now();
    const change=await env.DB.prepare(
      "UPDATE stripe_test_orders SET stage=?,updated_at=? WHERE id=? AND stage=? AND expires_at>? AND NOT EXISTS (SELECT 1 FROM stripe_test_sessions WHERE order_id=? AND offer_stage=?)"
    ).bind(next,now,row.id,row.stage,now,row.id,row.stage).run();
    if(change.meta?.changes!==1)return json({error:"L'offerta è già in lavorazione"},409);
    return json({stage:next,testOnly:true,accepted:false});
  }
  return json({error:"Non trovato"},404);
}
