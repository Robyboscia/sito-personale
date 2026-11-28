import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import worker from '../integrations/crm/service-email.mjs';

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const origin = 'https://test.example';
const target = 'qa@example.test';
function setup(overrides = {}, options = {}) {
  const calls = [];
  const keys = [];
  const env = {
    SERVICE_ALLOWED_ORIGINS: origin,
    SERVICE_TEST_RECIPIENT: target,
    TURNSTILE_HOSTNAME: 'test.example',
    TURNSTILE_SECRET: 'fake-turnstile',
    BREVO_API_KEY: 'fake-brevo',
    SERVICE_RATE_LIMITER: { async limit({key}) {
      keys.push(key);
      return {success: !key.startsWith(options.blockPrefix || 'never:')};
    } },
    ...overrides,
  };
  const fetchMock = async (url, init) => {
    calls.push({url, init});
    if (url.includes('siteverify')) return Response.json({
      success: true, hostname: 'test.example', action: 'invia-guida',
      ...options.verification,
    });
    if (url === 'https://api.brevo.com/v3/smtp/email') return new Response(null, {status: options.brevoStatus || 201});
    throw new Error('Unexpected network request');
  };
  return {env, calls, keys, fetchMock};
}
function request({source = origin, email = target, method = 'POST', ip = '192.0.2.1', token = 'fake-token', extra = {}} = {}) {
  const headers = {'Origin': source, 'Content-Type': 'application/x-www-form-urlencoded'};
  if (ip) headers['CF-Connecting-IP'] = ip;
  return new Request('https://worker.example/invia-guida', {
    method, headers,
    ...(['GET', 'HEAD', 'OPTIONS'].includes(method) ? {} : {
      body: new URLSearchParams({email, 'cf-turnstile-response': token, ...extra}),
    }),
  });
}
async function run(t, setupResult, req) {
  t.mock.method(globalThis, 'fetch', setupResult.fetchMock);
  return worker.fetch(req, setupResult.env);
}
test('default staging blocks another recipient without upstream calls', async t => {
  const s = setup();
  assert.equal((await run(t,s,request({email:'other@example.test'}))).status,403);
  assert.equal(s.calls.length,0);
});
test('rejects disallowed origins and invalid addresses', async t => {
  const s = setup();
  assert.equal((await run(t,s,request({source:'https://wrong.example'}))).status,403);
  assert.equal((await worker.fetch(request({email:'invalid'}),s.env)).status,400);
  assert.equal(s.calls.length,0);
});
test('preflight permits only the configured origin', async t => {
  const s = setup();
  const r = await run(t,s,request({method:'OPTIONS'}));
  assert.equal(r.status,204);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'),origin);
  assert.equal(s.calls.length,0);
});
test('missing rate limit binding fails closed', async t => {
  const s = setup({SERVICE_RATE_LIMITER:null});
  assert.equal((await run(t,s,request())).status,503);
  assert.equal(s.calls.length,0);
});
test('IP rate limit stops request before Turnstile', async t => {
  const s = setup({}, {blockPrefix:'ip:'});
  assert.equal((await run(t,s,request())).status,429);
  assert.equal(s.calls.length,0);
});
test('recipient rate limit prevents email delivery', async t => {
  const s = setup({}, {blockPrefix:'recipient:'});
  assert.equal((await run(t,s,request())).status,429);
  assert.equal(s.calls.length,1);
  assert.match(s.keys[1],/^recipient:[a-f0-9]{64}$/);
});
test('wrong Turnstile action or hostname stops delivery', async t => {
  const s = setup({}, {verification:{action:'wrong'}});
  assert.equal((await run(t,s,request())).status,403);
  assert.equal(s.calls.length,1);
});
test('authorized staging request sends only the necessary data', async t => {
  const s = setup();
  const r = await run(t,s,request({extra:{questionnaire:'private test data'}}));
  assert.equal(r.status,202);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'),origin);
  assert.equal(s.calls.length,2);
  const payload = JSON.parse(s.calls[1].init.body);
  assert.deepEqual(payload.to,[{email:target}]);
  assert.equal(payload.sender.email,'info@drrobertoboscia.com');
  assert.ok(!JSON.stringify(payload).includes('private test data'));
  assert.ok(!s.keys[1].includes(target));
});
test('Brevo failure is returned without exposing upstream content', async t => {
  const s = setup({}, {brevoStatus:429});
  const r = await run(t,s,request());
  assert.equal(r.status,502);
  assert.ok(!(await r.text()).includes('fake-brevo'));
});
