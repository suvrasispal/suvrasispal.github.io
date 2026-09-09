/* Nexyra brand guidelines — progressive enhancement only.
   The page is fully functional with JavaScript disabled. */
(function () {
  'use strict';

  /* Highlight the section currently in view in the top navigation. */
  var links = Array.prototype.slice.call(document.querySelectorAll('.topbar nav a'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  var byId = {};
  var targets = [];

  links.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (!el) return;
    byId[id] = link;
    targets.push(el);
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = byId[entry.target.id];
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(function (l) { l.removeAttribute('aria-current'); });
        link.setAttribute('aria-current', 'true');
      }
    });
  }, { rootMargin: '-72px 0px -70% 0px', threshold: 0 });

  targets.forEach(function (el) { observer.observe(el); });
}());
