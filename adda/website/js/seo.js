/* Per-page SEO for pages whose content depends on the URL (Event.dc.html?id=…).
   ADDA_SEO({ title, description, path, image, jsonld }) updates title, description, canonical, Open Graph, Twitter and JSON-LD. */
(function () {
  var SITE = 'https://adda-slough.org/';
  function meta(attr, key, val) {
    var el = document.head.querySelector('meta[' + attr + '="' + key + '"]');
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
    el.setAttribute('content', val);
  }
  window.ADDA_SEO = function (o) {
    var url = SITE + (o.path || '');
    var title = o.title;
    var img = o.image ? (/^https?:/.test(o.image) ? o.image : SITE + o.image.replace(/^\.?\//, '')) : SITE + 'assets/images/durga-pujo-pandal.jpg';
    if (document.title !== title) document.title = title;
    meta('name', 'description', o.description);
    meta('property', 'og:title', title); meta('property', 'og:description', o.description);
    meta('property', 'og:url', url); meta('property', 'og:image', img);
    meta('name', 'twitter:title', title); meta('name', 'twitter:description', o.description); meta('name', 'twitter:image', img);
    var c = document.head.querySelector('link[rel="canonical"]');
    if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.appendChild(c); }
    c.href = url;
    var s = document.getElementById('seo-jsonld-page');
    if (o.jsonld) {
      if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'seo-jsonld-page'; document.head.appendChild(s); }
      s.textContent = JSON.stringify(o.jsonld);
    } else if (s) s.remove();
  };
})();
