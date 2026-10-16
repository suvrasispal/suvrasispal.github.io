/* Loads before anything renders. Any image under assets/images/ that isn't in the package yet
   (run scripts/fetch-all-assets to download them) is loaded from the live Adda media server instead. */
(function () {
  var REMOTE = 'https://media.adda-slough.org/public/';
  function remote(src) { var i = String(src || '').indexOf('assets/images/'); return i < 0 ? '' : REMOTE + src.slice(i + 7); }
  function fix(el) {
    if (!el || el.tagName !== 'IMG' || el.getAttribute('data-remote-tried')) return;
    var r = remote(el.getAttribute('src'));
    if (!r) return;
    el.setAttribute('data-remote-tried', '1');
    el.removeAttribute('srcset');
    el.src = r;
  }
  document.addEventListener('error', function (ev) { fix(ev.target); }, true);
  function sweep() { var imgs = document.images; for (var i = 0; i < imgs.length; i++) { var im = imgs[i]; if (im.complete && im.naturalWidth === 0 && im.getAttribute('src')) fix(im); } }
  window.addEventListener('load', sweep);
  window.ADDA_REMOTE = remote;
})();
