(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var navLinks = document.querySelector('[data-nav-links]');
        if (menuButton && navLinks) {
            menuButton.addEventListener('click', function () {
                navLinks.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-back-top]').forEach(function (button) {
            button.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-dot]'));
            var prev = carousel.querySelector('[data-prev]');
            var next = carousel.querySelector('[data-next]');
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                    start();
                });
            });
            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
            show(0);
            start();
        });

        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var region = scope.querySelector('[data-region-filter]');
            var year = scope.querySelector('[data-year-filter]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var empty = scope.querySelector('[data-filter-empty]');

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var regionValue = region ? region.value : '';
                var yearValue = year ? year.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-type') || '',
                        card.getAttribute('data-year') || '',
                        card.getAttribute('data-tags') || ''
                    ].join(' ').toLowerCase();
                    var okQuery = !query || haystack.indexOf(query) !== -1;
                    var okRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                    var okYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    var showCard = okQuery && okRegion && okYear;
                    card.style.display = showCard ? '' : 'none';
                    if (showCard) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [input, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });

        document.querySelectorAll('.js-video-player').forEach(function (player) {
            var video = player.querySelector('video');
            var startButton = player.querySelector('.js-player-start');
            var stream = player.getAttribute('data-stream');
            var attached = false;
            var sourceReady = false;
            var pendingPlay = false;

            function requestPlay() {
                if (!video) {
                    return;
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }

            function attach() {
                if (!video || !stream || attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    sourceReady = true;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        sourceReady = true;
                        if (pendingPlay) {
                            requestPlay();
                        }
                    });
                    player._hls = hls;
                    return;
                }
                video.src = stream;
                sourceReady = true;
            }

            function play() {
                attach();
                player.classList.add('is-ready');
                pendingPlay = true;
                if (sourceReady) {
                    requestPlay();
                }
            }

            attach();
            if (startButton && video) {
                startButton.addEventListener('click', function () {
                    player.classList.add('is-playing');
                    play();
                });
            }
            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('is-playing');
                    player.classList.add('is-ready');
                });
                video.addEventListener('pause', function () {
                    player.classList.remove('is-playing');
                });
            }
        });
    });
})();
