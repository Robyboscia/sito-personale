import { FUNNELS } from "./flow.js";

const enc = new TextEncoder();
const mode = "test";
const STAGES = new Set(["primary", "upsell1", "upsell2", "downsell"]);

export function testReady(env) {
  return env.STRIPE_TEST_ENABLED === "true"
    && typeof env.STRIPE_SECRET_KEY === "string"
    && env.STRIPE_SECRET_KEY.startsWith("sk_test_")
    && typeof env.STRIPE_WEBHOOK_SECRET === "string"
    && env.STRIPE_WEBHOOK_SECRET.startsWith("whsec_")
    && typeof env.DEMO_API_KEY === "string"
    && !!env.DB
    && typeof env.STRIPE_TEST_RETURN_BASE === "string";
}
export function paymentOffer(funnel, stage) {
  if (!Object.hasOwn(FUNNELS, funnel) || !STAGES.has(stage)) return null;
  const plan = FUNNELS[funnel];
  const offer = stage === "primary" ? plan.primary : plan[stage];
  if (!Number.isSafeInteger(offer.cents) || offer.cents < 50) return null;
  return { cents: offer.cents, label: offer.label, funnel, stage };
}
export function nextAfterPaid(stage) {
  const choices = { primary:"upsell1", upsell1:"upsell2", upsell2:"done", downsell:"done" };
  return choices[stage] || null;
}
export function nextAfterDecline(stage) {
  return stage === "upsell1" ? "downsell" : ["upsell2","downsell"].includes(stage) ? "done" : null;
}
export function returnBase(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("Return URL must be a plain HTTPS base");
  }
  return url.origin;
}
export function sessionParams({offer,orderId,token,returnOrigin}) {
  if (!offer || !/^[a-f0-9-]{36}$/.test(orderId) || !/^[a-f0-9]{64}$/.test(token)) {
    throw new Error("Invalid test checkout request");
  }
  const url = returnBase(returnOrigin);
  const success = new URL("/api/stripe-test/return",url);
  success.searchParams.set("token",token);
  success.searchParams.set("stripe_session_id","{CHECKOUT_SESSION_ID}");
  const cancel = new URL("/api/stripe-test/return",url);
  cancel.searchParams.set("token",token);
  cancel.searchParams.set("cancelled","1");
  const form = new URLSearchParams({
    mode:"payment", locale:"it",
    "payment_method_types[0]":"card",
    "line_items[0][price_data][currency]":"eur",
    "line_items[0][price_data][unit_amount]":String(offer.cents),
    "line_items[0][price_data][product_data][name]":"TEST · "+offer.label,
    "line_items[0][quantity]":"1",
    "client_reference_id":orderId,
    "metadata[order_id]":orderId,
    "metadata[offer_stage]":offer.stage,
    "metadata[environment]":mode,
    success_url:success.href,
    cancel_url:cancel.href
  });
  return form;
}
export async function createStripeTestSession(env,args,fetcher=fetch) {
  if (!testReady(env)) throw new Error("Stripe test mode is disabled");
  const offer = paymentOffer(args.funnel,args.stage);
  if (!offer) throw new Error("The requested offer is not priced");
  const form = sessionParams({offer,orderId:args.orderId,token:args.token,returnOrigin:env.STRIPE_TEST_RETURN_BASE});
  const resp=await fetcher("https://api.stripe.com/v1/checkout/sessions",{
    method:"POST",
    headers:{
      Authorization:"Bearer "+env.STRIPE_SECRET_KEY,
      "Content-Type":"application/x-www-form-urlencoded",
      "Idempotency-Key":"boscia-test-"+args.orderId+"-"+args.stage
    },
    body:form.toString()
  });
  if(!resp.ok) throw new Error("Stripe test session could not be created: HTTP "+resp.status);
  const data=await resp.json();
  if(!data || data.livemode!==false || typeof data.id!=="string" || !data.id.startsWith("cs_test_") ||
     data.amount_total!==offer.cents || data.currency!=="eur" ||
     typeof data.url!=="string" || !data.url.startsWith("https://checkout.stripe.com/")){
    throw new Error("Stripe response failed test-mode checks");
  }
  return {sessionId:data.id,url:data.url,amountCents:offer.cents};
}
function hex(bytes) {return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");}
export async function sha256(s) {return hex(new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s))));}
export function makeToken() {return hex(crypto.getRandomValues(new Uint8Array(32)));}
function safeHexEqual(a,b) {
  if(!/^[a-f0-9]{64}$/i.test(a)||!/^[a-f0-9]{64}$/i.test(b)) return false;
  const aa=a.toLowerCase(),bb=b.toLowerCase();let diff=0;
  for(let i=0;i<64;i++)diff|=aa.charCodeAt(i)^bb.charCodeAt(i);
  return diff===0;
}
export async function stripeSignedEvent(raw,header,secret,nowSeconds=Math.floor(Date.now()/1000)) {
  if(typeof raw!=="string"||raw.length>256000) throw new Error("Invalid webhook body");
  if(typeof secret!=="string"||!secret.startsWith("whsec_")||typeof header!=="string") throw new Error("Missing Stripe signature");
  const params=header.split(",").map(part=>part.trim().split("="));
  const ts=params.find(p=>p[0]==="t")?.[1];
  const signatures=params.filter(p=>p[0]==="v1").map(p=>p[1]);
  if(!/^\d{10,}$/.test(ts||"")||Math.abs(nowSeconds-Number(ts))>300||!signatures.length) throw new Error("Expired webhook signature");
  const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const data=enc.encode(ts+"."+raw);
  const expected=hex(new Uint8Array(await crypto.subtle.sign("HMAC",key,data)));
  if(!signatures.some(s=>safeHexEqual(s,expected))) throw new Error("Invalid Stripe signature");
  const parsed=JSON.parse(raw);
  if(!parsed||typeof parsed.id!=="string"||typeof parsed.type!=="string"||!parsed.data?.object)throw new Error("Malformed Stripe event");
  return parsed;
}
