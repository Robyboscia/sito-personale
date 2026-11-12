import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/index.js";

// Deliberately tiny in-memory D1 fake: verifies HTTP/state behavior,
// not Cloudflare's SQL runtime. Integration tests against D1 are still required.
class FakeD1 {
  constructor() { this.orders = []; this.events = []; }
  prepare(sql) {
    const db = this;
    return {
      bind(...values) {
        return {
          async first() {
            if (sql.startsWith("SELECT id, funnel")) {
              const row = db.orders.find(o => o.token_hash === values[0]);
              return row ? {...row} : null;
            }
            throw Error("Unsupported first: " + sql);
          },
          async run() {
            if (sql.startsWith("INSERT INTO demo_orders")) {
              const [id,token_hash,funnel,stage,total_cents,created_at,updated_at,expires_at] = values;
              db.orders.push({id,token_hash,funnel,stage,total_cents,version:0,created_at,updated_at,expires_at});
              return { meta: { changes: 1 } };
            }
            if (sql.startsWith("UPDATE demo_orders")) {
              const [stage,total_cents,updated_at,id,oldStage,oldVersion,now] = values;
              const row = db.orders.find(x => x.id === id && x.stage === oldStage && x.version === oldVersion && x.expires_at > now);
              if (!row) return { meta: { changes: 0 } };
              Object.assign(row, {stage,total_cents,updated_at,version:row.version+1});
              return {meta:{changes:1}};
            }
            if (sql.startsWith("INSERT INTO demo_events")) {
              const [id,stage,decision,created_at,orderId,version] = values;
              const row = db.orders.find(x => x.id === orderId && x.version === version);
              if (!row) return {meta:{changes:0}};
              db.events.push({id,order_id:row.id,stage,decision,created_at});
              return {meta:{changes:1}};
            }
            throw Error("Unsupported run: " + sql);
          }
        };
      }
    };
  }
  async batch(statements) {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    return results;
  }
}
const env = () => ({DEMO_ENABLED:"true", DEMO_API_KEY:"local-secret", DB:new FakeD1()});
function request(path, data, key="local-secret") {
  const headers = {"Content-Type":"application/json"};
  if (key !== null) headers["x-demo-key"] = key;
  return new Request("https://local.example" + path, {method:"POST",headers,body:JSON.stringify(data)});
}
async function invoke(environment, path, body, key) {
  const response=await app.fetch(request(path,body,key),environment);
  return {status:response.status, data:await response.json(), headers:response.headers};
}
test("API pubblica: solo catalogo demo, nessuna integrazione pagamenti", async () => {
  const r=await app.fetch(new Request("https://local.example/api/health"),{DEMO_ENABLED:"false"});
  assert.equal(r.status,200);
  const x=await r.json();assert.equal(x.payments,"disabled");assert.equal(x.enabled,false);
  const cat=await app.fetch(new Request("https://local.example/api/catalog"),{});
  assert.equal(cat.status,200);assert.deepEqual(Object.keys((await cat.json()).funnels),["mental","libro","formazione"]);
});
test("nessun accesso senza segreto e demo attivata", async () => {
  const disabled=await invoke({DEMO_ENABLED:"false",DEMO_API_KEY:"local-secret",DB:new FakeD1()},"/api/demo/start",{funnel:"mental"});
  assert.equal(disabled.status,503);
  const unauthorized=await invoke(env(),"/api/demo/start",{funnel:"mental"},null);
  assert.equal(unauthorized.status,401);
});
test("Mental Pro: 47 + 70 + 105, sequenza e duplicazione respinta", async () => {
  const e=env();
  const start=await invoke(e,"/api/demo/start",{funnel:"mental"});
  assert.equal(start.status,201);assert.equal(start.data.totalCents,4700);
  assert.match(start.data.token,/^[a-f0-9]{64}$/);
  assert.equal(start.headers.get("cache-control"),"no-store");
  const token=start.data.token;
  const first=await invoke(e,"/api/demo/decision",{token,accept:true});
  assert.equal(first.status,200);assert.equal(first.data.stage,"upsell2");assert.equal(first.data.totalCents,11700);
  const second=await invoke(e,"/api/demo/decision",{token,accept:true});
  assert.equal(second.data.stage,"done");assert.equal(second.data.totalCents,22200);
  assert.equal(e.DB.events.length,2);
  const duplicated=await invoke(e,"/api/demo/decision",{token,accept:true});
  assert.equal(duplicated.status,409);
});
test("Upsell rifiutato -> downsell facoltativo -> 94 euro", async () => {
  const e=env(),start=await invoke(e,"/api/demo/start",{funnel:"mental"});
  const token=start.data.token;
  const refuse=await invoke(e,"/api/demo/decision",{token,accept:false});
  assert.equal(refuse.data.stage,"downsell");assert.equal(refuse.data.totalCents,4700);
  const accept=await invoke(e,"/api/demo/decision",{token,accept:true});
  assert.equal(accept.data.totalCents,9400);
});
test("Blocco prezzi sconosciuti, input ambiguo e sessione scaduta", async () => {
  const e=env();
  assert.equal((await invoke(e,"/api/demo/start",{funnel:"arbitrario"})).status,400);
  const start=await invoke(e,"/api/demo/start",{funnel:"formazione"});
  assert.equal(start.data.totalCents,null);
  const token=start.data.token;
  assert.equal((await invoke(e,"/api/demo/decision",{token,accept:"true"})).status,400);
  assert.equal((await invoke(e,"/api/demo/state",{token:"nonvalido"})).status,404);
  e.DB.orders[0].expires_at=Date.now()-1;
  assert.equal((await invoke(e,"/api/demo/state",{token})).status,404);
});
