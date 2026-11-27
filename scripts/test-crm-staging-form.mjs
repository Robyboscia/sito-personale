import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const html = readFileSync(new URL('../integrations/crm/staging-form.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function setup(configured = false) {
  const handlers = [], loads = [], requests = [];
  const elements = {
    'guide-form': {addEventListener(name, fn){ if(name==='submit') handlers.push(fn); }, reportValidity(){return true;}},
    email:{value:'qa@example.test'}, send:{disabled:true}, status:{textContent:''},
  };
  let callbacks, resetCount = 0;
  const window = {turnstile:{render(selector, options){callbacks=options;return 1;},reset(){resetCount++;}}};
  const context = {window, location:{protocol:'https:'}, URL, URLSearchParams, AbortSignal,
    document:{getElementById(id){return elements[id];},createElement(){return {};},head:{appendChild(s){loads.push(s);}}},
    fetch:async(url, init)=>{requests.push({url,init});return {status:202};}};
  const source = configured ? script.replace('__STAGING_WORKER_ENDPOINT__','https://worker.example/invia-guida').replace('__TURNSTILE_PUBLIC_SITE_KEY__','public-test-key') : script;
  vm.runInNewContext(source,context);
  const submit = async()=>{let prevented=false;for(const fn of handlers) await fn({preventDefault(){prevented=true;}});return prevented;};
  return {elements,loads,requests,window,submit,get callbacks(){return callbacks;},get resetCount(){return resetCount;}};
}
test('unconfigured staging page makes no network call and prevents form navigation',async()=>{
  const s=setup();assert.equal(s.loads.length,0);assert.equal(s.elements.send.disabled,true);
  assert.equal(await s.submit(),true);assert.equal(s.requests.length,0);
  assert.match(html,/<form id="guide-form" method="post">/);
  assert.doesNotMatch(html,/<input[^>]*name="email"/);
});
test('configured form sends no request without a Turnstile token',async()=>{
  const s=setup(true);assert.equal(s.loads.length,1);s.window.crmTurnstileReady();
  assert.equal(s.elements.send.disabled,true);await s.submit();assert.equal(s.requests.length,0);
});
test('valid token sends only email and token, clears address and resets the widget',async()=>{
  const s=setup(true);s.window.crmTurnstileReady();s.callbacks.callback('test-token');
  assert.equal(s.elements.send.disabled,false);await s.submit();
  assert.equal(s.requests.length,1);const r=s.requests[0];
  assert.equal(r.url,'https://worker.example/invia-guida');assert.equal(r.init.credentials,'omit');
  assert.equal(r.init.referrerPolicy,'no-referrer');
  assert.deepEqual([...r.init.body.entries()],[['email','qa@example.test'],['cf-turnstile-response','test-token']]);
  assert.equal(s.elements.email.value,'');assert.equal(s.elements.send.disabled,true);assert.equal(s.resetCount,1);
});
test('expired token disables the form again',async()=>{
  const s=setup(true);s.window.crmTurnstileReady();s.callbacks.callback('test-token');s.callbacks['expired-callback']();
  await s.submit();assert.equal(s.requests.length,0);assert.equal(s.elements.send.disabled,true);
});
