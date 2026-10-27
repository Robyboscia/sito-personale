'use strict';
/* Smoke test mobile browser WebKit (Safari engine), su dominio pubblico.
 * Non è un test su iPhone fisico e non registra dati reali di utenti.
 */
const fs = require('node:fs');
const path = require('node:path');
const { webkit } = require('playwright');

const base = process.env.TEST_BASE_URL || 'https://drrobertoboscia.com';
const out = path.resolve('mobile-test-output');
fs.mkdirSync(out, { recursive: true });
const checks = [];
const failures = [];
const browserErrors = [];
let browser;

function record(name, ok, details='') {
  checks.push({name, passed: Boolean(ok), details});
  console.log((ok?'PASS':'FAIL')+' | '+name+(details?' | '+details:''));
  if(!ok)failures.push(name);
}
function safe(e){return String(e?.message||e).split('\n')[0].slice(0,250)}
async function openPage(page, route) {
  const response=await page.goto(new URL(route,base).href, {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(800);
  return response?.status()||0;
}
async function mobilePage(width=390) {
  const ctx=await browser.newContext({
    viewport:{width,height:844}, deviceScaleFactor:3,
    isMobile:true, hasTouch:true, locale:'it-IT',
    reducedMotion:'reduce'
  });
  const page=await ctx.newPage();
  page.on('pageerror', e=>browserErrors.push(safe(e)));
  return {ctx,page};
}
async function dimensions(page) {
  return page.evaluate(()=>{
    const px=Math.round(window.innerWidth);
    const html=document.documentElement,body=document.body;
    return {viewport:px,client:html.clientWidth,scrollWidth:html.scrollWidth,
      bodyScrollWidth:body?.scrollWidth||0,
      overflowing: html.scrollWidth>html.clientWidth+2
    };
  });
}
async function screenshotAssetto(page,width) {
  const process=page.locator('.process-section');
  await process.scrollIntoViewIfNeeded();
  await page.waitForTimeout(450);
  const imageName='assetto-process-'+width+'.png';
  await process.screenshot({path:path.join(out,imageName),animations:'disabled',timeout:15000});
  return imageName;
}
async function sectionGeometry(page) {
 return page.locator('.process-steps').evaluate(el=>{
   const r=el.getBoundingClientRect(),s=getComputedStyle(el);
   const phases=[...el.querySelectorAll('.process-step')].map(item=>{
     const d=item.getBoundingClientRect();
     return {left:Math.round(d.left),right:Math.round(d.right),width:Math.round(d.width),height:Math.round(d.height)}
   });
   return {columns:s.gridTemplateColumns,rect:{left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)},
      phases,orientation:phases.length>1&&phases[1].top>phases[0].top,
      viewport:document.documentElement.clientWidth};
 });
}
async function assettoTest(width) {
 const {ctx,page}=await mobilePage(width);
 try {
   const status=await openPage(page,'/assetto-biologico/');
   record('Assetto HTTP '+width,status===200,String(status));
   await page.locator('.process-step').first().waitFor();
   const g=await sectionGeometry(page);
   record('Tre fasi senza tagli '+width,
     g.phases.length===3&&g.phases.every(p=>p.left>=-1&&p.right<=g.viewport+1) &&
      g.rect.right<=g.viewport+1 && g.orientation,
     JSON.stringify({viewport:g.viewport,columns:g.columns,rect:g.rect,phases:g.phases}));
   const d=await dimensions(page);
   record('Nessun overflow orizzontale Assetto '+width,!d.overflowing,JSON.stringify(d));
   if(width===390 || width===320)record('Screenshot sezione Assetto '+width,Boolean(await screenshotAssetto(page,width)));
   if(width===390) {
      await page.locator('#portale-navigazione .portale-mobile-menu summary').click();
      const link=page.locator('#portale-navigazione .portale-mobile-links a[href="../mental-pro/index.html"], #portale-navigazione .portale-mobile-links a[href="../mental-pro/"]');
      const fallback=page.locator('#portale-navigazione .portale-mobile-links a').filter({hasText:/mental pro/i}).first();
      record('Menu Assetto apre Mental Pro',await (link.count()?link.first():fallback).isVisible());
   }
 } catch(e){ record('Test Assetto '+width,false,safe(e));}
 finally { await ctx.close(); }
}
async function homepageTest(){
 const {ctx,page}=await mobilePage();
 try{
  const status=await openPage(page,'/');
  record('Homepage mobile HTTP',status===200);
  const menu=page.locator('.home-mobile-menu');
  await menu.locator('summary').click();
  record('Menu homepage apribile',await menu.evaluate(el=>el.open));
  const mental=menu.locator('a[href*="mental-pro"]');
  record('Mental Pro nel menu mobile',await mental.isVisible());
  await mental.click();
  await page.waitForURL('**/mental-pro/**',{timeout:15000});
  record('Link Mental Pro funzionante',page.url().includes('/mental-pro/'));
 }catch(e){record('Navigazione mobile homepage',false,safe(e))}
 finally{await ctx.close()}
}
async function toolsTest(label,route,demo,expectedSelector,extraCheck){
 const {ctx,page}=await mobilePage();
 try{
  const status=await openPage(page,route);
  record('HTTP '+label,status===200,String(status));
  const btn=page.locator(demo);
  await btn.waitFor({state:'visible',timeout:12000});
  await btn.click();
  await page.waitForTimeout(250);
  const report=page.locator(expectedSelector);
  await report.waitFor({state:'visible',timeout:12000});
  const text=await report.innerText();
  const extra=extraCheck?await extraCheck(page,text):true;
  record('Esempio '+label+' genera risultato',text.trim().length>100&&extra,
    'testo='+text.trim().length+' caratteri');
  const d=await dimensions(page);
  record('Nessun overflow '+label,!d.overflowing,JSON.stringify(d));
 }catch(e){record('Interazione '+label,false,safe(e))}
 finally{await ctx.close()}
}
async function diaryTest(){
 const {ctx,page}=await mobilePage();
 try{
  const status=await openPage(page,'/laboratorio-del-sonno/diario/');
  record('HTTP Diario 14 notti',status===200);
  const form=page.locator('#sd-form');
  const values={bedTime:'23:00',tryTime:'23:10',latency:'20',waso:'20',
    awakenings:'2',finalWake:'07:00',outTime:'07:15',quality:'4',energy:'4'};
  for(const [name,value] of Object.entries(values)){
   const field=form.locator('[name="'+name+'"]');
   if(['waso','quality','energy'].includes(name)) await field.selectOption(value);
   else await field.fill(value);
  }
  await form.locator('button[type="submit"]').click();
  await page.waitForTimeout(300);
  const days=(await page.locator('#sd-stat-days').innerText()).trim();
  const bars=await page.locator('#sd-chart .has-data').count();
  const exportEnabled=await page.locator('#sd-export').isEnabled();
  record('Diario salva una notte, aggiorna grafico, abilita CSV',days==='1'&&bars>0&&exportEnabled,
    JSON.stringify({days,bars,exportEnabled}));
  const d=await dimensions(page);
  record('Nessun overflow Diario',!d.overflowing,JSON.stringify(d));
 }catch(e){record('Compilazione Diario',false,safe(e))}
 finally{await ctx.close()}
}
async function main() {
 browser=await webkit.launch({headless:true});
 try {
  for(const size of [320,375,390,430])await assettoTest(size);
  await homepageTest();
  await toolsTest('Check-up','/laboratorio-del-sonno/strumenti/check-up/','#check-demo','#check-report',
   async(page)=>await page.locator('.check-positive-fill').count()===4);
  await toolsTest('Caffeina','/laboratorio-del-sonno/strumenti/caffeina/','#caff-example','#caff-result',
   async(page,txt)=>txt.includes('mg')&&await page.locator('#caff-actions').isVisible());
  await toolsTest('Diario PRO','/laboratorio-del-sonno/strumenti/diario-pro/','#pro-demo','#pro-report');
  await toolsTest('Turnisti','/laboratorio-del-sonno/strumenti/turnisti/','#shift-demo','#shift-report');
  await diaryTest();
 }finally{await browser.close()}
 const success=checks.filter(x=>x.passed).length;
 const m=[
  '# Collaudo mobile WebKit su drrobertoboscia.com',
  '', 'Data UTC: '+new Date().toISOString(),
  'Browser: WebKit Playwright (emula il motore Safari, NON un iPhone fisico).',
  'Dispositivo mobile simulato, con touch e viewport da 320, 375, 390 e 430 px.',
  '', '**Controlli superati: '+success+'/'+checks.length+'**.',
  '','| Verifica | Esito | Dettaglio |','|---|---|---|',
  ...checks.map(c=>'| '+c.name.replace(/\|/g,'/')+' | '+(c.passed?'PASS':'FAIL')+' | '+c.details.replace(/\|/g,'/').slice(0,350)+' |'),
  '','## Errori JavaScript pagina','',
  ...(browserErrors.length?[...new Set(browserErrors)].map(x=>'- '+x):['Nessuno rilevato.']),
  '', 'Gli screenshot sono allegati al workflow. Il test non certifica il funzionamento su ogni versione di Safari o su iPhone fisico.'
 ];
 fs.writeFileSync(path.join(out,'mobile-report.md'),m.join('\n')+'\n');
 fs.writeFileSync(path.join(out,'mobile-report.json'),JSON.stringify({checks,browserErrors,passed:success,total:checks.length},null,2));
 console.log('TOTAL: '+success+'/'+checks.length);
 if(failures.length){console.error('Failures:',failures.join(', '));process.exitCode=1}
}
main().catch(e=>{console.error(e);process.exitCode=1});
