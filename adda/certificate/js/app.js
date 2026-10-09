(function () {
  'use strict';
  var CERT_W = 1123, CERT_H = 794;
  var state = { eventName: 'Durga Puja', year: '2026', heading: 'Certificate', subheading: 'of Appreciation', recipient: '', competition: '', date: '', signatory: '', sponsors: [null, null] };

  var $ = function (id) { return document.getElementById(id); };
  var cert = $('cert'), certBox = $('certBox'), preview = $('preview');

  function fmtDate(v) {
    if (!v) return '';
    var d = new Date(v + 'T00:00:00');
    if (isNaN(d)) return v;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function render() {
    $('c-eventLine').textContent = state.eventName.trim();
    var yr = state.year.trim(); $('c-year').textContent = yr; $('c-year').classList.toggle('is-blank', !yr);
    $('c-heading').textContent = state.heading;
    $('c-subheading').textContent = state.subheading;

    var name = $('c-recipient'), len = state.recipient.length;
    name.textContent = state.recipient;
    name.style.fontSize = (len > 30 ? 40 : len > 22 ? 46 : 54) + 'px';

    var hasComp = !!state.competition.trim();
    $('c-competition').textContent = state.competition;
    $('c-competition').hidden = !hasComp;
    $('c-competitionBlank').hidden = hasComp;

    $('c-signature').textContent = state.signatory.trim() || 'Signature';
    var dateText = fmtDate(state.date);
    document.querySelectorAll('.c-date').forEach(function (el) { el.textContent = dateText; });

    var logos = state.sponsors.filter(Boolean), n = logos.length;
    $('sponsorCount').textContent = n;
    $('dateLeft').hidden = n === 0;
    $('dateRight').hidden = n > 0;
    $('sponsorBlock').hidden = n === 0;
    var wrap = $('sponsorLogos');
    wrap.innerHTML = '';
    logos.forEach(function (src, i) {
      if (i > 0) { var sep = document.createElement('div'); sep.className = 'sponsor-sep'; wrap.appendChild(sep); }
      var cell = document.createElement('div'); cell.className = 'sponsor-logo';
      var img = document.createElement('img'); img.src = src; img.alt = 'Sponsor';
      cell.appendChild(img); wrap.appendChild(cell);
    });

    document.querySelectorAll('.slot').forEach(function (slot) {
      var i = +slot.dataset.slot, src = state.sponsors[i];
      var thumb = slot.querySelector('.slot-thumb');
      thumb.innerHTML = '';
      if (src) { var t = document.createElement('img'); t.src = src; t.alt = ''; thumb.appendChild(t); }
      slot.querySelector('.slot-action').textContent = src ? 'Replace' : 'Upload logo';
      slot.querySelector('.slot-remove').hidden = !src;
    });
  }

  function fit() {
    var cs = getComputedStyle(preview);
    var w = preview.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var s = Math.max(0.2, Math.min(1, w / CERT_W));
    cert.style.transform = 'scale(' + s + ')';
    certBox.style.width = Math.round(CERT_W * s) + 'px';
    certBox.style.height = Math.round(CERT_H * s) + 'px';
  }

  document.querySelectorAll('input[data-key]').forEach(function (inp) {
    inp.addEventListener('input', function () { state[inp.dataset.key] = inp.value; render(); });
  });

  document.querySelectorAll('.slot').forEach(function (slot) {
    var i = +slot.dataset.slot;
    var file = slot.querySelector('input[type=file]');
    file.addEventListener('change', function () {
      var f = file.files && file.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () { state.sponsors[i] = r.result; render(); };
      r.readAsDataURL(f);
      file.value = '';
    });
    slot.querySelector('.slot-remove').addEventListener('click', function () { state.sponsors[i] = null; render(); });
  });

  var fontCSS = null;
  function getFontCSS() {
    if (fontCSS) return Promise.resolve(fontCSS);
    return fetch('https://fonts.googleapis.com/css2?family=Forum&family=Ovo&family=Yellowtail&display=swap')
      .then(function (r) { return r.text(); })
      .then(function (css) {
        var urls = Array.from(new Set((css.match(/url\((https:[^)]+)\)/g) || []).map(function (u) { return u.slice(4, -1); })));
        return Promise.all(urls.map(function (u) {
          return fetch(u).then(function (r) { return r.blob(); }).then(function (b) {
            return new Promise(function (res) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.readAsDataURL(b); });
          });
        })).then(function (datas) {
          urls.forEach(function (u, k) { css = css.split(u).join(datas[k]); });
          fontCSS = css; return css;
        });
      });
  }

  var btn = $('exportBtn'), label = $('exportLabel');
  btn.addEventListener('click', function () {
    if (!window.htmlToImage || !window.jspdf) { alert('PDF tools are still loading — try again in a moment.'); return; }
    btn.disabled = true; label.textContent = '…';
    (document.fonts ? document.fonts.ready : Promise.resolve())
      .then(getFontCSS)
      .then(function (css) {
        return window.htmlToImage.toCanvas(cert, {
          pixelRatio: 3, width: CERT_W, height: CERT_H, backgroundColor: '#ffffff', fontEmbedCSS: css,
          style: { transform: 'none', left: '0', top: '0' }
        });
      })
      .then(function (canvas) {
        var pdf = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 297, 210);
        var slug = (state.recipient || 'blank').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        pdf.save('certificate-' + slug + '.pdf');
      })
      .catch(function (err) { console.error(err); alert('Export failed: ' + err.message); })
      .finally(function () { btn.disabled = false; label.textContent = 'PDF'; });
  });

  var header = document.querySelector('.app-header'), dock = $('exportDock');
  var mq = window.matchMedia('(max-width: 960px)');
  function placeBtn() {
    if (!mq.matches) {
      if (btn.parentNode !== header) header.appendChild(btn);
      btn.classList.remove('is-floating');
      return;
    }
    if (btn.parentNode !== dock) dock.appendChild(btn);
    var vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight || document.documentElement.clientHeight;
    var docked = dock.getBoundingClientRect().bottom <= vh - 16;
    btn.classList.toggle('is-floating', !docked);
  }

  if (window.ResizeObserver) new ResizeObserver(fit).observe(preview);
  window.addEventListener('resize', function () { fit(); placeBtn(); });
  document.addEventListener('scroll', placeBtn, { passive: true, capture: true });
  window.addEventListener('orientationchange', function () { setTimeout(function () { fit(); placeBtn(); }, 200); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', placeBtn);
  if (mq.addEventListener) mq.addEventListener('change', placeBtn); else if (mq.addListener) mq.addListener(placeBtn);
  if (window.IntersectionObserver) new IntersectionObserver(placeBtn, { threshold: [0, 0.5, 1] }).observe(dock);
  render(); fit(); placeBtn();
})();
