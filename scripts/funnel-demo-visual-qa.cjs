const assert=require("node:assert/strict");
const {chromium}=require("playwright");
const {pathToFileURL}=require("node:url");
const path=require("node:path");
(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  const errors=[];
  page.on("pageerror", e=>errors.push(e.message));
  const root=pathToFileURL(path.resolve("laboratorio-funnel/prova.html")).href;
  async function start(funnel){await page.goto(root+"?funnel="+funnel);await page.getByRole("button",{name:/Simula l.acquisto/}).click();}
  await page.goto(root+"?funnel=mental");
  await page.waitForSelector(".hero");
  assert.match(await page.locator(".hero").innerText(),/Mental Pro/);
  await page.screenshot({path:"funnel-demo-preview-mental.png",fullPage:true});
  await page.getByRole("button",{name:/Simula l.acquisto/}).click();
  assert.match(await page.locator("#screen").innerText(),/70,00/);
  assert.match(await page.locator("#screen").innerText(),/39 € l\x27una/);
  assert.match(await page.locator("#screen").innerText(),/24 € in meno/);
  await page.screenshot({path:"funnel-demo-preview-upsell.png",fullPage:true});
  await page.locator("#screen .btn-primary").click();
  assert.match(await page.locator("#screen").innerText(),/105,00/);
  assert.match(await page.locator("#screen").innerText(),/37 € l\x27una/);
  await page.locator("#screen .btn-primary").click();
  assert.match(await page.locator("#screen").innerText(),/222,00/);

  await start("mental");
  await page.locator("#screen .btn-secondary").click();
  assert.match(await page.locator("#screen").innerText(),/94,00/);
  await page.locator("#screen .btn-primary").click();
  assert.match(await page.locator("#screen").innerText(),/94,00/);

  await start("mental");
  await page.locator("#screen .btn-secondary").click();
  await page.locator("#screen .btn-secondary").click();
  assert.match(await page.locator("#screen").innerText(),/47,00/);

  for(const funnel of ["libro","formazione"]){
    await start(funnel);
    assert.match(await page.locator("#screen").innerText(),/Prezzo da definire/);
    await page.locator("#screen .btn-primary").click();
    await page.locator("#screen .btn-secondary").click();
    assert.match(await page.locator("#screen").innerText(),/Da definire/);
  }

  await page.goto(root+"?funnel=mental");
  await page.getByRole("button",{name:"Libro e guide"}).click();
  assert.match(await page.locator(".hero").innerText(),/Dormire è facile/);
  assert.ok(new URL(page.url()).searchParams.get("funnel")==="libro");
  assert.deepEqual(errors,[],"Errori JavaScript nel browser");
  await browser.close();
  console.log("OK: 3 funnel, 5 percorsi checkout, navigazione mobile, totali e nessun JS error");
})().catch(e=>{console.error(e);process.exitCode=1;});
