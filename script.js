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
    if(e.key === 'Escape'){
      if(searchOverlay.classList.contains('is-open')) closeSearch();
      if(cartDrawer.classList.contains('is-open')) closeCart();
    }
  });

  /* =====================================================================
     CART DRAWER
     Front-end-only cart: items live in localStorage under "yc_cart" so
     they survive a page reload on the same browser. There is no server
     and no payment processing — the "Checkout" button below is a stub;
     wire it to your real checkout (Stripe Checkout, a WhatsApp order-
     message link built from `cart`, your own backend, etc.) when ready.
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

  function loadCart(){
    try{
      var raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      return [];
    }
  }
  function saveCart(){
    try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }catch(e){ /* storage unavailable — cart just won't persist */ }
  }

  var cart = loadCart();

  function openCart(){
    cartDrawer.classList.add('is-open');
    cartScrim.classList.add('is-visible');
    cartOpenBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeCart(){
    cartDrawer.classList.remove('is-open');
    cartScrim.classList.remove('is-visible');
    cartOpenBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function addToCart(product){
    var existing = cart.filter(function(item){ return item.id === product.id; })[0];
    if(existing){
      existing.qty += 1;
    }else{
      cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
    }
    saveCart();
    renderCart();
    openCart();
  }
  function changeQty(id, delta){
    var item = cart.filter(function(i){ return i.id === id; })[0];
    if(!item) return;
    item.qty += delta;
    if(item.qty <= 0){
      cart = cart.filter(function(i){ return i.id !== id; });
    }
    saveCart();
    renderCart();
  }
  function removeItem(id){
    cart = cart.filter(function(i){ return i.id !== id; });
    saveCart();
    renderCart();
  }

  function renderCart(){
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
  }

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
    // Stub — replace with your real checkout flow.
    window.alert('Checkout isn\'t connected yet. This button is where your payment or order flow goes.');
  });

  renderCart();

  /* =====================================================================
     SIZE GUIDE MODAL
     A simple popup showing the size chart table already in the HTML.
     Guarded with the `if` below so this does nothing on any page that
     doesn't have the modal markup — safe to include everywhere.
  ===================================================================== */
  var sizeGuideOpenBtn  = document.getElementById('sizeGuideOpen');
  var sizeGuideModal    = document.getElementById('sizeGuideModal');
  var sizeGuideScrim    = document.getElementById('sizeGuideScrim');
  var sizeGuideCloseBtn = document.getElementById('sizeGuideClose');

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

    sizeGuideOpenBtn.addEventListener('click', openSizeGuide);
    sizeGuideCloseBtn.addEventListener('click', closeSizeGuide);
    sizeGuideScrim.addEventListener('click', closeSizeGuide);

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && sizeGuideModal.classList.contains('is-open')) closeSizeGuide();
    });
  }

})();