/* Mobile QA live: WebKit + emulazione iPhone. Nessun dato reale o personale.
 * L'emulazione WebKit/Linux non equivale a una prova su Safari iOS fisico.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {webkit,devices}=require('playwright');

const BASE=new URL(process.env.QA_BASE_URL || 'https://drrobertoboscia.com/');
const dir=path.resolve('mobile-qa-output');
const results=[];
const consoleProblems=[];
fs.mkdirSync(dir,{recursive:true});
const iphone='iPhone 13';
const compact='iPhone SE';
const staticPaths=[
 '/','/chi-sono/','/assetto-biologico/','/laboratorio-del-sonno/',
 '/laboratorio-del-sonno/diario/','/laboratorio-del-sonno/strumenti/check-up/',
 '/laboratorio-del-sonno/strumenti/caffeina/','/laboratorio-del-sonno/strumenti/diario-pro/',
 '/laboratorio-del-sonno/strumenti/turnisti/','/accademia/','/mental-pro/',
 '/libro/','/contatti/','/privacy/','/cookie/'
];
let browser;

async function withIphone(profile,fn){
 const device=devices[profile];
 if(!device) throw new Error('Dispositivo Playwright non disponibile: '+profile);
 const context=await browser.newContext({...device,locale:'it-IT',timezoneId:'Europe/Rome',acceptDownloads:true});
 const page=await context.newPage();
 page.on('pageerror',e=>consoleProblems.push({profile,url:page.url(),message:String(e.message).slice(0,300)}));
 try{return await fn(page,context)}finally{await context.close();}
}
async function open(page,p){
 const res=await page.goto(new URL(p,BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
 if(!res || res.status()>=400) throw Error('HTTP '+(res?.status()??'n/a')+' su '+p);
 await page.locator('body').waitFor({state:'visible',timeout:7000});
 await page.waitForTimeout(350);
 return res.status();
}
async function layout(page){
 return await page.evaluate(()=>{
  const doc=document.documentElement;
  const inner=window.innerWidth;
  const overflow=Math.max(0,doc.scrollWidth-inner);
  const fixedImages=[...document.querySelectorAll('img')].filter(x=>x.complete&&x.naturalWidth===0)
   .map(x=>x.getAttribute('src')).slice(0,8);
  return {viewport:inner,documentWidth:doc.scrollWidth,horizontalOverflowPx:overflow,
    brokenImages:fixedImages,documentHeight:doc.scrollHeight};
 });
}
function assert(condition,message){if(!condition)throw Error(message)}
async function test(name,profile,fn){
 const start=Date.now();
 let details=null,error=null;
 try{details=await withIphone(profile,fn)}
 catch(e){error=String(e?.message||e).split('\n')[0].slice(0,340)}
 const r={name,profile,status:error?'FAIL':'PASS',seconds:Math.round((Date.now()-start)/100)/10,...(details?{details}:{}),...(error?{error}:{})};
 results.push(r);
 console.log(r.status+' ['+profile+'] '+name+(error?' — '+error:''));
}
async function screenshot(page,name){await page.screenshot({path:path.join(dir,name),fullPage:false,animations:'disabled'});}
async function main(){
 browser=await webkit.launch({headless:true});
 try{
  await test('Apertura e leggibilità di 15 pagine',iphone,async page=>{
   const summaries=[];
   for(const p of staticPaths){
    const status=await open(page,p);
    const l=await layout(page);
    summaries.push({path:p,http:status,...l});
   }
   const over=summaries.filter(x=>x.horizontalOverflowPx>4);
   const images=summaries.filter(x=>x.brokenImages.length);
   assert(!over.length,'Scorrimento orizzontale non previsto su: '+over.map(x=>x.path+' ('+x.horizontalOverflowPx+'px)').join(', '));
   return {pages:summaries,overflow:over.length,pagesWithBrokenImages:images.map(x=>({path:x.path,images:x.brokenImages}))};
  });

  await test('Menu mobile: apertura e navigazione a Mental Pro',iphone,async page=>{
   await open(page,'/');
   const summary=page.locator('#menu-button');
   assert(await summary.isVisible(),'Menu mobile non visibile');
   await summary.click();
   const link=page.locator('#nav-items a[href*="mental-pro"]');
   await link.waitFor({state:'visible',timeout:8000});
   await screenshot(page,'iphone-menu-aperto.png');
   await link.click();
   await page.waitForURL(/\/mental-pro\/(?:index\.html)?$/, {timeout:12000});
   assert((await page.title()).toLowerCase().includes('mental pro'),'Destinazione Mental Pro non corretta');
   await screenshot(page,'iphone-mental-pro.png');
   return {destination:page.url(),menu:'navigabile'};
  });

  await test('Dimensioni ridotte: homepage e menu',compact,async page=>{
   await open(page,'/');
   const home=await layout(page);
   if(home.horizontalOverflowPx>4){
     const suspects=await page.evaluate(()=>[...document.querySelectorAll('body *')].map(el=>({tag:el.tagName,cls:String(el.className||'').slice(0,80),right:Math.round(el.getBoundingClientRect().right),left:Math.round(el.getBoundingClientRect().left),width:Math.round(el.getBoundingClientRect().width)})).filter(x=>x.right>innerWidth+3).slice(0,12));
     console.log('Layout diagnostica iPhone SE:',JSON.stringify({home,suspects}));
   }
   assert(home.horizontalOverflowPx<=4,'Homepage eccede lo schermo di '+home.horizontalOverflowPx+'px');
   const summary=page.locator('#menu-button');
   await summary.click();
   assert(await page.locator('#nav-items a[href*="laboratorio-del-sonno"]').isVisible(),'Collegamento Laboratorio nascosto nel menu');
   await screenshot(page,'iphone-compatto-menu.png');
   return home;
  });

  await test('Check-up: esempio e grafico circolare',iphone,async page=>{
   await open(page,'/laboratorio-del-sonno/strumenti/check-up/');
   await page.locator('#check-demo').click();
   await page.locator('#check-report').waitFor({state:'visible',timeout:10000});
   const number=await page.locator('#check-result .check-area').count();
   assert(number===4,'Il report deve contenere quattro aree, trovate '+number);
   const resultText=(await page.locator('#check-result').innerText()).slice(0,500);
   assert(resultText.includes('DIMOSTRATIVO'),'Manca etichetta esempio dimostrativo');
   const graphics=await page.locator('#check-result svg, #check-result [class*="donut"], #check-result [class*="pie"]').count();
   assert(graphics>0,'Grafico finale assente');
   await screenshot(page,'iphone-checkup-esempio.png');
   return {areas:number,graphics,reportVisible:true};
  });

  await test('Caffeina: esempio, tre scenari, orari oltre mezzanotte',iphone,async page=>{
   await open(page,'/laboratorio-del-sonno/strumenti/caffeina/');
   await page.locator('#caff-example').click();
   await page.locator('#caff-actions').waitFor({state:'visible',timeout:10000});
   const result=await page.locator('#caff-result').innerText();
   const blocks=await page.locator('#caff-result .st-caffeine-finish').count();
   assert(blocks===3,'Attesi tre scenari con smaltimento, trovati '+blocks);
   assert(result.toLowerCase().includes('giorno'),'Manca indicazione temporale di fine smaltimento');
   await screenshot(page,'iphone-caffeina-esempio.png');
   return {scenarios:blocks,reportVisible:true};
  });

  await test('Diario: compilazione sintetica, grafico e CSV',iphone,async page=>{
   await open(page,'/laboratorio-del-sonno/diario/');
   await page.locator('#sd-form [name="bedTime"]').fill('23:00');
   await page.locator('#sd-form [name="tryTime"]').fill('23:20');
   await page.locator('#sd-form [name="latency"]').fill('20');
   await page.locator('#sd-form [name="waso"]').selectOption('20');
   await page.locator('#sd-form [name="finalWake"]').fill('07:00');
   await page.locator('#sd-form [name="outTime"]').fill('07:20');
   await page.locator('#sd-form button[type="submit"]').click();
   const message=await page.locator('#sd-form-message').innerText();
   const bars=await page.locator('#sd-chart .sd-chart-bar.has-data').count();
   assert(bars===1,'Dopo il salvataggio dovrebbe esserci una colonna compilata: '+bars+'; messaggio: '+message);
   const exportBtn=page.locator('#sd-export');
   assert(await exportBtn.isEnabled(),'CSV ancora disabilitato');
   const wait=page.waitForEvent('download',{timeout:8000});
   await exportBtn.click();
   const download=await wait;
   assert(download.suggestedFilename().endsWith('.csv'),'Il file scaricato non è un CSV');
   await screenshot(page,'iphone-diario-esempio.png');
   return {bars,exportFormat:'.csv',sample:'dati inventati, non memorizzati'};
  });

  await test('Diario: consenso salvataggio locale, ricarica e rimozione',iphone,async page=>{
   await open(page,'/laboratorio-del-sonno/diario/');
   const key='roberto-boscia.sleep-diary.v1';
   const initial=await page.evaluate(k=>localStorage.getItem(k),key);
   assert(initial===null,'Il Diario ha dati preesistenti in contesto pulito');
   await page.locator('#sd-persist').check();
   const after=await page.evaluate(k=>localStorage.getItem(k)!==null,key);
   assert(after,'Attivazione del salvataggio non persiste la chiave');
   await page.reload({waitUntil:'domcontentloaded'});
   assert(await page.locator('#sd-persist').isChecked(),'L’opzione salvata non persiste dopo ricarica');
   await page.locator('#sd-persist').uncheck();
   assert(!(await page.evaluate(k=>localStorage.getItem(k)!==null,key)),'Chiave ancora presente dopo disattivazione');
   return {before:false,optIn:true,afterOptOut:false};
  });

  await test('Diario PRO: dati inventati, grafico e sintesi',iphone,async page=>{
   await open(page,'/laboratorio-del-sonno/strumenti/diario-pro/');
   await page.locator('#pro-demo').click();
   await page.locator('#pro-report').waitFor({state:'visible',timeout:10000});
   const charts=await page.locator('#pro-result .pro-dashboard').count();
   assert(charts===1,'Dashboard grafica non trovata');
   assert((await page.locator('#pro-result').innerText()).includes('DIMOSTRATIVO'),'Manca avviso dati inventati');
   await screenshot(page,'iphone-diario-pro-esempio.png');
   return {dashboard:true};
  });

  await test('Turnisti: settimana dimostrativa e risultato',iphone,async page=>{
   await open(page,'/laboratorio-del-sonno/strumenti/turnisti/');
   await page.locator('#shift-demo').click();
   await page.locator('#shift-report').waitFor({state:'visible',timeout:10000});
   assert((await page.locator('#shift-result').innerText()).includes('DIMOSTRATIVO'),'Manca avviso settimana inventata');
   await screenshot(page,'iphone-turnisti-esempio.png');
   return {reportVisible:true};
  });

  await test('Schermo compatto: menu e moduli del Laboratorio',compact,async page=>{
   const arr=[];
   for(const p of ['/laboratorio-del-sonno/diario/','/laboratorio-del-sonno/strumenti/check-up/','/laboratorio-del-sonno/strumenti/caffeina/','/laboratorio-del-sonno/strumenti/diario-pro/','/laboratorio-del-sonno/strumenti/turnisti/']){
    await open(page,p);
    const l=await layout(page);
    arr.push({path:p,overflow:l.horizontalOverflowPx});
   }
   const over=arr.filter(x=>x.overflow>4);
   assert(!over.length,'Contenuto deborda su iPhone compatto: '+JSON.stringify(over));
   return {pages:arr};
  });
 }finally{await browser.close();}
 const failures=results.filter(x=>x.status==='FAIL');
 const report={dateUtc:new Date().toISOString(),baseUrl:BASE.origin,engine:'Playwright WebKit on Linux (non Safari iOS nativo)',devices:[iphone,compact],results,pageErrors:consoleProblems};
 fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2)+'\n');
 const lines=[
  '# Collaudo mobile — drrobertoboscia.com',
  '',
  '**Ambiente:** WebKit su Linux (emulazione delle dimensioni, eventi touch e user agent iPhone), non test su iPhone reale.',
  '**Data UTC:** '+report.dateUtc,
  '',
  '**Esito:** '+(results.length-failures.length)+' / '+results.length+' test superati.',
  '',
  '| Verifica | Profilo | Esito | Durata |',
  '|---|---|---|---|',
  ...results.map(x=>'| '+x.name+' | '+x.profile+' | '+x.status+(x.error?' — '+x.error.replace(/\|/g,'/'): '')+' | '+x.seconds+' s |'),
  '',
  '## Errori JavaScript osservati',
  ...(consoleProblems.length?consoleProblems.map(e=>'- '+e.profile+' / '+e.url+': '+e.message):['Nessuno intercettato nelle sessioni testate.']),
  '',
  '## Note importanti',
  '- Il collaudo usa dati inventati e non invia messaggi o pagamenti.',
  '- Errori di immagine esterna sono inventariati nel file JSON.',
  '- Non testa la tastiera fisica, le barre Safari, VoiceOver e iOS su hardware Apple.',
  '- Screenshot allegati nell’artefatto solo per esempi sintetici.',
  ''
 ];
 fs.writeFileSync(path.join(dir,'report.md'),lines.join('\n'));
 console.log(lines.slice(0,16).join('\n'));
 if(failures.length)process.exitCode=1;
}
main().catch(e=>{
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'error.txt'),String(e?.stack||e).slice(0,2000));
 console.error(e);process.exitCode=1;
});
