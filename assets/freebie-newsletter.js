/* The newsletter form is hosted by Brevo.
   This script never collects email addresses, data about sleep or user behavior. */
(() => {
  const confirmedBrevoSignupUrl = 'https://509774ab.sibforms.com/serve/MUIFAHAkJkR76klJ8itC2XlX_o-uvuXUihShgvXSUSf-za7eyrjLBbrSdNsh7ioT7Zn31LrnDPkKxCXjJWTlvYzAqF0Gk_4Qavr8CNyuxm-nK9czAvC514W4ywvt5kyocw0RCPUzTv4CtwqdJ_G1q3T17sjwpp9QThpfGDWo-sJ3ksy8obvwqxYyZPCK4Yo5ue4ugyusGzDekR3flQ==';
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