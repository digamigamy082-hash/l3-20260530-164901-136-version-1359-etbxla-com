(function () {
    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === activeIndex);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === activeIndex);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var overlay = document.querySelector('[data-search-overlay]');
    var openSearchButtons = document.querySelectorAll('[data-open-search]');
    var closeSearch = document.querySelector('[data-close-search]');

    function openSearch() {
        if (!overlay) {
            return;
        }
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        var input = overlay.querySelector('[data-search-input]');
        if (input) {
            window.setTimeout(function () {
                input.focus();
            }, 50);
        }
    }

    function closeSearchOverlay() {
        if (!overlay) {
            return;
        }
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
    }

    openSearchButtons.forEach(function (button) {
        button.addEventListener('click', openSearch);
    });

    if (closeSearch) {
        closeSearch.addEventListener('click', closeSearchOverlay);
    }

    if (overlay) {
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                closeSearchOverlay();
            }
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeSearchOverlay();
        }
    });

    var catalog = window.MOVIE_CATALOG || [];

    function currentPrefix() {
        var path = window.location.pathname;
        if (path.indexOf('/movie/') !== -1 || path.indexOf('/category/') !== -1) {
            return '../';
        }
        return '';
    }

    function makeUrl(movie) {
        return currentPrefix() + movie.url;
    }

    function makeCover(movie) {
        return currentPrefix() + movie.cover;
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function searchMovies(query, category) {
        var q = normalize(query);
        var c = normalize(category);
        return catalog.filter(function (movie) {
            if (c && normalize(movie.category) !== c) {
                return false;
            }
            if (!q) {
                return true;
            }
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return haystack.indexOf(q) !== -1;
        }).slice(0, 80);
    }

    function renderResults(container, results) {
        if (!container) {
            return;
        }
        if (!results.length) {
            container.innerHTML = '<p class="empty-result">没有找到匹配影片，请更换关键词。</p>';
            return;
        }
        container.innerHTML = results.map(function (movie) {
            return [
                '<a class="search-result-item" href="' + makeUrl(movie) + '">',
                '    <span class="search-result-thumb"><img src="' + makeCover(movie) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"></span>',
                '    <span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</span></span>',
                '    <em>' + escapeHtml(movie.category) + '</em>',
                '</a>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function bindSearch(inputSelector, selectSelector, resultSelector) {
        var input = document.querySelector(inputSelector);
        var select = document.querySelector(selectSelector);
        var result = document.querySelector(resultSelector);
        if (!input || !result) {
            return;
        }
        function run() {
            renderResults(result, searchMovies(input.value, select ? select.value : ''));
        }
        input.addEventListener('input', run);
        if (select) {
            select.addEventListener('change', run);
        }
        renderResults(result, searchMovies('', select ? select.value : '').slice(0, 20));
    }

    bindSearch('[data-search-input]', '[data-filter-category]', '[data-search-results]');
    bindSearch('[data-page-search-input]', '[data-page-filter-category]', '[data-page-search-results]');

    var inlineInput = document.querySelector('[data-inline-search-input]');
    if (inlineInput) {
        inlineInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                openSearch();
                var overlayInput = document.querySelector('[data-search-input]');
                if (overlayInput) {
                    overlayInput.value = inlineInput.value;
                    overlayInput.dispatchEvent(new Event('input'));
                }
            }
        });
    }

    function loadHlsScript(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.onload = callback;
        script.onerror = callback;
        document.head.appendChild(script);
    }

    function initPlayer(button) {
        var playerCard = button.closest('[data-player-card]');
        if (!playerCard) {
            return;
        }
        var video = playerCard.querySelector('[data-video-player]');
        var start = playerCard.querySelector('[data-video-start]');
        var src = button.getAttribute('data-src');
        if (!video || !src) {
            return;
        }

        function playNative() {
            video.src = src;
            video.play().catch(function () {});
        }

        loadHlsScript(function () {
            if (window.Hls && window.Hls.isSupported()) {
                if (video._hls) {
                    video._hls.destroy();
                }
                var hls = new window.Hls();
                video._hls = hls;
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                playNative();
            } else {
                playNative();
            }
        });

        if (start) {
            start.classList.add('hidden');
        }
    }

    document.querySelectorAll('[data-play-button]').forEach(function (button) {
        button.addEventListener('click', function () {
            initPlayer(button);
        });
    });
})();
