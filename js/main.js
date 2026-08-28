/* Suvrasis Pal — portfolio
   Slide viewer for the project galleries. No dependencies. */

(function () {
  "use strict";

  var lb = document.getElementById("lb");
  var img = document.getElementById("lbImg");
  var titleEl = document.getElementById("lbTitle");
  var countEl = document.getElementById("lbCount");
  var prevBtn = document.getElementById("lbPrev");
  var nextBtn = document.getElementById("lbNext");
  var closeBtn = document.getElementById("lbClose");
  var fullLink = document.getElementById("lbFull");

  var slides = [];
  var index = 0;
  var opener = null;

  function srcFor(id) {
    return (window.__IMG && window.__IMG[id]) || "assets/full/" + id + ".jpg";
  }

  function preload(i) {
    if (i < 0 || i >= slides.length) return;
    var p = new Image();
    p.src = srcFor(slides[i]);
  }

  function render() {
    img.src = srcFor(slides[index]);
    img.alt = titleEl.textContent + " — slide " + (index + 1) + " of " + slides.length;
    countEl.textContent = index + 1 + " / " + slides.length;
    fullLink.href = srcFor(slides[index]);
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === slides.length - 1;
    preload(index + 1);
    preload(index - 1);
  }

  function open(btn) {
    slides = btn.dataset.gallery.split(",");
    index = 0;
    opener = btn;
    titleEl.textContent = btn.dataset.title;
    lb.hidden = false;
    document.body.classList.add("lb-open");
    render();
    closeBtn.focus();
  }

  function close() {
    lb.hidden = true;
    document.body.classList.remove("lb-open");
    img.src = "";
    if (opener) opener.focus();
    opener = null;
  }

  function go(step) {
    var next = index + step;
    if (next < 0 || next >= slides.length) return;
    index = next;
    render();
  }

  document.querySelectorAll(".work__open").forEach(function (btn) {
    btn.addEventListener("click", function () { open(btn); });
  });

  prevBtn.addEventListener("click", function () { go(-1); });
  nextBtn.addEventListener("click", function () { go(1); });
  closeBtn.addEventListener("click", close);

  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.classList.contains("lb__stage")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "Home") { index = 0; render(); }
    else if (e.key === "End") { index = slides.length - 1; render(); }
    else if (e.key === "Tab") {
      // keep focus inside the dialog
      var f = [closeBtn, fullLink, prevBtn, nextBtn].filter(function (b) { return !b.disabled; });
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  // swipe on touch
  var x0 = null;
  lb.addEventListener("touchstart", function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });

  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
