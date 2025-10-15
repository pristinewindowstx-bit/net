// hero.js — enhanced for slow connection optimization
(function(){
  function setTopbar(){
    var topbar = document.querySelector('.topbar');
    if(!topbar) return;
    var rect = topbar.getBoundingClientRect();
    document.documentElement.style.setProperty('--topbar-height', Math.round(rect.height) + 'px');
  }
  window.addEventListener('resize', setTopbar);
  window.addEventListener('load', setTopbar);
  setTopbar();
})();

// Enhanced video management with connection-aware loading
(function(){
  var shouldLoadVideo = true;
  var videoLoadStarted = false;
  
  // Check connection speed and device capabilities
  function assessConnectionAndDevice() {
    // Check for slow connection indicators
    if (navigator.connection) {
      var conn = navigator.connection;
      var slowConnections = ['slow-2g', '2g', '3g'];
      if (slowConnections.includes(conn.effectiveType)) {
        shouldLoadVideo = false;
        return;
      }
      // Also check if data saver is enabled
      if (conn.saveData) {
        shouldLoadVideo = false;
        return;
      }
    }
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shouldLoadVideo = false;
      return;
    }
    
    // Check device memory (if available)
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      shouldLoadVideo = false;
      return;
    }
    
    // Check viewport size (don't load video on very small screens)
    if (window.innerWidth < 600) {
      shouldLoadVideo = false;
      return;
    }
  }
  
  function loadVideoWhenReady() {
    if (!shouldLoadVideo || videoLoadStarted) return;
    
    var v = document.querySelector('.hero-video');
    if (!v) return;
    
    videoLoadStarted = true;
    
    // Set preload to auto and start loading
    v.preload = 'auto';
    v.load();
    
    // Add loading indicator
    var heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.classList.add('video-loading');
    }
    
    // Handle successful load
    v.addEventListener('canplay', function() {
      if (heroSection) {
        heroSection.classList.remove('video-loading');
        heroSection.classList.add('video-loaded');
      }
      tryPlay();
    });
    
    // Handle load error
    v.addEventListener('error', function() {
      v.style.display = 'none';
      if (heroSection) {
        heroSection.classList.remove('video-loading');
        heroSection.classList.add('video-fallback');
      }
    });
  }

  function tryPlay(){
    var v = document.querySelector('.hero-video');
    if(!v || !shouldLoadVideo) return;
    v.muted = true; // ensure muted
    var p = v.play();
    if(p && p.catch){
      p.catch(function(err){
        console.error('hero-video play() failed:', err);
        // Hide video on play failure
        v.style.display = 'none';
      });
    }
  }

  // Initialize connection assessment
  assessConnectionAndDevice();
  
  // Load video after page interaction or after delay for good connections
  function initVideoLoading() {
    if (shouldLoadVideo) {
      // For fast connections, load video after a short delay
      setTimeout(loadVideoWhenReady, 1000);
    }
  }
  
  // Load video on user interaction for medium connections
  function loadOnInteraction() {
    if (shouldLoadVideo && !videoLoadStarted) {
      loadVideoWhenReady();
      // Remove listeners after first interaction
      document.removeEventListener('click', loadOnInteraction);
      document.removeEventListener('scroll', loadOnInteraction);
      document.removeEventListener('touchstart', loadOnInteraction);
    }
  }
  
  // Set up interaction listeners for lazy loading
  document.addEventListener('click', loadOnInteraction);
  document.addEventListener('scroll', loadOnInteraction);
  document.addEventListener('touchstart', loadOnInteraction);

  // Compute and set the hero video's height so it reaches the bottom of #text-call
  // Use requestAnimationFrame for scroll updates and CSS transform for smooth GPU-accelerated motion.
  var rafScheduled = false;
  var lastTopPx = 0;
  function updateHeroExtent(){
    rafScheduled = false;
    var v = document.querySelector('.hero-video');
    var topbar = document.querySelector('.topbar');
    if(!v || !topbar) return;
    var headerRect = topbar.getBoundingClientRect();
    var heroEl = document.querySelector('.hero') || document.querySelector('.hero-wrap') || document.body;
    var heroRect = heroEl.getBoundingClientRect();
    // compute document-space coordinates
    var heroTopDoc = heroRect.top + window.scrollY;
    var headerBottomDoc = headerRect.bottom + window.scrollY;
    // choose the top of the video so it starts at the hero top but never above the header bottom (nudge up slightly)
    var topDoc = Math.max(heroTopDoc, headerBottomDoc - 12);
    // convert to viewport coordinate for fixed positioning
    var topPx = Math.round(topDoc - window.scrollY);
    var textCall = document.getElementById('text-call');
    var stopY;
    var quoteForm = document.getElementById('quote-form');
    if(quoteForm){
      var quoteTop = quoteForm.getBoundingClientRect().top + window.scrollY;
      var gap = 0;
      stopY = quoteTop - gap;
    } else if(textCall){
      var details = textCall.querySelector('details') || textCall;
      var summary = details.querySelector('summary');
      var ref = summary || details;
      stopY = ref.getBoundingClientRect().bottom + window.scrollY;
    } else {
      stopY = document.documentElement.scrollHeight;
    }
    var desired = Math.max(0, (stopY - window.scrollY) - topPx);

    // Only update height when it changes to avoid layout thrash
    var h = Math.round(desired);
    if (v._lastHeight !== h) {
      v.style.height = h + 'px';
      v._lastHeight = h;
    }

    // Use CSS variable and transform for smooth vertical positioning
    var offset = topPx;
    if (lastTopPx !== offset) {
      document.documentElement.style.setProperty('--hero-video-offset', offset + 'px');
      lastTopPx = offset;
    }

    // Ensure the element is composited on the GPU
    v.style.zIndex = '-1';
    v.style.pointerEvents = 'none';
    v.style.objectFit = 'cover';
    v.style.willChange = 'transform,opacity';
  }

  function scheduleRafUpdate(){
    if(rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(updateHeroExtent);
  }

  // run on load/resize/scroll; small debounce for scroll/resize
  var resizeTimer;
  function scheduleUpdate(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateHeroExtent, 120);
  }
  function scheduleScroll(){
    // use rAF throttling for smoothness
    scheduleRafUpdate();
  }

  window.addEventListener('load', function(){ 
    initVideoLoading(); 
    updateHeroExtent(); 
  });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('orientationchange', scheduleUpdate);
  window.addEventListener('scroll', scheduleScroll, {passive:true});
  // Try video loading after delay for good connections
  setTimeout(function(){ 
    if (shouldLoadVideo) loadVideoWhenReady(); 
    updateHeroExtent(); 
  }, 1400);
})();
