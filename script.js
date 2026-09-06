(function(){
  "use strict";

  /* ---------- Announcement bar dismiss ---------- */
  var announceBar = document.getElementById('announceBar');
  var announceClose = document.getElementById('announceClose');
  announceClose.addEventListener('click', function(){
    announceBar.style.display = 'none';
  });

  /* ---------- Sticky header shadow on scroll ---------- */
  var header = document.getElementById('siteHeader');
  var toTopBtn = document.getElementById('toTop');

  function onScroll(){
    var scrolled = window.scrollY > 12;
    header.classList.toggle('is-scrolled', scrolled);
    toTopBtn.classList.toggle('is-visible', window.scrollY > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTopBtn.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var mobilePanel = document.getElementById('mobilePanel');
  var scrim = document.getElementById('scrim');
  var panelClose = document.getElementById('panelClose');

  function openMenu(){
    mobilePanel.classList.add('is-open');
    scrim.classList.add('is-visible');
    menuToggle.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu(){
    mobilePanel.classList.remove('is-open');
    scrim.classList.remove('is-visible');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  menuToggle.addEventListener('click', function(){
    mobilePanel.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  panelClose.addEventListener('click', closeMenu);
  scrim.addEventListener('click', closeMenu);

  // Close mobile menu when a nav link is tapped
  mobilePanel.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', closeMenu);
  });

  /* ---------- Newsletter form validation ---------- */
  var form = document.getElementById('newsletterForm');
  var emailInput = document.getElementById('newsletterEmail');
  var note = document.getElementById('newsletterNote');
  var defaultNote = note.textContent;

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var value = emailInput.value.trim();
    var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if(!isValid){
      note.textContent = 'Please enter a valid email address.';
      note.classList.remove('success');
      emailInput.focus();
      return;
    }

    // NOTE: this is a front-end-only demo. To actually collect emails,
    // point this fetch() at your own signup endpoint (Mailchimp,
    // Klaviyo, your own backend, etc.) or swap in that provider's form.
    note.textContent = 'Thanks — check your inbox to confirm your subscription.';
    note.classList.add('success');
    form.reset();

    setTimeout(function(){
      note.textContent = defaultNote;
      note.classList.remove('success');
    }, 6000);
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

})();