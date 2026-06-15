# Checklist Landing Page — Roberto Boscia

Questo file è una memoria operativa: ogni volta che si costruisce o aggiorna una landing page, verificare tutti i punti prima del deploy.

---

## SEO & Structured Data

- [ ] **Schema.org JSON-LD** nel `<head>`: tipi `Person`, `MedicalBusiness`, `WebPage`, `Offer`
- [ ] **Open Graph** meta tags: `og:title`, `og:description`, `og:image` (1200×630), `og:site_name`
- [ ] **Google Search Console**: verificare proprietà via DNS TXT, inviare sitemap
- [ ] **Bing Webmaster Tools**: caricare `BingSiteAuth.xml` nella root, cliccare "Riprova"
- [ ] **Sitemap.xml** in root, referenziata in `robots.txt`
- [ ] **robots.txt** presente e corretto

---

## Performance

- [ ] Immagini con `loading="lazy"` (eccetto above-the-fold)
- [ ] Font Google con `display=swap`
- [ ] GA4 caricato in modo differito (non blocca rendering)
- [ ] GSAP con `defer`

---

## Mobile

- [ ] Foto hero: `object-fit: cover; object-position: center top` su mobile
- [ ] Container foto con `display: block` nel breakpoint mobile (evita problema flex height)
- [ ] Overlay `::before` disabilitato su mobile con `background: none !important`
- [ ] Sticky CTA bar mobile (mostra dopo 300px scroll, nasconde vicino al form)
- [ ] Test su viewport 390×844 (iPhone 14 Pro) — verificare che il viso sia visibile

---

## Conversioni

- [ ] **Testimonianze reali** (4–6 minimo) con nome + consenso GDPR scritto
- [ ] **Scarcity counter**: mostra posti disponibili per mese (JS dinamico)
- [ ] **Sticky CTA bar**: visibile su tutti i device (mobile + desktop)
- [ ] **Form contatto** con campo telefono opzionale
- [ ] **CTA principale** sopra la piega (above-the-fold)

---

## Anti-spam & Sicurezza

- [ ] **Honeypot** nel form: campo nascosto `name="full-name-hp"`, validato lato client
  ```html
  <div style="position:absolute;left:-9999px;top:-9999px;opacity:0;pointer-events:none;" aria-hidden="true">
    <input type="text" name="full-name-hp" tabindex="-1" autocomplete="off" />
  </div>
  ```
  ```js
  form.addEventListener('submit', function(e){
    var hp = form.querySelector('input[name="full-name-hp"]');
    if (hp && hp.value !== '') { e.preventDefault(); return false; }
  });
  ```

---

## GDPR & Privacy (obbligatorio in Italia)

- [ ] **Cookie banner** (Iubenda o equivalente) — obbligatorio se c'è GA4
- [ ] **Privacy Policy** pagina dedicata — obbligatoria
- [ ] Link a Privacy Policy nel footer e vicino al form

---

## Tracking

- [ ] **GA4** configurato con Measurement ID corretto
- [ ] **UTM cookie tracking**: salva `utm_source`, `utm_medium`, `utm_campaign` al primo accesso
  ```js
  (function(){
    var params = new URLSearchParams(window.location.search);
    var utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    var utms = {};
    utmKeys.forEach(function(k){ if(params.get(k)) utms[k] = params.get(k); });
    if (Object.keys(utms).length) {
      document.cookie = 'rb_utms=' + encodeURIComponent(JSON.stringify(utms)) + '; path=/; max-age=2592000';
    }
  })();
  ```

---

## Dati reali da richiedere al cliente

Prima di andare live, verificare di avere:

- [ ] Numero di telefono reale (per sticky CTA e footer)
- [ ] P.IVA
- [ ] Numero iscrizione Ordine professionale
- [ ] Email contatto
- [ ] Indirizzo completo
- [ ] Link social reali (Instagram, Facebook, LinkedIn)
- [ ] Testimonianze con nome e consenso scritto
- [ ] Foto profilo alta qualità (almeno 800×800px, viso visibile)
- [ ] Logo in SVG o PNG alta risoluzione
- [ ] Recensioni Google Business (se disponibili)

---

## Git & Deploy

- [ ] Branch di sviluppo: `claude/youthful-planck-XSYBQ` → merge su `main`
- [ ] Commit author: `Claude <noreply@anthropic.com>` (enforced da hook, mai usare `--no-verify`)
- [ ] GitHub Pages attivo su `main`
- [ ] Dominio custom configurato in repository Settings → Pages
- [ ] CNAME file presente nella root

---

## Competitor reference

- **dilettaghiglione.com** — buon esempio per: Google Reviews widget, scarcity counter, sticky bar desktop, UTM tracking, Iubenda cookie banner
- **ratinglab.eu** — buon esempio per: struttura autorità, sezione bio, FAQ
