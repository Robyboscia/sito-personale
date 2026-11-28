// Business-only state transitions for a NO-PAYMENT demonstration.
// Prices are in cents and are always selected on the server.
export const FUNNELS = Object.freeze({
  mental: Object.freeze({
    label: "Mental Pro", domain: "mentalpro.it",
    primary: { label: "1 confezione Mental Pro", cents: 4700 },
    upsell1: { label: "Aggiungi 2 confezioni", cents: 7000 },
    upsell2: { label: "Aggiungi altre 3 confezioni", cents: 10500 },
    downsell: { label: "Aggiungi 1 confezione", cents: 4700 }
  }),
  libro: Object.freeze({
    label: "Libri e guide", domain: "dormirefacile.com",
    primary: { label: "Libro: Dormire è facile", cents: null },
    upsell1: { label: "Guida digitale complementare", cents: null },
    upsell2: { label: "Pacchetto editoriale premium", cents: null },
    downsell: { label: "Guida introduttiva", cents: null }
  }),
  formazione: Object.freeze({
    label: "Formazione e consulenze", domain: "drrobertoboscia.com",
    primary: { label: "Formazione introduttiva", cents: null },
    upsell1: { label: "Percorso approfondito", cents: null },
    upsell2: { label: "Servizio premium", cents: null },
    downsell: { label: "Modulo individuale", cents: null }
  })
});
export const VALID_STAGES = Object.freeze(["upsell1", "upsell2", "downsell", "done"]);

export function beginFunnel(funnel) {
  const plan = FUNNELS[funnel];
  if (!plan) throw new RangeError("Funnel sconosciuto");
  return { stage: "upsell1", totalCents: plan.primary.cents };
}

export function decide(funnel, stage, accept, totalCents) {
  const plan = FUNNELS[funnel];
  if (!plan) throw new RangeError("Funnel sconosciuto");
  if (!["upsell1", "upsell2", "downsell"].includes(stage)) throw new RangeError("Fase non modificabile");
  if (typeof accept !== "boolean") throw new TypeError("Decisione esplicita necessaria");
  const offer = plan[stage];
  const nextStage = stage === "upsell1" ? (accept ? "upsell2" : "downsell") : "done";
  const increment = accept ? offer.cents : 0;
  const nextTotal = totalCents === null || increment === null ? null : totalCents + increment;
  return { nextStage, nextTotal, offer: offer.label, action: accept ? "accepted" : "declined" };
}
