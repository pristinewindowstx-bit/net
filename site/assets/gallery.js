// Minimal carousel for single-image display with prev/next and keyboard support.
(function(){
  // Startup probe: helps determine whether the script executes in the browser
  try {
    console.log('[gallery.js] script loaded');
  } catch (e) {
    // ignore in non-browser environments
  }
  function qs(sel, ctx){ return (ctx||document).querySelector(sel); }
  function qsa(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

  function parseDataFor(container){
    // prefer a script with id containing the container id, e.g. 'gallery-data' or 'team-gallery-data'
    const idMatch = container.id ? document.querySelector('script[id*="' + container.id + '"]') : null;
    if(idMatch) {
      try{ return JSON.parse(idMatch.textContent); }catch(e){ return []; }
    }
    // fallback: next script sibling after the container
    let s = container.nextElementSibling;
    while(s){ if(s.tagName && s.tagName.toLowerCase() === 'script' && s.type === 'application/json'){
        try{ return JSON.parse(s.textContent); }catch(e){ return []; }
      } s = s.nextElementSibling; }
    return [];
  }

  function Carousel(container){
    // accept either id string or element
    this.container = (typeof container === 'string') ? qs('#'+container) : container;
    if(!this.container) return;
    this.prevBtn = qs('.carousel-prev', this.container);
    this.nextBtn = qs('.carousel-next', this.container);
    // find image and caption inside this container
    this.imgEl = qs('img', this.container);
    this.captionEl = qs('.carousel-caption', this.container);
    this.data = parseDataFor(this.container);
    this.index = 0;
    // autoplay config per container via data attributes
    this.autoplay = (this.container.dataset.autoplay === 'true');
    this.autoplayInterval = parseInt(this.container.dataset.interval || this.container.dataset.autoplayInterval || 4000, 10);
    this.autoplayDirection = (this.container.dataset.direction === 'prev') ? 'prev' : 'next';
    this.pauseOnHover = this.container.dataset.pauseOnHover !== 'false';
    this.init();
  }

  Carousel.prototype.init = function(){
    if(!this.data.length) return;
    const self = this;
    // render first image responsively
    this.setImage(this.index);
    // compute a stable min-height for this carousel so arrows don't shift
    // when images change orientation. Preload natural sizes and then set
    // a min-height equal to the tallest scaled image for the current
    // carousel width (respecting max-height from CSS).
    this._computeStableHeight();
    this.prevBtn.addEventListener('click', function(){ self.prev(); });
    this.nextBtn.addEventListener('click', function(){ self.next(); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft') self.prev();
      if(e.key === 'ArrowRight') self.next();
    });

    // optional: swipe support for touch
    let startX = null;
    this.imgEl.addEventListener('touchstart', function(e){ startX = e.touches[0].clientX; }, {passive:true});
    this.imgEl.addEventListener('touchend', function(e){
      if(startX === null) return;
      const endX = e.changedTouches[0].clientX;
      const dx = endX - startX;
      if(Math.abs(dx) > 40){ if(dx > 0) self.prev(); else self.next(); }
      startX = null;
    });

    // autoplay: start if enabled
    if(this.autoplay){ this.startAutoplay(); }
    // pause on hover/focus
    if(this.pauseOnHover){
      this.container.addEventListener('mouseenter', function(){ self.stopAutoplay(); });
      this.container.addEventListener('mouseleave', function(){ self.startAutoplay(); });
      this.container.addEventListener('focusin', function(){ self.stopAutoplay(); });
      this.container.addEventListener('focusout', function(){ self.startAutoplay(); });
    }
  };

  // debounce helper
  function debounce(fn, wait){ let t; return function(){ clearTimeout(t); t = setTimeout(()=>fn.apply(this, arguments), wait); }; }

  Carousel.prototype._computeStableHeight = function(){
    const self = this;
    // collect src candidates for measurement (prefer src800 then src)
    const srcs = this.data.map(it => it.src800 || it.src).filter(Boolean);
    if(!srcs.length) return;
    let loaded = 0;
    const sizes = [];
    const maxCssHeight = 760; // matches CSS max-height for images
    srcs.forEach((s, idx) => {
      const img = new Image();
      img.onload = function(){
        // natural sizes
        const nw = img.naturalWidth || img.width;
        const nh = img.naturalHeight || img.height;
        sizes[idx] = {w: nw, h: nh};
        loaded++;
        if(loaded === srcs.length) {
          // all loaded, compute scaled heights based on current container width
          self._applyStableHeight(sizes, maxCssHeight);
          // recompute on resize (debounced)
          const onResize = debounce(function(){ self._applyStableHeight(sizes, maxCssHeight); }, 120);
          window.addEventListener('resize', onResize);
        }
      };
      img.onerror = function(){ loaded++; sizes[idx] = null; if(loaded === srcs.length){ self._applyStableHeight(sizes, maxCssHeight); } };
      img.src = s;
    });
  };

  Carousel.prototype._applyStableHeight = function(sizes, maxCssHeight){
    // compute available width for image inside the carousel frame
    const frame = this.imgEl; // the img element scales to container width
    const containerWidth = Math.max(200, frame.clientWidth || this.container.clientWidth || 600);
    let maxScaled = 0;
    sizes.forEach(sz => {
      if(!sz) return;
      const scaled = Math.min(maxCssHeight, Math.round(containerWidth * (sz.h / sz.w)));
      if(scaled > maxScaled) maxScaled = scaled;
    });
    if(maxScaled > 0){
      // set min-height on the carousel container so arrows stay vertically centered
      this.container.style.minHeight = (maxScaled + 48) + 'px'; // add small padding for caption/buttons
    }
  };

  Carousel.prototype.setImage = function(i){
    if(!this.data[i]) return;
    const item = this.data[i];
    // choose best src available (prefer src800 then src)
    const width = Math.min(window.innerWidth, 1200);
    const src = (width <= 480 && item.src480) ? item.src480 : (item.src800 ? item.src800 : item.src);
    // update both src and srcset so the browser picks the right file
    this.imgEl.setAttribute('src', src);
    // build a matching srcset if smaller variants exist
    const parts = [];
    if(item.src480) parts.push(item.src480 + ' 480w');
    if(item.src800) parts.push(item.src800 + ' 800w');
    if(item.src) parts.push(item.src + ' 1200w');
    if(parts.length) this.imgEl.setAttribute('srcset', parts.join(', '));
    this.imgEl.setAttribute('alt', item.alt || '');
    this.captionEl.textContent = item.alt || '';
    this.index = i;
    // preload neighbors
    this.preload(i-1); this.preload(i+1);
    // reset autoplay timer after manual navigation to give users time
    if(this.autoplay){ this.stopAutoplay(); this.startAutoplay(); }
  };

  Carousel.prototype.prev = function(){
    const next = (this.index - 1 + this.data.length) % this.data.length; this.setImage(next);
  };
  Carousel.prototype.next = function(){
    const next = (this.index + 1) % this.data.length; this.setImage(next);
  };

  Carousel.prototype.preload = function(i){ if(!this.data[i]) return; const p = new Image(); p.src = this.data[i].src800 || this.data[i].src; };

  Carousel.prototype.startAutoplay = function(){
    const self = this;
    if(!this.autoplay) return;
    this._autoplayId = setInterval(function(){
      if(self.autoplayDirection === 'prev') self.prev(); else self.next();
    }, Math.max(800, this.autoplayInterval));
  };

  Carousel.prototype.stopAutoplay = function(){ if(this._autoplayId){ clearInterval(this._autoplayId); this._autoplayId = null; } };

  document.addEventListener('DOMContentLoaded', function(){
    try {
      console.log('[gallery.js] DOMContentLoaded — initializing carousels');
      const containers = qsa('.carousel');
      containers.forEach(c => { try { new Carousel(c); } catch (err) { console.error('[gallery.js] carousel init error', err); } });
      console.log('[gallery.js] initialization complete —', containers.length, 'carousels');
    } catch (err) {
      console.error('[gallery.js] initialization failed', err);
    }
  });
})();
