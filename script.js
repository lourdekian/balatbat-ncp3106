(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var softMotion = !reduceMotion && finePointer;

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
      });
    });
  }

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    items.forEach(function (item, index) {
      item.style.setProperty('--reveal-delay', Math.min(index % 5, 4) * 55 + 'ms');
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
      '<div class="intro-loader__meta">Operations · CRM · Automation</div>';

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

  function initLanguageBars() {
    var bars = document.querySelectorAll('.language-bar-fill[data-width]');
    if (!bars.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      bars.forEach(function (bar) { bar.style.width = bar.dataset.width + '%'; });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.width = entry.target.dataset.width + '%';
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

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
    if (!softMotion) return;

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

  function dedupeExperienceCards() {
    var seen = {};
    document.querySelectorAll('#experience .timeline-item').forEach(function (item) {
      var title = item.querySelector('.exp-title');
      var company = item.querySelector('.exp-company');
      var duration = item.querySelector('.exp-duration');
      if (!title || !company || !duration) return;

      var key = [
        title.textContent.trim().toLowerCase(),
        company.textContent.trim().toLowerCase(),
        duration.textContent.trim().toLowerCase()
      ].join('|');

      if (seen[key]) {
        item.remove();
        return;
      }

      seen[key] = true;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    dedupeExperienceCards();
    initPageIntro();
    initTheme();
    initImages();
    initNav();
    initKineticTitles();
    initSectionWipes();
    initReveal();
    initLanguageBars();
    initMobileMenu();
    initProjectPreview();
    initClickRipples();
  });
})();
