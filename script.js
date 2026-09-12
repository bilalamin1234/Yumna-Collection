(function(){
  "use strict";

  /* ---------- Announcement bar dismiss ---------- */
  var announceBar = document.getElementById('announceBar');
  var announceClose = document.getElementById('announceClose');
  if(announceBar && announceClose){
    announceClose.addEventListener('click', function(){
      announceBar.style.display = 'none';
    });
  }

  /* ---------- Sticky header shadow on scroll + back-to-top button ---------- */
  var header = document.getElementById('siteHeader');
  var toTopBtn = document.getElementById('toTop');

  if(header && toTopBtn){
    var onScroll = function(){
      var scrolled = window.scrollY > 12;
      header.classList.toggle('is-scrolled', scrolled);
      toTopBtn.classList.toggle('is-visible', window.scrollY > 700);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTopBtn.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var mobilePanel = document.getElementById('mobilePanel');
  var scrim = document.getElementById('scrim');
  var panelClose = document.getElementById('panelClose');

  if(menuToggle && mobilePanel && scrim && panelClose){
    var openMenu = function(){
      mobilePanel.classList.add('is-open');
      scrim.classList.add('is-visible');
      menuToggle.classList.add('is-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    var closeMenu = function(){
      mobilePanel.classList.remove('is-open');
      scrim.classList.remove('is-visible');
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    menuToggle.addEventListener('click', function(){
      mobilePanel.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    panelClose.addEventListener('click', closeMenu);
    scrim.addEventListener('click', closeMenu);

    mobilePanel.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', closeMenu);
    });
  }

  /* ---------- Newsletter (index.html / category.html only) ---------- */
  var form = document.getElementById('newsletterForm');
  var emailInput = document.getElementById('newsletterEmail');
  var note = document.getElementById('newsletterNote');

  if(form && emailInput && note){
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

      note.textContent = 'Thanks — check your inbox to confirm your subscription.';
      note.classList.add('success');
      form.reset();

      setTimeout(function(){
        note.textContent = defaultNote;
        note.classList.remove('success');
      }, 6000);
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  /* =====================================================================
     SEARCH OVERLAY (index.html / category.html only)
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

  var closeSearch = function(){}; // no-op default; replaced below if the search UI exists on this page

  if(searchOpenBtn && searchOverlay && searchCloseBtn && searchInput && searchResults && searchHint){
    var renderSearchResults = function(rawQuery){
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
    };

    var openSearch = function(){
      searchOverlay.classList.add('is-open');
      searchOpenBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      window.setTimeout(function(){ searchInput.focus(); }, 60);
    };
    closeSearch = function(){
      searchOverlay.classList.remove('is-open');
      searchOpenBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      searchInput.value = '';
      renderSearchResults('');
    };

    searchOpenBtn.addEventListener('click', openSearch);
    searchCloseBtn.addEventListener('click', closeSearch);
    searchInput.addEventListener('input', function(){
      renderSearchResults(searchInput.value);
    });
  }

  /* =====================================================================
     CART DRAWER (index.html / category.html only)
     Client-side cart stored in localStorage under "yc_cart", so it
     persists between visits on the same device/browser. There is no
     server or payment processing here — wire "Checkout" to your real
     flow (Stripe Checkout, a WhatsApp order link, your own backend, etc.).
  ===================================================================== */
  var CART_KEY = 'yc_cart';
  var cartDrawer      = document.getElementById('cartDrawer');
  var cartScrim       = document.getElementById('cartScrim');
  var cartOpenBtn     = document.getElementById('cartOpen');
  var cartCloseBtn    = document.getElementById('cartClose');
  var cartItemsEl     = document.getElementById('cartItems');
  var cartEmptyEl     = document.getElementById('cartEmpty');
  var cartFooterEl    = document.getElementById('cartFooter');
  var cartSubtotalEl  = document.getElementById('cartSubtotal');
  var bagCountEl      = document.getElementById('bagCount');
  var cartCheckoutBtn = document.getElementById('cartCheckout');

  var cart = [];
  var closeCart = function(){}; // no-op default; replaced below if the cart UI exists on this page

  if(cartDrawer && cartScrim && cartOpenBtn && cartCloseBtn && cartItemsEl && cartEmptyEl && cartFooterEl && cartSubtotalEl && bagCountEl && cartCheckoutBtn){

    var loadCart = function(){
      try{
        var raw = localStorage.getItem(CART_KEY);
        return raw ? JSON.parse(raw) : [];
      }catch(e){
        return [];
      }
    };
    var saveCart = function(){
      try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }catch(e){}
    };

    cart = loadCart();

    var openCart = function(){
      cartDrawer.classList.add('is-open');
      cartScrim.classList.add('is-visible');
      cartOpenBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    closeCart = function(){
      cartDrawer.classList.remove('is-open');
      cartScrim.classList.remove('is-visible');
      cartOpenBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    var renderCart; // declared here so addToCart/changeQty/removeItem can reference it before definition

    var addToCart = function(product){
      var existing = cart.filter(function(item){ return item.id === product.id; })[0];
      if(existing){
        existing.qty += 1;
      }else{
        cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
      }
      saveCart();
      renderCart();
      openCart();
    };
    var changeQty = function(id, delta){
      var item = cart.filter(function(i){ return i.id === id; })[0];
      if(!item) return;
      item.qty += delta;
      if(item.qty <= 0){
        cart = cart.filter(function(i){ return i.id !== id; });
      }
      saveCart();
      renderCart();
    };
    var removeItem = function(id){
      cart = cart.filter(function(i){ return i.id !== id; });
      saveCart();
      renderCart();
    };

    renderCart = function(){
      cartItemsEl.innerHTML = '';
      var totalQty = cart.reduce(function(sum, i){ return sum + i.qty; }, 0);
      var subtotal = cart.reduce(function(sum, i){ return sum + (i.qty * i.price); }, 0);

      var hasItems = cart.length > 0;
      cartEmptyEl.style.display = hasItems ? 'none' : 'flex';
      cartFooterEl.style.display = hasItems ? 'block' : 'none';
      cartItemsEl.style.display = hasItems ? 'flex' : 'none';

      cart.forEach(function(item){
        var line = document.createElement('div');
        line.className = 'cart-line';
        line.innerHTML =
          '<img src="' + item.image + '" alt="">' +
          '<div class="cart-line-info">' +
            '<h4>' + item.name + '</h4>' +
            '<span class="cart-line-price">\u20B9' + item.price + '</span>' +
            '<div class="cart-line-controls">' +
              '<div class="qty-stepper">' +
                '<button type="button" data-action="dec" aria-label="Decrease quantity">\u2212</button>' +
                '<span>' + item.qty + '</span>' +
                '<button type="button" data-action="inc" aria-label="Increase quantity">+</button>' +
              '</div>' +
              '<button type="button" class="cart-line-remove">Remove</button>' +
            '</div>' +
          '</div>';
        line.querySelector('[data-action="dec"]').addEventListener('click', function(){ changeQty(item.id, -1); });
        line.querySelector('[data-action="inc"]').addEventListener('click', function(){ changeQty(item.id, 1); });
        line.querySelector('.cart-line-remove').addEventListener('click', function(){ removeItem(item.id); });
        cartItemsEl.appendChild(line);
      });

      cartSubtotalEl.textContent = '\u20B9' + subtotal;
      bagCountEl.textContent = totalQty;
      bagCountEl.hidden = totalQty === 0;
    };

    cartOpenBtn.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartScrim.addEventListener('click', closeCart);

    document.querySelectorAll('.product-quickadd').forEach(function(btn){
      btn.addEventListener('click', function(){
        var card = btn.closest('.product-card');
        if(!card) return;
        addToCart({
          id: card.getAttribute('data-id'),
          name: card.getAttribute('data-name'),
          price: parseFloat(card.getAttribute('data-price')) || 0,
          image: card.getAttribute('data-image')
        });
      });
    });

    cartCheckoutBtn.addEventListener('click', function(){
      window.alert('Checkout isn\'t connected yet. This button is where your payment or order flow goes.');
    });

    renderCart();
  }

  /* ---------- Escape key closes whichever overlay is currently open ---------- */
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    if(searchOverlay && searchOverlay.classList.contains('is-open')) closeSearch();
    if(cartDrawer && cartDrawer.classList.contains('is-open')) closeCart();
  });

  /* =====================================================================
     SIZE GUIDE MODAL (index.html / category.html only)
  ===================================================================== */
  var sizeGuideOpenBtn  = document.getElementById('sizeGuideOpen');
  var sizeGuideModal    = document.getElementById('sizeGuideModal');
  var sizeGuideScrim    = document.getElementById('sizeGuideScrim');
  var sizeGuideCloseBtn = document.getElementById('sizeGuideClose');
  var openSizeGuideRef; // exposed so the FAQ modal can optionally jump here

  if(sizeGuideOpenBtn && sizeGuideModal && sizeGuideScrim && sizeGuideCloseBtn){
    function openSizeGuide(e){
      if(e) e.preventDefault();
      sizeGuideModal.classList.add('is-open');
      sizeGuideScrim.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }
    function closeSizeGuide(){
      sizeGuideModal.classList.remove('is-open');
      sizeGuideScrim.classList.remove('is-visible');
      document.body.style.overflow = '';
    }
    openSizeGuideRef = openSizeGuide; // strict mode scopes the function above to this block, so expose it via a variable declared outside

    sizeGuideOpenBtn.addEventListener('click', openSizeGuide);
    sizeGuideCloseBtn.addEventListener('click', closeSizeGuide);
    sizeGuideScrim.addEventListener('click', closeSizeGuide);

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && sizeGuideModal.classList.contains('is-open')) closeSizeGuide();
    });
  }

  /* =====================================================================
     SHIPPING & RETURNS / CONTACT MODAL
     Same open/close pattern as the size guide, plus a front-end-only form
     submit. Nothing is actually sent anywhere yet — the submission is
     logged to the console so you can see what would be sent. Point it at
     a real backend or form service (Formspree, your own API, etc.) when
     you're ready to receive these for real.
  ===================================================================== */
  var returnsOpenBtn  = document.getElementById('returnsOpen');
  var returnsModal    = document.getElementById('returnsModal');
  var returnsScrim    = document.getElementById('returnsScrim');
  var returnsCloseBtn = document.getElementById('returnsClose');
  var returnsForm     = document.getElementById('returnsForm');
  var returnsEmail    = document.getElementById('returnsEmail');
  var returnsError    = document.getElementById('returnsError');
  var returnsFormWrap = document.getElementById('returnsFormWrap');
  var returnsThanks   = document.getElementById('returnsThanks');

  if(returnsOpenBtn && returnsModal && returnsScrim && returnsCloseBtn && returnsForm){
    function openReturns(e){
      if(e) e.preventDefault();
      returnsModal.classList.add('is-open');
      returnsScrim.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }
    function closeReturns(){
      returnsModal.classList.remove('is-open');
      returnsScrim.classList.remove('is-visible');
      document.body.style.overflow = '';
      // Reset back to the form view after the close animation finishes
      window.setTimeout(function(){
        returnsFormWrap.hidden = false;
        returnsThanks.hidden = true;
        returnsForm.reset();
        returnsError.textContent = '';
      }, 200);
    }

    returnsOpenBtn.addEventListener('click', openReturns);
    returnsCloseBtn.addEventListener('click', closeReturns);
    returnsScrim.addEventListener('click', closeReturns);

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && returnsModal.classList.contains('is-open')) closeReturns();
    });

    returnsForm.addEventListener('submit', function(e){
      e.preventDefault();

      var email = returnsEmail.value.trim();
      var isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var checkedReasons = Array.prototype.slice.call(
        returnsForm.querySelectorAll('input[name="reason"]:checked')
      );

      if(!isValidEmail){
        returnsError.textContent = 'Please enter a valid email address.';
        returnsEmail.focus();
        return;
      }
      if(checkedReasons.length === 0){
        returnsError.textContent = 'Please select at least one reason.';
        return;
      }
      returnsError.textContent = '';

      // Front-end-only demo — swap this for a real request, e.g.:
      // fetch('/api/returns', { method:'POST', body: JSON.stringify(payload) });
      var payload = {
        email: email,
        reasons: checkedReasons.map(function(cb){ return cb.value; }),
        message: document.getElementById('returnsMessage').value.trim()
      };
      console.log('Returns/contact submission:', payload);

      returnsFormWrap.hidden = true;
      returnsThanks.hidden = false;
    });
  }

  /* =====================================================================
     TRACK ORDER MODAL
     Front-end-only demo: there is no backend here to actually look up an
     order, so this validates the input and shows an honest message rather
     than fabricating a fake shipping status. Wire the submit handler
     below to your real order/shipping platform when ready.
  ===================================================================== */
  var trackOpenBtn  = document.getElementById('trackOpen');
  var trackModal    = document.getElementById('trackModal');
  var trackScrim    = document.getElementById('trackScrim');
  var trackCloseBtn = document.getElementById('trackClose');
  var trackForm     = document.getElementById('trackForm');
  var trackOrderId  = document.getElementById('trackOrderId');
  var trackEmail    = document.getElementById('trackEmail');
  var trackError    = document.getElementById('trackError');
  var trackFormWrap = document.getElementById('trackFormWrap');
  var trackThanks   = document.getElementById('trackThanks');

  if(trackOpenBtn && trackModal && trackScrim && trackCloseBtn && trackForm){
    function openTrack(e){
      if(e) e.preventDefault();
      trackModal.classList.add('is-open');
      trackScrim.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }
    function closeTrack(){
      trackModal.classList.remove('is-open');
      trackScrim.classList.remove('is-visible');
      document.body.style.overflow = '';
      window.setTimeout(function(){
        trackFormWrap.hidden = false;
        trackThanks.hidden = true;
        trackForm.reset();
        trackError.textContent = '';
      }, 200);
    }

    trackOpenBtn.addEventListener('click', openTrack);
    trackCloseBtn.addEventListener('click', closeTrack);
    trackScrim.addEventListener('click', closeTrack);

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && trackModal.classList.contains('is-open')) closeTrack();
    });

    trackForm.addEventListener('submit', function(e){
      e.preventDefault();

      var orderId = trackOrderId.value.trim();
      var email = trackEmail.value.trim();
      var isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if(!orderId){
        trackError.textContent = 'Please enter your order number.';
        trackOrderId.focus();
        return;
      }
      if(!isValidEmail){
        trackError.textContent = 'Please enter a valid email address.';
        trackEmail.focus();
        return;
      }
      trackError.textContent = '';

      // Front-end-only demo — swap this for a real lookup, e.g.:
      // fetch('/api/orders/' + orderId + '?email=' + email)
      console.log('Track-order lookup requested:', { orderId: orderId, email: email });

      trackFormWrap.hidden = true;
      trackThanks.hidden = false;
    });
  }

  /* =====================================================================
     FAQ MODAL
     A simple accordion — each question toggles its own answer
     independently. No dependency on the other modals except an optional
     link from a FAQ answer into the Size Guide modal, if both exist.
  ===================================================================== */
  var faqOpenBtn  = document.getElementById('faqOpen');
  var faqModal    = document.getElementById('faqModal');
  var faqScrim    = document.getElementById('faqScrim');
  var faqCloseBtn = document.getElementById('faqClose');

  if(faqOpenBtn && faqModal && faqScrim && faqCloseBtn){
    function openFaq(e){
      if(e) e.preventDefault();
      faqModal.classList.add('is-open');
      faqScrim.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
    }
    function closeFaq(){
      faqModal.classList.remove('is-open');
      faqScrim.classList.remove('is-visible');
      document.body.style.overflow = '';
    }

    faqOpenBtn.addEventListener('click', openFaq);
    faqCloseBtn.addEventListener('click', closeFaq);
    faqScrim.addEventListener('click', closeFaq);

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && faqModal.classList.contains('is-open')) closeFaq();
    });

    document.querySelectorAll('.faq-item').forEach(function(item){
      var question = item.querySelector('.faq-question');
      if(!question) return;
      question.addEventListener('click', function(){
        item.classList.toggle('is-open');
      });
    });

    // Optional: "Check the Size Guide" link inside the FAQ jumps straight
    // to that modal, if it exists on this page.
    var faqSizeGuideLink = document.getElementById('faqSizeGuideLink');
    if(faqSizeGuideLink && typeof openSizeGuideRef === 'function'){
      faqSizeGuideLink.addEventListener('click', function(e){
        e.preventDefault();
        closeFaq();
        openSizeGuideRef();
      });
    }
  }

  /* =====================================================================
     AUTH TABS + FORMS (login.html only)
     Switches between the Sign In / Create Account forms and validates
     both client-side. There is no backend here — a successful submit
     just confirms the input passed validation and stops there. Wire
     these to your real authentication API/service when ready.
  ===================================================================== */
  var tabSignIn = document.getElementById('tabSignIn');
  var tabSignUp = document.getElementById('tabSignUp');
  var signInForm = document.getElementById('signInForm');
  var signUpForm = document.getElementById('signUpForm');
  var authFoot = document.getElementById('authFoot');

  if(tabSignIn && tabSignUp && signInForm && signUpForm){

    function bindSwitchLink(){
      var link = document.getElementById('switchToSignUp');
      if(!link) return;
      link.addEventListener('click', function(e){
        e.preventDefault();
        tabSignIn.classList.contains('is-active') ? showSignUp() : showSignIn();
      });
    }

    function showSignIn(){
      tabSignIn.classList.add('is-active');
      tabSignIn.setAttribute('aria-selected', 'true');
      tabSignUp.classList.remove('is-active');
      tabSignUp.setAttribute('aria-selected', 'false');
      signInForm.classList.add('is-active');
      signUpForm.classList.remove('is-active');
      if(authFoot){
        authFoot.innerHTML = 'New here? <a href="#" id="switchToSignUp">Create an account</a>';
        bindSwitchLink();
      }
    }
    function showSignUp(){
      tabSignUp.classList.add('is-active');
      tabSignUp.setAttribute('aria-selected', 'true');
      tabSignIn.classList.remove('is-active');
      tabSignIn.setAttribute('aria-selected', 'false');
      signUpForm.classList.add('is-active');
      signInForm.classList.remove('is-active');
      if(authFoot){
        authFoot.innerHTML = 'Already have an account? <a href="#" id="switchToSignUp">Sign in</a>';
        bindSwitchLink();
      }
    }

    tabSignIn.addEventListener('click', showSignIn);
    tabSignUp.addEventListener('click', showSignUp);
    bindSwitchLink();

    var signInEmail    = document.getElementById('signInEmail');
    var signInPassword = document.getElementById('signInPassword');
    var signInError    = document.getElementById('signInError');

    signInForm.addEventListener('submit', function(e){
      e.preventDefault();
      var email = signInEmail.value.trim();
      var isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if(!isValidEmail){
        signInError.textContent = 'Please enter a valid email address.';
        signInEmail.focus();
        return;
      }
      if(!signInPassword.value){
        signInError.textContent = 'Please enter your password.';
        signInPassword.focus();
        return;
      }
      signInError.textContent = '';

      // Front-end-only demo — swap this for a real request, e.g.:
      // fetch('/api/login', { method:'POST', body: JSON.stringify({ email, password }) });
      console.log('Sign-in submitted:', { email: email });
      window.alert('Sign in isn\'t connected to a backend yet — this is where your login request would be sent.');
    });

    var signUpName     = document.getElementById('signUpName');
    var signUpEmail    = document.getElementById('signUpEmail');
    var signUpPassword = document.getElementById('signUpPassword');
    var signUpConfirm  = document.getElementById('signUpConfirm');
    var signUpError    = document.getElementById('signUpError');

    signUpForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = signUpName.value.trim();
      var email = signUpEmail.value.trim();
      var isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if(!name){
        signUpError.textContent = 'Please enter your full name.';
        signUpName.focus();
        return;
      }
      if(!isValidEmail){
        signUpError.textContent = 'Please enter a valid email address.';
        signUpEmail.focus();
        return;
      }
      if(signUpPassword.value.length < 8){
        signUpError.textContent = 'Password must be at least 8 characters.';
        signUpPassword.focus();
        return;
      }
      if(signUpPassword.value !== signUpConfirm.value){
        signUpError.textContent = 'Passwords do not match.';
        signUpConfirm.focus();
        return;
      }
      signUpError.textContent = '';

      // Front-end-only demo — swap this for a real request, e.g.:
      // fetch('/api/signup', { method:'POST', body: JSON.stringify({ name, email, password }) });
      console.log('Sign-up submitted:', { name: name, email: email });
      window.alert('Account creation isn\'t connected to a backend yet — this is where your sign-up request would be sent.');
    });
  }

})();

(function(){
  "use strict";

  /* =====================================================================
     CATEGORY FILTERING (category.html only)
     Reads ?cat= from the URL on load, filters the .product-card elements
     already on this page by their data-category attribute, and keeps the
     URL in sync as tabs are clicked (so the page is linkable/shareable
     and the browser back button works) — all without a page reload.
  ===================================================================== */

  var CATEGORY_LABELS = {
    all: 'All Categories',
    kurti: "Kurti's Set",
    bandhani: 'Bandhani Suit',
    floral: 'Floral',
    sharara: 'Sharara'
  };

  var cards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));
  var tabs  = Array.prototype.slice.call(document.querySelectorAll('.category-tab'));
  var titleEl = document.getElementById('categoryTitle');
  var emptyEl = document.getElementById('categoryEmpty');

  if(cards.length === 0 || tabs.length === 0) return; // safety net if markup is missing

  function getCategoryFromURL(){
    var params = new URLSearchParams(window.location.search);
    var cat = params.get('cat');
    return CATEGORY_LABELS.hasOwnProperty(cat) ? cat : 'all';
  }

  function applyCategory(cat){
    var visibleCount = 0;
    cards.forEach(function(card){
      var matches = (cat === 'all') || (card.getAttribute('data-category') === cat);
      card.style.display = matches ? '' : 'none';
      if(matches) visibleCount += 1;
    });

    tabs.forEach(function(tab){
      tab.classList.toggle('is-active', tab.getAttribute('data-cat') === cat);
    });

    if(titleEl) titleEl.textContent = CATEGORY_LABELS[cat] || 'All Categories';
    if(emptyEl) emptyEl.hidden = visibleCount > 0;

    var url = new URL(window.location.href);
    if(cat === 'all'){
      url.searchParams.delete('cat');
    }else{
      url.searchParams.set('cat', cat);
    }
    window.history.replaceState({}, '', url);
  }

  tabs.forEach(function(tab){
    tab.addEventListener('click', function(e){
      // Filter instantly without a page reload. The anchor's href is left
      // in place on purpose — if JavaScript is ever unavailable, clicking
      // still works as a normal link (category.html reads ?cat= on load).
      e.preventDefault();
      applyCategory(tab.getAttribute('data-cat'));
    });
  });

  // Support the browser back/forward buttons
  window.addEventListener('popstate', function(){
    applyCategory(getCategoryFromURL());
  });

  applyCategory(getCategoryFromURL());

})();