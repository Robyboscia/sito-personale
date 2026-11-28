import test from "node:test";
import assert from "node:assert/strict";
import { FUNNELS, beginFunnel, decide } from "../src/flow.js";

test("tre funnel distinti per dominio", () => {
  assert.deepEqual(Object.keys(FUNNELS), ["mental", "libro", "formazione"]);
  assert.equal(FUNNELS.mental.domain, "mentalpro.it");
  assert.equal(FUNNELS.libro.domain, "dormirefacile.com");
});
test("mental pro: 47 -> 117 -> 222 euro simulati", () => {
  const initial = beginFunnel("mental");
  assert.deepEqual(initial, {stage:"upsell1",totalCents:4700});
  const one = decide("mental", initial.stage, true, initial.totalCents);
  assert.equal(one.nextTotal,11700);
  assert.equal(one.nextStage,"upsell2");
  const two = decide("mental", one.nextStage, true, one.nextTotal);
  assert.equal(two.nextTotal,22200);
  assert.equal(two.nextStage,"done");
});
test("rifiuto primo upsell: downsell -> 94 euro o 47 euro", () => {
  const one = decide("mental","upsell1",false,4700);
  assert.equal(one.nextStage,"downsell");
  assert.equal(one.nextTotal,4700);
  assert.deepEqual([decide("mental","downsell",true,4700).nextTotal, decide("mental","downsell",false,4700).nextTotal],[9400,4700]);
});
test("nessun addebito immaginario per guide e formazione non prezzate", () => {
  for (const id of ["libro","formazione"]) {
    const start=beginFunnel(id);
    assert.equal(start.totalCents,null);
    assert.equal(decide(id,"upsell1",true,start.totalCents).nextTotal,null);
  }
});
test("transizioni illegali o decisioni implicite respinte", () => {
  assert.throws(()=>beginFunnel("sconosciuto"), RangeError);
  assert.throws(()=>decide("mental","done",true,4700), RangeError);
  assert.throws(()=>decide("mental","checkout",true,4700), RangeError);
  assert.throws(()=>decide("mental","upsell1","true",4700), TypeError);
});
