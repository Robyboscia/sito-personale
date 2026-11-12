const assert=require("node:assert/strict");
const http=require("node:http");
const fs=require("node:fs/promises");
const path=require("node:path");
const {chromium}=require("playwright");

(async()=>{
  const root=path.resolve("laboratorio-funnel/mental-pro-2");
  const server=http.createServer(async(req,res)=>{
    try{
      const name=new URL(req.url,"http://localhost").pathname;
      if(!/^\/(?:index\.html|admin\.html|shared\.js|shop\.js|admin\.js|style\.css)$/.test(name)){
        res.writeHead(404);res.end("missing");return;
      }
      const ext=path.extname(name);
      const type=ext===".html"?"text/html":ext===".js"?"application/javascript":"text/css";
      const content=await fs.readFile(path.join(root,name));
      res.writeHead(200,{"content-type":type+"; charset=utf-8","cache-control":"no-store"});
      res.end(content);
    }catch{res.writeHead(500);res.end("read error");}
  });
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const port=server.address().port;
  const origin="http://127.0.0.1:"+port;
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  const pageErrors=[],external=[];
  page.on("pageerror",x=>pageErrors.push(x.message));
  page.on("request",request=>{if(!request.url().startsWith(origin))external.push(request.url());});
  const go=async url=>{await page.goto(origin+url);await page.waitForLoadState("domcontentloaded");};
  const tap=async re=>page.getByRole("button",{name:re}).click();
  const text=()=>page.locator("#app").innerText();
  try{
    await go("/index.html");
    assert.match(await text(),/La sera non ha bisogno di un'altra promessa/);
    assert.match(await text(),/47,00/);
    await page.screenshot({path:"mental2-funnel-landing-mobile.png",fullPage:true});
    await tap(/Scopri l'offerta iniziale/);
    await tap(/Simula l'acquisto da/);
    assert.match(await text(),/70,00/);
    assert.match(await text(),/39,00/); // 3 confezioni / 117 € con A
    assert.match(await text(),/24,00/); // risparmio effettivo
    await page.screenshot({path:"mental2-funnel-upsell-mobile.png",fullPage:true});
    await tap(/Sì, aggiungo 2 confezioni/);
    assert.match(await text(),/105,00/);
    assert.match(await text(),/37,00/);
    await tap(/Sì, aggiungo altre 3 confezioni/);
    assert.match(await text(),/222,00/);
    assert.match(await text(),/Confezioni totali\s*6/);
    await page.screenshot({path:"mental2-funnel-summary-mobile.png",fullPage:true});

    await tap(/Ricomincia la simulazione/);
    await tap(/Scopri l'offerta iniziale/);
    await tap(/Simula l'acquisto da/);
    await tap(/No, preferisco meno confezioni/);
    assert.match(await text(),/94,00/);
    await tap(/Sì, aggiungo 1 confezione/);
    assert.match(await text(),/94,00/);

    await go("/admin.html");
    assert.match(await page.locator("main").innerText(),/Decidi tu come vendere/);
    assert.match(await page.locator("#statistics").innerText(),/Checkout avviati/);
    await page.screenshot({path:"mental2-dashboard-mobile.png",fullPage:true});
    await page.locator("#base-price").fill("49");
    await page.locator("#field-offers-A-price").fill("72");
    await page.locator("#offer-order").selectOption("B,A");
    await tap(/Salva le modifiche$/);
    assert.match(await page.locator("#form-status").innerText(),/salvata/);
    await go("/index.html");
    assert.match(await text(),/49,00/);
    await tap(/Scopri l'offerta iniziale/);
    await tap(/Simula l'acquisto da/);
    assert.match(await text(),/105,00/); // B must now be the first upsell
    assert.match(await text(),/38,50/);  // 49+105 over 4 bottles = 38.50
    await tap(/Sì, aggiungo altre 3 confezioni/);
    assert.match(await text(),/72,00/);  // A now second
    await tap(/No, preferisco meno confezioni/); // A reject = down if enabled? second reject -> done
    assert.match(await text(),/154,00/); // base + B only

    await go("/admin.html");
    assert.equal(await page.locator("#base-price").inputValue(),"49");
    await page.locator("#field-offers-D-enabled").uncheck();
    await tap(/Salva le modifiche$/);
    await go("/index.html");
    await tap(/Scopri l'offerta iniziale/);
    await tap(/Simula l'acquisto da/);
    await tap(/No, concludo così/);  // B first, decline: no D and done
    assert.match(await text(),/Hai completato la prova/);

    await go("/admin.html");
    await tap(/Mostra JSON/);
    const exported=await page.locator("#json-box").inputValue();
    const parsed=JSON.parse(exported);
    assert.equal(parsed.base.price,49);
    assert.deepEqual(parsed.order,["B","A"]);
    page.once("dialog",dialog=>dialog.accept());
    await tap(/Ripristina i valori iniziali/);
    assert.equal(await page.locator("#base-price").inputValue(),"47");
    assert.equal(await page.locator("#offer-order").inputValue(),"A,B");
    // Export includes saved config, not test stats; import restores edited config.
    await page.locator("#json-box").fill(exported);
    page.once("dialog",dialog=>dialog.accept());
    await tap(/Importa JSON/);
    assert.equal(await page.locator("#base-price").inputValue(),"49");
    assert.equal(await page.locator("#offer-order").inputValue(),"B,A");

    // Ensure rejected unsafe/out-of-range values are not saved.
    await page.locator("#base-price").fill("-9");
    await tap(/Salva le modifiche$/);
    assert.match(await page.locator("#form-status").innerText(),/Non salvato/);
    await go("/index.html");
    assert.match(await text(),/49,00/);
    await go("/admin.html");
    page.once("dialog",dialog=>dialog.accept());
    await tap(/Azzera simulazioni/);
    assert.match(await page.locator("#statistics").innerText(),/Checkout avviati\s*0|0\s*Checkout avviati/);
    await page.setViewportSize({width:1280,height:850});
    await page.screenshot({path:"mental2-dashboard-desktop.png",fullPage:true});
    assert.deepEqual(pageErrors,[],"Unexpected JavaScript errors");
    assert.deepEqual(external,[],"Unexpected external network requests");
    console.log("OK Mental Pro 2.0: mobile checkout, 47→117→222, downsell 94, admin save/order/toggles, JSON, validation, local metrics, offline scripts");
  }finally{
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(err=>{console.error(err);process.exitCode=1;});
