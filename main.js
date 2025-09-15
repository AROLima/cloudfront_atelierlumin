/* =============================================
   Atelier Lumin (nome fictício) - main.js
   -------------------------------------------------
   Funções de inicialização de animações (GSAP) e interações.
   Animações respeitam prefers-reduced-motion.

   COMO DESATIVAR TODAS AS ANIMAÇÕES:
   - Definir const DISABLE_ANIMATIONS = true;
   - Ou adicionar body class="no-motion" manualmente.

   TESTES MANUAIS SUGERIDOS:
   1. Hero: Recarregar página -> texto e imagem sobem com fade.
   2. Scroll: Rolar até Serviços -> cards aparecem com scale/opacity.
   3. Galeria: Hover em imagens -> leve scale; clique -> modal com zoom.
   4. Depoimentos: Observa slider trocando a cada ~5s e barra de progresso.
   5. Header sticky: Rolar 120px -> altura reduz e sombra aparece.
   6. CTA final: Ao focar/hover, pulso pausa; sem foco volta.
   7. Formulário: Enviar vazio -> mensagens de erro; preencher válido -> sucesso.
   8. Redução de movimento: Ativar em SO -> animações reduzidas/omitidas.

   DEPLOY (resumo):
   - GitHub Pages: Commit -> Settings -> Pages -> branch main / root.
   - Netlify: Arrastar pasta do projeto para UI do Netlify ou conectar repositório.
   - Atualizar meta OG e URL canonical ao publicar.
   ============================================= */

/* Config global */
const DISABLE_ANIMATIONS = false; // pode alterar para true para debug ou auditoria

// Detecção de movimento reduzido (dinâmica para reagir a mudança do SO)
let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
motionQuery.addEventListener?.('change', e => { prefersReducedMotion = e.matches; });

// Função para verificar GSAP / plugin a qualquer momento
function gsapReady() {
  return typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
}

// Registrar plugin se já disponível
if (gsapReady()) {
  window.gsap.registerPlugin(window.ScrollTrigger);
}

// Early exit condicional (permite modo reduzido leve futuramente)
function animationsEnabled() {
  if (DISABLE_ANIMATIONS) return false;
  if (document.body.classList.contains('no-motion')) return false;
  if (!gsapReady()) return false;
  if (prefersReducedMotion) return false; // pode adaptar para 'modo leve'
  return true;
}

// Fallback dinâmico: se GSAP não carregou (ex: CDN bloqueada), tentar unpkg
function ensureGSAP(callback) {
  if (gsapReady()) { callback && callback(); return; }
  const existing = document.querySelector('script[data-gsap-fallback]');
  if (existing) { existing.addEventListener('load', () => { if (gsapReady()) { window.gsap.registerPlugin(window.ScrollTrigger); callback && callback(); } }); return; }
  const core = document.createElement('script');
  core.src = 'https://unpkg.com/gsap@3.12.5/dist/gsap.min.js';
  core.defer = true;
  core.setAttribute('data-gsap-fallback', 'core');
  const trig = document.createElement('script');
  trig.src = 'https://unpkg.com/gsap@3.12.5/dist/ScrollTrigger.min.js';
  trig.defer = true;
  trig.setAttribute('data-gsap-fallback', 'st');
  let loaded = 0;
  function tryFinish() {
    loaded++;
    if (loaded === 2 && gsapReady()) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      callback && callback();
    }
  }
  core.addEventListener('load', tryFinish);
  trig.addEventListener('load', tryFinish);
  document.head.appendChild(core);
  document.head.appendChild(trig);
}

/* =============================
   Animação: Hero Entrance
   ============================= */
function initHeroAnimation() {
  if (!animationsEnabled()) {
    document.querySelectorAll('.animate-on-load').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }
  let heroEls = document.querySelectorAll('.animate-on-load');
  if (!heroEls.length) {
    // Fallback: pegar filhos diretos do conteúdo do hero
    const content = document.querySelector('.hero-content');
    if (content) heroEls = content.children;
  }
  if (!heroEls.length) return;
  gsap.set(heroEls, { opacity: 0, y: 28 });
  gsap.to(heroEls, { opacity: 1, y: 0, duration: 1, ease: 'power2.out', stagger: 0.18, delay: 0.25 });
  // Zoom de fundo sutil
  const bgImg = document.querySelector('.hero-picture img');
  if (bgImg) {
    gsap.fromTo(bgImg, { scale: 1.08 }, { scale: 1, duration: 6, ease: 'power2.out' });
  }
}

/* =============================
   Animação: Navegação Sticky (shrink + sombra)
   ============================= */
function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  let lastState = false;
  function onScroll() {
    const cond = window.scrollY > 120;
    if (cond !== lastState) {
      header.classList.toggle('shrink', cond);
      header.classList.toggle('shadow', cond);
      lastState = cond;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* =============================
   Animação: Serviços (cards aparecendo on-scroll)
   ============================= */
function initServiceScrollAnimations() {
  const cards = document.querySelectorAll('.servico-card');
  if (!cards.length) return;
  // Estado sem animação
  if (!animationsEnabled()) {
    cards.forEach(c => { c.style.opacity = 1; c.style.transform = 'none'; });
    return;
  }
  cards.forEach((card, i) => {
    gsap.set(card, { opacity: 0, y: 26, scale: 0.98 });
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        once: true
      },
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.65,
      ease: 'power2.out',
      delay: i * 0.05
    });
  });
}

/* =============================
   Galeria: Hover micro + Modal zoom
   ============================= */
function initGalleryInteractions() {
  const items = document.querySelectorAll('.galeria-item');
  const modal = document.getElementById('modal-galeria');
  if (!items.length || !modal) return;
  const imgEl = modal.querySelector('#modal-img');
  const captionEl = modal.querySelector('#modal-caption');

  function openModal(src, alt, caption) {
    imgEl.src = src;
    imgEl.alt = alt || 'Imagem ampliada';
    captionEl.textContent = caption || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (animationsEnabled()) {
      gsap.fromTo('.modal-dialog', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
    }
    // Focus trapping simples (mínimo viável)
    setTimeout(() => {
      modal.querySelector('.modal-close').focus();
    }, 60);
    document.addEventListener('keydown', escHandler);
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', escHandler);
  }

  function escHandler(e) { if (e.key === 'Escape') closeModal(); }

  modal.addEventListener('click', e => {
    if (e.target.hasAttribute('data-close-modal')) closeModal();
  });
  modal.querySelector('.modal-close').addEventListener('click', closeModal);

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      openModal(img.src, img.alt, item.querySelector('figcaption')?.textContent);
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const img = item.querySelector('img');
        openModal(img.src, img.alt, item.querySelector('figcaption')?.textContent);
      }
    });
    item.tabIndex = 0; // Acessível via teclado
  });
}

/* =============================
   Depoimentos: Slider automático com progress bar
   ============================= */
function initTestimonialsSlider() {
  const track = document.querySelector('.testimonial-track');
  if (!track) return;
  const slides = Array.from(track.children);
  const progressBar = document.querySelector('.testimonial-progress .bar');
  const btnPrev = document.querySelector('.testimonial-prev');
  const btnNext = document.querySelector('.testimonial-next');
  const btnPlayPause = document.querySelector('.testimonial-playpause');
  const liveRegion = document.createElement('div');
  liveRegion.className = 'visually-hidden';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  track.parentElement.appendChild(liveRegion);
  let index = 0;
  let autoplayDelay = 5000; // 5s
  let autoplayTimer = null;
  let playing = true;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    if (animationsEnabled()) {
      gsap.to(track, { xPercent: -100 * index, duration: 0.8, ease: 'power2.inOut' });
    } else {
      track.style.transform = `translateX(${-100 * index}%)`;
    }
  }

  function animateProgress() {
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    // Força reflow para reiniciar
    void progressBar.offsetWidth;
    progressBar.style.transition = `width ${autoplayDelay}ms linear`;
    progressBar.style.width = '100%';
  }

  function next() {
    goTo(index + 1);
    animateProgress();
  }

  function startAutoplay() {
    clearAutoplay();
    if (!playing) return;
    animateProgress();
    autoplayTimer = setTimeout(() => { next(); startAutoplay(); }, autoplayDelay);
  }
  function clearAutoplay() {
    if (autoplayTimer) { clearTimeout(autoplayTimer); autoplayTimer = null; }
  }
  function togglePlay() {
    playing = !playing;
    btnPlayPause.setAttribute('aria-pressed', String(playing));
    btnPlayPause.textContent = playing ? '⏸' : '▶';
    btnPlayPause.setAttribute('aria-label', playing ? 'Pausar autoplay' : 'Retomar autoplay');
    if (playing) {
      startAutoplay();
    } else {
      clearAutoplay();
      progressBar.style.transition = 'none';
    }
  }
  function announce() {
    const current = slides[index];
    const quote = current.querySelector('blockquote')?.textContent?.trim() || '';
    liveRegion.textContent = `Slide ${index + 1} de ${slides.length}. ${quote}`;
  }

  goTo(0);
  announce();
  startAutoplay();
  // Eventos
  btnPrev?.addEventListener('click', () => { goTo(index - 1); announce(); startAutoplay(); });
  btnNext?.addEventListener('click', () => { goTo(index + 1); announce(); startAutoplay(); });
  btnPlayPause?.addEventListener('click', togglePlay);
  track.addEventListener('mouseenter', () => { playing && togglePlay(); });
  track.addEventListener('mouseleave', () => { !playing && togglePlay(); });
}

/* =============================
   CTA Final pulso sutil (loop controlado)
   ============================= */
function initFinalCtaPulse() {
  const btn = document.querySelector('.pulse-cta');
  if (!btn) return;
  if (!animationsEnabled()) return;
  const pulse = gsap.to(btn, { scale: 1.035, duration: 1.6, ease: 'power1.inOut', yoyo: true, repeat: -1, paused: false });
  // Pausa em foco ou hover (acessibilidade)
  ['mouseenter', 'focus'].forEach(ev => btn.addEventListener(ev, () => pulse.pause()));
  ['mouseleave', 'blur'].forEach(ev => btn.addEventListener(ev, () => pulse.resume()));
}

/* =============================
   Scroll Progress Bar
   ============================= */
function initScrollProgressBar() {
  const bar = document.querySelector('.scroll-progress-bar');
  if (!bar) return;
  function update() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const p = height > 0 ? (scrollTop / height) * 100 : 0;
    bar.style.width = p + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* =============================
   Reveal Sections (fallback sem GSAP com IntersectionObserver)
   ============================= */
function initSectionRevealAnimations() {
  const sections = document.querySelectorAll('.reveal');
  if (!sections.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Aplica will-change apenas próximo da animação
        el.style.willChange = 'transform, opacity';
        requestAnimationFrame(() => {
          el.classList.add('is-visible');
          // Remove will-change após transição para liberar memória
          const remove = () => {
            el.style.willChange = '';
            el.removeEventListener('transitionend', remove);
          };
            el.addEventListener('transitionend', remove);
        });
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.15 });
  sections.forEach(sec => obs.observe(sec));
}

/* =============================
   Contadores numéricos animados
   ============================= */
function initCounters() {
  const wrap = document.querySelector('[data-observe-counters]');
  if (!wrap) return;
  const counters = wrap.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const useGSAP = animationsEnabled();
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counters.forEach(el => {
          const target = parseFloat(el.getAttribute('data-target')) || 0;
          if (useGSAP) {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = (Number.isInteger(target) ? Math.round(obj.val) : obj.val.toFixed(1));
              }
            });
          } else {
            el.textContent = target;
          }
          el.parentElement.classList.add('is-visible');
        });
        obs.disconnect();
      }
    });
  }, { threshold: 0.4 });
  obs.observe(wrap);
}

/* =============================
   Hero Parallax leve (mouse move)
   ============================= */
function initHeroParallax() {
  if (!animationsEnabled()) return;
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const media = hero.querySelector('.hero-picture img');
  const decor1 = hero.querySelector('.blob-1');
  const decor2 = hero.querySelector('.blob-2');
  if (!media) return; // sem imagem
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(media, { duration: 0.9, x: x * 12, y: y * 10, ease: 'power3.out' });
    if (decor1) gsap.to(decor1, { duration: 1.4, x: x * 50, y: y * 40, ease: 'power3.out' });
    if (decor2) gsap.to(decor2, { duration: 1.4, x: -x * 60, y: -y * 30, ease: 'power3.out' });
  });
}

/* =============================
   Tilt / Hover Dinâmico em Cards de Serviço
   ============================= */
function initServiceCardHoverFX() {
  const cards = document.querySelectorAll('.servico-card');
  if (!cards.length) return;
  cards.forEach(card => {
    let idleTimer;
    card.addEventListener('mousemove', e => {
      const b = card.getBoundingClientRect();
      const x = ((e.clientX - b.left) / b.width) * 2 - 1;
      const y = ((e.clientY - b.top) / b.height) * 2 - 1;
      card.classList.add('hover-tilt');
      card.style.transform = `rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(0)`;
      card.style.willChange = 'transform';
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        card.classList.remove('hover-tilt');
        card.style.transform = '';
        card.style.willChange = '';
      }, 800);
    });
    ['mouseleave','blur'].forEach(ev => card.addEventListener(ev, () => {
      card.classList.remove('hover-tilt');
      card.style.transform = '';
      card.style.willChange = '';
    }));
  });
}

/* =============================
   Background Ambient Parallax (classe no body)
   ============================= */
function initBackgroundAmbient() {
  document.body.classList.add('has-ambient');
  if (!animationsEnabled()) return;
  // Movimento sutil com scroll
  window.addEventListener('scroll', () => {
    const y = window.scrollY * 0.02;
    document.body.style.setProperty('--ambient-shift', y.toFixed(2));
  }, { passive: true });
}

/* =============================
   Navegação mobile toggle
   ============================= */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('menu-mobile');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    if (expanded) {
      menu.hidden = true;
    } else {
      menu.hidden = false;
      menu.querySelector('a')?.focus();
    }
  });
  // Fechar ao clicar link
  menu.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }
  });
}

/* =============================
   Validação simples de formulário
   ============================= */
function initFormValidation() {
  const form = document.getElementById('form-contato');
  if (!form) return;
  const feedback = document.getElementById('contato-feedback');
  let sending = false;

  function showFieldMsg(field, msg, valid) {
    const span = form.querySelector(`[data-field-msg="${field.name}"]`);
    if (span) { span.textContent = msg || ''; }
    field.classList.toggle('is-error', !valid);
    field.classList.toggle('is-valid', valid);
  }

  function validateField(field) {
    if (field.hasAttribute('required') && !field.value.trim()) {
      showFieldMsg(field, 'Campo obrigatório', false); return false;
    }
    if (field.type === 'email') {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(field.value.trim())) { showFieldMsg(field, 'Email inválido', false); return false; }
    }
    showFieldMsg(field, '', true); return true;
  }

  ['input', 'blur'].forEach(ev => {
    form.addEventListener(ev, e => {
      const target = e.target;
      if (target.matches('input, textarea')) validateField(target);
    }, true);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (sending) return;
    // Honeypot
    const honey = form.querySelector('[name="website"]');
    if (honey && honey.value.trim()) {
      feedback.textContent = 'Ação bloqueada.';
      return; // provável bot
    }
    const fields = form.querySelectorAll('input, textarea');
    let allValid = true;
    fields.forEach(f => { if (!validateField(f)) allValid = false; });
    if (!allValid) {
      feedback.textContent = 'Por favor, corrija os campos destacados.';
      return;
    }
    sending = true;
    feedback.textContent = 'Enviando...';
    setTimeout(() => {
      feedback.textContent = 'Mensagem enviada! (Simulação)';
      form.reset();
      fields.forEach(f => { f.classList.remove('is-valid'); });
      sending = false;
    }, 1200);
  });
}

/* =============================
   Inicialização Geral
   ============================= */
function initYear() {
  const anoEl = document.getElementById('ano');
  if (anoEl) anoEl.textContent = new Date().getFullYear();
}

function runAnimations() {
  initHeroAnimation();
  initStickyHeader();
  initServiceScrollAnimations();
  initGalleryInteractions();
  initTestimonialsSlider();
  initFinalCtaPulse();
  initScrollProgressBar();
  initSectionRevealAnimations();
  initCounters();
  initHeroParallax();
  initServiceCardHoverFX();
  initBackgroundAmbient();
}

function init() {
  initYear();
  initMobileNav();
  initFormValidation();
  initThemeToggle();
  initScrollSpy();
  // Se GSAP ok imediatamente
  if (gsapReady()) {
    runAnimations();
  } else {
    // Tenta fallback e reexecuta quando pronto
    ensureGSAP(() => {
      runAnimations();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* =============================
   Export (opcional para debugging)
   ============================= */
window.AtelierLumin = {
  initHeroAnimation,
  initStickyHeader,
  initServiceScrollAnimations,
  initGalleryInteractions,
  initTestimonialsSlider,
  initFinalCtaPulse,
  initFormValidation,
  initScrollProgressBar,
  initSectionRevealAnimations,
  initCounters,
  initHeroParallax,
  initServiceCardHoverFX,
  initBackgroundAmbient,
  initScrollSpy,
  animationsEnabled
};

/* =============================
   ScrollSpy Navegação
   ============================= */
function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.main-nav a, .menu-mobile a'));
  if (!links.length) return;
  const map = links
    .filter(l => l.hash && document.querySelector(l.hash))
    .map(l => ({ link: l, section: document.querySelector(l.hash) }));
  let active = null;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const found = map.find(m => m.section === entry.target);
        if (found && active !== found.link) {
          if (active) active.removeAttribute('aria-current');
          found.link.setAttribute('aria-current', 'true');
          active = found.link;
        }
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.1 });
  map.forEach(m => observer.observe(m.section));
}

/* =============================
   Tema (Dark/Light) com persistência
   ============================= */
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const STORAGE_KEY = 'atelierTheme';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') {
    document.body.classList.add('theme-dark');
    btn.setAttribute('aria-pressed', 'true');
  }
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('theme-dark');
    btn.setAttribute('aria-pressed', String(isDark));
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  });
}
