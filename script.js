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

  /* =====================================================================
     SEARCH OVERLAY
     Filters the products already present in the page — reads each
     .product-card's data-id / data-name / data-price / data-image
     attributes, so it needs no backend and no separate product list
     to maintain. Add a product to the page and it's searchable.
  ===================================================================== */
  var searchOpenBtn  = document.getElementById('searchOpen');
  var searchOverlay  = document.getElementById('searchOverlay');
  var searchCloseBtn = document.getElementById('searchClose');
  var searchInput    = document.getElementById('searchInput');
  var searchResults  = document.getElementById('searchResults');
  var searchHint     = document.getElementById('searchHint');

  var productCards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));
  var products = productCards.map(function(card){
    return {
      id: card.getAttribute('data-id'),
      name: card.getAttribute('data-name') || '',
      price: parseFloat(card.getAttribute('data-price')) || 0,
      image: card.getAttribute('data-image') || '',
      el: card
    };
  });

  function openSearch(){
    searchOverlay.classList.add('is-open');
    searchOpenBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    window.setTimeout(function(){ searchInput.focus(); }, 60);
  }
  function closeSearch(){
    searchOverlay.classList.remove('is-open');
    searchOpenBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    searchInput.value = '';
    renderSearchResults('');
  }
  function renderSearchResults(rawQuery){
    var query = rawQuery.trim().toLowerCase();
    searchResults.innerHTML = '';

    if(!query){
      searchHint.style.display = 'block';
      searchHint.textContent = 'Start typing to search across all products.';
      return;
    }
    searchHint.style.display = 'none';

    var matches = products.filter(function(p){
      return p.name.toLowerCase().indexOf(query) !== -1;
    });

    if(matches.length === 0){
      var none = document.createElement('p');
      none.className = 'search-no-results';
      none.textContent = 'No products match "' + rawQuery.trim() + '".';
      searchResults.appendChild(none);
      return;
    }

    matches.forEach(function(p){
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'search-result';
      row.innerHTML =
        '<img src="' + p.image + '" alt="">' +
        '<span class="sr-info"><h4>' + p.name + '</h4></span>' +
        '<span class="sr-price">\u20B9' + p.price + '</span>';
      row.addEventListener('click', function(){
        closeSearch();
        p.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        p.el.style.transition = 'box-shadow .3s ease';
        p.el.style.boxShadow = '0 0 0 3px var(--clay)';
        window.setTimeout(function(){ p.el.style.boxShadow = ''; }, 1400);
      });
      searchResults.appendChild(row);
    });
  }

  searchOpenBtn.addEventListener('click', openSearch);
  searchCloseBtn.addEventListener('click', closeSearch);
  searchInput.addEventListener('input', function(){
    renderSearchResults(searchInput.value);
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && searchOverlay.classList.contains('is-open')) closeSearch();
  });

})();









(function(){
  "use strict";

  var tabSignIn = document.getElementById('tabSignIn');
  var tabSignUp = document.getElementById('tabSignUp');
  var signInForm = document.getElementById('signInForm');
  var signUpForm = document.getElementById('signUpForm');
  var authFoot = document.getElementById('authFoot');
  var switchToSignUp = document.getElementById('switchToSignUp');

  function showSignIn(){
    tabSignIn.classList.add('is-active'); tabSignIn.setAttribute('aria-selected','true');
    tabSignUp.classList.remove('is-active'); tabSignUp.setAttribute('aria-selected','false');
    signInForm.classList.add('is-active');
    signUpForm.classList.remove('is-active');
    authFoot.innerHTML = 'New here? <a href="#" id="switchToSignUp">Create an account</a>';
    document.getElementById('switchToSignUp').addEventListener('click', function(e){ e.preventDefault(); showSignUp(); });
  }
  function showSignUp(){
    tabSignUp.classList.add('is-active'); tabSignUp.setAttribute('aria-selected','true');
    tabSignIn.classList.remove('is-active'); tabSignIn.setAttribute('aria-selected','false');
    signUpForm.classList.add('is-active');
    signInForm.classList.remove('is-active');
    authFoot.innerHTML = 'Already have an account? <a href="#" id="switchToSignIn">Sign in</a>';
    document.getElementById('switchToSignIn').addEventListener('click', function(e){ e.preventDefault(); showSignIn(); });
  }

  tabSignIn.addEventListener('click', showSignIn);
  tabSignUp.addEventListener('click', showSignUp);
  switchToSignUp.addEventListener('click', function(e){ e.preventDefault(); showSignUp(); });

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  signInForm.addEventListener('submit', function(e){
    e.preventDefault();
    var email = document.getElementById('signInEmail').value.trim();
    var password = document.getElementById('signInPassword').value;
    var errorEl = document.getElementById('signInError');

    if(!emailPattern.test(email)){
      errorEl.textContent = 'Please enter a valid email address.';
      return;
    }
    if(!password){
      errorEl.textContent = 'Please enter your password.';
      return;
    }
    errorEl.textContent = '';

    // TODO(auth): send { email, password } to your real sign-in endpoint
    // and redirect on success. This demo just confirms the form works.
    window.alert('This is a static demo — connect this form to your real authentication service to sign users in.');
  });

  signUpForm.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('signUpName').value.trim();
    var email = document.getElementById('signUpEmail').value.trim();
    var password = document.getElementById('signUpPassword').value;
    var confirm = document.getElementById('signUpConfirm').value;
    var errorEl = document.getElementById('signUpError');

    if(!name){
      errorEl.textContent = 'Please enter your name.';
      return;
    }
    if(!emailPattern.test(email)){
      errorEl.textContent = 'Please enter a valid email address.';
      return;
    }
    if(password.length < 8){
      errorEl.textContent = 'Password must be at least 8 characters.';
      return;
    }
    if(password !== confirm){
      errorEl.textContent = 'Passwords do not match.';
      return;
    }
    errorEl.textContent = '';

    // TODO(auth): send { name, email, password } to your real sign-up
    // endpoint and handle the response. This demo just confirms the form works.
    window.alert('This is a static demo — connect this form to your real authentication service to create accounts.');
  });

})();