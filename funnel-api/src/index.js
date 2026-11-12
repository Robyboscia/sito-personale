import { FUNNELS, beginFunnel, decide } from "./flow.js";

// Prototype endpoints. There are deliberately NO Stripe calls, payment methods,
// customer details, marketing pixels, or live checkout capabilities.
const enc = new TextEncoder();
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'" // no cross-origin API use in the prototype
  }
});
function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map(x => x.toString(16).padStart(2, "0")).join("");
}
async function hashToken(token) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(token)));
  return [...bytes].map(x => x.toString(16).padStart(2, "0")).join("");
}
async function parseBody(req) {
  if (!(req.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) {
    throw new Error("È richiesto JSON");
  }
  const body = await req.text();
  if (body.length > 2048) throw new Error("Richiesta troppo grande");
  const data = JSON.parse(body);
  if (!data || Array.isArray(data) || typeof data !== "object") throw new Error("Corpo non valido");
  return data;
}
async function findOrder(db, token) {
  if (typeof token !== "string" || !/^[0-9a-f]{64}$/.test(token)) return null;
  const row = await db.prepare(
    "SELECT id, funnel, stage, total_cents, version, expires_at FROM demo_orders WHERE token_hash = ?"
  ).bind(await hashToken(token)).first();
  if (!row || row.expires_at <= Date.now()) return null;
  return row;
}
function describe(row) {
  return {
    funnel: row.funnel, stage: row.stage,
    totalCents: row.total_cents,
    offer: row.stage === "done" ? null : FUNNELS[row.funnel][row.stage],
    simulatedOnly: true
  };
}
export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      if (request.method === "GET" && path === "/api/health") {
        return json({ ok: true, demoOnly: true, payments: "disabled", enabled: env.DEMO_ENABLED === "true" });
      }
      if (request.method === "GET" && path === "/api/catalog") {
        return json({ funnels: FUNNELS, demoOnly: true, payments: "disabled" });
      }
      if (!path.startsWith("/api/demo/")) return json({ error: "Non trovato" }, 404);
      if (request.method !== "POST") return json({ error: "Metodo non consentito" }, 405);
      if (env.DEMO_ENABLED !== "true" || !env.DEMO_API_KEY || !env.DB) {
        return json({ error: "Ambiente demo disattivato" }, 503);
      }
      // Manual developer-only endpoints: do NOT place DEMO_API_KEY in public JS.
      if (request.headers.get("x-demo-key") !== env.DEMO_API_KEY) {
        return json({ error: "Accesso non autorizzato" }, 401);
      }
      let body;
      try { body = await parseBody(request); }
      catch { return json({ error: "JSON non valido" }, 400); }

      if (path === "/api/demo/start") {
        const funnel = body.funnel;
        if (typeof funnel !== "string" || !Object.hasOwn(FUNNELS, funnel)) {
          return json({ error: "Funnel non valido" }, 400);
        }
        const initial = beginFunnel(funnel);
        const id = crypto.randomUUID();
        const token = randomToken();
        const now = Date.now();
        const expires = now + 60 * 60 * 1000;
        await env.DB.prepare(
          "INSERT INTO demo_orders (id, token_hash, funnel, stage, total_cents, version, created_at, updated_at, expires_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)"
        ).bind(id, await hashToken(token), funnel, initial.stage, initial.totalCents, now, now, expires).run();
        return json({ token, ...describe({ funnel, stage: initial.stage, total_cents: initial.totalCents }) }, 201);
      }

      if (path !== "/api/demo/state" && path !== "/api/demo/decision") {
        return json({ error: "Non trovato" }, 404);
      }
      const row = await findOrder(env.DB, body.token);
      if (!row) return json({ error: "Sessione inesistente o scaduta" }, 404);
      if (path === "/api/demo/state") return json(describe(row));

      if (typeof body.accept !== "boolean") {
        return json({ error: "Specificare accept: true oppure false" }, 400);
      }
      if (row.stage === "done") return json({ error: "Percorso già concluso" }, 409);

      const step = decide(row.funnel, row.stage, body.accept, row.total_cents);
      const now = Date.now();
      const eventId = crypto.randomUUID();
      // Both statements run in one D1 transaction. The event is inserted ONLY
      // when the conditional stage transition wins its compare-and-swap.
      const update = env.DB.prepare(
        "UPDATE demo_orders SET stage = ?, total_cents = ?, version = version + 1, updated_at = ? WHERE id = ? AND stage = ? AND version = ? AND expires_at > ?"
      ).bind(step.nextStage, step.nextTotal, now, row.id, row.stage, row.version, now);
      const event = env.DB.prepare(
        "INSERT INTO demo_events (id, order_id, stage, decision, created_at) SELECT ?, id, ?, ?, ? FROM demo_orders WHERE id = ? AND version = ?"
      ).bind(eventId, row.stage, step.action, now, row.id, row.version + 1);
      const results = await env.DB.batch([update, event]);
      if (results[0]?.meta?.changes !== 1) return json({ error: "Fase già aggiornata: aggiorna il riepilogo" }, 409);
      return json({
        funnel: row.funnel,
        stage: step.nextStage,
        totalCents: step.nextTotal,
        lastDecision: step.action,
        offer: step.nextStage === "done" ? null : FUNNELS[row.funnel][step.nextStage],
        simulatedOnly: true
      });
    } catch (err) {
      // Avoid exposing database details or secrets in API responses.
      console.error("demo api error", String(err?.name || "Error"));
      return json({ error: "Errore del prototipo" }, 500);
    }
  }
};
