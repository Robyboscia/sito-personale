/* Lead capture: deployment switch remains off until real Brevo forms/consent are configured.
 * This is a *soft* lead gate, not an access-control system.
 * A static page cannot prove that a form was completed or protect direct links.
 */
(function(){
  'use strict';
  const config = {
    enabled: false,  // Do not enable until the hosted Brevo forms are set up and tested.
    formUrls: {
      laboratorio: '',
      autovalutazione: ''
    }
  };
  const page = document.body?.dataset?.leadPage;
  if (!page || !Object.hasOwn(config.formUrls,page)) return;
  const params = new URLSearchParams(location.search);
  const preview = params.get('anteprima-lead') === '1';
  const enabled = config.enabled && /^https:\/\//.test(config.formUrls[page]);
  if (!preview && !enabled) return;
  const key = 'roberto-lead-unlocked-' + page;
  const confirmed = params.get('accesso') === 'confermato';
  if (enabled && confirmed) {
    try { sessionStorage.setItem(key,'1'); } catch(e) {}
    history.replaceState(null,'',location.pathname + location.hash);
  }
  if (!preview && enabled) {
    try { if (sessionStorage.getItem(key) === '1') return; } catch(e) {}
  }
  const root = document.createElement('div');
  root.className='lead-capture-overlay';
  root.setAttribute('role','dialog');
  root.setAttribute('aria-modal','true');
  root.setAttribute('aria-labelledby','lead-capture-title');
  const content=document.createElement('div');content.className='lead-capture-inner';
  const eyebrow=document.createElement('div');eyebrow.className='lead-capture-eyebrow';
  eyebrow.textContent=page==='laboratorio'?'ACCESSO AL LABORATORIO DEL SONNO':'ACCESSO ALLE AUTOVALUTAZIONI';
  const h=document.createElement('h2');h.id='lead-capture-title';h.innerHTML='GRATIS. SÌ. MA NON FACCIAMO FINTA CHE SIA <em>BENEFICENZA.</em>';
  const paras=[
    'Ho messo a tua disposizione strumenti, questionari e risorse che mi sono costati tempo, studio e lavoro.',
    'Tu non paghi un euro. Io, però, non sono qui soltanto per collezionare ringraziamenti.',
    'Voglio farti conoscere il mio lavoro. E sì, mi piacerebbe anche che, un giorno, acquistassi un mio libro, un prodotto o una consulenza.',
    'Almeno abbiamo messo le carte in tavola.',
    'Per accedere mi basta un indirizzo email valido: riceverai il link. Per ricevere anche le mie offerte dovrai invece dare un consenso separato e facoltativo.'
  ];
  const action=document.createElement('div');action.className='lead-capture-action';
  if (preview || !enabled) {
    const notice=document.createElement('div');notice.className='lead-capture-preview';notice.textContent='ANTEPRIMA: il collegamento a Brevo non è ancora attivo. Nessuna email viene raccolta.';
    const label=document.createElement('label');label.htmlFor='lead-preview-email';label.textContent='La tua email';
    const input=document.createElement('input');input.id='lead-preview-email';input.type='email';input.placeholder='nome@esempio.it';input.disabled=true;
    const button=document.createElement('button');button.type='button';button.disabled=true;button.textContent='SBLOCCA GRATIS GLI STRUMENTI';
    const opt=document.createElement('label');opt.className='lead-capture-consent';
    const check=document.createElement('input');check.type='checkbox';check.disabled=true;
    const optText=document.createElement('span');optText.textContent='Sì, voglio ricevere contenuti informativi e comunicazioni promozionali su libri, integratori, corsi e consulenze. Posso revocare il consenso quando voglio.';
    opt.append(check,optText);action.append(notice,label,input,button,opt);
  } else {
    const intro=document.createElement('p');intro.textContent='Per garantire la verifica dell’email e la registrazione separata dell’eventuale consenso marketing, il modulo si apre su Brevo.';
    const go=document.createElement('a');go.className='lead-capture-cta';go.href=config.formUrls[page];go.textContent='SBLOCCA GRATIS GLI STRUMENTI';go.rel='noopener noreferrer';
    action.append(intro,go);
  }
  const small=document.createElement('small');small.innerHTML='Il consenso commerciale è facoltativo: l’accesso è disponibile anche senza autorizzare le promozioni. Leggi la <a href="/privacy/">Privacy Policy</a>. Non inserire informazioni sanitarie nel modulo.';
  action.append(small);
  content.append(eyebrow,h);
  for(const p of paras){const el=document.createElement('p');el.textContent=p;content.append(el);}
  content.append(action);
  if(preview){const close=document.createElement('button');close.className='lead-capture-close';close.textContent='Chiudi anteprima';close.addEventListener('click',()=>{root.remove();document.body.classList.remove('lead-capture-lock')});content.append(close);}
  root.append(content);document.body.classList.add('lead-capture-lock');document.body.append(root);
  const focus=content.querySelector('input:not([disabled]),a.lead-capture-cta,button.lead-capture-close');
  if(focus)focus.focus({preventScroll:true});
})();
