(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = qs('.nav-toggle');
    var links = qs('.nav-links');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  function setupCarousel() {
    var carousel = qs('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('.hero-dots button', carousel);
    var prev = qs('.hero-control.prev', carousel);
    var next = qs('.hero-control.next', carousel);
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  function setupLocalFilter() {
    var input = qs('.live-filter');
    var select = qs('.year-filter');
    var scope = qs('.filter-scope');
    if (!scope || (!input && !select)) {
      return;
    }
    var cards = qsa('.movie-card', scope);

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = select ? select.value : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var sameText = !keyword || text.indexOf(keyword) !== -1;
        var sameYear = !year || card.getAttribute('data-year').indexOf(year) !== -1;
        card.style.display = sameText && sameYear ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (select) {
      select.addEventListener('change', apply);
    }
  }

  function setupPlayer() {
    var boxes = qsa('.player-box');
    boxes.forEach(function (box) {
      var video = qs('video', box);
      var layer = qs('.play-layer', box);
      if (!video || !layer) {
        return;
      }
      var url = video.getAttribute('data-url');
      var loaded = false;

      function loadAndPlay() {
        if (!url) {
          return;
        }
        if (!loaded) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
          } else {
            video.src = url;
          }
          loaded = true;
        }
        layer.classList.add('hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            layer.classList.remove('hidden');
          });
        }
      }

      layer.addEventListener('click', loadAndPlay);
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          loadAndPlay();
        }
      });
      video.addEventListener('play', function () {
        layer.classList.add('hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          layer.classList.remove('hidden');
        }
      });
    });
  }

  function movieCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="card-cover" href="./' + item.file + '">',
      '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="card-year">' + escapeHtml(item.year) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '    <h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupGlobalSearch() {
    var input = qs('#global-search-input');
    var results = qs('#global-search-results');
    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        results.innerHTML = '';
        return;
      }
      var items = window.SEARCH_MOVIES.filter(function (item) {
        return [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(' ')]
          .join(' ')
          .toLowerCase()
          .indexOf(keyword) !== -1;
      }).slice(0, 120);
      results.innerHTML = items.map(movieCard).join('');
    }

    input.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupCarousel();
    setupLocalFilter();
    setupPlayer();
    setupGlobalSearch();
  });
}());
