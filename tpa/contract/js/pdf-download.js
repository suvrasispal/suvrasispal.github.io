(function(){
  var FILE='The-Pint-Bar-Statement-of-Main-Terms-of-Employment.pdf';
  // Contract pages: content ink always starts exactly TOP_MARGIN pt from the sheet top;
  // GAP_BOTTOM pt of clear space is kept above the footer.
  // TOP_MARGIN_PX matches the 62px left/right page margin (CSS px, scaled to pt below).
  // GAP_TOP/GAP_BOTTOM: clear space (pt) between header→content and content→footer.
  var TOP_MARGIN_PX=62, GAP_TOP=28, GAP_BOTTOM=28;
  function btn(){
    if(document.getElementById('pb-pdf-btn')) return;
    var b=document.createElement('button');
    b.id='pb-pdf-btn';
    b.type='button';
    b.textContent='Download PDF';
    b.setAttribute('style','position:fixed;top:20px;right:20px;z-index:99999;display:inline-flex;align-items:center;gap:8px;padding:12px 20px;background:#12332A;color:#F3ECDD;border:none;border-bottom:3px solid #C8811E;font-family:\'Barlow Condensed\',sans-serif;font-weight:600;font-size:15px;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;box-shadow:0 6px 18px rgba(18,51,42,0.28)');
    b.addEventListener('mouseenter',function(){b.style.background='#1B4A3C';});
    b.addEventListener('mouseleave',function(){b.style.background='#12332A';});
    b.addEventListener('click',function(){ go(b); });
    document.body.appendChild(b);
  }
  function blankRow(ctx,y,w){
    try{
      var d=ctx.getImageData(0,y,w,1).data;
      for(var x=0;x<w;x+=8){var i=x*4;if(d[i]<244||d[i+1]<244||d[i+2]<244) return false;}
      return true;
    }catch(e){return false;}
  }
  function libs(){
    if(typeof window.html2canvas!=='function') throw new Error('The PDF engine (html2canvas) did not load. Check your internet connection and try again.');
    if(!window.jspdf||!window.jspdf.jsPDF) throw new Error('The PDF engine (jsPDF) did not load. Check your internet connection and try again.');
  }
  // Inline every <img> as a data URI so the capture never depends on cross-origin
  // or file:// image access (which silently taints the canvas).
  async function inlineImages(root){
    var imgs=Array.prototype.slice.call(root.querySelectorAll('img'));
    var restore=[];
    for(var i=0;i<imgs.length;i++){
      var im=imgs[i];
      if(!im.src || im.src.indexOf('data:')===0) continue;
      try{
        var txt=null;
        if(/\.svg(\?|$)/i.test(im.src)){
          var r=await fetch(im.src,{cache:'force-cache'});
          txt=await r.text();
          restore.push([im,im.src]);
          im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(txt);
        }else{
          var r2=await fetch(im.src,{cache:'force-cache'});
          var bl=await r2.blob();
          var du=await new Promise(function(res,rej){var fr=new FileReader();fr.onload=function(){res(fr.result);};fr.onerror=rej;fr.readAsDataURL(bl);});
          restore.push([im,im.src]);
          im.src=du;
        }
        await new Promise(function(res){ if(im.complete) return res(); im.onload=im.onerror=res; });
      }catch(e){ /* leave original src; html2canvas will try useCORS */ }
    }
    return function(){ restore.forEach(function(p){ p[0].src=p[1]; }); };
  }
  function deliver(pdf,name){
    var blob=pdf.output('blob');
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url; a.download=name; a.rel='noopener'; a.style.display='none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); },4000);
  }
  async function go(b){
    if(b.disabled) return;
    var label=b.textContent, restore=null;
    b.disabled=true; b.style.opacity='0.7'; b.textContent='Preparing PDF…';
    try{
      libs();
      var dps=Array.prototype.slice.call(document.querySelectorAll('doc-page'));
      if(!dps.length) throw new Error('Document not ready yet — please wait a moment and try again.');
      restore=await inlineImages(document.body);
      var scale=2;
      var jsPDF=window.jspdf.jsPDF;
      function url(cv){ try{ return cv.toDataURL('image/png'); }catch(err){ throw new Error('The browser blocked reading the rendered page (image security). Serve the page over http(s) rather than opening the file directly.'); } }
      var pdf=new jsPDF({unit:'pt',format:'a4',compress:true});
      var pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
      var tmp=document.createElement('canvas'), tctx=tmp.getContext('2d');
      var first=true;
      for(var di=0;di<dps.length;di++){
        var dp=dps[di];
        var blocks=Array.prototype.slice.call(dp.children).filter(function(el){return !el.hasAttribute('slot');});
        if(!blocks.length) continue;
        var header=dp.querySelector('[slot="header"]');
        var footer=dp.querySelector('[slot="footer"]');
        var opt={scale:scale,backgroundColor:'#FFFFFF',useCORS:true,allowTaint:false,imageTimeout:15000,logging:false,windowWidth:blocks[0].scrollWidth};
        var canv=await Promise.all(
          [header?html2canvas(header,opt):null, footer?html2canvas(footer,opt):null]
            .concat(blocks.map(function(el){return html2canvas(el,opt);}))
        );
        var hC=canv[0], fC=canv[1], blockCanvases=canv.slice(2);
        var cssW=blocks[0].getBoundingClientRect().width, ps=pw/cssW;
        var hH=hC?(hC.height/scale)*ps:0, fH=fC?(fC.height/scale)*ps:0, TOP_MARGIN=hC?hH+GAP_TOP:TOP_MARGIN_PX*ps;
        var gB=fC?GAP_BOTTOM:0;
        var availPx=Math.floor(((ph-hH-fH)/ps)*scale);
        var flowPx=Math.floor(((ph-TOP_MARGIN-fH-gB)/ps)*scale);
        var hImg=hC?url(hC):null, fImg=fC?url(fC):null;
        for(var bi=0;bi<blockCanvases.length;bi++){
          var cC=blockCanvases[bi];
          if(!cC||!cC.height) continue;
          var standalone=blocks[bi].hasAttribute('data-pdf-page');
          var cctx=standalone?null:cC.getContext('2d',{willReadFrequently:true});
          var y=0, room=standalone?availPx:flowPx, top=standalone?hH:TOP_MARGIN;
          while(y<cC.height){
            if(!standalone){ while(y<cC.height && blankRow(cctx,y,cC.width)) y++; if(y>=cC.height) break; }
            var cut=Math.min(room,cC.height-y);
            if(!standalone && y+cut<cC.height){
              var limit=Math.max(40,Math.floor(cut*0.72));
              for(var t=cut;t>limit;t--){ if(blankRow(cctx,y+t-1,cC.width)){ cut=t; break; } }
            }
            tmp.width=cC.width; tmp.height=cut;
            tctx.fillStyle='#FFFFFF'; tctx.fillRect(0,0,tmp.width,tmp.height);
            tctx.drawImage(cC,0,y,cC.width,cut,0,0,cC.width,cut);
            if(!first) pdf.addPage();
            first=false;
            if(hImg) pdf.addImage(hImg,'PNG',0,0,pw,hH,undefined,'FAST');
            pdf.addImage(url(tmp),'PNG',0,top,pw,(cut/scale)*ps,undefined,'FAST');
            if(fImg) pdf.addImage(fImg,'PNG',0,ph-fH,pw,fH,undefined,'FAST');
            y+=cut;
            if(standalone) break;
          }
        }
      }
      deliver(pdf,FILE);
    }catch(e){
      console.error('PDF generation failed',e);
      alert('PDF could not be generated.\n\n'+(e&&e.message?e.message:e)+'\n\nYou can also use your browser\u2019s Print command and choose “Save as PDF”.');
    }finally{
      if(restore) try{ restore(); }catch(e2){}
    }
    b.disabled=false; b.style.opacity='1'; b.textContent=label;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',btn); else btn();
  setTimeout(btn,500);
})();
