/* NutriFamilia V7.1.2 — compatibility + deployment hardening */
(function () {
  'use strict';

  window.NF_COMPAT = window.NF_COMPAT || {};
  window.NF_COMPAT.version = '7.1.2';

  // Global HTML escaping fallback used by several UI modules.
  if (typeof window.esc !== 'function') {
    window.esc = function (value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
      });
    };
  }

  // Keep the current app usable even if a browser blocks service workers.
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(function (err) {
        if (window.NF_RUNTIME && Array.isArray(window.NF_RUNTIME.errors)) {
          window.NF_RUNTIME.errors.push({ type: 'service-worker', message: String(err && err.message || err) });
        }
      });
    }, { once: true });
  }

  // Give old installs one reload opportunity after a new worker takes control.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (sessionStorage.getItem('nf-sw-reloaded') === '1') return;
      sessionStorage.setItem('nf-sw-reloaded', '1');
      setTimeout(function () { location.reload(); }, 50);
    });
  }

  registerServiceWorker();
})();
