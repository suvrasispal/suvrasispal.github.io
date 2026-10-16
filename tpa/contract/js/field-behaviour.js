(function(){
  function paint(el){
    var inline = getComputedStyle(el).display === 'inline-block';
    if (inline && !el.dataset.fieldWidth) {
      el.dataset.fieldWidth = el.style.minWidth || '0px';
      el.dataset.fieldPad = el.style.padding || '0';
    }
    var filled = el.textContent.replace(/\u200b/g,'').trim().length > 0;
    var keepRule = el.hasAttribute('data-field-keep-rule');
    el.style.background = filled ? 'transparent' : (el.dataset.fieldTone || '#F1F1F0');
    el.style.borderBottomColor = (filled && !keepRule) ? 'transparent' : (el.dataset.fieldRule || '#C6C4BF');
    el.style.fontWeight = filled ? '600' : '';
    if (inline) {
      el.style.minWidth = filled ? '0px' : el.dataset.fieldWidth;
      el.style.padding = filled ? '0' : el.dataset.fieldPad;
    }
  }
  function paintInput(el){
    var filled = (el.value || '').trim().length > 0;
    el.style.background = filled ? 'transparent' : (el.dataset.fieldTone || '#F1F1F0');
    el.style.borderBottomColor = filled ? '#12332A' : (el.dataset.fieldRule || '#C6C4BF');
    el.style.fontWeight = filled ? '600' : '';
  }
  function all(){
    document.querySelectorAll('[data-field]').forEach(paint);
    document.querySelectorAll('[data-field-input]').forEach(paintInput);
  }
  function maskDate(el){
    var d=(el.value||'').replace(/\D/g,'').slice(0,8), v=d;
    if(d.length>4) v=d.slice(0,2)+'/'+d.slice(2,4)+'/'+d.slice(4);
    else if(d.length>2) v=d.slice(0,2)+'/'+d.slice(2);
    if(v!==el.value) el.value=v;
  }
  document.addEventListener('input', function(e){
    var t = e.target; if (!t || !t.closest) return;
    if (t.hasAttribute && t.hasAttribute('data-date-mask')) maskDate(t);
    var el = t.closest('[data-field]'); if (el) paint(el);
    if (t.hasAttribute && t.hasAttribute('data-field-input')) paintInput(t);
  }, true);
  document.addEventListener('change', function(e){
    var t = e.target;
    if (t && t.hasAttribute && t.hasAttribute('data-field-input')) paintInput(t);
  }, true);
  document.addEventListener('blur', function(e){
    var el = e.target && e.target.closest && e.target.closest('[data-field]');
    if (el) paint(el);
  }, true);
  new MutationObserver(all).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded', all);
  setTimeout(all, 300);
})();
