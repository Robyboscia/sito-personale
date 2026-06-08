// Header scroll
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Mobile menu
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', navMenu.classList.contains('open'));
});
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navMenu.classList.remove('open'));
});

// GSAP
gsap.registerPlugin(ScrollTrigger);

// Hero entrance
gsap.from('.hero-badge', { opacity: 0, y: 20, duration: 0.8, delay: 0.3 });
gsap.from('.hook-text h1', { opacity: 0, y: 40, duration: 1, delay: 0.5 });
gsap.from('.hook-text .hero-sub', { opacity: 0, y: 30, duration: 0.9, delay: 0.75 });
gsap.from('.hero-actions', { opacity: 0, y: 25, duration: 0.8, delay: 0.95 });
gsap.from('.hero-image-right img', { opacity: 0, scale: 1.05, duration: 1.4, delay: 0.2, ease: 'power2.out' });

// Scroll animations helper
const scrollIn = (selector, vars = {}) => {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  gsap.from(selector, {
    scrollTrigger: { trigger: selector, start: 'top 85%', once: true },
    opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
    ...vars
  });
};

// Narrative paragraphs
gsap.utils.toArray('.narrative-inner > p, .narrative-inner > hr, .narrative-inner > ul, .narrative-inner > div').forEach((el, i) => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    opacity: 0, y: 20, duration: 0.6, ease: 'power2.out',
    delay: 0
  });
});

// Results grid
gsap.from('.result-item', {
  scrollTrigger: { trigger: '.results-grid', start: 'top 82%', once: true },
  opacity: 0, y: 25, duration: 0.55, stagger: 0.1, ease: 'power2.out'
});

// Product block
scrollIn('.product-name', { y: 40 });
gsap.from('.product-not-item', {
  scrollTrigger: { trigger: '.product-not', start: 'top 85%', once: true },
  opacity: 0, x: -20, duration: 0.5, stagger: 0.1
});
gsap.from('.include-item', {
  scrollTrigger: { trigger: '.includes-grid', start: 'top 82%', once: true },
  opacity: 0, y: 30, duration: 0.6, stagger: 0.12, ease: 'power2.out'
});

// Value stack
scrollIn('.value-stack', { y: 40 });
gsap.from('.value-row', {
  scrollTrigger: { trigger: '.value-stack', start: 'top 80%', once: true },
  opacity: 0, x: -15, duration: 0.5, stagger: 0.1, delay: 0.2
});

// CTA
scrollIn('.cta-final-inner', { y: 35 });
scrollIn('.form-section-inner', { y: 30 });

// Self-check cards
gsap.from('.check-card', {
  scrollTrigger: { trigger: '.check-grid', start: 'top 85%', once: true },
  opacity: 0, y: 25, duration: 0.5, stagger: 0.08, ease: 'power2.out'
});

// Comparison block
gsap.from('.comp-col', {
  scrollTrigger: { trigger: '.comparison-block', start: 'top 85%', once: true },
  opacity: 0, y: 20, duration: 0.6, stagger: 0.2, ease: 'power2.out'
});

// Stats counters
document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  gsap.to({ val: 0 }, {
    scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    val: target, duration: 1.8, ease: 'power2.out',
    onUpdate() { el.textContent = Math.round(this.targets()[0].val) + suffix; }
  });
});

// Pillar bars
document.querySelectorAll('.pillar-bar-fill').forEach(bar => {
  const w = bar.dataset.width + '%';
  gsap.to(bar, {
    scrollTrigger: { trigger: bar, start: 'top 88%', once: true },
    width: w, duration: 1.2, ease: 'power2.out', delay: 0.2
  });
});

// Process steps
gsap.from('.process-step', {
  scrollTrigger: { trigger: '.process-steps', start: 'top 80%', once: true },
  opacity: 0, y: 40, duration: 0.7, stagger: 0.2, ease: 'power2.out'
});

// Contact form
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Richiesta inviata ✓ Ti rispondo entro 24 ore';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Prenota la valutazione Assetto Biologico™';
      btn.disabled = false;
      form.reset();
    }, 4000);
  });
}
