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

/* ------------------------------------------------------------
   Contact form — posts to Web3Forms, no backend of our own.
   ------------------------------------------------------------ */

(function () {
  "use strict";

  var form = document.getElementById("cform");
  if (!form) return;

  var status = document.getElementById("cf-status");
  var button = form.querySelector(".cform__send");
  var sending = false;

  var FIELDS = [
    { id: "cf-name", err: "cf-name-err", msg: "Please enter your name." },
    { id: "cf-email", err: "cf-email-err", msg: "Please enter your email address.",
      bad: "That doesn't look like a valid email address." },
    { id: "cf-message", err: "cf-message-err", msg: "Please tell me a little about it." }
  ];

  // Deliberately permissive: something@something.tld. Stricter patterns reject
  // addresses that are perfectly valid.
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(f, text) {
    var input = document.getElementById(f.id);
    var slot = document.getElementById(f.err);
    if (text) {
      slot.textContent = text;
      slot.hidden = false;
      input.setAttribute("aria-invalid", "true");
    } else {
      slot.textContent = "";
      slot.hidden = true;
      input.removeAttribute("aria-invalid");
    }
  }

  function validate(showAll) {
    var firstBad = null;
    FIELDS.forEach(function (f) {
      var input = document.getElementById(f.id);
      var value = input.value.trim();
      var problem = null;
      if (!value) problem = f.msg;
      else if (f.id === "cf-email" && !EMAIL.test(value)) problem = f.bad;

      // don't scold someone about a field they haven't reached yet
      if (problem && (showAll || input.dataset.touched)) setError(f, problem);
      else if (!problem) setError(f, null);

      if (problem && !firstBad) firstBad = input;
    });
    return firstBad;
  }

  FIELDS.forEach(function (f) {
    var input = document.getElementById(f.id);
    input.addEventListener("blur", function () {
      input.dataset.touched = "1";
      validate(false);
    });
    input.addEventListener("input", function () {
      if (input.dataset.touched) validate(false);
    });
  });

  function say(text, kind) {
    status.textContent = text;
    status.className = "cform__status" + (kind ? " is-" + kind : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;               // one submission at a time

    var firstBad = validate(true);
    if (firstBad) {
      say("Please fix the highlighted fields.", "bad");
      firstBad.focus();
      return;
    }

    var key = form.elements.access_key.value;
    if (!key || key.indexOf("6a434485-55fa-4f55-9dba-e4066a8c6835") === 0) {
      say("This form isn't connected yet — add your Web3Forms access key.", "bad");
      return;
    }

    sending = true;
    button.disabled = true;
    button.textContent = "Sending…";
    say("Sending your message…");

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (data && data.success) {
          form.reset();
          FIELDS.forEach(function (f) {
            setError(f, null);
            delete document.getElementById(f.id).dataset.touched;
          });
          say("Thanks — your message is on its way. I'll be in touch shortly.", "ok");
        } else {
          say((data && data.message) ||
              "Something went wrong sending that. Please email me directly instead.", "bad");
        }
      })
      .catch(function () {
        say("Couldn't reach the server. Check your connection, or email me directly.", "bad");
      })
      .then(function () {
        sending = false;
        button.disabled = false;
        button.textContent = "Send message";
      });
  });
})();
