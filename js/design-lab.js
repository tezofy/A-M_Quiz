/* ============================================================
   design-lab.js — Design Lab feedback + NFC business card
   ============================================================ */
(function(){
'use strict';

/* ===== Design Lab: real website blocks + feedback (100% exact screenshots) ===== */
var DL_BLOCKS = [
  { id:'hero', cat:'home', icon:'🏠', title:'Header + Hero Section', sub:'Navigation, "Everything you need, under one roof." & CTA', img:'assets/blocks/shots/01-header-hero.png', imgMobile:'assets/blocks/shots-mobile/01-header-hero.png', realTitle:'Your every NEED. Right here, ready to ROCK!' },
  { id:'brands', cat:'home', icon:'🏢', title:'Brand Marquee + Stats', sub:'"Trusted by these brands, & more…" + counters', img:'assets/blocks/shots/02-brands-stats.png', imgMobile:'assets/blocks/shots-mobile/02-brands-stats.png', realTitle:'Trusted by these brands, & more…' },
  { id:'quote', cat:'home', icon:'💬', title:'Quote Block', sub:'Richard Branson quote — "MOST AMAZING way to do it?"', img:'assets/blocks/shots/03-quote-services.png', imgMobile:'assets/blocks/shots-mobile/03-quote-services.png', realTitle:'"What\'s the MOST AMAZING way to do it?"' },
  { id:'services', cat:'home', icon:'🛠️', title:'Services Grid', sub:'"Everything under one happy roof." — 20+ service cards', img:'assets/blocks/shots/04-services-grid.png', imgMobile:'assets/blocks/shots-mobile/04-services-grid.png', realTitle:'Everything under one happy roof.' },
  { id:'process', cat:'home', icon:'⚙️', title:'Our Process', sub:'We Listen → We Plan → We Execute → We Deliver → We Celebrate', img:'assets/blocks/shots/05-process.png', imgMobile:'assets/blocks/shots-mobile/05-process.png', realTitle:'Our Process.' },
  { id:'testimonials', cat:'home', icon:'⭐', title:'Testimonials', sub:'"What our clients say." — LinkedIn, Bosch, UMG, Dentsu', img:'assets/blocks/shots/06-testimonials.png', imgMobile:'assets/blocks/shots-mobile/06-testimonials.png', realTitle:'What our clients say.' },
  { id:'portfolio', cat:'home', icon:'🎬', title:'Portfolio', sub:'"Teamwork made the dream work." — campaign showcase', img:'assets/blocks/shots/07-portfolio.png', imgMobile:'assets/blocks/shots-mobile/07-portfolio.png', realTitle:'Teamwork made the dream work.' },
  { id:'team', cat:'home', icon:'👥', title:'Team Section', sub:'"Meet your dream team." — Tanya Hyacinth, CEO', img:'assets/blocks/shots/08-team.png', imgMobile:'assets/blocks/shots-mobile/08-team.png', realTitle:'Meet your dream team.' },
  { id:'contact', cat:'home', icon:'📧', title:'Contact + Footer', sub:'"Click For Coffee" — enquiry form, footer & links', img:'assets/blocks/shots/11-contact.png', imgMobile:'assets/blocks/shots-mobile/09-contact-footer.png', realTitle:'Click For Coffee' },
  { id:'logo', cat:'home', icon:'🎨', title:'Coffee Cup Logo', sub:'A&M brand logo — coffee cup identity', img:'assets/coffee-cup.png', imgMobile:'assets/coffee-cup.png', realTitle:'Advertising & More Logo' },
  { id:'bizcard', cat:'home', icon:'📇', title:'Business Card', sub:'Digital NFC business card design', img:'assets/blocks/hero-coffee.webp', imgMobile:'assets/blocks/hero-coffee.webp', realTitle:'Advertising & More Business Card' },
  { id:'signature', cat:'home', icon:'✉️', title:'Email Signature', sub:'Email footer & contact layout design', img:'assets/blocks/quote-open.webp', imgMobile:'assets/blocks/quote-open.webp', realTitle:'Email Signature Block' }
];

/* ===== Live demo HTML for each block (100% design copy) ===== */
var DL_DEMOS = {
  hero: '<div class="am-hero"><span class="am-eyebrow"><span class="am-dot"></span> Everything you need, under one roof.</span><div class="am-hero-badge"><div class="am-seal"><span class="am-seal-100">100<span>%</span></span><span class="am-seal-txt">Success Rate</span></div></div><h3 class="am-hero-title">Your every <span class="am-hero-word">NEED.</span></h3><p class="am-hero-sub">Right here, ready to ROCK!</p><button class="am-cta"><img src="assets/blocks/hero-coffee.webp" alt=""> CLICK FOR COFFEE</button></div>',
  brands: '<div class="am-brands"><p class="am-brands-title">TRUSTED BY THESE BRANDS, &amp; MORE…</p><div class="am-brand-row"><img src="assets/blocks/brand-bosch.webp" alt="Bosch"><img src="assets/blocks/brand-umg.webp" alt="UMG"><img src="assets/blocks/brand-dentsu.webp" alt="Dentsu"><img src="assets/blocks/brand-linkedin.webp" alt="LinkedIn"><img src="assets/blocks/brand-airasia.webp" alt="AirAsia"><img src="assets/blocks/brand-airbnb.webp" alt="Airbnb"></div></div>',
  stats: '<div class="am-stats"><div class="am-stat"><span class="am-stat-icon">📅</span><div><b>12+</b><span>Years in business</span></div></div><div class="am-stat"><span class="am-stat-icon">🌍</span><div><b>150+</b><span>Countries advertised in</span></div></div><div class="am-stat"><span class="am-stat-icon">👤</span><div><b>98%</b><span>Clients return to us</span></div></div><div class="am-stat"><span class="am-stat-icon">✅</span><div><b>100%</b><span>Project success rates</span></div></div></div>',
  quote: '<div class="am-quote"><img src="assets/blocks/quote-open.webp" alt=""><p>"Don\'t think what\'s the <b>CHEAPEST</b> way to do it or what\'s the <b>FASTEST</b> way to do it. Think, what\'s the <b>MOST AMAZING</b> way to do it?"</p><span>— Richard Branson —</span></div>',
  services: '<div class="am-services"><span class="am-eyebrow-sm">What we do</span><h3 class="am-svc-title">Everything under one <span class="am-happy">happy</span> roof.</h3><div class="am-svc-grid"><div class="am-svc"><img src="assets/blocks/services-digital.webp" alt=""><h4>Digital Advertising</h4><span class="am-svc-line"></span></div><div class="am-svc"><img src="assets/blocks/services-social.webp" alt=""><h4>Social Media Management &amp; Influencer Marketing</h4><span class="am-svc-line"></span></div><div class="am-svc"><img src="assets/blocks/services-traditional.webp" alt=""><h4>Traditional Advertising</h4><span class="am-svc-line"></span></div><div class="am-svc"><img src="assets/blocks/services-design.webp" alt=""><h4>Graphic &amp; Creative Design</h4><span class="am-svc-line"></span></div><div class="am-svc"><img src="assets/blocks/services-video.webp" alt=""><h4>Video, Film &amp; Photography</h4><span class="am-svc-line"></span></div><div class="am-svc"><img src="assets/blocks/services-web.webp" alt=""><h4>Website &amp; Mobile App Design + Development</h4><span class="am-svc-line"></span></div></div></div>',
  process: '<div class="am-process"><span class="am-eyebrow-sm">How we work</span><h3 class="am-proc-title">Our Process.</h3><p class="am-proc-sub">Five simple steps, a lot of heart, and just enough caffeine.</p><div class="am-flow"><div class="am-flow-item"><span class="am-flow-num">1</span><div class="am-flow-card"><div><h4>We Listen</h4><h5>So that you can be heard.</h5></div></div></div><div class="am-flow-item"><span class="am-flow-num">2</span><div class="am-flow-card"><div><h4>We Plan</h4><h5>With a little caffeine, and a lot of heart.</h5></div></div></div><div class="am-flow-item"><span class="am-flow-num">3</span><div class="am-flow-card"><div><h4>We Execute</h4><h5>See your ideas come to life.</h5></div></div></div><div class="am-flow-item"><span class="am-flow-num">4</span><div class="am-flow-card"><div><h4>We Deliver</h4><h5>Only successful post campaign results.</h5></div></div></div><div class="am-flow-item"><span class="am-flow-num">5</span><div class="am-flow-card"><div><h4>We Celebrate</h4><h5>Cheers to our joint success.</h5></div></div></div></div></div>',
  testimonials: '<div class="am-testimonials"><span class="am-eyebrow-sm">Kind words</span><h3 class="am-tst-title">What our clients say.</h3><p class="am-tst-sub">Real words from the brands who trust us.</p><div class="am-tst-card"><img src="assets/blocks/brand-linkedin.webp" alt=""><p>"Congratulations for being the highest earners for LinkedIn. As a token of my appreciation, I would like to reward your hard work."</p><span>— LinkedIn Corporation</span></div><div class="am-tst-card"><img src="assets/blocks/brand-bosch.webp" alt=""><p>"Never failed to provide sound advice &amp; solutions. Impeccable professional ethics &amp; pleasant to work with."</p><span>— Bosch</span></div></div>',
  portfolio: '<div class="am-portfolio"><span class="am-eyebrow-sm">Our work</span><h3 class="am-port-title">Teamwork made the dream work.</h3><p class="am-port-sub">A few campaigns we\'re proud of, and the results that came with them.</p><div class="am-port-grid"><img src="assets/blocks/portfolio-1.webp" alt=""><img src="assets/blocks/portfolio-2.webp" alt=""></div><div class="am-port-card"><h4>Nepal Earthquake Donation Drive</h4><span>NGO Campaign</span><p>Campaign ideation, Facebook strategy, design, bilingual copywriting, advertising, A/B testing.</p></div></div>',
  team: '<div class="am-team"><span class="am-eyebrow-sm">The people</span><h3 class="am-team-title">Meet your dream team.</h3><img src="assets/blocks/team-tanya.jpg" alt="Tanya Hyacinth" class="am-team-photo"><h4>Tanya Hyacinth D\'Silva-Fernandez</h4><span class="am-team-role">Chief Executive Officer (CEO)</span></div>',
  contact: '<div class="am-contact"><div class="am-seal am-seal-sm"><span class="am-seal-100">100<span>%</span></span><span class="am-seal-txt">Success Rate</span></div><h3 class="am-contact-title">Click For Coffee</h3><p class="am-contact-sub">Start your enquiry — every field matters!</p><div class="am-form"><input placeholder="Your name" disabled><input placeholder="Email address" disabled><input placeholder="Phone number" disabled><textarea placeholder="Your message..." disabled></textarea><button class="am-cta" disabled><img src="assets/blocks/hero-coffee.webp" alt=""> SEND ENQUIRY</button></div></div>'
};

var DL_KEY = 'amDesignFeedback';
var feedbacks = [];
try { feedbacks = JSON.parse(localStorage.getItem(DL_KEY) || '[]'); } catch(e) { feedbacks = []; }

function saveFeedbacks() {
  try { localStorage.setItem(DL_KEY, JSON.stringify(feedbacks)); } catch(e) {}
}

function updateDLStats() {
  var countEl = document.getElementById('dlFeedbackCount');
  var xpEl = document.getElementById('dlBonusXP');
  if (countEl) countEl.textContent = feedbacks.length;
  if (xpEl) xpEl.textContent = feedbacks.length * 50;
}

var dlActiveCat = 'all';

var DL_CAT_NAMES = { home: '🏠 Home Page', services: '🎉 Party Rent & Services', careers: '💼 Career / Hiring', logo: '🎨 Logo', bizcard: '📇 Business Card', signature: '✉️ Email Signature' };

function renderDLBlocks() {
  var grid = document.getElementById('dlGrid');
  if (!grid) return;
  grid.innerHTML = '';
  var visible = DL_BLOCKS.filter(function(b) { return dlActiveCat === 'all' || b.cat === dlActiveCat; });
  if (visible.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'dl-empty';
    empty.innerHTML =
      '<div class="dl-empty-icon">🔗</div>' +
      '<div class="dl-empty-title">No designs yet in ' + (DL_CAT_NAMES[dlActiveCat] || dlActiveCat) + '</div>' +
      '<div class="dl-empty-sub">Share a link for this category and I will create the designs here — just like the Home Page cards.</div>';
    grid.appendChild(empty);
    return;
  }
  visible.forEach(function(block) {
    var card = document.createElement('div');
    card.className = 'dl-block';
    card.dataset.block = block.id;

    var preview = block.img
      ? '<div class="dl-block-preview"><img src="' + block.img + '" alt="' + block.title + '"></div>'
      : '<div class="dl-block-preview"><div class="dl-preview-placeholder">' + block.icon + ' ' + block.title + '</div></div>';

    card.innerHTML =
      '<div class="dl-block-head">' +
        '<span class="dl-block-icon">' + block.icon + '</span>' +
        '<div><div class="dl-block-title">' + block.title + '</div>' +
        '<div class="dl-block-sub">' + block.sub + '</div></div>' +
      '</div>' +
      preview +
      '<div class="dl-real-title">Current: "' + block.realTitle + '"</div>' +
      '<button class="btn ghost dl-demo-btn" type="button">▶️ View Live Demo</button>' +
      '<div class="dl-feedback-form">' +
        '<div class="dl-rating" data-rating="0">' +
          '<button type="button" data-val="1">😞</button>' +
          '<button type="button" data-val="2">😐</button>' +
          '<button type="button" data-val="3">🙂</button>' +
          '<button type="button" data-val="4">😊</button>' +
          '<button type="button" data-val="5">🤩</button>' +
        '</div>' +
        '<input type="text" placeholder="Your suggestion (e.g. Change title to...)" maxlength="120">' +
        '<textarea placeholder="Describe your design idea..." maxlength="500"></textarea>' +
        '<div class="dl-upload">' +
          '<label class="dl-upload-label">📷 Upload your design mockup:</label>' +
          '<input type="file" accept="image/*" class="dl-file-input">' +
          '<div class="dl-upload-preview" hidden><img alt="Your design"><button type="button" class="dl-upload-remove">✕ Remove</button></div>' +
        '</div>' +
        '<button class="btn gold dl-submit" type="button">Submit Feedback (+50 XP)</button>' +
      '</div>';

    // Rating selection
    var ratingEl = card.querySelector('.dl-rating');
    ratingEl.addEventListener('click', function(e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      ratingEl.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      ratingEl.dataset.rating = btn.dataset.val;
    });

    // Live demo button — shows exact screenshot with device toggle
    card.querySelector('.dl-demo-btn').addEventListener('click', function() {
      openDemoModal(block);
    });

    // Click preview image to view full screenshot
    var previewImg = card.querySelector('.dl-block-preview img');
    if (previewImg) {
      previewImg.addEventListener('click', function() {
        openDemoModal(block);
      });
    }

    // Image upload
    var fileInput = card.querySelector('.dl-file-input');
    var uploadPreview = card.querySelector('.dl-upload-preview');
    var uploadedData = null;
    fileInput.addEventListener('change', function() {
      var file = fileInput.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        alert('Image too large (max 2MB). Please choose a smaller image.');
        fileInput.value = '';
        return;
      }
      var reader = new FileReader();
      reader.onload = function(e) {
        uploadedData = e.target.result;
        uploadPreview.querySelector('img').src = uploadedData;
        uploadPreview.hidden = false;
      };
      reader.readAsDataURL(file);
    });
    uploadPreview.querySelector('.dl-upload-remove').addEventListener('click', function() {
      uploadedData = null;
      fileInput.value = '';
      uploadPreview.hidden = true;
    });

    // Submit
    var submitBtn = card.querySelector('.dl-submit');
    submitBtn.addEventListener('click', function() {
      var rating = parseInt(ratingEl.dataset.rating || '0', 10);
      var suggestion = card.querySelector('input[type="text"]').value.trim();
      var idea = card.querySelector('textarea').value.trim();
      if (!rating && !suggestion && !idea && !uploadedData) {
        alert('Please give a rating, write a suggestion, or upload a design first.');
        return;
      }
      feedbacks.push({
        block: block.id,
        blockTitle: block.title,
        realTitle: block.realTitle,
        rating: rating,
        suggestion: suggestion,
        idea: idea,
        designImage: uploadedData,
        date: new Date().toISOString()
      });
      saveFeedbacks();
      updateDLStats();
      // Show confirmation
      var msg = document.createElement('div');
      msg.className = 'dl-submitted';
      msg.textContent = '✅ Feedback submitted! +50 XP earned.';
      card.querySelector('.dl-feedback-form').appendChild(msg);
      // Reset form
      ratingEl.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
      ratingEl.dataset.rating = '0';
      card.querySelector('input[type="text"]').value = '';
      card.querySelector('textarea').value = '';
      uploadedData = null;
      fileInput.value = '';
      uploadPreview.hidden = true;
      setTimeout(function() { msg.remove(); }, 4000);
    });

    grid.appendChild(card);
  });
  updateDLStats();
}

// Demo modal — exact screenshot with Mobile/Desktop toggle
function openDemoModal(block) {
  var modal = document.getElementById('demoModal');
  var body = document.getElementById('demoModalBody');
  document.getElementById('demoModalTitle').textContent = block.title;
  var isMobile = window.innerWidth < 760;
  var src = isMobile ? block.imgMobile : block.img;
  body.innerHTML =
    '<div class="demo-device-toggle">' +
      '<button type="button" class="demo-dev-btn' + (isMobile ? ' active' : '') + '" data-dev="mobile">📱 Mobile</button>' +
      '<button type="button" class="demo-dev-btn' + (!isMobile ? ' active' : '') + '" data-dev="desktop">🖥️ Desktop</button>' +
    '</div>' +
    '<div class="demo-shot-wrap' + (isMobile ? ' is-mobile' : ' is-desktop') + '">' +
      '<img src="' + src + '" alt="' + block.title + '">' +
    '</div>';
  body.querySelectorAll('.demo-dev-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      body.querySelectorAll('.demo-dev-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var dev = btn.dataset.dev;
      var wrap = body.querySelector('.demo-shot-wrap');
      wrap.className = 'demo-shot-wrap is-' + dev;
      wrap.querySelector('img').src = dev === 'mobile' ? block.imgMobile : block.img;
    });
  });
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

// Category filter
document.addEventListener('click', function(e) {
  var catBtn = e.target.closest('.dl-cat');
  if (catBtn) {
    document.querySelectorAll('.dl-cat').forEach(function(b) { b.classList.remove('active'); });
    catBtn.classList.add('active');
    dlActiveCat = catBtn.dataset.cat;
    renderDLBlocks();
  }
});

// Demo modal close
document.addEventListener('click', function(e) {
  if (e.target.id === 'demoModalClose' || e.target.id === 'demoModal') {
    document.getElementById('demoModal').hidden = true;
    document.body.style.overflow = '';
  }
});

// Export feedback as JSON
document.addEventListener('click', function(e) {
  if (e.target.id === 'dlExportBtn') {
    var blob = new Blob([JSON.stringify(feedbacks, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'design-feedback.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  if (e.target.id === 'dlClearBtn') {
    if (confirm('Clear all feedback?')) {
      feedbacks = [];
      saveFeedbacks();
      updateDLStats();
    }
  }
});

/* ===== NFC Business Card ===== */
var nfcStatus = document.getElementById('nfcStatus');

function checkNFC() {
  if (!nfcStatus) return;
  if ('NDEFReader' in window) {
    nfcStatus.textContent = '✅ NFC is available on this device!';
  } else {
    nfcStatus.textContent = 'ℹ️ NFC not available — use QR code or share instead.';
  }
}

function getVCard() {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:Advertising & More',
    'ORG:Advertising & More Sdn. Bhd.',
    'TITLE:Integrated Advertising & Marketing Agency',
    'URL:https://advertisingandmore.com.my',
    'EMAIL:info@advertisingandmore.com.my',
    'TEL:+60-3-XXXX-XXXX',
    'ADR:;;Kuala Lumpur;;;Malaysia',
    'END:VCARD'
  ].join('\n');
}

document.addEventListener('click', function(e) {
  // NFC Share
  if (e.target.id === 'nfcShareBtn') {
    if ('NDEFReader' in window) {
      var ndef = new NDEFReader();
      ndef.write({
        records: [{ recordType: 'text', data: getVCard() }]
      }).then(function() {
        nfcStatus.textContent = '✅ Card written! Hold near another device.';
      }).catch(function() {
        nfcStatus.textContent = '❌ NFC write failed. Try QR code instead.';
      });
    } else if (navigator.share) {
      navigator.share({
        title: 'Advertising & More',
        text: 'Advertising & More — Integrated Advertising & Marketing Agency\n🌐 advertisingandmore.com.my\n📧 info@advertisingandmore.com.my',
        url: 'https://advertisingandmore.com.my'
      }).catch(function() {});
    } else {
      nfcStatus.textContent = 'ℹ️ Sharing not supported. Use QR code or download.';
    }
  }

  // QR Code
  if (e.target.id === 'nfcQrBtn') {
    var qrBox = document.getElementById('nfcQr');
    var qrImg = document.getElementById('nfcQrImg');
    if (qrBox.hidden) {
      // Generate QR via API (free, no key needed)
      var data = encodeURIComponent(getVCard());
      qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + data;
      qrBox.hidden = false;
    } else {
      qrBox.hidden = true;
    }
  }

  // Download vCard
  if (e.target.id === 'nfcDownloadBtn') {
    var blob = new Blob([getVCard()], { type: 'text/vcard' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'advertising-and-more.vcf';
    a.click();
    URL.revokeObjectURL(url);
    nfcStatus.textContent = '✅ Business card downloaded!';
  }
});

// Init
renderDLBlocks();
checkNFC();

})();
