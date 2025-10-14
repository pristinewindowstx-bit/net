// Lightweight dependency-free lightbox for the gallery
// - Clicking a gallery link (anchor with [data-large]) opens a full-screen overlay
// - Escape or click outside closes it

(function(){
  function createOverlay(src, alt) {
    const overlay = document.createElement('div');
    overlay.className = 'gw-overlay';
    overlay.innerHTML = `
      <div class="gw-inner">
        <img src="${src}" alt="${alt || ''}" class="gw-img" />
        <button class="gw-close" aria-label="Close">×</button>
      </div>
    `;
    return overlay;
  }

  function open(e){
    e.preventDefault();
    const a = e.currentTarget;
    const src = a.getAttribute('href');
    const img = a.querySelector('img');
    const alt = img ? img.getAttribute('alt') : '';
    const overlay = createOverlay(src, alt);
    document.body.appendChild(overlay);
    // allow CSS animation frame
    requestAnimationFrame(()=> overlay.classList.add('open'));

    function closeHandler(ev){
      if(ev.target === overlay || ev.target.classList.contains('gw-close')){
        overlay.classList.remove('open');
        overlay.addEventListener('transitionend', ()=> overlay.remove(), {once:true});
        document.removeEventListener('keydown', keyHandler);
      }
    }
    function keyHandler(ev){ if(ev.key === 'Escape') closeHandler({target: overlay}); }

    overlay.addEventListener('click', closeHandler);
    document.addEventListener('keydown', keyHandler);
  }

  document.addEventListener('DOMContentLoaded', function(){
    const links = document.querySelectorAll('a[data-large]');
    links.forEach(l => l.addEventListener('click', open));
  });
})();
