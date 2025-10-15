// Populate footer date/time where an element with id 'footer-datetime' exists.
(function(){
  try{
    var el = document.getElementById('footer-datetime');
    if(!el) return;
    var now = new Date();
    // Format: Month Day, Year — HH:MM (local)
    var opts = { year: 'numeric', month: 'long', day: 'numeric' };
    var datePart = now.toLocaleDateString(undefined, opts);
    var timePart = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    el.textContent = '© ' + now.getFullYear() + ' Pristine Windows and Services. Last updated: ' + datePart + ' — ' + timePart;
  }catch(e){
    console.error('footer-datetime failed', e);
  }
})();
