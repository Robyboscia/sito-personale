'use strict';
const {chromium,webkit,devices}=require('playwright');
const assert=require('node:assert/strict');
const BASE=process.env.QA_BASE_URL||'http://127.0.0.1:9876';
const path=BASE+'/autovalutazione/';
const problems=[];
async function exercise(browserType,profile){
 const browser=await browserType.launch({headless:true});
 const device=profile==='desktop'?{viewport:{width:1440,height:900}}:devices[profile];
 const context=await browser.newContext({...device,locale:'it-IT'});
 const page=await context.newPage();
 page.on('pageerror',e=>problems.push(profile+': '+e.message));
 let checks=0;
 const ok=(cond,msg)=>{assert.ok(cond,profile+': '+msg);checks++};
 const r=await page.goto(path,{waitUntil:'domcontentloaded'});
 ok(r.status()===200,'landing responds 200');
 ok((await page.locator('h1').innerText()).includes('Quanto conosci'),'approved H1');
 ok(await page.locator('.map-area').count()===15,'fifteen areas');
 ok((await page.locator('.map-appendix').innerText()).includes('ACE'),'appendix ACE label');
 ok((await page.locator('.map-appendix').innerText()).includes('PSS'),'appendix PSS label');
 ok(await page.locator('a[aria-disabled="true"]').count()===2,'PDF gated for content approval');
 ok(await page.locator('input').count()===0,'no health data form');
 ok(await page.locator('h2').count()>=4,'meaningful headings');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 ok(overflow<=4,'landing horizontal overflow '+overflow);
 const home=await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
 ok(home.status()===200,'homepage responds 200');
 ok(await page.locator('.map-home-section').count()===1,'new home feature present once');
 const h=await page.locator('.hero h1').innerText();
 ok(h.includes('Dormi abbastanza'),'original homepage hero unchanged');
 const next=await page.locator('.hero + .map-home-section').count();
 ok(next===1,'feature inserted immediately after hero');
 const nav=await page.locator('#nav-items a').allInnerTexts();
 ok(nav.indexOf('Autovalutazione')===nav.indexOf('Il metodo')+1,'main menu correct order');
 ok((await page.locator('.map-home-section .button-main').getAttribute('href'))==='autovalutazione/index.html','home CTA link');
 if(profile!=='desktop'){
  const width=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  ok(width<=4,'homepage horizontal overflow '+width);
  await page.locator('#menu-button').click();
  ok(await page.locator('#nav-items').evaluate(x=>x.classList.contains('open')),'mobile menu opens');
  ok(await page.locator('#nav-items a[href="autovalutazione/index.html"]').isVisible(),'mobile autovalutazione link visible');
 }
 await context.close();await browser.close();
 return {profile,engine:browserType.name(),checks};
}
(async()=>{
 const outputs=[];
 for(const [type,profile] of [[chromium,'desktop'],[chromium,'iPhone SE'],[webkit,'iPhone 13']])outputs.push(await exercise(type,profile));
 if(problems.length)throw Error(problems.join('; '));
 console.log(JSON.stringify({ok:true,outputs},null,2));
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
