(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var panel = document.querySelector('[data-menu-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length === 0) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });

        show(0);
        play();
    }

    function initGlobalSearchForms() {
        var forms = document.querySelectorAll('.global-search-form');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });
    }

    function initLocalFilters() {
        var form = document.querySelector('[data-local-filter-form]');
        var list = document.querySelector('[data-filter-list]');
        var emptyState = document.querySelector('[data-empty-state]');
        if (!form || !list) {
            return;
        }
        var input = form.querySelector('.local-filter');
        var yearSelect = form.querySelector('.year-filter');
        var regionSelect = form.querySelector('.region-filter');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : 'all';
            var region = regionSelect ? regionSelect.value : 'all';
            var visible = 0;

            cards.forEach(function (card) {
                var search = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var matched = true;

                if (keyword && search.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (year !== 'all' && cardYear !== year) {
                    matched = false;
                }
                if (region !== 'all' && cardRegion !== region) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            form.addEventListener(eventName, apply);
        });
        apply();
    }

    function initSearchPage() {
        var results = document.getElementById('search-results');
        if (!results || !window.siteMovieIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.getElementById('search-page-input');
        var title = document.getElementById('search-title');
        var empty = document.getElementById('search-empty');
        if (input) {
            input.value = query;
        }
        if (title) {
            title.textContent = query ? '搜索结果' : '推荐内容';
        }

        function normalize(value) {
            return String(value || '').toLowerCase();
        }

        var source = window.siteMovieIndex.slice();
        var matched = source.filter(function (movie) {
            if (!query) {
                return movie.hot;
            }
            var haystack = normalize([
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(' '));
            return haystack.indexOf(normalize(query)) !== -1;
        }).slice(0, query ? 120 : 48);

        results.innerHTML = matched.map(function (movie) {
            return [
                '<article class="movie-card">',
                '    <a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
                '        <span class="poster-shell">',
                '            <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '            <span class="poster-mask"><span class="play-icon">▶</span></span>',
                '            <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
                '        </span>',
                '    </a>',
                '    <div class="card-body">',
                '        <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
                '    </div>',
                '</article>'
            ].join('');
        }).join('');

        if (empty) {
            empty.classList.toggle('is-visible', matched.length === 0);
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initPlayer() {
        var shell = document.querySelector('[data-player-shell]');
        var video = document.getElementById('movie-player');
        var button = document.querySelector('[data-player-button]');
        if (!shell || !video || !button) {
            return;
        }
        var source = video.getAttribute('data-src');
        var hlsInstance = null;
        var prepared = false;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function play() {
            prepare();
            button.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initGlobalSearchForms();
        initLocalFilters();
        initSearchPage();
        initPlayer();
    });
}());
