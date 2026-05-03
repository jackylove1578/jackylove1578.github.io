// Pixel Cosmos — lazy game loader + fullscreen toggle
// Usage on a container:
//   <div data-game-player
//        data-game-url="https://..."
//        data-game-title="Traffic Rider"
//        data-game-thumb="/path/to/thumb.png"
//        data-game-fullscreen="auto|manual">
//     <!-- placeholder with [data-play-button] -->
//   </div>
// And anywhere else:
//   <button data-fullscreen-target="#game-frame">FULLSCREEN</button>
(function () {
    'use strict';

    function enterFs(el) {
        var req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
        if (req) return req.call(el);
    }
    function exitFs() {
        var exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (exit) return exit.call(document);
    }
    function isFs() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    }

    function mountGame(host) {
        var url = host.getAttribute('data-game-url');
        if (!url) return null;
        var title = host.getAttribute('data-game-title') || 'Game';
        var iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.title = title;
        iframe.className = 'w-full h-full border-0 block';
        iframe.setAttribute('allow', 'autoplay; fullscreen; gamepad; cross-origin-isolated; clipboard-write');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('loading', 'eager');

        // Clear placeholder + mount iframe
        host.innerHTML = '';
        host.appendChild(iframe);
        host.setAttribute('data-game-mounted', '1');

        // Auto fullscreen if requested (must be in same user-gesture stack)
        if (host.getAttribute('data-game-fullscreen') === 'auto') {
            try { enterFs(host); } catch (e) { /* ignore */ }
        }
        // Focus iframe so keyboard input goes to game
        try { iframe.focus(); } catch (e) {}
        return iframe;
    }

    // Zoom game to full width (keep header/footer visible)
    function toggleZoom(host) {
        if (!host) return;

        // If not mounted yet, mount first
        if (host.hasAttribute('data-game-player') && !host.hasAttribute('data-game-mounted')) {
            mountGame(host);
        }

        var section = host.closest('section');
        var main = host.closest('main');
        var sidebar = main ? main.querySelector('aside') : null;
        var articles = section ? section.parentElement.querySelectorAll('article') : [];

        if (host.hasAttribute('data-zoomed')) {
            // Exit zoom
            host.removeAttribute('data-zoomed');
            host.classList.remove('!h-[80vh]', '!min-h-[600px]');
            if (section) {
                section.classList.remove('!col-span-12');
            }
            if (sidebar) {
                sidebar.style.display = '';
            }
            articles.forEach(function(article) {
                article.style.display = '';
            });
        } else {
            // Enter zoom
            host.setAttribute('data-zoomed', '1');
            host.classList.add('!h-[80vh]', '!min-h-[600px]');
            if (section) {
                section.classList.add('!col-span-12');
            }
            if (sidebar) {
                sidebar.style.display = 'none';
            }
            articles.forEach(function(article) {
                article.style.display = 'none';
            });
            // Scroll to fit iframe in viewport (account for sticky header)
            setTimeout(function() {
                var header = document.querySelector('header');
                var headerHeight = header ? header.offsetHeight : 0;
                var rect = host.getBoundingClientRect();
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                var targetScroll = scrollTop + rect.top - headerHeight - 20; // header height + 20px padding
                window.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
            }, 100);
        }
    }

    // Click-to-play (delegated)
    document.addEventListener('click', function (e) {
        var playBtn = e.target.closest('[data-play-button]');
        if (playBtn) {
            var host = playBtn.closest('[data-game-player]');
            if (host && !host.hasAttribute('data-game-mounted')) {
                e.preventDefault();
                mountGame(host);
                return;
            }
        }

        var zoomBtn = e.target.closest('[data-zoom-game]');
        if (zoomBtn) {
            e.preventDefault();
            var host = document.querySelector('#game-frame');
            toggleZoom(host);
            zoomBtn.textContent = host.hasAttribute('data-zoomed') ? '✕ CLOSE' : '► ZOOM';
            return;
        }

        var fsBtn = e.target.closest('[data-fullscreen-target]');
        if (fsBtn) {
            e.preventDefault();
            var target = document.querySelector(fsBtn.getAttribute('data-fullscreen-target'));
            if (!target) return;
            // If host not mounted yet, mount then fullscreen
            if (target.hasAttribute('data-game-player') && !target.hasAttribute('data-game-mounted')) {
                mountGame(target);
            }
            if (isFs()) exitFs(); else enterFs(target);
        }
    });

    // ESC to exit zoom
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var zoomed = document.querySelector('[data-zoomed]');
            if (zoomed) {
                toggleZoom(zoomed);
                var btn = document.querySelector('[data-zoom-game]');
                if (btn) btn.textContent = '► ZOOM';
            }
        }
    });
})();
