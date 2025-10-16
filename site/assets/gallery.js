// Lightweight resilient carousel initializer
(function(){
  'use strict';
  function qs(sel, ctx){ return (ctx||document).querySelector(sel); }
  function qsa(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

  function readJSON(container){
    if(!container) return [];
    if(container.id){
      const s = document.querySelector('script[id*="' + container.id + '"]');
      if(s && s.type === 'application/json'){
        try{ return JSON.parse(s.textContent); }catch(e){ console.error('JSON parse', e); return []; }
      }
    }
    let s = container.nextElementSibling;
    while(s){ if(s.tagName && s.tagName.toLowerCase() === 'script' && s.type === 'application/json'){
        try{ return JSON.parse(s.textContent); }catch(e){ console.error('JSON parse', e); return []; }
      } s = s.nextElementSibling; }
    return [];
  }

  function initCarousel(container){
    if(!container) return;
    const img = qs('img', container);
    const prev = qs('.carousel-prev', container);
    const next = qs('.carousel-next', container);
    const caption = qs('.carousel-caption', container);
    if(!img || !prev || !next) return;
    const data = readJSON(container);
    if(!data || !data.length) return;
    let idx = 0;

    function set(i){
      const item = data[i]; if(!item) return;
      const frame = container.querySelector('.carousel-frame');
      // lock current height to avoid collapse during swap
      if(frame){
        frame.style.transition = 'height 360ms cubic-bezier(.22,.9,.28,1)';
        // include caption height when locking
        const capEl = container.querySelector('.carousel-caption');
        const capH = capEl ? (capEl.offsetHeight + 12) : 0;
        frame.style.height = ((frame.clientHeight || frame.offsetHeight || 400) + capH) + 'px';
      }
      const w = Math.min(window.innerWidth || 1200, 1200);
      const src = (w <= 480 && item.src480) ? item.src480 : (item.src800 ? item.src800 : item.src);
      // fade out current image, then swap src
      img.style.transition = img.style.transition || 'opacity 260ms ease';
      img.style.opacity = '0';
      // small timeout to allow opacity to begin transitioning before src swap
      setTimeout(function(){ img.src = src; }, 60);
      const parts = [];
      if(item.src480) parts.push(item.src480 + ' 480w');
      if(item.src800) parts.push(item.src800 + ' 800w');
      if(item.src) parts.push(item.src + ' 1200w');
      if(parts.length) img.srcset = parts.join(', ');
      img.alt = item.alt || '';
      if(caption) caption.textContent = item.alt || '';
      idx = i;
      // preload neighbors
      if(data[idx-1]) new Image().src = data[idx-1].src800 || data[idx-1].src;
      if(data[idx+1]) new Image().src = data[idx+1].src800 || data[idx+1].src;
      // Smooth height adjustment: wait for image naturalHeight if not loaded
      if(frame){
        function adjust(){
          try{
            const natural = img.naturalHeight || img.height || 400;
            const naturalW = img.naturalWidth || img.width || 600;
            const ratio = natural / naturalW || 1.0;
            const currentWidth = frame.clientWidth || (window.innerWidth * 0.6);
            let desired = Math.min(760, Math.round(currentWidth * ratio));
            // add caption height so caption isn't clipped
            const capEl2 = container.querySelector('.carousel-caption');
            const capH2 = capEl2 ? (capEl2.offsetHeight + 12) : 0;
            desired = desired + capH2;
            // apply new height and fade image in
            frame.style.height = desired + 'px';
            img.style.opacity = '1';
          }catch(e){/* ignore measurement errors */}
        }
        if(img.complete){ adjust(); } else { img.addEventListener('load', adjust, {once:true}); }
      } else {
        // ensure fade-in if no frame
        if(img.complete) img.style.opacity = '1'; else img.addEventListener('load', function(){ img.style.opacity = '1'; }, {once:true});
      }
    }

  prev.addEventListener('click', function(e){ set((idx - 1 + data.length) % data.length); });
  next.addEventListener('click', function(e){ set((idx + 1) % data.length); });

    // initial render
    set(0);
    // simple resize throttle to re-evaluate src selection
    let rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ set(idx); }, 120); });
  }

  function initAll(){ qsa('.carousel').forEach(c=>{ try{ initCarousel(c); }catch(e){ console.error('initCarousel', e); } }); }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll); else initAll();
  setTimeout(initAll, 220);

})();
