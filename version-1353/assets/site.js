(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function() {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));

    if (filterInput && grids.length) {
        filterInput.addEventListener('input', function() {
            var query = filterInput.value.trim().toLowerCase();
            grids.forEach(function(grid) {
                Array.prototype.slice.call(grid.querySelectorAll('[data-card]')).forEach(function(card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' ').toLowerCase();
                    card.classList.toggle('is-hidden', Boolean(query) && text.indexOf(query) === -1);
                });
            });
        });
    }
})();
