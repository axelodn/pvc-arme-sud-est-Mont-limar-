// ===== EXPANSION HERO =====
(function () {
  const hero = document.getElementById('expansion-hero');
  if (!hero) return;

  let progress = 0;
  let expanded = false;
  let touchStartY = 0;

  const media = document.getElementById('expansion-media');
  const bg = document.getElementById('expansion-bg');
  const overlay = document.getElementById('expansion-overlay');
  const titleUp = document.getElementById('title-up');
  const titleDown = document.getElementById('title-down');
  const hint = document.getElementById('expansion-hint');
  const content = document.getElementById('expansion-content');
  const pageContent = document.getElementById('page-content');

  function mobile() { return window.innerWidth < 768; }

  function render() {
    const m = mobile();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Media: small card → full viewport
    const sw = m ? 260 : 340;
    const sh = m ? 320 : 440;
    const w = sw + progress * (vw - sw);
    const h = sh + progress * (vh - sh);
    const r = Math.round((1 - progress) * 16);

    media.style.width = w + 'px';
    media.style.height = h + 'px';
    media.style.borderRadius = r + 'px';
    media.style.boxShadow = '0 0 ' + (50 * (1 - progress)) + 'px rgba(0,0,0,' + (0.3 * (1 - progress)) + ')';

    // Background fade
    bg.style.opacity = 1 - progress;

    // Image overlay lighten
    overlay.style.opacity = Math.max(0, 0.45 - progress * 0.35);

    // Titles split apart
    var tx = progress * (m ? 110 : 100);
    titleUp.style.transform = 'translateX(-' + tx + 'vw)';
    titleDown.style.transform = 'translateX(' + tx + 'vw)';

    // Scroll hint fades early
    hint.style.opacity = Math.max(0, 1 - progress * 4);

    // Hero content (slogan + CTA)
    if (progress >= 0.92) {
      content.classList.add('visible');
    } else {
      content.classList.remove('visible');
    }

    // Page content below
    if (expanded) {
      pageContent.classList.add('visible');
    } else {
      pageContent.classList.remove('visible');
    }
  }

  // — Wheel —
  function onWheel(e) {
    // Scroll back up when expanded → re-engage expansion
    if (expanded && e.deltaY < 0 && window.scrollY <= 5) {
      expanded = false;
      content.classList.remove('visible');
      pageContent.classList.remove('visible');
      e.preventDefault();
      return;
    }
    if (!expanded) {
      e.preventDefault();
      progress = Math.min(Math.max(progress + e.deltaY * 0.001, 0), 1);
      if (progress >= 1) expanded = true;
      render();
    }
  }

  // — Touch —
  function onTouchStart(e) { touchStartY = e.touches[0].clientY; }

  function onTouchMove(e) {
    if (!touchStartY) return;
    var y = e.touches[0].clientY;
    var dy = touchStartY - y;

    if (expanded && dy < -20 && window.scrollY <= 5) {
      expanded = false;
      content.classList.remove('visible');
      pageContent.classList.remove('visible');
      e.preventDefault();
    } else if (!expanded) {
      e.preventDefault();
      var factor = dy < 0 ? 0.008 : 0.005;
      progress = Math.min(Math.max(progress + dy * factor, 0), 1);
      if (progress >= 1) expanded = true;
      render();
      touchStartY = y;
    }
  }

  function onTouchEnd() { touchStartY = 0; }

  // Lock scroll during expansion
  function onScroll() {
    if (!expanded) window.scrollTo(0, 0);
  }

  // Init
  window.scrollTo(0, 0);
  render();

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onScroll);
  window.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);
  window.addEventListener('resize', render);
})();

// ===== NAV SCROLL =====
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== MOBILE MENU =====
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (toggle) {
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = toggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
}

// ===== SCROLL REVEAL =====
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => observer.observe(el));
} else {
  reveals.forEach(el => el.classList.add('visible'));
}

// ===== BEFORE / AFTER SLIDER =====
const baSlider = document.querySelector('.ba-slider');
if (baSlider) {
  const baBefore = baSlider.querySelector('.ba-before');
  const baHandle = baSlider.querySelector('.ba-handle');
  let isDragging = false;

  function updateSlider(x) {
    if (!baBefore || !baHandle) return;
    const rect = baSlider.getBoundingClientRect();
    let pos = ((x - rect.left) / rect.width) * 100;
    pos = Math.max(5, Math.min(95, pos));
    baBefore.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
    baHandle.style.left = pos + '%';
  }

  baSlider.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSlider(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) updateSlider(e.clientX);
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  baSlider.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateSlider(e.touches[0].clientX);
  });

  baSlider.addEventListener('touchmove', (e) => {
    if (isDragging) {
      e.preventDefault();
      updateSlider(e.touches[0].clientX);
    }
  }, { passive: false });

  window.addEventListener('touchend', () => { isDragging = false; });
}

// ===== GALLERY FILTER =====
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    galleryItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.style.display = '';
        setTimeout(() => { item.style.opacity = '1'; item.style.transform = ''; }, 10);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => { item.style.display = 'none'; }, 400);
      }
    });
  });
});

// ===== FORM - FORMSPREE INTEGRATION =====
// Laisser Formspree gérer l'envoi naturellement
const form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', function() {
    const btn = form.querySelector('.btn-primary');
    const originalText = btn.textContent;
    btn.textContent = 'Message envoyé !';
    btn.style.background = '#4CAF50';
    btn.disabled = true;
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  });
}

// ===== COUNTER ANIMATION =====
const counters = document.querySelectorAll('.stat-number');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current) + suffix;
      }, 20);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

counters.forEach(el => counterObserver.observe(el));

// ===== YOUTUBE FACADE (charge l'iframe seulement quand la section est visible) =====
const ytWrap = document.querySelector('.video-bg-iframe-wrap[data-yt]');
if (ytWrap) {
  const ytObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = ytWrap.dataset.yt;
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&mute=1&loop=1&playlist=' + id + '&controls=0&rel=0&modestbranding=1&playsinline=1';
        iframe.title = 'Soudure thermique membrane PVC armé';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        ytWrap.appendChild(iframe);
        ytObserver.disconnect();
      }
    });
  }, { rootMargin: '200px' });
  ytObserver.observe(ytWrap);
}

// Slider avant/après
document.querySelectorAll('.ba-slider').forEach(slider => {
  const before = slider.querySelector('.ba-before');
  const handle = slider.querySelector('.ba-handle');
  let isDragging = false;

  const moveSlider = (x) => {
    const rect = slider.getBoundingClientRect();
    let pos = ((x - rect.left) / rect.width) * 100;
    pos = Math.max(0, Math.min(100, pos));
    before.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
    handle.style.left = pos + '%';
  };

  slider.addEventListener('mousedown', () => isDragging = true);
  document.addEventListener('mouseup', () => isDragging = false);
  document.addEventListener('mousemove', (e) => {
    if (isDragging) moveSlider(e.clientX);
  });

  slider.addEventListener('touchstart', () => isDragging = true);
  document.addEventListener('touchend', () => isDragging = false);
  document.addEventListener('touchmove', (e) => {
    if (isDragging) moveSlider(e.touches[0].clientX);
  });
});
