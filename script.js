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

// GSAP animations
gsap.registerPlugin(ScrollTrigger);

// Hero entrance
gsap.from('.hero-badge', { opacity: 0, y: 20, duration: 0.8, delay: 0.3 });
gsap.from('.hero h1', { opacity: 0, y: 40, duration: 1, delay: 0.5 });
gsap.from('.hero-sub', { opacity: 0, y: 30, duration: 0.9, delay: 0.75 });
gsap.from('.hero-actions', { opacity: 0, y: 25, duration: 0.8, delay: 0.95 });
gsap.from('.hero-stats > div', {
  opacity: 0, y: 20, duration: 0.7, delay: 1.1, stagger: 0.15
});
gsap.from('.hero-image img', {
  opacity: 0, scale: 1.05, duration: 1.4, delay: 0.2, ease: 'power2.out'
});

// Counter animation for stats
function animateCounter(el, target, suffix = '') {
  gsap.to({ val: 0 }, {
    val: target,
    duration: 1.8,
    ease: 'power2.out',
    delay: 1.2,
    onUpdate() {
      el.textContent = Math.round(this.targets()[0].val) + suffix;
    }
  });
}

document.querySelectorAll('.stat-num[data-count]').forEach(el => {
  const target = parseInt(el.dataset.count);
  const suffix = target >= 100 ? '+' : (target >= 10 ? '+' : '');
  animateCounter(el, target, suffix);
});

// Section animations
const scrollAnim = (selector, vars = {}) => {
  gsap.from(selector, {
    scrollTrigger: { trigger: selector, start: 'top 82%', once: true },
    opacity: 0, y: 35, duration: 0.75, ease: 'power2.out',
    ...vars
  });
};

// Servizi
scrollAnim('#servizi .section-eyebrow');
scrollAnim('#servizi .section-heading');
scrollAnim('#servizi .section-lead', { delay: 0.1 });
gsap.from('.service-card', {
  scrollTrigger: { trigger: '.services-grid', start: 'top 80%', once: true },
  opacity: 0, y: 45, duration: 0.7, ease: 'power2.out', stagger: 0.15
});

// Chi sono
scrollAnim('.about-photo-wrap', { x: -30, y: 0 });
scrollAnim('.about-text .section-eyebrow', { delay: 0.1 });
scrollAnim('.about-text .section-heading', { delay: 0.2 });
gsap.from('.about-text p', {
  scrollTrigger: { trigger: '.about-text', start: 'top 78%', once: true },
  opacity: 0, y: 20, duration: 0.6, stagger: 0.12, delay: 0.3
});
scrollAnim('.credentials', { delay: 0.5 });

// Prezzi
scrollAnim('.pricing-intro', { y: 25 });
gsap.from('.pricing-card', {
  scrollTrigger: { trigger: '.pricing-grid', start: 'top 80%', once: true },
  opacity: 0, y: 40, duration: 0.7, ease: 'power2.out', stagger: 0.18
});

// Contatti
scrollAnim('.contact-info .section-eyebrow');
scrollAnim('.contact-info .section-heading', { delay: 0.1 });
scrollAnim('.contact-info > p', { delay: 0.2 });
gsap.from('.contact-item', {
  scrollTrigger: { trigger: '.contact-info', start: 'top 80%', once: true },
  opacity: 0, x: -20, duration: 0.6, stagger: 0.12, delay: 0.3
});
scrollAnim('.contact-form', { x: 30, y: 0, delay: 0.1 });

// Contact form submit
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Messaggio inviato ✓';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Prenota Consulenza';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
}
