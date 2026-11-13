/* Deliberately disabled until the real HTTPS Brevo double-opt-in form is ready.
   This script never collects email addresses, data about sleep or user behavior. */
(() => {
  const confirmedBrevoSignupUrl = '';
  if (!confirmedBrevoSignupUrl) return;
  let url;
  try { url = new URL(confirmedBrevoSignupUrl); } catch { return; }
  if (url.protocol !== 'https:') return;
  document.querySelectorAll('[data-brevo-newsletter-link]').forEach((link) => {
    link.href = url.href;
    link.hidden = false;
    link.rel = 'noopener noreferrer';
    link.target = '_blank';
  });
  document.querySelectorAll('[data-brevo-newsletter-pending]').forEach((node) => { node.hidden = true; });
})();