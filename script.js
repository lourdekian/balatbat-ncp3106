(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var darkVars = {
    '--bg': '#f2eee6',
    '--bg2': '#151513',
    '--surface': '#f2eee6',
    '--surface2': '#e7e1d6',
    '--surface3': 'rgba(20, 20, 18, 0.05)',
    '--border': 'rgba(20, 20, 18, 0.24)',
    '--border2': 'rgba(202, 61, 32, 0.58)',
    '--text': '#171715',
    '--muted': '#69655e',
    '--soft': '#f6f1e8',
    '--white': '#171715',
    '--em': '#c94524',
    '--em2': '#a7341b',
    '--em3': '#f2eee6',
    '--blue': '#29343a',
    '--blue2': '#4d585f',
    '--gold': '#b38a40',
    '--rose': '#c94524'
  };

  var lightVars = {
    '--bg': '#f7f3eb',
    '--bg2': '#151513',
    '--surface': '#f7f3eb',
    '--surface2': '#eee8de',
    '--surface3': 'rgba(20, 20, 18, 0.045)',
    '--border': 'rgba(20, 20, 18, 0.2)',
    '--border2': 'rgba(202, 61, 32, 0.55)',
    '--text': '#171715',
    '--muted': '#706b62',
    '--soft': '#fbf7ef',
    '--white': '#171715',
    '--em': '#c94524',
    '--em2': '#9f321c',
    '--em3': '#f7f3eb',
    '--blue': '#283238',
    '--blue2': '#535d63',
    '--gold': '#a87930',
    '--rose': '#c94524'
  };

  function setTheme(theme) {
    var nextTheme = theme === 'light' ? 'light' : 'dark';
    var vars = nextTheme === 'light' ? lightVars : darkVars;

    root.dataset.theme = nextTheme;
    Object.keys(vars).forEach(function (key) {
      root.style.setProperty(key, vars[key]);
    });

    localStorage.setItem('theme', nextTheme);

    var toggle = document.getElementById('themeToggle');
    if (toggle) {
      // In dark mode show the sun (to switch to light); in light mode show the moon (to switch to dark)
      var sunIcon = toggle.querySelector('.theme-icon--sun');
      var moonIcon = toggle.querySelector('.theme-icon--moon');
      if (sunIcon) sunIcon.style.display = nextTheme === 'dark' ? 'block' : 'none';
      if (moonIcon) moonIcon.style.display = nextTheme === 'light' ? 'block' : 'none';
      toggle.setAttribute('aria-label', nextTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
  }

  function initTheme() {
    var saved = localStorage.getItem('theme');
    setTheme(saved === 'light' ? 'light' : 'dark');

    var toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var currentTheme = root.dataset.theme === 'light' ? 'light' : 'dark';
      setTheme(currentTheme === 'light' ? 'dark' : 'light');
    });
  }

  function tryImageSources(img, sources, fallbackDisplay) {
    var index = 0;

    function nextSource() {
      index += 1;
      if (index < sources.length) {
        img.src = sources[index];
        return;
      }

      if (fallbackDisplay) {
        img.style.display = 'none';
        fallbackDisplay.style.display = 'flex';
      }
    }

    img.addEventListener('error', nextSource);
    if (sources.length && img.getAttribute('src') !== sources[0]) img.src = sources[0];
    if (img.complete && img.naturalWidth === 0) nextSource();
  }

  function initImages() {
    var heroImg = document.querySelector('.avatar-wrap img');
    var heroFallback = document.querySelector('.avatar-fallback');

    if (heroImg && heroImg.getAttribute('src') && !heroImg.getAttribute('src').startsWith('data:')) {
      tryImageSources(heroImg, [
        'kobe-profile-avatar.jpg',
        './kobe-profile-avatar.jpg'
      ], heroFallback);
    } else if (heroImg && heroFallback && !heroImg.getAttribute('src')) {
      heroImg.style.display = 'none';
      heroFallback.style.display = 'flex';
    }

    var aboutImg = document.querySelector('.about-image-wrap img');
    if (aboutImg && aboutImg.getAttribute('src') && !aboutImg.getAttribute('src').startsWith('data:')) {
      tryImageSources(aboutImg, [
        'about.jpg',
        './about.jpg',
        'about.JPG',
        'about.jpeg',
        'about.JPEG',
        'about.png',
        'about.PNG'
      ]);
    }
  }

  function initNav() {
    var nav = document.querySelector('nav');
    var progressBar = document.getElementById('progressBar');
    var backToTop = document.getElementById('backToTop');
    var links = document.querySelectorAll('.nav-links a[href^="#"]');
    var allNavLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]');
    var sections = Array.prototype.map.call(allNavLinks, function (link) {
      return document.querySelector(link.getAttribute('href'));
    }).filter(Boolean);
    var ticking = false;

    function update() {
      var scrollY = window.scrollY;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = total > 0 ? scrollY / total : 0;

      if (nav) nav.classList.toggle('scrolled', scrollY > 18);
      if (progressBar) progressBar.style.transform = 'scaleX(' + ratio + ')';
      if (backToTop) backToTop.classList.toggle('show', scrollY > 420);

      var current = sections[0];
      var trigger = scrollY + window.innerHeight * 0.28;
      sections.forEach(function (section) {
        if (section.offsetTop <= trigger) current = section;
      });

      if (current) {
        allNavLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + current.id);
        });
      }

      ticking = false;
    }

    update();

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

        // A hash navigation can begin a smooth scroll before the pointer-up event
        // reaches the document. Let the custom cursor know that this click is done.
        document.dispatchEvent(new CustomEvent('navigationclick'));
      });
    });
  }

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    items.forEach(function (item, index) {
      item.style.setProperty('--reveal-delay', Math.min(index % 5, 4) * 55 + 'ms');

      if (item.classList.contains('section-label') || item.classList.contains('divider')) {
        item.classList.add('reveal-left');
      } else if (
        item.classList.contains('project-card') ||
        item.classList.contains('service-card') ||
        item.classList.contains('competency-card') ||
        item.classList.contains('profile-logo-grid')
      ) {
        item.classList.add('reveal-zoom');
      } else if (index % 3 === 1) {
        item.classList.add('reveal-right');
      }
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (item) {
        item.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function initPageIntro() {
    if (reduceMotion || sessionStorage.getItem('portfolioIntroSeen') === 'true') return;

    var intro = document.createElement('div');
    intro.className = 'intro-loader';
    intro.setAttribute('aria-hidden', 'true');
    intro.innerHTML =
      '<div class="intro-loader__line"></div>' +
      '<div class="intro-loader__name">' +
        '<span>Kobe</span><span>Christian</span><span>Balatbat</span>' +
      '</div>' +
      '<div class="intro-loader__meta">Real Estate Ops · Mortgage Support</div>';

    document.body.classList.add('intro-active');
    document.body.prepend(intro);

    window.setTimeout(function () {
      intro.classList.add('is-leaving');
      document.body.classList.remove('intro-active');
      sessionStorage.setItem('portfolioIntroSeen', 'true');
      intro.addEventListener('animationend', function () {
        intro.remove();
      }, { once: true });
    }, 1150);
  }

  function initSectionWipes() {
    var sections = document.querySelectorAll('main section');
    if (!sections.length) return;

    sections.forEach(function (section) {
      var wipe = document.createElement('span');
      wipe.className = 'section-wipe';
      wipe.setAttribute('aria-hidden', 'true');
      section.prepend(wipe);
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      sections.forEach(function (section) {
        section.classList.add('section-wipe-in');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('section-wipe-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -16% 0px' });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initCountersAndBars() {
    var counters = document.querySelectorAll('.stat-num[data-target]');
    var bars = document.querySelectorAll('.skill-bar-fill[data-width], .language-bar-fill[data-width]');

    function animateCounter(el) {
      var target = parseInt(el.dataset.target, 10) || 0;
      var start = 0;
      var duration = 900;
      var started = performance.now();

      function tick(now) {
        var progress = Math.min((now - started) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (target - start) * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
      bars.forEach(function (bar) { bar.style.width = bar.dataset.width + '%'; });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains('stat-num')) {
          animateCounter(entry.target);
        } else {
          entry.target.style.width = entry.target.dataset.width + '%';
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    counters.forEach(function (counter) { observer.observe(counter); });
    bars.forEach(function (bar) { observer.observe(bar); });
  }

  function initMobileMenu() {
    var hamburger = document.getElementById('hamburger');
    var menu = document.getElementById('mobileMenu');
    if (!hamburger || !menu) return;

    function setOpen(open) {
      menu.hidden = !open;
      hamburger.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';

      menu.querySelectorAll('a').forEach(function (link, index) {
        link.style.setProperty('--menu-delay', (index * 42) + 'ms');
      });
    }

    hamburger.addEventListener('click', function () {
      setOpen(!menu.classList.contains('open'));
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });

    menu.addEventListener('click', function (event) {
      if (event.target === menu) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('open')) {
        setOpen(false);
        hamburger.focus();
      }
    });
  }

  function initProjectPreview() {
    var cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;

    var modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="project-modal__panel" role="dialog" aria-modal="true" aria-label="Project preview">' +
        '<div class="project-modal__bar">' +
          '<div class="project-modal__title"></div>' +
          '<button class="project-modal__close" type="button" aria-label="Close preview">×</button>' +
        '</div>' +
        '<img class="project-modal__image" alt="" />' +
      '</div>';
    document.body.appendChild(modal);

    var title = modal.querySelector('.project-modal__title');
    var image = modal.querySelector('.project-modal__image');
    var close = modal.querySelector('.project-modal__close');
    var previousFocus = null;

    function open(card, trigger) {
      var img = card.querySelector('.project-image');
      var cardTitle = card.querySelector('.project-title');
      if (!img) return;
      previousFocus = trigger || document.activeElement;
      title.textContent = cardTitle ? cardTitle.textContent : 'Project preview';
      image.src = img.currentSrc || img.src;
      image.alt = img.alt || title.textContent;

      if (trigger) {
        var rect = trigger.getBoundingClientRect();
        modal.style.setProperty('--modal-origin-x', (rect.left + rect.width / 2) + 'px');
        modal.style.setProperty('--modal-origin-y', (rect.top + rect.height / 2) + 'px');
      }

      modal.hidden = false;
      document.body.classList.add('modal-open');
      close.focus();
    }

    function closeModal() {
      modal.hidden = true;
      image.removeAttribute('src');
      document.body.classList.remove('modal-open');
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
      previousFocus = null;
    }

    cards.forEach(function (card) {
      var imageWrap = card.querySelector('.project-image-wrap');
      if (!imageWrap) return;
      imageWrap.setAttribute('tabindex', '0');
      imageWrap.setAttribute('role', 'button');
      imageWrap.setAttribute('aria-label', 'Preview project screenshot');
      imageWrap.addEventListener('click', function () { open(card, imageWrap); });
      imageWrap.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open(card, imageWrap);
        }
      });
    });

    close.addEventListener('click', closeModal);
    modal.addEventListener('click', function (event) {
      if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  function initClickRipples() {
    if (reduceMotion) return;

    var selectors = [
      '.btn',
      '.profile-logo',
      '.calendly-cta-block',
      '.contact-detail',
      '.project-image-wrap',
      '#themeToggle',
      '#backToTop'
    ].join(',');

    document.querySelectorAll(selectors).forEach(function (target) {
      if (target.classList.contains('btn')) {
        target.dataset.glitch = target.textContent.trim();
      }

      var position = window.getComputedStyle(target).position;
      if (position === 'static') target.style.position = 'relative';
      target.style.overflow = 'hidden';

      target.addEventListener('click', function (event) {
        var rect = target.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.className = 'interactive-ripple';
        ripple.style.left = (event.clientX - rect.left) + 'px';
        ripple.style.top = (event.clientY - rect.top) + 'px';
        target.appendChild(ripple);
        ripple.addEventListener('animationend', function () {
          ripple.remove();
        }, { once: true });
      });
    });
  }

  function initHoverReactive() {
    if (reduceMotion) return;

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.body.classList.add('spatial-ready');
    }

    var hero = document.getElementById('home');
    if (hero && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      hero.addEventListener('pointermove', function (event) {
        var rect = hero.getBoundingClientRect();
        var x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        var y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

        hero.style.setProperty('--hero-tilt-x', (-y * 4.5).toFixed(2) + 'deg');
        hero.style.setProperty('--hero-tilt-y', (x * 5.5).toFixed(2) + 'deg');
        hero.style.setProperty('--hero-shift-x', (x * 18).toFixed(2) + 'px');
        hero.style.setProperty('--hero-shift-y', (y * 14).toFixed(2) + 'px');
        hero.style.setProperty('--spot-x', ((x + 1) * 50).toFixed(1) + '%');
        hero.style.setProperty('--spot-y', ((y + 1) * 50).toFixed(1) + '%');
      }, { passive: true });

      hero.addEventListener('pointerleave', function () {
        hero.style.setProperty('--hero-tilt-x', '0deg');
        hero.style.setProperty('--hero-tilt-y', '0deg');
        hero.style.setProperty('--hero-shift-x', '0px');
        hero.style.setProperty('--hero-shift-y', '0px');
        hero.style.setProperty('--spot-x', '74%');
        hero.style.setProperty('--spot-y', '24%');
      });
    }

    var selectors = [
      '.stat-item',
      '.competency-card',
      '.service-card',
      '.timeline-card',
      '.project-card',
      '.tools-group',
      '.language-card',
      '.edu-card',
      '.cert-item',
      '.contact-detail',
      '.calendly-cta-block'
    ].join(',');

    var activeItem = null;

    function setActiveItem(item) {
      if (activeItem && activeItem !== item) {
        activeItem.classList.remove('is-hovered');
        activeItem.style.removeProperty('--hover-x');
        activeItem.style.removeProperty('--hover-y');
        activeItem.style.setProperty('--tilt-x', '0deg');
        activeItem.style.setProperty('--tilt-y', '0deg');
        activeItem.style.setProperty('--shift-x', '0px');
      }

      activeItem = item;
      if (activeItem) activeItem.classList.add('is-hovered');
    }

    document.querySelectorAll(selectors).forEach(function (item) {
      item.classList.add('hover-reactive');

      item.addEventListener('pointerenter', function () {
        setActiveItem(item);
      });

      item.addEventListener('pointermove', function (event) {
        if (activeItem !== item) setActiveItem(item);

        var rect = item.getBoundingClientRect();
        var localX = event.clientX - rect.left;
        var localY = event.clientY - rect.top;
        var x = (localX / rect.width - 0.5) * 2;
        var y = (localY / rect.height - 0.5) * 2;
        var maxTilt = item.classList.contains('project-card') || item.classList.contains('timeline-card') ? 1.8 : 2.4;

        item.style.setProperty('--hover-x', localX + 'px');
        item.style.setProperty('--hover-y', localY + 'px');
        item.style.setProperty('--tilt-x', (-y * maxTilt).toFixed(2) + 'deg');
        item.style.setProperty('--tilt-y', (x * maxTilt).toFixed(2) + 'deg');
        item.style.setProperty('--shift-x', (x * 0.8).toFixed(2) + 'px');
      }, { passive: true });

      item.addEventListener('pointerleave', function () {
        if (activeItem === item) activeItem = null;
        item.classList.remove('is-hovered');
        item.style.removeProperty('--hover-x');
        item.style.removeProperty('--hover-y');
        item.style.setProperty('--tilt-x', '0deg');
        item.style.setProperty('--tilt-y', '0deg');
        item.style.setProperty('--shift-x', '0px');
      });
    });
  }

  function initScrollTypography() {
    var targets = document.querySelectorAll('.section-title, .hero-wordmark');
    if (!targets.length || reduceMotion) return;

    var ticking = false;

    function update() {
      var viewportMid = window.innerHeight * 0.52;

      targets.forEach(function (target) {
        var rect = target.getBoundingClientRect();
        var elementMid = rect.top + rect.height / 2;
        var distance = Math.abs(elementMid - viewportMid);
        var range = Math.max(window.innerHeight * 0.72, 1);
        var progress = Math.max(0, 1 - distance / range);
        var direction = elementMid < viewportMid ? -1 : 1;

        target.style.setProperty('--title-progress', progress.toFixed(3));
        target.style.setProperty('--title-drift', (direction * progress * 18).toFixed(2) + 'px');
      });

      ticking = false;
    }

    update();

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('resize', update, { passive: true });
  }

  function initAtmosphereLayers() {
    if (reduceMotion) return;

    var grid = document.createElement('div');
    var grain = document.createElement('div');
    var flash = document.createElement('div');

    grid.className = 'kinetic-grid';
    grain.className = 'grain-layer';
    flash.className = 'wow-flash';
    grid.setAttribute('aria-hidden', 'true');
    grain.setAttribute('aria-hidden', 'true');
    flash.setAttribute('aria-hidden', 'true');

    document.body.insertBefore(grid, document.body.firstChild);
    document.body.appendChild(grain);
    document.body.appendChild(flash);

    document.addEventListener('pointermove', function (event) {
      root.style.setProperty('--grid-x', event.clientX + 'px');
      root.style.setProperty('--grid-y', event.clientY + 'px');
    }, { passive: true });

    document.addEventListener('click', function (event) {
      flash.style.setProperty('--flash-x', event.clientX + 'px');
      flash.style.setProperty('--flash-y', event.clientY + 'px');
      flash.classList.remove('active');
      void flash.offsetWidth;
      flash.classList.add('active');
    });
  }

  function initScrollAtmosphere() {
    var ticking = false;

    function update() {
      var total = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = total > 0 ? window.scrollY / total : 0;
      root.style.setProperty('--scroll-ratio', ratio.toFixed(4));
      ticking = false;
    }

    update();

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('resize', update, { passive: true });
  }

  function initKineticTitles() {
    var titles = document.querySelectorAll('.section-title');
    if (!titles.length) return;

    titles.forEach(function (title) {
      var parts = title.innerHTML.split(/<br\s*\/?>/i);
      title.textContent = '';

      parts.forEach(function (part, partIndex) {
        var words = part.trim().split(/\s+/).filter(Boolean);

        words.forEach(function (word, wordIndex) {
          var outer = document.createElement('span');
          var inner = document.createElement('span');

          outer.className = 'kinetic-word';
          outer.style.setProperty('--word-delay', ((partIndex * 110) + (wordIndex * 56)) + 'ms');
          inner.textContent = word;
          outer.appendChild(inner);
          title.appendChild(outer);

          if (wordIndex < words.length - 1) {
            title.appendChild(document.createTextNode(' '));
          }
        });

        if (partIndex < parts.length - 1) {
          title.appendChild(document.createElement('br'));
        }
      });
    });
  }

  function initMagneticElements() {
    if (reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var selectors = '.btn, .profile-logo, #backToTop, #themeToggle, .project-image-wrap, .nav-links a, .nav-logo';
    document.querySelectorAll(selectors).forEach(function (item) {
      item.addEventListener('pointermove', function (event) {
        var rect = item.getBoundingClientRect();
        var x = event.clientX - rect.left - rect.width / 2;
        var y = event.clientY - rect.top - rect.height / 2;
        var strength = 0.18;

        if (item.classList.contains('project-image-wrap')) strength = 0.045;
        if (item.closest('.nav-links') || item.classList.contains('nav-logo')) strength = 0.12;

        item.style.transform = 'translate3d(' + (x * strength).toFixed(2) + 'px,' + (y * strength).toFixed(2) + 'px,0)';
      }, { passive: true });

      item.addEventListener('pointerleave', function () {
        item.style.transform = '';
      });
    });
  }

  function initBackgroundCanvas() {
    var canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    if (reduceMotion || !canvas.getContext) {
      canvas.hidden = true;
      return;
    }

    var ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    var points = [];
    var width = 0;
    var height = 0;
    var dpr = 1;
    var rafId = 0;
    var lastTime = 0;
    var mouseX = -9999;
    var mouseY = -9999;
    var theme = root.dataset.theme === 'light' ? 'light' : 'dark';

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.min(54, Math.max(24, Math.floor((width * height) / 30000)));
      points = Array.from({ length: count }, function (_, index) {
        var angle = (index / count) * Math.PI * 2;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * (0.07 + Math.random() * 0.08),
          vy: Math.sin(angle) * (0.07 + Math.random() * 0.08),
          r: 1.2 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2
        };
      });
    }

    function draw(now) {
      var elapsed = Math.min((now - lastTime) || 16, 34);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);
      theme = root.dataset.theme === 'light' ? 'light' : 'dark';

      var lineColor = theme === 'light' ? 'rgba(201, 69, 36, 0.18)' : 'rgba(201, 69, 36, 0.16)';
      var dotColor = theme === 'light' ? 'rgba(201, 69, 36, 0.38)' : 'rgba(245, 241, 232, 0.35)';
      var accentColor = theme === 'light' ? 'rgba(201, 69, 36, 0.16)' : 'rgba(201, 69, 36, 0.18)';

      points.forEach(function (point) {
        point.x += point.vx * elapsed;
        point.y += point.vy * elapsed;
        point.phase += 0.0018 * elapsed;

        if (point.x < -20) point.x = width + 20;
        if (point.x > width + 20) point.x = -20;
        if (point.y < -20) point.y = height + 20;
        if (point.y > height + 20) point.y = -20;

        var dx = point.x - mouseX;
        var dy = point.y - mouseY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          var push = (130 - dist) / 130;
          point.x += (dx / Math.max(dist, 1)) * push * 0.9;
          point.y += (dy / Math.max(dist, 1)) * push * 0.9;
        }
      });

      for (var i = 0; i < points.length; i += 1) {
        for (var j = i + 1; j < points.length; j += 1) {
          var a = points[i];
          var b = points[j];
          var x = a.x - b.x;
          var y = a.y - b.y;
          var distance = Math.sqrt(x * x + y * y);

          if (distance < 150) {
            ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/g, (0.16 * (1 - distance / 150)).toFixed(3) + ')');
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      points.forEach(function (point) {
        var pulse = Math.sin(point.phase) * 0.45;
        ctx.beginPath();
        ctx.fillStyle = dotColor;
        ctx.arc(point.x, point.y, point.r + pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      if (mouseX > -100) {
        var gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 170);
        gradient.addColorStop(0, accentColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 170, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    function start() {
      if (rafId || document.hidden) return;
      lastTime = performance.now();
      rafId = requestAnimationFrame(draw);
    }

    function stop() {
      if (!rafId) return;
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    resize();
    start();

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });
    document.addEventListener('pointermove', function (event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
    }, { passive: true });
    document.addEventListener('pointerleave', function () {
      mouseX = -9999;
      mouseY = -9999;
    });
  }

  function initCustomCursor() {
    if (reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var cursor = document.getElementById('customCursor');
    var dot = document.getElementById('cursorDot');
    if (!cursor || !dot) return;

    document.body.classList.add('cursor-ready');
    cursor.setAttribute('aria-hidden', 'true');
    dot.setAttribute('aria-hidden', 'true');

    var visible = false;
    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var ringX = mouseX;
    var ringY = mouseY;
    var rafId = 0;
    var lastTrail = 0;
    var cursorEase = 0.46;

    function show() {
      if (visible) return;
      visible = true;
      cursor.classList.add('cursor-visible');
      dot.classList.add('cursor-visible');
    }

    function hide() {
      visible = false;
      cursor.classList.remove('cursor-visible', 'cursor-hover', 'cursor-click');
      dot.classList.remove('cursor-visible', 'cursor-hover');
    }

    function interactiveFor(target) {
      if (!target || typeof target.closest !== 'function') return null;
      return target.closest('a, button, [role="button"], input, textarea, select');
    }

    function isNavigationTarget(target) {
      return Boolean(target && typeof target.closest === 'function' && target.closest('nav, .mobile-menu'));
    }

    function labelFor(target) {
      var item = interactiveFor(target);
      if (!item) return '';
      if (item.classList.contains('project-image-wrap')) return 'View';
      if (item.classList.contains('btn-calendly')) return 'Book';
      if (item.classList.contains('btn-cv')) return 'CV';
      if (item.tagName === 'A' && item.hostname && item.hostname !== window.location.hostname) return 'Open';
      if (item.tagName === 'BUTTON') return 'Tap';
      if (item.classList.contains('contact-detail')) return 'Go';
      return 'Tap';
    }

    function setHover(target) {
      var label = labelFor(target);
      cursor.classList.toggle('cursor-hover', Boolean(label));
      dot.classList.toggle('cursor-hover', Boolean(label));
      cursor.dataset.cursorLabel = label;
    }

    function elementAtPointer(event) {
      return document.elementFromPoint(event.clientX, event.clientY) || event.target;
    }

    function releaseClick() {
      cursor.classList.remove('cursor-click');
    }

    function spawnTrail(x, y) {
      var now = performance.now();
      if (now - lastTrail < 115) return;
      lastTrail = now;

      var trail = document.createElement('span');
      trail.className = 'cursor-trail';
      trail.style.left = x + 'px';
      trail.style.top = y + 'px';
      document.body.appendChild(trail);
      trail.addEventListener('animationend', function () {
        trail.remove();
      }, { once: true });
    }

    function spawnBurst(x, y) {
      var burst = document.createElement('span');
      burst.className = 'cursor-burst';
      burst.style.left = x + 'px';
      burst.style.top = y + 'px';
      document.body.appendChild(burst);
      burst.addEventListener('animationend', function () {
        burst.remove();
      }, { once: true });
    }

    function render() {
      ringX += (mouseX - ringX) * cursorEase;
      ringY += (mouseY - ringY) * cursorEase;

      cursor.style.transform = 'translate3d(' + ringX.toFixed(2) + 'px, ' + ringY.toFixed(2) + 'px, 0) translate(-50%, -50%)';
      dot.style.transform = 'translate3d(' + mouseX.toFixed(2) + 'px, ' + mouseY.toFixed(2) + 'px, 0) translate(-50%, -50%) rotate(45deg)';

      rafId = requestAnimationFrame(render);
    }

    function syncCursor(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursor.style.setProperty('--cursor-x', event.clientX + 'px');
      cursor.style.setProperty('--cursor-y', event.clientY + 'px');

      if (isNavigationTarget(elementAtPointer(event))) {
        hide();
        return;
      }

      show();
      // pointerrawupdate events can be dispatched from document while the
      // pointer is still over a link. Hit-test the current coordinates so the
      // cursor does not flicker or get stuck during navbar smooth-scrolling.
      setHover(elementAtPointer(event));
      if (cursor.classList.contains('cursor-hover')) spawnTrail(mouseX, mouseY);
    }

    document.addEventListener('pointermove', syncCursor, { passive: true });

    if ('onpointerrawupdate' in window) {
      document.addEventListener('pointerrawupdate', syncCursor, { passive: true });
    }

    document.addEventListener('pointerleave', hide);
    document.addEventListener('pointerdown', function (event) {
      if (interactiveFor(event.target)) {
        cursor.classList.add('cursor-click');
        spawnBurst(event.clientX, event.clientY);
      }
    });
    document.addEventListener('pointerup', function () {
      releaseClick();
    });
    document.addEventListener('pointercancel', function () {
      releaseClick();
    });
    window.addEventListener('blur', function () {
      releaseClick();
    });
    document.addEventListener('navigationclick', function () {
      releaseClick();
    });

    var hoverTargets = 'a, button, [role="button"], input, textarea, select';
    document.querySelectorAll(hoverTargets).forEach(function (item) {
      item.addEventListener('pointerenter', function () {
        setHover(item);
      });

      item.addEventListener('pointerleave', function () {
        cursor.classList.remove('cursor-hover');
        dot.classList.remove('cursor-hover');
        cursor.dataset.cursorLabel = '';
      });
    });

    if (!rafId) rafId = requestAnimationFrame(render);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initPageIntro();
    initTheme();
    initImages();
    initNav();
    initAtmosphereLayers();
    initScrollAtmosphere();
    initKineticTitles();
    initSectionWipes();
    initReveal();
    initCountersAndBars();
    initMobileMenu();
    initProjectPreview();
    initHoverReactive();
    initScrollTypography();
    initMagneticElements();
    initClickRipples();
    initBackgroundCanvas();
    initCustomCursor();
  });
})();
