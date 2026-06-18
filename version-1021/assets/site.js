(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === active);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    var target = document.getElementById(input.getAttribute('data-target'));
    var empty = document.querySelector('[data-empty-state]');

    if (!target) {
      return;
    }

    var cards = Array.prototype.slice.call(target.querySelectorAll('[data-card]'));

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '')).toLowerCase();
        var match = !query || haystack.indexOf(query) !== -1;
        card.hidden = !match;
        if (match) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var trigger = box.querySelector('[data-play-trigger]');
    var message = box.querySelector('[data-player-message]');
    var url = box.getAttribute('data-src');
    var attached = false;
    var instance = null;

    function showMessage(text) {
      if (message) {
        message.hidden = false;
        message.textContent = text;
      }
    }

    function hideMessage() {
      if (message) {
        message.hidden = true;
        message.textContent = '';
      }
    }

    function attach() {
      if (attached || !video || !url) {
        return;
      }

      attached = true;
      hideMessage();

      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(url);
        instance.attachMedia(video);
        instance.on(window.Hls.Events.ERROR, function (_event, data) {
          if (data && data.fatal) {
            showMessage('视频暂时无法播放，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        showMessage('当前浏览器暂无法播放该视频');
      }
    }

    function play() {
      attach();
      if (!video) {
        return;
      }
      video.controls = true;
      box.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!attached || video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          box.classList.remove('is-playing');
        }
      });
      video.addEventListener('error', function () {
        showMessage('视频暂时无法播放，请稍后重试');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (instance) {
        instance.destroy();
      }
    });
  });
})();
