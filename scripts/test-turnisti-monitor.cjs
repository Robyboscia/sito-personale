'use strict';
const {webkit,chromium,devices}=require('playwright');
const assert=require('node:assert/strict');
const BASE=process.env.QA_BASE_URL||'http://127.0.0.1:9876';
const tool=BASE+'/laboratorio-del-sonno/strumenti/turnisti/';
const errors=[];
async function run(browserType,device){
 const browser=await browserType.launch({headless:true});
 const ctx=await browser.newContext({...devices[device],locale:'it-IT',timezoneId:'Europe/Rome',acceptDownloads:true});
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push({device,message:e.message}));
 let tests=0;
 function ok(cond,msg){assert.ok(cond,msg);tests++}
 async function start(){
  const r=await page.goto(tool,{waitUntil:'domcontentloaded'});
  ok(r.status()===200,'route HTTP 200');
  await page.locator('#shift-sleep-days tr').first().waitFor();
  ok(await page.locator('#shift-sleep-days tr').count()===7,'seven monitor rows');
  ok(await page.locator('#shift-days tr').count()===7,'seven planner rows');
  ok(await page.locator('#shift-monitor').isVisible(),'monitor area visible');
  ok(await page.locator('#shift-mode-nav').count()===0,'no invalid id');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  ok(overflow<=4,'horizontal overflow '+overflow+'px');
 }
 await start();
 await page.locator('#shift-demo').click();
 await page.locator('#shift-report').waitFor({state:'visible'});
 let ptext=await page.locator('#shift-result').innerText();
 ok(ptext.includes('DIMOSTRATIVO'),'sample report displayed');
 ok(ptext.includes('8 h 00 min')||ptext.includes('inferiori a 11 ore'),'short break detected');
 await page.locator('#sleep-start-0').fill('23:00');
 await page.locator('#sleep-end-0').fill('07:00');
 await page.locator('#sleep-quality-0').selectOption('4');
 await page.locator('#sleep-nap-0').fill('30');
 await page.locator('#sleep-start-1').fill('22:30');
 await page.locator('#sleep-end-1').fill('05:30');
 await page.locator('#sleep-quality-1').selectOption('3');
 await page.locator('#shift-monitor-form button[type=submit]').click();
 await page.locator('#shift-monitor-report').waitFor({state:'visible'});
 let t=await page.locator('#shift-monitor-results').innerText();
 ok(t.includes('7 h 30 min'),'mean self-reported duration');
 ok(t.includes('3,5 / 5'),'mean quality');
 ok(await page.locator('.shift-compare-work').count()>0,'work bars present');
 ok(await page.locator('.shift-compare-sleep').count()>0,'sleep bars present');
 const overflow2=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 ok(overflow2<=4,'horizontal overflow after report '+overflow2);
 // Changing hours in planning invalidates the old comparison rather than presenting it as current.
 await page.locator('#shift-commute').fill('40');
 ok(await page.locator('#shift-report').isHidden(),'changed planner invalidates planner report');
 ok((await page.locator('#shift-monitor-results').innerText()).includes('Confronto con i turni non attivo'),'monitor correctly drops outdated plan');
 await page.locator('#shift-rest-target').fill('600');
 await page.locator('#shift-form button[type=submit]').click();
 const ptext2=await page.locator('#shift-result').innerText();
 ok(ptext2.includes('10 h 00 min'),'custom rest opportunity duration');
 ok((await page.locator('#shift-monitor-results').innerText()).includes('Lavoro inserito'),'comparison automatically refreshed');
 await page.locator('#shift-monitor-save').click();
 ok((await page.locator('#shift-monitor-status').innerText()).includes('salvato'),'local save message');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.locator('#sleep-start-0').waitFor();
 ok(await page.locator('#sleep-start-0').inputValue()==='23:00','restore save after reload');
 await page.locator('#shift-monitor-form button[type=submit]').click();
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#shift-monitor-export').click();
 const download=await downloadPromise;
 ok(download.suggestedFilename().endsWith('.csv'),'CSV export');
 // Rejected incomplete record.
 await page.locator('#sleep-end-2').fill('07:00');
 await page.locator('#shift-monitor-form button[type=submit]').click();
 ok((await page.locator('#shift-monitor-status').innerText()).includes('completa sia'),'incomplete hours validation');
 await page.locator('#sleep-end-2').fill('');
 // Sleep overlapping an actual work interval is flagged, not clinically interpreted.
 await page.locator('#shift-demo').click();
 await page.locator('#sleep-start-0').fill('10:00');
 await page.locator('#sleep-end-0').fill('12:00');
 await page.locator('#shift-monitor-form button[type=submit]').click();
 ok((await page.locator('#shift-monitor-results').innerText()).includes('Orario sovrapposto a turno'),'overlap detected');
 await page.locator('#shift-monitor-reset').click();
 await page.waitForTimeout(100);
 ok(await page.locator('#shift-monitor-report').isHidden(),'monitor reset hides report');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.locator('#sleep-start-0').waitFor();
 ok(await page.locator('#sleep-start-0').inputValue()==='','reset removes stored copy');
 await ctx.close();await browser.close();
 return {device,engine:browserType.name(),checks:tests,errors};
}
(async()=>{
 const results=[];
 for(const [browser,device] of [[webkit,'iPhone 13'],[chromium,'iPhone SE']]){
  results.push(await run(browser,device));
 }
 if(errors.length)throw Error('Uncaught page errors: '+JSON.stringify(errors));
 console.log(JSON.stringify({passed:true,results},null,2));
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
