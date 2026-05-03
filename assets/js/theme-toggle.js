// Pixel Cosmos — light/dark theme toggle
(function () {
    var STORAGE_KEY = 'eggy-theme';
    var root = document.documentElement;

    function setTheme(t) {
        root.dataset.theme = t;
        try { localStorage.setItem(STORAGE_KEY, t); } catch (e) {}
        document.querySelectorAll('.dark-only').forEach(function (el) {
            el.classList.toggle('hidden', t !== 'dark');
        });
        document.querySelectorAll('.light-only').forEach(function (el) {
            el.classList.toggle('hidden', t !== 'light');
        });
    }

    // init label state on load
    document.addEventListener('DOMContentLoaded', function () {
        setTheme(root.dataset.theme || 'dark');

        document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
            });
        });
    });
})();
