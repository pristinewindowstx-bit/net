// Lightweight dependency-free lightbox for the gallery
// - Clicking a gallery link (anchor with [data-large]) opens a full-screen overlay
// - Escape or click outside closes it

(function(){
  // Build an array of gallery items for navigation
  function collectItems(){
    const anchors = Array.from(document.querySelectorAll('a[data-large]'));
    return anchors.map(a => ({
      href: a.getAttribute('href'),
      alt: (a.querySelector('img') && a.querySelector('img').getAttribute('alt')) || '',
      node: a
    }));
  }

  function createOverlay(src, alt, index, total){
    const overlay = document.createElement('div');
    overlay.className = 'gw-overlay';
    overlay.innerHTML = `
      <div class="gw-inner">
        <button class="gw-prev" aria-label="Previous">‹</button>
        <img src="${src}" alt="${alt || ''}" class="gw-img" />
        <button class="gw-next" aria-label="Next">›</button>
        <div class="gw-caption">${alt || ''}</div>
        <button class="gw-close" aria-label="Close">×</button>
      </div>
    `;
    overlay.dataset.index = index;
    overlay.dataset.total = total;
    return overlay;
  }

  function open(e){
    e.preventDefault();
    const anchors = collectItems();
    const a = e.currentTarget;
    const src = a.getAttribute('href');
    const img = a.querySelector('img');
    const alt = img ? img.getAttribute('alt') : '';
    const index = anchors.findIndex(it => it.href === src);
  const overlay = createOverlay(src, alt, index, anchors.length);
  document.body.appendChild(overlay);
  // lock body scroll and mark open
  document.body.classList.add('gw-open');
  requestAnimationFrame(()=> overlay.classList.add('open'));

    function navigateTo(i){
      if(i < 0) i = anchors.length - 1;
      if(i >= anchors.length) i = 0;
      const next = anchors[i];
      const imgEl = overlay.querySelector('.gw-img');
      const cap = overlay.querySelector('.gw-caption');
      overlay.dataset.index = i;
      imgEl.setAttribute('src', next.href);
      imgEl.setAttribute('alt', next.alt || '');
      cap.textContent = next.alt || '';
    }

    function closeHandler(ev){
      if(ev.target === overlay || ev.target.classList.contains('gw-close')){
        overlay.classList.remove('open');
        overlay.addEventListener('transitionend', ()=> { overlay.remove(); document.body.classList.remove('gw-open'); }, {once:true});
        document.removeEventListener('keydown', keyHandler);
      }
    }

    function keyHandler(ev){
      if(ev.key === 'Escape') return closeHandler({target: overlay});
      if(ev.key === 'ArrowLeft') return navigateTo(Number(overlay.dataset.index) - 1);
      if(ev.key === 'ArrowRight') return navigateTo(Number(overlay.dataset.index) + 1);
    }

    overlay.addEventListener('click', function(ev){
      // close when clicking outside inner (but ignore clicks on controls)
      // don't close if click happened inside gw-inner
      const inner = overlay.querySelector('.gw-inner');
      if(inner && inner.contains(ev.target)) return;
      if(ev.target === overlay) closeHandler({target: overlay});
    });

    // prev/next button handlers (use event delegation)
    overlay.addEventListener('click', function(ev){
      if(ev.target.classList.contains('gw-prev')){
        navigateTo(Number(overlay.dataset.index) - 1);
      } else if(ev.target.classList.contains('gw-next')){
        navigateTo(Number(overlay.dataset.index) + 1);
      }
    });

    document.addEventListener('keydown', keyHandler);
    // preload neighbors for snappy navigation
    function preloadNeighbor(i){
      if(!anchors[i]) return;
      const p = new Image(); p.src = anchors[i].href;
    }
    preloadNeighbor(index-1);
    preloadNeighbor(index+1);
  }

  document.addEventListener('DOMContentLoaded', function(){
    const links = document.querySelectorAll('a[data-large]');
    links.forEach(l => {
      l.addEventListener('click', open);
      l.dataset.gwBound = '1';
    });

    // safety: prevent default navigation for any a[data-large] if JS didn't bind
    document.addEventListener('click', function(e){
      const a = e.target.closest && e.target.closest('a[data-large]');
      if(a && a.dataset.gwBound !== '1'){
        e.preventDefault();
      }
    });
  });
})();
