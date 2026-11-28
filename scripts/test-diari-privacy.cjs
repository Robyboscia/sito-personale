'use strict';
const {chromium,webkit,devices}=require('playwright');
const assert=require('node:assert/strict');
const BASE=process.env.QA_BASE_URL||'http://127.0.0.1:9876';
const root='/laboratorio-del-sonno/';
const tests=[
 {name:'diario',path:root+'diario/',key:'roberto-boscia.sleep-diary.v1',toggle:'#sd-persist',fields:{'[name="wakeDate"]':'2026-11-20','[name="bedTime"]':'22:30','[name="tryTime"]':'22:45','[name="latency"]':'20','[name="finalWake"]':'06:45','[name="outTime"]':'07:00'},submit:'#sd-form button[type=submit]',result:'#sd-stat-days',expect:'1'},
 {name:'pro',path:root+'strumenti/diario-pro/',key:'roberto-boscia.sleep-pro.v2',toggle:'#dp-persist',fields:{'#dp-date':'2026-11-20','#dp-bed':'22:30','#dp-try':'22:45','#dp-latency':'20','#dp-wake':'06:45','#dp-out':'07:00'},submit:'#dp-form button[type=submit]',result:'#dp-form-status',expect:'Notte salvata'},
 {name:'turni',path:root+'strumenti/turnisti/',key:'dott-boscia-turni-sonno-diario-v1',fields:{'#sleep-start-0':'23:00','#sleep-end-0':'07:00'},submit:'#shift-monitor-form button[type=submit]',result:'#shift-monitor-report',save:'#shift-monitor-save',forget:'#shift-monitor-forget'}
];
async function exercise(engine, profile, tool){
 const browser=await engine.launch({headless:true});
 try{
 const context=await browser.newContext({... (profile==='desktop'?{viewport:{width:1440,height:900}}:devices[profile]),locale:'it-IT',serviceWorkers:'block'});
 const page=await context.newPage();
 const requests=[],errors=[],initialExternal=[];
 page.on('request',r=>requests.push(r.url()));
 page.on('pageerror',e=>errors.push(e.message));
 // Do not contact external services in QA, even during initial loading.
 await context.route('**/*',route=>{if(new URL(route.request().url()).origin!==new URL(BASE).origin){initialExternal.push(route.request().url());return route.abort()}return route.continue()});
 const load=async()=>{const r=await page.goto(BASE+tool.path,{waitUntil:'networkidle'});assert.equal(r.status(),200)};
 const stored=()=>page.evaluate(key=>localStorage.getItem(key),tool.key);
 await load();
 assert.equal(await stored(),null);
 if(tool.toggle)assert.equal(await page.locator(tool.toggle).isChecked(),false);
 requests.length=0;
 for(const [selector,value] of Object.entries(tool.fields))await page.locator(selector).fill(value);
 await page.locator(tool.submit).click();
 if(tool.expect)assert.ok((await page.locator(tool.result).innerText()).includes(tool.expect),tool.name+' save result');
 else assert.ok(await page.locator(tool.result).isVisible(),tool.name+' report visible');
 await page.waitForLoadState('networkidle');
 assert.deepEqual(requests,[],tool.name+' network during entry/report');
 assert.equal(await stored(),null,tool.name+' no persistence by default');
 if(tool.toggle)await page.locator(tool.toggle).check();else await page.locator(tool.save).click();
 const copy=await stored();assert.ok(copy&&JSON.parse(copy),tool.name+' explicit persistence');
 await page.waitForLoadState('networkidle');assert.deepEqual(requests,[],tool.name+' no network during save');
 await load();
 assert.equal(await stored(),copy,tool.name+' persisted across reload');
 if(tool.toggle){assert.ok(await page.locator(tool.toggle).isChecked());await page.locator(tool.toggle).uncheck()}else await page.locator(tool.forget).click();
 assert.equal(await stored(),null,tool.name+' explicit deletion');
 await load();
 assert.equal(await stored(),null,tool.name+' remains deleted');
 if(tool.toggle)assert.equal(await page.locator(tool.toggle).isChecked(),false);
 assert.deepEqual(errors,[],tool.name+' browser errors');
 return {profile,tool:tool.name,pass:true,externalResourcesAttemptedAtLoad:[...new Set(initialExternal)]};
 }finally{await browser.close()}
}
(async()=>{const outputs=[];for(const [engine,profile] of [[chromium,'desktop'],[chromium,'iPhone SE'],[webkit,'iPhone 13']])for(const tool of tests)outputs.push(await exercise(engine,profile,tool));console.log(JSON.stringify({ok:true,outputs},null,2))})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
