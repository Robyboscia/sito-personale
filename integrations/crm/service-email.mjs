const site = 'https://drrobertoboscia.com';
const guide = site + '/risorse/guida-sette-giorni-sonno/';
const sender = { email: 'info@drrobertoboscia.com', name: 'Dr. Roberto Boscia' };

function reply(status, error, origin) {
  return Response.json(error ? { error } : { accepted: true }, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Vary': 'Origin',
      ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowedOrigins = (env.SERVICE_ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean);
    if (!origin || !allowedOrigins.includes(origin)) return reply(403, 'Origine non autorizzata.');
    const respond = (status, error) => reply(status, error, origin);
    if (new URL(request.url).pathname !== '/invia-guida') return respond(404, 'Risorsa non trovata.');
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store',
        'Vary': 'Origin',
      } });
    }
    if (request.method !== 'POST') return respond(405, 'Metodo non consentito.');
    // Staging is the safe default. Production requires explicit configuration.
    const mode = env.SERVICE_MODE || 'staging';
    const testRecipient = (env.SERVICE_TEST_RECIPIENT || '').trim().toLowerCase();
    if (!['staging', 'production'].includes(mode) || !env.TURNSTILE_SECRET ||
        !env.TURNSTILE_HOSTNAME || !env.BREVO_API_KEY || !env.SERVICE_RATE_LIMITER ||
        (mode === 'staging' && !testRecipient)) return respond(503, 'Servizio non disponibile.');
    if (!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) {
      return respond(415, 'Formato non supportato.');
    }
    const reader = request.body?.getReader();
    if (!reader) return respond(400, 'Richiesta non valida.');
    const decoder = new TextDecoder();
    let body = '';
    let size = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return respond(413, 'Richiesta troppo grande.');
      }
      body += decoder.decode(value, { stream: true });
    }
    const fields = new URLSearchParams(body + decoder.decode());
    const email = (fields.get('email') || '').trim();
    const token = fields.get('cf-turnstile-response');
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !token || token.length > 2048) {
      return respond(400, 'Controlla l’indirizzo e la verifica del modulo.');
    }

    if (mode === 'staging' && email.toLowerCase() !== testRecipient) {
      return respond(403, 'Destinatario non abilitato al collaudo.');
    }

    try {
      // Cloudflare's native limiter is approximate and per location; use independent IP and recipient keys.
      const ip = request.headers.get('CF-Connecting-IP');
      if (!ip) return respond(403, 'Richiesta non verificabile.');
      const ipLimit = await env.SERVICE_RATE_LIMITER.limit({ key: 'ip:' + ip });
      if (!ipLimit.success) return respond(429, 'Troppe richieste. Riprova più tardi.');
      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token }),
        signal: AbortSignal.timeout(8000),
      });
      const result = verification.ok ? await verification.json() : {};
      if (!result.success || result.hostname !== env.TURNSTILE_HOSTNAME || result.action !== 'invia-guida') {
        return respond(403, 'Verifica del modulo non riuscita.');
      }
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.toLowerCase()));
      const recipientKey = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      const recipientLimit = await env.SERVICE_RATE_LIMITER.limit({ key: 'recipient:' + recipientKey });
      if (!recipientLimit.success) return respond(429, 'Troppe richieste. Riprova più tardi.');
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
      return sent.status === 201 ? respond(202) : respond(502, 'Non siamo riusciti a inviare la guida.');
    } catch {
      return respond(502, 'Non siamo riusciti a inviare la guida.');
    }
  },
};
