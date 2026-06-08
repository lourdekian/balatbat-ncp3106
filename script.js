(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var darkVars = {
    '--bg': '#070a0f',
    '--bg2': '#0b1118',
    '--surface': 'rgba(15, 23, 31, 0.82)',
    '--surface2': 'rgba(22, 32, 42, 0.92)',
    '--surface3': 'rgba(255, 255, 255, 0.06)',
    '--border': 'rgba(186, 230, 253, 0.16)',
    '--border2': 'rgba(52, 211, 153, 0.28)',
    '--text': '#edf7f2',
    '--muted': '#a7b8c5',
    '--soft': '#d9e8e1',
    '--white': '#ffffff',
    '--em': '#2ddc91',
    '--em2': '#12b981',
    '--em3': '#a7f3d0',
    '--blue': '#4cc9f0',
    '--blue2': '#7dd3fc',
    '--gold': '#ffd166',
    '--rose': '#ff6b8a'
  };

  var lightVars = {
    '--bg': '#f7fafc',
    '--bg2': '#eef4f8',
    '--surface': 'rgba(255, 255, 255, 0.88)',
    '--surface2': 'rgba(255, 255, 255, 0.96)',
    '--surface3': 'rgba(15, 23, 42, 0.05)',
    '--border': 'rgba(15, 23, 42, 0.12)',
    '--border2': 'rgba(15, 159, 110, 0.22)',
    '--text': '#102018',
    '--muted': '#607081',
    '--soft': '#21352b',
    '--white': '#06120c',
    '--em': '#0f9f6e',
    '--em2': '#0b815a',
    '--em3': '#047857',
    '--blue': '#2563eb',
    '--blue2': '#1d4ed8',
    '--gold': '#b7791f',
    '--rose': '#e11d48'
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
      toggle.textContent = nextTheme === 'light' ? '☀️' : '🌙';
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
    if (sources.length) img.src = sources[0];
  }

  function initImages() {
    var heroImg = document.querySelector('.avatar-wrap img');
    var heroFallback = document.querySelector('.avatar-fallback');

    // Only run tryImageSources if the src is a relative path (not already a data URL or absolute URL)
    if (heroImg && heroImg.src && !heroImg.src.startsWith('data:') && !heroImg.complete) {
      tryImageSources(heroImg, [
        'kobe-profile-avatar.jpg',
        './kobe-profile-avatar.jpg'
      ], heroFallback);
    } else if (heroImg && heroFallback && !heroImg.src) {
      // No src at all — show fallback
      heroImg.style.display = 'none';
      heroFallback.style.display = 'flex';
    }

    var aboutImg = document.querySelector('.about-image-wrap img');
    if (aboutImg && aboutImg.src && !aboutImg.src.startsWith('data:') && !aboutImg.complete) {
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
    var sections = Array.prototype.map.call(links, function (link) {
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
        links.forEach(function (link) {
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
      hamburger.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
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

    function open(card) {
      var img = card.querySelector('.project-image');
      var cardTitle = card.querySelector('.project-title');
      if (!img) return;
      title.textContent = cardTitle ? cardTitle.textContent : 'Project preview';
      image.src = img.currentSrc || img.src;
      image.alt = img.alt || title.textContent;
      modal.hidden = false;
      document.body.classList.add('modal-open');
      close.focus();
    }

    function closeModal() {
      modal.hidden = true;
      image.removeAttribute('src');
      document.body.classList.remove('modal-open');
    }

    cards.forEach(function (card) {
      var imageWrap = card.querySelector('.project-image-wrap');
      if (!imageWrap) return;
      imageWrap.setAttribute('tabindex', '0');
      imageWrap.setAttribute('role', 'button');
      imageWrap.setAttribute('aria-label', 'Preview project screenshot');
      imageWrap.addEventListener('click', function () { open(card); });
      imageWrap.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open(card);
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

    var selectors = [
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

    document.querySelectorAll(selectors).forEach(function (item) {
      item.classList.add('hover-reactive');

      item.addEventListener('pointermove', function (event) {
        var rect = item.getBoundingClientRect();
        item.style.setProperty('--hover-x', (event.clientX - rect.left) + 'px');
        item.style.setProperty('--hover-y', (event.clientY - rect.top) + 'px');
      }, { passive: true });

      item.addEventListener('pointerleave', function () {
        item.style.removeProperty('--hover-x');
        item.style.removeProperty('--hover-y');
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

      var lineColor = theme === 'light' ? 'rgba(37, 99, 235, 0.12)' : 'rgba(125, 211, 252, 0.13)';
      var dotColor = theme === 'light' ? 'rgba(15, 159, 110, 0.34)' : 'rgba(167, 243, 208, 0.42)';
      var accentColor = theme === 'light' ? 'rgba(15, 159, 110, 0.14)' : 'rgba(45, 220, 145, 0.16)';

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

    var visible = false;

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

    function syncCursor(event) {
      var transform = 'translate3d(' + event.clientX + 'px, ' + event.clientY + 'px, 0) translate(-50%, -50%)';
      cursor.style.transform = transform;
      dot.style.transform = transform;
      show();
    }

    document.addEventListener('pointermove', syncCursor, { passive: true });

    if ('onpointerrawupdate' in window) {
      document.addEventListener('pointerrawupdate', syncCursor, { passive: true });
    }

    document.addEventListener('pointerleave', hide);
    document.addEventListener('pointerdown', function () {
      cursor.classList.add('cursor-click');
    });
    document.addEventListener('pointerup', function () {
      cursor.classList.remove('cursor-click');
    });

    var hoverTargets = 'a, button, [role="button"], input, textarea, select, .project-card, .service-card, .competency-card, .timeline-card, .profile-logo, .contact-detail';
    document.querySelectorAll(hoverTargets).forEach(function (item) {
      item.addEventListener('pointerenter', function () {
        cursor.classList.add('cursor-hover');
        dot.classList.add('cursor-hover');
      });

      item.addEventListener('pointerleave', function () {
        cursor.classList.remove('cursor-hover');
        dot.classList.remove('cursor-hover');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initImages();
    initNav();
    initReveal();
    initCountersAndBars();
    initMobileMenu();
    initProjectPreview();
    initHoverReactive();
    initClickRipples();
    initBackgroundCanvas();
    initCustomCursor();
  });
})();
