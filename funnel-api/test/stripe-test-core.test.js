import test from "node:test";
import assert from "node:assert/strict";
import {
  testReady,paymentOffer,nextAfterPaid,nextAfterDecline,returnBase,
  sessionParams,createStripeTestSession,stripeSignedEvent,makeToken,sha256
} from "../src/stripe-test-core.js";

const env=()=>({
  STRIPE_TEST_ENABLED:"true",
  STRIPE_SECRET_KEY:"sk_test_local_only",
  STRIPE_WEBHOOK_SECRET:"whsec_fake_local_only",
  STRIPE_TEST_RETURN_BASE:"https://checkout-test.example.com",
  DEMO_API_KEY:"dev-local",
  DB:{}
});
test("fail-closed if Stripe key is live or disabled",()=>{
  const e=env();assert.equal(testReady(e),true);
  assert.equal(testReady({...e,STRIPE_TEST_ENABLED:"false"}),false);
  assert.equal(testReady({...e,STRIPE_SECRET_KEY:"sk_live_dont_use"}),false);
  assert.equal(testReady({...e,STRIPE_WEBHOOK_SECRET:"invalid"}),false);
});
test("server-owned prices for Mental Pro, other lines still unpriced",()=>{
  assert.equal(paymentOffer("mental","primary").cents,4700);
  assert.equal(paymentOffer("mental","upsell1").cents,7000);
  assert.equal(paymentOffer("mental","upsell2").cents,10500);
  assert.equal(paymentOffer("mental","downsell").cents,4700);
  assert.equal(paymentOffer("libro","primary"),null);
  assert.equal(paymentOffer("formazione","primary"),null);
  assert.equal(paymentOffer("mental","other"),null);
});
test("Stripe test Checkout params include single test line-item and safe callbacks",()=>{
  const orderId="12345678-1234-1234-1234-123456789abc";
  const token="a".repeat(64);
  const p=sessionParams({offer:paymentOffer("mental","primary"),orderId,token,returnOrigin:"https://checkout-test.example.com:443/path"});
  assert.equal(p.get("line_items[0][price_data][unit_amount]"),"4700");
  assert.equal(p.get("line_items[0][price_data][currency]"),"eur");
  assert.equal(p.get("client_reference_id"),orderId);
  assert.equal(p.get("metadata[environment]"),"test");
  assert.match(p.get("success_url"),/\/api\/stripe-test\/return/);
  assert.ok(p.get("success_url").includes("{CHECKOUT_SESSION_ID}"));
  assert.equal(p.get("payment_method_types[0]"),"card");
  assert.throws(()=>returnBase("http://unsafe.example.com"),/HTTPS/);
});
test("Stripe API request enforces test mode and idempotent session keys",async()=>{
  const e=env(),orderId="12345678-1234-1234-1234-123456789abc";
  const captured=[];
  const fake=async(url,opts)=>{
    captured.push({url,opts});
    return new Response(JSON.stringify({
      id:"cs_test_mock_001",livemode:false,amount_total:4700,currency:"eur",
      url:"https://checkout.stripe.com/c/pay/cs_test_mock_001"
    }),{status:200,headers:{"content-type":"application/json"}});
  };
  const s=await createStripeTestSession(e,{orderId,token:"b".repeat(64),funnel:"mental",stage:"primary"},fake);
  assert.equal(s.amountCents,4700);
  assert.equal(captured[0].opts.headers["Idempotency-Key"],"boscia-test-"+orderId+"-primary");
  assert.equal(new URLSearchParams(captured[0].opts.body).get("metadata[order_id]"),orderId);
  const bad=async()=>new Response(JSON.stringify({id:"cs_live_1",livemode:true,amount_total:4700,currency:"eur",url:"https://checkout.stripe.com/c/hi"}),{status:200});
  await assert.rejects(createStripeTestSession(e,{orderId,token:"b".repeat(64),funnel:"mental",stage:"primary"},bad),/test-mode/);
});
test("HMAC v1 Stripe signature valid, tampered, stale and missing rejected",async()=>{
  const secret="whsec_webhook_for_tests";
  const raw=JSON.stringify({id:"evt_test_1",type:"checkout.session.completed",data:{object:{livemode:false}}});
  const time=1700000000;
  const cryptoKey=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const sig=Array.from(new Uint8Array(await crypto.subtle.sign("HMAC",cryptoKey,new TextEncoder().encode(time+"."+raw)))).map(b=>b.toString(16).padStart(2,"0")).join("");
  assert.equal((await stripeSignedEvent(raw,"t="+time+",v1="+sig,secret,time)).id,"evt_test_1");
  await assert.rejects(stripeSignedEvent(raw+" ","t="+time+",v1="+sig,secret,time),/signature/i);
  await assert.rejects(stripeSignedEvent(raw,"t="+time+",v1="+sig,secret,time+301),/signature/i);
  await assert.rejects(stripeSignedEvent(raw,null,secret,time),/signature/i);
});
test("offer transitions enforce conditional flow, strong tokens",async()=>{
  assert.equal(nextAfterPaid("primary"),"upsell1");
  assert.equal(nextAfterPaid("upsell1"),"upsell2");
  assert.equal(nextAfterPaid("downsell"),"done");
  assert.equal(nextAfterDecline("upsell1"),"downsell");
  assert.equal(nextAfterDecline("upsell2"),"done");
  assert.equal(nextAfterDecline("primary"),null);
  const token=makeToken(); assert.match(token,/^[a-f0-9]{64}$/);
  assert.match(await sha256(token),/^[a-f0-9]{64}$/);
});
