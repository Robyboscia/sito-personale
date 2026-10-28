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


  await test('Diario PRO: grafici comparativi, 12 microlezioni e quiz educativo',iphone,async page=>{
   await open(page,'/laboratorio-del-sonno/strumenti/diario-pro/');
   assert(await page.locator('#dp-lessons .dp-lesson').count()===12,'Manca una delle 12 microlezioni');
   await page.locator('#pro-demo').click();
   assert(await page.locator('#dp-scatter svg circle').count()>=14,'Grafico energia e durata non popolato');
   assert((await page.locator('#dp-factor-chart').innerText()).includes('notti'),'Confronto abitudini non visibile');
   await page.locator('#dp-factor').selectOption('stress');
   assert((await page.locator('#dp-factor-chart').innerText()).includes('notti'),'Confronto stress non aggiornato');
   await page.locator('#dp-focus').selectOption('energy');
   assert((await page.locator('#dp-progress-result').innerText()).includes('Energia riferita al mattino'),'Il focus sui 28 giorni non modifica la spiegazione');
   const lesson=page.locator('#dp-lessons details[data-lesson="caffeine"]');
   await lesson.locator('summary').click();
   const href=await lesson.locator('.dp-source a').getAttribute('href');
   assert(href.includes('pubmed.ncbi.nlm.nih.gov'),'Fonte scientifica non collegata alla lezione');
   await lesson.locator('.dp-quiz-option').nth(1).click();
   assert((await lesson.locator('.dp-quiz-feedback').innerText()).includes('Esatto'),'Quiz non fornisce riscontro corretto');
   await lesson.locator('.dp-lesson-done').click();
   assert((await page.locator('#dp-learning-summary').innerText()).includes('1 di 12'),'Progresso lezioni non aggiornato');
   assert((await page.locator('#dp-report-education').innerText()).length>100,'Manca approfondimento nel report');
   await screenshot(page,'iphone-diario-pro-microaccademia.png');
   return {lessons:12,scatter:true,habitChart:true,quiz:true,contextualReport:true};
  });

  await test('Diario PRO: contrasto testi nel report su iPhone',iphone,async page=>{
   await open(page,'/laboratorio-del-sonno/strumenti/diario-pro/');
   await page.locator('#pro-demo').click();
   await page.locator('#pro-report').waitFor({state:'visible',timeout:10000});
   const targets=[
    ['#pro-report #pro-result .pro-dashboard > .dp-panel > h3','Titolo su crema',3],
    ['#pro-report #pro-result .pro-dashboard > .dp-panel > p.dp-muted','Nota sotto il grafico su crema',4.5],
    ['#pro-report #pro-result .pro-dashboard .dp-insight p','Spiegazione su fondo scuro',4.5],
    ['#pro-report #pro-result .pro-dashboard .dp-insight strong','Titolo su fondo scuro',4.5],
    ['#pro-report > .dp-footer-note','Nota finale del report',4.5],
    ['#pro-report > .dp-muted','Introduzione del report',4.5]
   ];
   const results=await page.evaluate(checks=>{
    const rgb=s=>{const match=s.match(/rgba?\\(([^)]*)\\)/);return match?match[1].split(',').slice(0,3).map(Number):null};
    const luminance=color=>{
      const c=rgb(color);if(!c)return null;
      const a=c.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)});
      return .2126*a[0]+.7152*a[1]+.0722*a[2];
    };
    const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return x===null||y===null?0:(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
    return checks.map(([selector,label,min])=>{
      const node=document.querySelector(selector);if(!node)return {label,ratio:0,reason:'missing'};
      let parent=node,background='rgba(0, 0, 0, 0)';
      while(parent){const bg=getComputedStyle(parent).backgroundColor;
        if(bg&&!bg.includes('rgba(0, 0, 0, 0)')&&bg!=='transparent'){background=bg;break}
        parent=parent.parentElement;
      }
      const color=getComputedStyle(node).color;return {label,contrast:contrast(color,background),color,background,min};
    });
   },targets);
   const bad=results.filter(r=>r.contrast<r.min);
   assert(!bad.length,'Contrasto insufficiente: '+JSON.stringify(bad));
   await screenshot(page,'iphone-diario-pro-contrasto-report.png');
   return {measurements:results};
  });

  await test('Diario PRO v2: compilazione, backup, importazione e turni',iphone,async page=>{
   await open(page,'/laboratorio-del-sonno/strumenti/diario-pro/');
   await page.locator('#dp-persist').check();
   await page.locator('#dp-date').fill('2026-10-20');
   await page.locator('#dp-bed').fill('23:00');
   await page.locator('#dp-try').fill('23:15');
   await page.locator('#dp-latency').fill('20');
   await page.locator('#dp-waso').selectOption('20');
   await page.locator('#dp-wake').fill('07:00');
   await page.locator('#dp-out').fill('07:15');
   await page.locator('#dp-quality').selectOption('4');
   await page.locator('#dp-energy-morning').selectOption('3');
   await page.locator('#dp-form button[type="submit"]').click();
   assert((await page.locator('#dp-total').innerText()).includes('1 / 90'),'Notte 1 non salvata');
   assert(await page.locator('#pro-report').isVisible(),'Report non visibile dopo una notte');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForTimeout(300);
   assert((await page.locator('#dp-total').innerText()).includes('1 / 90'),'Notte non ritrovata dopo ricarica con opt-in');
   await page.locator('#dp-date').fill('2026-10-21');
   await page.locator('#dp-bed').fill('09:00');
   await page.locator('#dp-try').fill('09:10');
   await page.locator('#dp-latency').fill('15');
   await page.locator('#dp-waso').selectOption('20');
   await page.locator('#dp-wake').fill('16:00');
   await page.locator('#dp-out').fill('16:05');
   await page.locator('#dp-form details').nth(1).locator('summary').click();
   await page.locator('#dp-shift').selectOption('night');
   await page.locator('#dp-form button[type="submit"]').click();
   assert((await page.locator('#dp-total').innerText()).includes('2 / 90'),'Notte diurna non registrata');
   assert(await page.locator('#dp-rhythm-list .dp-rhythm-row:first-child .dp-rhythm-segment').count()===2,'Intervallo diurno oltre mezzogiorno non spezzato sulla mappa');
   await page.locator('#dp-last-date').fill('2026-10-22');
   const csv='Giorno;Data risveglio;Ora a letto;Tentativo di dormire;Latenza min;Minuti orientativi sottratti;Risveglio finale;Ora alzata;Sonno orientativo min;Calcolo parziale\n1;;23:30;23:40;20;20;07:00;07:15;400;No\n';
   await page.locator('#dp-import-csv').setInputFiles({name:'esempio-diario.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});
   await page.waitForTimeout(200);
   assert((await page.locator('#dp-total').innerText()).includes('3 / 90'),'Import CSV con data scelta fallito');
   const downloadPromise=page.waitForEvent('download');
   await page.locator('#dp-export-json').click();
   const download=await downloadPromise;
   assert(download.suggestedFilename().endsWith('.json'),'Backup JSON non scaricabile');
   await screenshot(page,'iphone-diario-pro-v2-mappa.png');
   return {savedNights:3,legacyCsvImport:true,persist:true,daytimeSleep:true,backup:true};
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
