/* Nexyra icon set — Lucide-style, 24px grid, 1.5px stroke, currentColor.
   A small local subset of the 37-icon brand set, enough to cover the
   template editors (upload, media, zoom, positioning, export, feedback). */
const NX_ICONS = {
  upload: '<path d="M12 16V4M12 4l-5 5M12 4l5 5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="0"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5.5-5.5a1 1 0 0 0-1.4 0L4 20"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="0"/><path d="M16 10l6-3v10l-6-3"/>',
  zoomIn: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M21 21l-4.3-4.3"/><path d="M10.5 7.5v6M7.5 10.5h6"/>',
  zoomOut: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M21 21l-4.3-4.3"/><path d="M7.5 10.5h6"/>',
  move: '<path d="M12 2v20M2 12h20"/><path d="M5 9l-3 3 3 3M19 9l3 3-3 3M9 5l3-3 3 3M9 19l3 3 3-3"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  download: '<path d="M12 4v12M12 16l-5-5M12 16l5-5"/><path d="M4 19h16"/>',
  play: '<path d="M6 4l14 8-14 8V4z"/>',
  pause: '<rect x="5" y="4" width="5" height="16"/><rect x="14" y="4" width="5" height="16"/>',
  check: '<path d="M4 12l6 6L20 6"/>',
  x: '<path d="M5 5l14 14M19 5L5 19"/>',
  arrowRight: '<path d="M4 12h16M14 6l6 6-6 6"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17.5l9 5 9-5"/>',
  expand: '<path d="M9 3H3v6M15 3h6v6M21 15v6h-6M3 15v6h6"/>',
  type: '<path d="M4 5h16M12 5v14M9 19h6"/>',
  crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>',
  film: '<rect x="3" y="4" width="18" height="16"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
};

function nxIcon(name, cls){
  const body = NX_ICONS[name] || '';
  return `<svg class="${cls || 'nx-icon'}" viewBox="0 0 24 24">${body}</svg>`;
}
