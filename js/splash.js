/* ============================================================
   splash.js — splash screen, sticky stats observer, helpers
   ============================================================ */
(function(){var h=document.querySelector('.stickybar');if(!h||!window.ResizeObserver)return;var ro=new ResizeObserver(function(){document.documentElement.style.setProperty('--stickyH',h.offsetHeight+'px');});ro.observe(h);})();

(function(){function c(){var b=a.contentDocument||(a.contentWindow&&a.contentWindow.document);if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'a59f8138f85b2154',t:'MTc5NDU5MTAzMQ=='};var l=window.parent.location,o;try{o=new URL(l.origin).origin}catch(e){try{o=new URL(new URL(l.href).origin).origin}catch(e){o=''}}var u='/cdn-cgi/challenge-platform/scripts/jsd/main.js?ray=a59f8138f85b2154',a=document.createElement('script');a.src=o?new URL(u,o).href:u;document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();

/* ===== Review Lab splash: Click For Start reveals the quiz ===== */
(function(){
  var splashScreen = document.getElementById('splashScreen');
  var splashStartButton = document.getElementById('splashStartButton');
  var splashStatus = document.getElementById('splashStatus');
  if(!splashScreen || !splashStartButton) return;
  document.body.style.overflow = 'hidden';
  splashStartButton.addEventListener('click', function(){
    if(splashScreen.classList.contains('loading')) return;
    splashScreen.classList.add('loading');
    splashStartButton.disabled = true;
    splashStartButton.textContent = 'LOADING…';
    if(splashStatus) splashStatus.textContent = 'Preparing your quiz';
    setTimeout(function(){
      splashScreen.classList.add('is-exiting');
      setTimeout(function(){
        splashScreen.remove();
        document.body.style.overflow = '';
        window.scrollTo(0, 0);
      }, 430);
    }, 620);
  });
})();
