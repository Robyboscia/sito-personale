/* Audit tecnico del sito pubblico: dati diagnostici senza valori di cookie o dati degli utenti.
 * Esecuzione: npm install --no-save playwright@1.56.1 && npx playwright install chromium
 *             node scripts/privacy-cookie-audit.cjs
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const BASE = process.env.AUDIT_BASE_URL || 'https://drrobertoboscia.com';
const root = new URL(BASE);
const outputDir = path.resolve('audit-output');
const pages = [
  ['Homepage', '/'],
  ['Assetto Biologico', '/assetto-biologico/'],
  ['Mental Pro', '/mental-pro/'],
  ['Laboratorio', '/laboratorio-del-sonno/'],
  ['Diario 14 notti', '/laboratorio-del-sonno/diario/'],
  ['Diario PRO', '/laboratorio-del-sonno/strumenti/diario-pro/'],
  ['Check-up', '/laboratorio-del-sonno/strumenti/check-up/'],
  ['Caffeina', '/laboratorio-del-sonno/strumenti/caffeina/'],
  ['Turnisti', '/laboratorio-del-sonno/strumenti/turnisti/'],
  ['Privacy', '/privacy/'],
  ['Cookie', '/cookie/'],
  ['Contatti', '/contatti/']
];
const knownTrackingHosts = [
  /(^|\.)google-analytics\.com$/i,
  /(^|\.)googletagmanager\.com$/i,
  /(^|\.)doubleclick\.net$/i,
  /(^|\.)googleadservices\.com$/i,
  /(^|\.)connect\.facebook\.net$/i,
  /(^|\.)analytics\.tiktok\.com$/i,
  /(^|\.)clarity\.ms$/i,
  /(^|\.)hotjar\.com$/i,
  /(^|\.)bat\.bing\.com$/i
];
const trackingPathPatterns = [
  /(^|\.)facebook\.com\/tr(?:\/|$)/i,
  /(^|\.)tiktok\.com\/i18n\/pixel/i
];

function endpoint(raw) {
  try {
    const u = new URL(raw);
    return u.origin + u.pathname; // mai salvare query string, fragment o corpi di richieste
  } catch {
    return '[URL non valida]';
  }
}
function host(raw) {
  try { return new URL(raw).hostname.toLowerCase(); } catch { return 'non-valido'; }
}
function external(raw) {
  try { return new URL(raw).origin !== root.origin; } catch { return false; }
}
function tracker(raw) {
  const h = host(raw);
  const p = endpoint(raw).replace(/^https?:\/\//i, '');
  return knownTrackingHosts.some(re => re.test(h)) ||
    trackingPathPatterns.some(re => re.test(p));
}
function cleanError(e) {
  return String(e && e.message ? e.message : e).split('\n')[0].slice(0, 240);
}
function cookieInfo(cookie) {
  return {
    name: cookie.name, domain: cookie.domain, path: cookie.path,
    expires: cookie.expires === -1 ? 'sessione' : new Date(cookie.expires * 1000).toISOString(),
    secure: cookie.secure, httpOnly: cookie.httpOnly, sameSite: cookie.sameSite,
    partitionKey: cookie.partitionKey || null
  };
}
async function storageKeys(page) {
  return page.evaluate(() => {
    const get = (storage) => {
      try { return Object.keys(storage).sort(); } catch { return ['[accesso negato]']; }
    };
    let cookieNames = [];
    try {
      cookieNames = document.cookie.split(';').map(s => s.trim().split('=')[0])
        .filter(Boolean).sort();
    } catch { cookieNames = ['[accesso negato]']; }
    return {
      localStorageKeys: get(localStorage),
      sessionStorageKeys: get(sessionStorage),
      documentCookieNames: cookieNames
    };
  });
}
function markdownCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}
function uniqueSorted(values) {
  return Array.from(new Set(values)).sort();
}
async function inspectPage(browser, label, pathname) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const url = new URL(pathname, root).href;
  const requests = [];
  const failed = [];
  const setCookieNames = [];
  const pendingHeaders = [];
  page.on('request', request => {
    const raw = request.url();
    requests.push({
      url: endpoint(raw), host: host(raw), resourceType: request.resourceType(),
      externalOrigin: external(raw), trackingCandidate: tracker(raw)
    });
  });
  page.on('requestfailed', request => {
    failed.push({ url: endpoint(request.url()), error: cleanError(request.failure()?.errorText || 'errore') });
  });
  page.on('response', response => {
    pendingHeaders.push((async () => {
      const values = await response.headerValues('set-cookie');
      for (const value of values) {
        const first = value.split(';')[0];
        const name = first.slice(0, first.indexOf('=')).trim();
        if (name && /^[\x21-\x7e]+$/.test(name)) {
          setCookieNames.push({ domain: host(response.url()), name });
        }
      }
    })().catch(() => {}));
  });

  const result = {
    label, path: pathname, url, httpStatus: null, title: '', cookies: [],
    setCookieNames: [], storage: null, requests: [], externalHosts: [],
    trackingRequests: [], requestFailures: [], error: null, hasConsentUI: false
  };
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    result.httpStatus = response?.status() ?? null;
    await page.waitForTimeout(2000);
    result.title = await page.title();
    result.cookies = (await context.cookies()).map(cookieInfo);
    result.storage = await storageKeys(page);
    result.hasConsentUI = (await page.locator(
      '[id*="cookie-banner" i], [class*="cookie-banner" i], [id*="cookie-consent" i], [data-testid*="cookie-consent" i]'
    ).count()) > 0;
  } catch (error) {
    result.error = cleanError(error);
  }
  await Promise.allSettled(pendingHeaders);
  result.setCookieNames = uniqueSorted(setCookieNames.map(x => x.domain + ' / ' + x.name))
    .map(x => ({ domain: x.split(' / ')[0], name: x.split(' / ')[1] }));
  result.requests = Array.from(new Map(requests.map(item => [
    item.url + '|' + item.resourceType, item
  ])).values());
  result.externalHosts = uniqueSorted(result.requests.filter(x => x.externalOrigin).map(x => x.host));
  result.trackingRequests = result.requests.filter(x => x.trackingCandidate);
  result.requestFailures = failed;
  await context.close();
  return result;
}
async function diaryOptIn(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const summary = { tested: false, before: [], afterOptIn: [], afterOptOut: [], result: 'non eseguito', error: null };
  try {
    const response = await page.goto(new URL('/laboratorio-del-sonno/diario/', root).href, {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    if (!response || response.status() >= 400) throw new Error('Diario non raggiungibile');
    await page.locator('#sd-persist').waitFor({ state: 'visible', timeout: 12000 });
    summary.before = (await storageKeys(page)).localStorageKeys;
    await page.locator('#sd-persist').check();
    summary.afterOptIn = (await storageKeys(page)).localStorageKeys;
    await page.locator('#sd-persist').uncheck();
    summary.afterOptOut = (await storageKeys(page)).localStorageKeys;
    summary.tested = true;
    const key = 'roberto-boscia.sleep-diary.v1';
    summary.result =
      !summary.before.includes(key) &&
      summary.afterOptIn.includes(key) &&
      !summary.afterOptOut.includes(key)
      ? 'PASS: nessun salvataggio iniziale, attivazione esplicita e cancellazione alla disattivazione'
      : 'ATTENZIONE: sequenza localStorage diversa da quella attesa';
  } catch (error) {
    summary.error = cleanError(error);
  }
  await context.close();
  return summary;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const report = {
    generatedUtc: new Date().toISOString(),
    baseUrl: root.origin,
    browser: 'Chromium ' + browser.version(),
    scope: 'Sessioni pulite e senza consenso/interazione, salvo il test separato del salvataggio Diario',
    limitations: [
      'La presenza di richieste verso terzi non dimostra da sola profilazione o violazione GDPR.',
      'Il report osserva Chromium Linux in GitHub Actions; non Safari su iPhone.',
      'document.cookie non espone cookie HttpOnly: usare anche browserContext.cookies e Set-Cookie.',
      'I cookie bloccati dal browser potrebbero non comparire; le condizioni variano con dispositivo, browser, geografia e CDN.',
      'Non vengono riportati valori dei cookie, valori dello storage, query string, payload o dati personali.'
    ],
    pages: [],
    diaryOptIn: null
  };
  try {
    for (const [label, pathname] of pages) {
      process.stdout.write('Audit: ' + pathname + '\n');
      report.pages.push(await inspectPage(browser, label, pathname));
    }
    report.diaryOptIn = await diaryOptIn(browser);
  } finally {
    await browser.close();
  }
  const trackingPages = report.pages.filter(p => p.trackingRequests.length);
  const broken = report.pages.filter(p => p.error || !p.httpStatus || p.httpStatus >= 400);
  const allHosts = uniqueSorted(report.pages.flatMap(p => p.externalHosts));
  const cookieKeys = uniqueSorted(report.pages.flatMap(p =>
    p.cookies.map(c => c.domain + '/' + c.name)));
  const lines = [
    '# Audit tecnico privacy e cookie — drrobertoboscia.com',
    '',
    '**Data UTC:** ' + report.generatedUtc,
    '**Browser:** ' + report.browser,
    '**Metodo:** accesso in contesti nuovi, nessun consenso e nessun dato personale digitato.',
    '',
    '## Risultati principali',
    '',
    '- Pagine esaminate: **' + report.pages.length + '**.',
    '- Pagine non raggiungibili/errore: **' + broken.length + '**.',
    '- Pagine con richieste a host noti per tracciamento (euristica): **' + trackingPages.length + '**.',
    '- Host esterni rilevati: **' + allHosts.length + '**.',
    '- Coppie dominio/nome cookie osservate: **' + cookieKeys.length + '** (nessun valore salvato).',
    '- Diario, opt-in e opt-out: **' + (report.diaryOptIn?.result || 'non eseguito') + '**.',
    '',
    '## Pagine',
    '',
    '| Pagina | HTTP | Cookie | Host esterni | Tracker sospetti | Memoria locale |',
    '|---|---:|---:|---:|---:|---|'
  ];
  for (const p of report.pages) {
    const status = p.error ? 'ERRORE' : String(p.httpStatus);
    lines.push('| ' + markdownCell(p.label) + ' | ' + markdownCell(status) +
      ' | ' + p.cookies.length + ' | ' + p.externalHosts.length +
      ' | ' + p.trackingRequests.length + ' | ' +
      markdownCell((p.storage?.localStorageKeys || []).join(', ') || 'nessuna') + ' |');
  }
  lines.push('', '## Host esterni effettivamente richiesti', '');
  lines.push(...(allHosts.length ? allHosts.map(h => '- ' + h) : ['Nessuno rilevato.']));
  lines.push('', '## Cookie osservati (solo nome e attributi)', '');
  lines.push(...(cookieKeys.length ? report.pages.flatMap(p =>
    p.cookies.map(c => '- **' + p.label + '**: ' + c.domain + ' / ' + c.name +
      ' — scadenza: ' + c.expires + '; SameSite: ' + c.sameSite +
      '; Secure: ' + c.secure + '; HttpOnly: ' + c.httpOnly))
    : ['Nessun cookie osservato nelle sessioni testate. **Non è prova di assenza universale di cookie.**']));
  lines.push('', '## Risposte Set-Cookie rilevate (nomi, senza valori)', '');
  const setCookieList = uniqueSorted(report.pages.flatMap(p =>
    p.setCookieNames.map(c => p.label + ': ' + c.domain + ' / ' + c.name)));
  lines.push(...(setCookieList.length ? setCookieList.map(x => '- ' + x) : ['Nessuna rilevata.']));
  lines.push('', '## Richieste a tracker noti (euristica)', '');
  lines.push(...(trackingPages.length ? trackingPages.flatMap(p =>
    p.trackingRequests.map(r => '- **' + p.label + '**: ' + r.url))
    : ['Nessuna richiesta osservata verso i domini/pattern noti definiti nello script.']));
  lines.push('', '## Problemi di caricamento', '');
  for (const p of report.pages) {
    if (p.error) lines.push('- **' + p.label + '**: ' + p.error);
    for (const failed of p.requestFailures) lines.push('- **' + p.label + '**: ' + failed.url + ' — ' + failed.error);
  }
  if (!report.pages.some(p => p.error || p.requestFailures.length)) lines.push('Nessun errore registrato.');
  lines.push('', '## Salvataggio Diario', '');
  lines.push('- ' + report.diaryOptIn.result);
  if (report.diaryOptIn.error) lines.push('- Errore: ' + report.diaryOptIn.error);
  lines.push('- Prima: ' + report.diaryOptIn.before.join(', '));
  lines.push('- Dopo attivazione: ' + report.diaryOptIn.afterOptIn.join(', '));
  lines.push('- Dopo disattivazione: ' + report.diaryOptIn.afterOptOut.join(', '));
  lines.push('', '## Limiti e significato', '');
  for (const limitation of report.limitations) lines.push('- ' + limitation);
  lines.push('', 'Il report **non** certifica conformità GDPR e non sostituisce la valutazione del titolare o di un professionista privacy.');
  fs.writeFileSync(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(outputDir, 'report.md'), lines.join('\n') + '\n');
  process.stdout.write(lines.slice(0, 20).join('\n') + '\n');
  if (broken.length || report.diaryOptIn.error) {
    console.error('Controllo non completo: aprire report.md');
    process.exitCode = 1;
  }
}
main().catch(error => {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'error.txt'), cleanError(error) + '\n');
  console.error(error);
  process.exitCode = 1;
});
