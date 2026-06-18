(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
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

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        show(0);
        restart();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-movie-search]');
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
        var noResults = scope.querySelector('[data-no-results]');
        var container = scope.parentElement || document;
        var items = Array.prototype.slice.call(container.querySelectorAll('.movie-card, .rank-row'));
        var activeFilter = 'all';

        function applyFilters() {
            var term = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;

            items.forEach(function (item) {
                var text = (item.getAttribute('data-search') || '').toLowerCase();
                var filterText = item.getAttribute('data-filter') || '';
                var textMatches = !term || text.indexOf(term) !== -1;
                var filterMatches = activeFilter === 'all' || filterText.indexOf(activeFilter) !== -1;
                var showItem = textMatches && filterMatches;

                item.hidden = !showItem;
                if (showItem) {
                    visible += 1;
                }
            });

            if (noResults) {
                noResults.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeFilter = chip.getAttribute('data-filter-value') || 'all';
                chips.forEach(function (button) {
                    button.classList.toggle('active', button === chip);
                });
                applyFilters();
            });
        });
    });
})();
