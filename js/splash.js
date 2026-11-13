/* ============================================================
   splash.js — splash screen, sticky stats observer, helpers
   ============================================================ */
(function(){var h=document.querySelector('.stickybar');if(!h||!window.ResizeObserver)return;var ro=new ResizeObserver(function(){document.documentElement.style.setProperty('--stickyH',h.offsetHeight+'px');});ro.observe(h);})();

(function(){function c(){var b=a.contentDocument||(a.contentWindow&&a.contentWindow.document);if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'a59f8138f85b2154',t:'MTc5NDU5MTAzMQ=='};var l=window.parent.location,o;try{o=new URL(l.origin).origin}catch(e){try{o=new URL(new URL(l.href).origin).origin}catch(e){o=''}}var u='/cdn-cgi/challenge-platform/scripts/jsd/main.js?ray=a59f8138f85b2154',a=document.createElement('script');a.src=o?new URL(u,o).href:u;document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();

/* ===== Review Lab splash: Click For Start → gift selection → quiz ===== */
(function(){
  var splashScreen = document.getElementById('splashScreen');
  var splashStartButton = document.getElementById('splashStartButton');
  var splashStatus = document.getElementById('splashStatus');
  var giftPickScreen = document.getElementById('giftPickScreen');
  var giftPickStart = document.getElementById('giftPickStart');
  var giftPickHint = document.getElementById('giftPickHint');
  if(!splashScreen || !splashStartButton) return;
  document.body.style.overflow = 'hidden';
  /* Rotating gift box above the start button — cycles through gift art */
  var giftImgs = splashScreen.querySelectorAll('.splash-gift-img');
  if(giftImgs.length > 1){
    var giftIdx = 0;
    setInterval(function(){
      if(!document.body.contains(splashScreen)) return;
      giftImgs[giftIdx].classList.remove('is-active');
      giftIdx = (giftIdx + 1) % giftImgs.length;
      giftImgs[giftIdx].classList.add('is-active');
    }, 2600);
  }
  /* Gift selection page logic — 9 mystery cards, pick one, prize by score */
  var chosenCard = null;
  window.__chosenPrizeCard = null;
  if(giftPickScreen){
    var mysteryCards = giftPickScreen.querySelectorAll('.mystery-card');
    mysteryCards.forEach(function(card){
      card.addEventListener('click', function(){
        if(chosenCard) return;
        chosenCard = card;
        window.__chosenPrizeCard = card;
        /* Shake the gift icon, then flip the card */
        card.classList.add('is-shaking');
        setTimeout(function(){
          card.classList.remove('is-shaking');
          card.classList.add('is-flipped','is-chosen');
          mysteryCards.forEach(function(c){
            if(c !== card){ c.classList.add('is-dim'); c.disabled = true; }
          });
          card.disabled = true;
          if(giftPickStart) giftPickStart.disabled = false;
          if(giftPickHint) giftPickHint.textContent = 'Card ' + card.getAttribute('data-card') + ' chosen! Your prize depends on your score — tap Start Quiz!';
        }, 650);
      });
    });
    if(giftPickStart){
      giftPickStart.addEventListener('click', function(){
        if(!chosenCard) return;
        giftPickStart.disabled = true;
        giftPickStart.textContent = 'LOADING…';
        setTimeout(function(){
          giftPickScreen.classList.add('is-exiting');
          setTimeout(function(){
            giftPickScreen.remove();
            document.body.style.overflow = '';
            window.scrollTo(0, 0);
          }, 430);
        }, 500);
      });
    }
  }
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
        if(giftPickScreen){
          giftPickScreen.hidden = false;
          window.scrollTo(0, 0);
        } else {
          document.body.style.overflow = '';
          window.scrollTo(0, 0);
        }
      }, 430);
    }, 620);
  });
})();
