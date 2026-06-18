(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupSearchForms() {
    qsa('[data-site-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var base = form.getAttribute('data-search-base') || 'search.html';
        var query = input ? input.value.trim() : '';
        var target = base;
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupPageFilters() {
    var panel = qs('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var textInput = qs('[data-filter-text]', panel);
    var yearSelect = qs('[data-filter-year]', panel);
    var regionSelect = qs('[data-filter-region]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var items = qsa('[data-filter-item]');
    var count = qs('[data-filter-count]');

    function apply() {
      var text = normalize(textInput && textInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      items.forEach(function (item) {
        var haystack = normalize(item.getAttribute('data-search-text'));
        var itemYear = normalize(item.getAttribute('data-year'));
        var itemRegion = normalize(item.getAttribute('data-region'));
        var itemType = normalize(item.getAttribute('data-type'));
        var matched = true;

        if (text && haystack.indexOf(text) === -1) {
          matched = false;
        }
        if (year && itemYear !== year) {
          matched = false;
        }
        if (region && itemRegion !== region) {
          matched = false;
        }
        if (type && itemType !== type) {
          matched = false;
        }

        item.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [textInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupImageFallback() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupSearchForms();
    setupPageFilters();
    setupImageFallback();
  });
})();
