const site = 'https://drrobertoboscia.com';
const guide = site + '/risorse/guida-sette-giorni-sonno/';
const sender = { email: 'info@drrobertoboscia.com', name: 'Dr. Roberto Boscia' };

function reply(status, error) {
  return Response.json(error ? { error } : { accepted: true }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/invia-guida') return reply(404, 'Risorsa non trovata.');
    if (request.method !== 'POST') return reply(405, 'Metodo non consentito.');
    if (!env.TURNSTILE_SECRET || !env.BREVO_API_KEY) return reply(503, 'Servizio non disponibile.');
    if (!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) {
      return reply(415, 'Formato non supportato.');
    }
    const reader = request.body?.getReader();
    if (!reader) return reply(400, 'Richiesta non valida.');
    const decoder = new TextDecoder();
    let body = '';
    let size = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return reply(413, 'Richiesta troppo grande.');
      }
      body += decoder.decode(value, { stream: true });
    }
    const fields = new URLSearchParams(body + decoder.decode());
    const email = (fields.get('email') || '').trim();
    const token = fields.get('cf-turnstile-response');
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !token || token.length > 2048) {
      return reply(400, 'Controlla l’indirizzo e la verifica del modulo.');
    }

    try {
      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token }),
        signal: AbortSignal.timeout(8000),
      });
      const result = verification.ok ? await verification.json() : {};
      if (!result.success || result.hostname !== env.TURNSTILE_HOSTNAME || result.action !== 'invia-guida') {
        return reply(403, 'Verifica del modulo non riuscita.');
      }
      const sent = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender,
          to: [{ email }],
          subject: 'La guida gratuita che hai richiesto',
          textContent: 'Puoi leggere e stampare la guida 7 giorni per preparare il sonno da qui:\n' + guide
            + '\n\nBuona lettura,\nDr. Roberto Boscia',
        }),
        signal: AbortSignal.timeout(8000),
      });
      return sent.status === 201 ? reply(202) : reply(502, 'Non siamo riusciti a inviare la guida.');
    } catch {
      return reply(502, 'Non siamo riusciti a inviare la guida.');
    }
  },
};
