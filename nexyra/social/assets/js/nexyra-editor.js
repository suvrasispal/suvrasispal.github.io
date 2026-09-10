/* =====================================================================
   NEXYRA EDITOR ENGINE
   Shared, reusable logic behind all three (Facebook / Instagram /
   LinkedIn) template editors:
     - responsive scaling of a fixed-pixel "stage"
     - image/video upload, drag-to-reposition, zoom, reset
     - brand-locked inline text editing
     - JPG / PNG export (html2canvas)
     - MP4 export for video templates (canvas + MediaRecorder, ffmpeg.wasm
       transcode from WebM -> MP4, fully client-side)
   Each platform page instantiates one NexyraEditor with a small config
   object describing ITS OWN layout — the engine does not assume any
   particular visual design, only the interaction mechanics.
   ===================================================================== */

class NexyraEditor {
  /**
   * @param {Object} opts
   * @param {HTMLElement} opts.wrapper       responsive outer wrapper (scales the stage to fit)
   * @param {HTMLElement} opts.stage         fixed-pixel-size template root
   * @param {HTMLElement} opts.mediaViewport fixed-size, overflow:hidden crop window
   * @param {HTMLElement} opts.mediaLayer    absolutely-positioned element that receives the <img>/<video>
   * @param {number} opts.width  real stage width in px
   * @param {number} opts.height real stage height in px
   * @param {{x:number,y:number,w:number,h:number}} opts.mediaRect  mediaViewport position/size relative to stage, in real px
   * @param {string} opts.fileBase   base filename used for exports
   * @param {string} [opts.defaultMediaUrl] initial placeholder image URL
   * @param {Array<{el:HTMLElement,maxFont:number,minFont?:number}>} opts.editableEls  text nodes to keep brand-locked but content-editable
   * @param {HTMLImageElement} [opts.logoImg]      the in-template logo <img>, swappable by the user
   * @param {string} [opts.defaultLogoSrc]         the brand-default logo src, restored by resetLogo()
   * @param {(state:Object)=>void} [opts.onStateChange]
   */
  constructor(opts) {
    this.wrapper = opts.wrapper;
    this.stage = opts.stage;
    this.mediaViewport = opts.mediaViewport;
    this.mediaLayer = opts.mediaLayer;
    this.width = opts.width;
    this.height = opts.height;
    this.mediaRect = opts.mediaRect;
    this.fileBase = opts.fileBase || 'nexyra-export';
    this.defaultMediaUrl = opts.defaultMediaUrl || null;
    this.editableEls = opts.editableEls || [];
    this.logoImg = opts.logoImg || null;
    this.defaultLogoSrc = opts.defaultLogoSrc || (this.logoImg ? this.logoImg.getAttribute('src') : null);
    this.onStateChange = opts.onStateChange || function () {};

    this.mediaType = null;   // 'image' | 'video'
    this.mediaEl = null;     // the live <img> or <video>
    this._objectUrl = null;  // to revoke on replace
    this.crop = { x: 0, y: 0, scale: 1, minScale: 1, naturalW: 0, naturalH: 0 };
    this._drag = null;
    this._overlayCacheUrl = null;
    this._logoObjectUrl = null; // to revoke on logo replace/reset

    this.stage.style.width = this.width + 'px';
    this.stage.style.height = this.height + 'px';

    this._initResponsive();
    this._initTextLock();
    this._bindPointer();
    this._bindDropZone();

    if (this.defaultMediaUrl) {
      this.loadMediaFromUrl(this.defaultMediaUrl, 'image');
    }
  }

  /* ------------------------------------------------------------ *
   * Responsive scaling — the stage is always rendered at its real
   * pixel size internally; a CSS transform scales it down to fit
   * the available column width so exports never need re-layout.
   * ------------------------------------------------------------ */
  _initResponsive() {
    const apply = () => {
      const available = this.wrapper.clientWidth;
      const scale = Math.min(1, available / this.width);
      this.stage.style.transform = `scale(${scale})`;
      this.stage.style.transformOrigin = 'top left';
      this.wrapper.style.height = (this.height * scale) + 'px';
      this._displayScale = scale;
    };
    apply();
    window.addEventListener('resize', apply);
    this._recalcResponsive = apply;
  }

  /* ------------------------------------------------------------ *
   * Text lock: content is editable, brand styling is not.
   * Paste is sanitised to plain text; long copy auto-shrinks
   * within its own box rather than spilling into the layout.
   * ------------------------------------------------------------ */
  _initTextLock() {
    this.editableEls.forEach((cfg) => {
      const el = cfg.el;
      el.dataset.maxFont = cfg.maxFont;
      el.dataset.minFont = cfg.minFont || Math.round(cfg.maxFont * 0.55);
      el.style.fontSize = cfg.maxFont + 'px';
      el.setAttribute('contenteditable', 'true');
      el.classList.add('nx-editable');

      el.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
      });

      // noAutoFit: true keeps the element locked at its brand-spec maxFont
      // permanently — the box is expected to grow with its content (normal
      // flow / flex layout) instead of the text shrinking to fit a fixed box.
      if (!cfg.noAutoFit) {
        el.addEventListener('input', () => this._autoFit(el));
      }
      el.addEventListener('keydown', (e) => {
        // Enter creates a plain line break instead of a new <div>/<p>
        if (e.key === 'Enter' && !el.dataset.allowMultiline) {
          e.preventDefault();
          document.execCommand('insertLineBreak');
        }
      });
      el.addEventListener('blur', () => {
        if (!el.textContent.trim()) el.textContent = cfg.placeholder || '';
      });
    });
  }

  _autoFit(el) {
    const max = parseFloat(el.dataset.maxFont);
    const min = parseFloat(el.dataset.minFont);
    let size = max;
    el.style.fontSize = size + 'px';
    let guard = 0;
    while (el.scrollHeight > el.clientHeight + 1 && size > min && guard < 40) {
      size -= 1;
      el.style.fontSize = size + 'px';
      guard++;
    }
  }

  /* ------------------------------------------------------------ *
   * Dynamic stage height — for layouts (e.g. LinkedIn's full-height
   * left column) whose fixed-height canvas has no slack of its own
   * to absorb longer copy. A template's own script measures its
   * content and decides the new `this.height` / `this.mediaRect.h`;
   * call refreshLayout() afterwards so the stage element, the
   * transform-scale wrapper, and (via syncMediaToViewport) the photo
   * crop all stay consistent with the new size. Facebook/Instagram
   * never call these — purely additive, no effect unless used.
   * ------------------------------------------------------------ */
  refreshLayout() {
    this.stage.style.height = this.height + 'px';
    this.stage.style.width = this.width + 'px';
    if (this._recalcResponsive) this._recalcResponsive();
  }

  /** Keep the currently-loaded photo/video fully covering the media
   * viewport after its height changes — bumps the crop scale up only
   * if the existing scale would otherwise leave a gap; never zooms
   * back out on its own, so it never fights a user's manual crop. */
  syncMediaToViewport() {
    if (!this.crop.naturalW) return; // nothing loaded yet
    const minScale = Math.max(this.mediaRect.w / this.crop.naturalW, this.mediaRect.h / this.crop.naturalH);
    this.crop.minScale = minScale;
    if (this.crop.scale < minScale) this.crop.scale = minScale;
    this._clampCrop();
    this._applyMediaTransform();
  }

  /* ------------------------------------------------------------ *
   * Media loading
   * ------------------------------------------------------------ */
  loadMediaFromFile(file) {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      this.onStateChange({ type: 'error', message: 'Unsupported file type. Please upload an image (JPG/PNG/WebP) or a video (MP4/WebM).' });
      return;
    }
    const url = URL.createObjectURL(file);
    this.loadMediaFromUrl(url, isVideo ? 'video' : 'image', true);
  }

  loadMediaFromUrl(url, type, isObjectUrl) {
    this._teardownMedia();
    if (isObjectUrl) this._objectUrl = url;
    this.mediaType = type;
    this._overlayCacheUrl = null; // invalidate cached export overlay

    if (type === 'image') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.mediaEl = img;
        this.crop.naturalW = img.naturalWidth;
        this.crop.naturalH = img.naturalHeight;
        this._styleMediaEl(img);
        this.mediaLayer.appendChild(img);
        this._resetCropState();
        this.onStateChange({ type: 'media-loaded', mediaType: 'image' });
      };
      img.onerror = () => this.onStateChange({ type: 'error', message: 'Could not load that image.' });
      img.src = url;
    } else {
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.crossOrigin = 'anonymous';
      video.addEventListener('loadedmetadata', () => {
        this.mediaEl = video;
        this.crop.naturalW = video.videoWidth;
        this.crop.naturalH = video.videoHeight;
        this._styleMediaEl(video);
        this.mediaLayer.appendChild(video);
        this._resetCropState();
        video.play().catch(() => {});
        this.onStateChange({ type: 'media-loaded', mediaType: 'video', duration: video.duration });
      });
      video.addEventListener('error', () => this.onStateChange({ type: 'error', message: 'Could not load that video.' }));
      video.src = url;
    }
  }

  _styleMediaEl(el) {
    el.style.position = 'absolute';
    el.style.left = '0';
    el.style.top = '0';
    el.style.transformOrigin = '0 0';
    el.draggable = false;
  }

  _teardownMedia() {
    if (this.mediaEl && this.mediaEl.parentNode) this.mediaEl.parentNode.removeChild(this.mediaEl);
    if (this._objectUrl) { URL.revokeObjectURL(this._objectUrl); this._objectUrl = null; }
    this.mediaEl = null;
  }

  /* ------------------------------------------------------------ *
   * Logo swap — lets a non-designer replace the brand logo with
   * their own, while its position/size in the layout stay fixed
   * (only the img.src changes; every CSS rule keyed to #logoImg /
   * .nx-lockup still applies). The overlay cache used for video
   * export bakes the logo pixel-for-pixel, so it must be invalidated
   * on every change.
   * ------------------------------------------------------------ */
  changeLogo(file) {
    if (!this.logoImg) return;
    if (!file || !file.type || !file.type.startsWith('image/')) {
      throw new Error('Please choose an image file (PNG, JPG, WebP or SVG).');
    }
    const url = URL.createObjectURL(file);
    if (this._logoObjectUrl) URL.revokeObjectURL(this._logoObjectUrl);
    this._logoObjectUrl = url;
    this.logoImg.src = url;
    this._overlayCacheUrl = null; // invalidate cached export overlay
    this.onStateChange({ type: 'logo-changed' });
  }

  resetLogo() {
    if (!this.logoImg) return;
    if (this._logoObjectUrl) { URL.revokeObjectURL(this._logoObjectUrl); this._logoObjectUrl = null; }
    if (this.defaultLogoSrc) this.logoImg.src = this.defaultLogoSrc;
    this._overlayCacheUrl = null; // invalidate cached export overlay
    this.onStateChange({ type: 'logo-reset' });
  }

  /* ------------------------------------------------------------ *
   * Crop / pan / zoom
   * ------------------------------------------------------------ */
  _resetCropState() {
    const vw = this.mediaRect.w, vh = this.mediaRect.h;
    const nw = this.crop.naturalW, nh = this.crop.naturalH;
    const minScale = Math.max(vw / nw, vh / nh);
    this.crop.minScale = minScale;
    this.crop.scale = minScale;
    this.crop.x = (vw - nw * minScale) / 2;
    this.crop.y = (vh - nh * minScale) / 2;
    this._applyMediaTransform();
    this.onStateChange({ type: 'crop-changed', crop: { ...this.crop } });
  }

  resetMedia() {
    if (!this.mediaEl) return;
    this._resetCropState();
  }

  _applyMediaTransform() {
    if (!this.mediaEl) return;
    const { x, y, scale, naturalW, naturalH } = this.crop;
    this.mediaEl.style.width = naturalW + 'px';
    this.mediaEl.style.height = naturalH + 'px';
    this.mediaEl.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  _clampCrop() {
    const vw = this.mediaRect.w, vh = this.mediaRect.h;
    const { scale, naturalW, naturalH } = this.crop;
    const minX = Math.min(0, vw - naturalW * scale);
    const minY = Math.min(0, vh - naturalH * scale);
    this.crop.x = Math.max(minX, Math.min(0, this.crop.x));
    this.crop.y = Math.max(minY, Math.min(0, this.crop.y));
  }

  _zoomAround(newScale, anchorX, anchorY) {
    const c = this.crop;
    newScale = Math.max(c.minScale, Math.min(c.minScale * 4, newScale));
    const imgX = (anchorX - c.x) / c.scale;
    const imgY = (anchorY - c.y) / c.scale;
    c.x = anchorX - imgX * newScale;
    c.y = anchorY - imgY * newScale;
    c.scale = newScale;
    this._clampCrop();
    this._applyMediaTransform();
    this.onStateChange({ type: 'crop-changed', crop: { ...this.crop } });
  }

  zoomIn() {
    if (!this.mediaEl) return;
    this._zoomAround(this.crop.scale * 1.15, this.mediaRect.w / 2, this.mediaRect.h / 2);
  }
  zoomOut() {
    if (!this.mediaEl) return;
    this._zoomAround(this.crop.scale / 1.15, this.mediaRect.w / 2, this.mediaRect.h / 2);
  }
  /** @param {number} t 0..1 slider position */
  setZoom(t) {
    if (!this.mediaEl) return;
    const target = this.crop.minScale * (1 + 3 * t); // maps 0..1 -> minScale..minScale*4
    this._zoomAround(target, this.mediaRect.w / 2, this.mediaRect.h / 2);
  }
  getZoomT() {
    return (this.crop.scale - this.crop.minScale) / (this.crop.minScale * 3 || 1);
  }

  togglePlay() {
    if (this.mediaType !== 'video' || !this.mediaEl) return;
    if (this.mediaEl.paused) { this.mediaEl.play(); return true; }
    this.mediaEl.pause(); return false;
  }

  /* ------------------------------------------------------------ *
   * Pointer drag-to-reposition
   * ------------------------------------------------------------ */
  _bindPointer() {
    const vp = this.mediaViewport;
    vp.style.touchAction = 'none';
    vp.addEventListener('pointerdown', (e) => {
      if (!this.mediaEl) return;
      vp.setPointerCapture(e.pointerId);
      this._drag = { startX: e.clientX, startY: e.clientY, origX: this.crop.x, origY: this.crop.y };
      vp.classList.add('is-dragging');
    });
    vp.addEventListener('pointermove', (e) => {
      if (!this._drag) return;
      const scale = this._displayScale || 1;
      const dx = (e.clientX - this._drag.startX) / scale;
      const dy = (e.clientY - this._drag.startY) / scale;
      this.crop.x = this._drag.origX + dx;
      this.crop.y = this._drag.origY + dy;
      this._clampCrop();
      this._applyMediaTransform();
    });
    const end = () => { this._drag = null; vp.classList.remove('is-dragging'); };
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
    vp.addEventListener('pointerleave', () => { if (this._drag) end(); });

    // wheel = zoom
    vp.addEventListener('wheel', (e) => {
      if (!this.mediaEl) return;
      e.preventDefault();
      const rect = vp.getBoundingClientRect();
      const scale = this._displayScale || 1;
      const ax = (e.clientX - rect.left) / scale;
      const ay = (e.clientY - rect.top) / scale;
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      this._zoomAround(this.crop.scale * factor, ax, ay);
    }, { passive: false });
  }

  _bindDropZone() {
    const vp = this.mediaViewport;
    ['dragover', 'dragenter'].forEach((evt) => vp.addEventListener(evt, (e) => { e.preventDefault(); vp.classList.add('is-dropping'); }));
    ['dragleave', 'drop'].forEach((evt) => vp.addEventListener(evt, (e) => { e.preventDefault(); vp.classList.remove('is-dropping'); }));
    vp.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) this.loadMediaFromFile(file);
    });
  }

  /* ------------------------------------------------------------ *
   * Export: JPG / PNG (image or video-currently-showing frame)
   * ------------------------------------------------------------ */
  async exportImage(format) {
    if (typeof html2canvas === 'undefined') {
      throw new Error('html2canvas failed to load — check assets/vendor/html2canvas/html2canvas.min.js is present.');
    }
    await this._fontsReady();
    this._blurActive();

    let tempImg = null;
    const isVideo = this.mediaType === 'video';
    if (isVideo) {
      tempImg = this._videoFrameToImg();
      this.mediaEl.style.display = 'none';
      this.mediaLayer.appendChild(tempImg);
    }

    const prevTransform = this.stage.style.transform;
    this.stage.style.transform = 'none';

    let canvas;
    try {
      canvas = await html2canvas(this.stage, {
        width: this.width,
        height: this.height,
        scale: 1,
        useCORS: true,
        backgroundColor: format === 'jpg' ? '#0A0A0F' : null,
        ignoreElements: (el) => el.classList && el.classList.contains('nx-export-ignore'),
      });
    } finally {
      this.stage.style.transform = prevTransform;
      if (tempImg) {
        tempImg.remove();
        this.mediaEl.style.display = '';
      }
    }

    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpg' ? 0.92 : undefined;
    const blob = await new Promise((res) => canvas.toBlob(res, mime, quality));
    this._downloadBlob(blob, `${this.fileBase}.${format === 'jpg' ? 'jpg' : 'png'}`);
    return blob;
  }

  _videoFrameToImg() {
    const c = document.createElement('canvas');
    c.width = this.crop.naturalW;
    c.height = this.crop.naturalH;
    c.getContext('2d').drawImage(this.mediaEl, 0, 0);
    const img = new Image();
    img.src = c.toDataURL('image/png');
    this._styleMediaEl(img);
    img.style.width = this.crop.naturalW + 'px';
    img.style.height = this.crop.naturalH + 'px';
    img.style.transform = this.mediaEl.style.transform;
    return img;
  }

  _fontsReady() {
    return (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  }

  _downloadBlob(blob, name) {
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  /* ------------------------------------------------------------ *
   * Export: MP4 (video templates only)
   * Strategy — render the static brand chrome (logo, overlays, text,
   * decorative shapes) ONCE to a transparent-hole PNG via html2canvas
   * (video hidden so its rectangle stays transparent), then in a fast
   * real-time loop draw the current video frame + that cached overlay
   * onto a canvas, capture the canvas as a MediaStream, and record it
   * with MediaRecorder. The WebM result is then transcoded to MP4 with
   * ffmpeg.wasm, loaded on demand — entirely in the browser.
   * ------------------------------------------------------------ */
  _blurActive() {
    const active = document.activeElement;
    if (active && this.editableEls.some((c) => c.el === active)) active.blur();
  }

  async _buildOverlayCache() {
    await this._fontsReady();
    this._blurActive();
    const prevDisplay = this.mediaEl.style.display;
    this.mediaEl.style.display = 'none';
    const prevTransform = this.stage.style.transform;
    this.stage.style.transform = 'none';
    // The stage itself carries an opaque brand-colour background (so the
    // live preview never shows a gap before media loads). That would
    // otherwise paint over the "hole" left by the hidden video, so it is
    // suspended for this one capture and restored immediately after.
    const prevBg = this.stage.style.backgroundColor;
    this.stage.style.backgroundColor = 'transparent';
    let canvas;
    try {
      canvas = await html2canvas(this.stage, {
        width: this.width, height: this.height, scale: 1,
        useCORS: true, backgroundColor: null,
        ignoreElements: (el) => el.classList && el.classList.contains('nx-export-ignore'),
      });
    } finally {
      this.mediaEl.style.display = prevDisplay;
      this.stage.style.transform = prevTransform;
      this.stage.style.backgroundColor = prevBg;
    }
    const overlayImg = new Image();
    overlayImg.src = canvas.toDataURL('image/png');
    await new Promise((res) => { overlayImg.onload = res; });
    this._overlayImg = overlayImg;
  }

  _videoSourceRect() {
    const { x, y, scale } = this.crop;
    const vw = this.mediaRect.w, vh = this.mediaRect.h;
    return {
      sx: -x / scale, sy: -y / scale,
      sw: vw / scale, sh: vh / scale,
    };
  }

  async exportVideo(opts) {
    opts = opts || {};
    const onProgress = opts.onProgress || function () {};
    if (this.mediaType !== 'video' || !this.mediaEl) {
      throw new Error('Upload a video before exporting MP4.');
    }
    await this._buildOverlayCache();

    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');

    const video = this.mediaEl;
    const wasLooping = video.loop;
    const wasPaused = video.paused;
    video.loop = false; // record exactly one pass through, then stop on 'ended'
    video.currentTime = 0;
    await video.play().catch(() => {});

    const fps = 30;
    const stream = canvas.captureStream(fps);
    const mimeCandidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    const mimeType = mimeCandidates.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

    const rect = this.mediaRect;
    const duration = Math.min(video.duration || 6, 30); // safety cap
    let rafId;
    const draw = () => {
      const { sx, sy, sw, sh } = this._videoSourceRect();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, sx, sy, sw, sh, rect.x, rect.y, rect.w, rect.h);
      if (this._overlayImg) ctx.drawImage(this._overlayImg, 0, 0, this.width, this.height);
      onProgress(Math.min(1, video.currentTime / duration));
      rafId = requestAnimationFrame(draw);
    };

    const recordingDone = new Promise((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    });

    recorder.start();
    draw();
    // Play exactly one pass and stop on the browser's own 'ended' event —
    // more reliable than polling currentTime against a narrow time window,
    // which can alias badly when duration is a near-multiple of the poll
    // interval (a looping video may never be caught inside that window).
    await new Promise((resolve) => {
      let settled = false;
      const finish = () => { if (!settled) { settled = true; resolve(); } };
      video.addEventListener('ended', finish, { once: true });
      setTimeout(finish, duration * 1000 + 2000); // safety net
    });
    cancelAnimationFrame(rafId);
    recorder.stop();
    video.loop = wasLooping;
    if (wasPaused) video.pause(); else { video.currentTime = 0; video.play().catch(() => {}); }

    const webmBlob = await recordingDone;
    if (!webmBlob || webmBlob.size < 4000) {
      // A capture this small means MediaRecorder did not actually receive
      // real frames (e.g. the tab lost focus/was throttled mid-export).
      // Fail loudly instead of silently handing back a broken file.
      throw new Error('The video capture came back empty — keep this tab focused and in the foreground while exporting, then try again.');
    }

    let mp4Blob = null;
    try {
      mp4Blob = await this._transcodeToMp4(webmBlob, onProgress);
    } catch (err) {
      console.warn('MP4 transcode unavailable, falling back to WebM:', err);
    }

    if (mp4Blob && mp4Blob.size > 1000) {
      this._downloadBlob(mp4Blob, `${this.fileBase}.mp4`);
      return { blob: mp4Blob, format: 'mp4' };
    }
    this._downloadBlob(webmBlob, `${this.fileBase}.webm`);
    return { blob: webmBlob, format: 'webm', fallback: true };
  }

  async _transcodeToMp4(webmBlob, onProgress) {
    if (typeof FFmpeg === 'undefined') throw new Error('ffmpeg.wasm not loaded');
    const { createFFmpeg, fetchFile } = FFmpeg;
    if (!this._ffmpeg) {
      // Must be an absolute URL — ffmpeg.wasm resolves this inside a worker
      // context where a relative path does not reliably resolve against
      // the page's own location.
      const corePath = new URL('../assets/vendor/ffmpeg/ffmpeg-core.js', document.baseURI).toString();
      this._ffmpeg = createFFmpeg({ log: false, corePath });
    }
    const ff = this._ffmpeg;
    if (!ff.isLoaded()) await ff.load();
    ff.FS('writeFile', 'in.webm', await fetchFile(webmBlob));
    ff.setProgress(({ ratio }) => { if (ratio >= 0 && ratio <= 1) onProgress(ratio); });
    // ultrafast: wasm encoding has no hardware acceleration, so a fast
    // preset keeps this from taking minutes on longer or larger videos.
    // scale=trunc(iw/2)*2:trunc(ih/2)*2 rounds down to even width/height —
    // yuv420p chroma subsampling requires both, and a template like
    // LinkedIn's 1200x627 stage has an odd height. Without this, libx264
    // fails internally and ffmpeg.wasm silently hands back an empty file
    // rather than rejecting the run() call.
    await ff.run(
      '-i', 'in.webm',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', 'out.mp4'
    );
    const data = ff.FS('readFile', 'out.mp4');
    return new Blob([data.buffer], { type: 'video/mp4' });
  }
}
