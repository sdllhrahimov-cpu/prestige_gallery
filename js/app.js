// Prestige Gallery - Core Application Logic & Router

// Shopping Cart Store
class CartStore {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('prestige_cart') || '[]');
    this.promoDiscount = 0; // percentage
    this.promoCode = '';
  }

  save() {
    localStorage.setItem('prestige_cart', JSON.stringify(this.items));
    this.renderBadge();
    this.renderDrawer();
  }

  addItem(product) {
    const existingIndex = this.items.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += (product.quantity || 1);
    } else {
      this.items.push({
        id: product.id,
        title: product.title,
        subtitle: product.subtitle || product.stems || 'Эксклюзивная композиция',
        price: product.price,
        priceFormatted: product.priceFormatted,
        image: product.image,
        quantity: product.quantity || 1
      });
    }
    this.save();
    openCartDrawer();
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.save();
  }

  updateQuantity(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeItem(id);
      } else {
        this.save();
      }
    }
  }

  clear() {
    this.items = [];
    this.promoDiscount = 0;
    this.promoCode = '';
    this.save();
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    if (this.promoDiscount > 0) {
      return subtotal * (1 - this.promoDiscount / 100);
    }
    return subtotal;
  }

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  applyPromo(code) {
    const clean = code.trim().toUpperCase();
    if (clean === 'PRESTIGE10' || clean === 'VIP2026') {
      this.promoDiscount = 10;
      this.promoCode = clean;
      this.save();
      return { success: true, message: 'Привилегия 10% успешно активирована!' };
    }
    return { success: false, message: 'Недействительный промокод' };
  }

  renderBadge() {
    const count = this.getCount();
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  renderDrawer() {
    const container = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty-state');
    const footer = document.getElementById('cart-drawer-footer');
    const subtotalEl = document.getElementById('cart-subtotal-price');
    const totalEl = document.getElementById('cart-total-price');
    const discountRow = document.getElementById('cart-discount-row');
    const discountEl = document.getElementById('cart-discount-value');

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      if (footer) footer.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (footer) footer.style.display = 'block';

    const subtotal = this.getSubtotal();
    const total = this.getTotal();

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (totalEl) totalEl.textContent = formatPrice(total);

    if (discountRow) {
      if (this.promoDiscount > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-${this.promoDiscount}% (${formatPrice(subtotal - total)})`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    container.innerHTML = this.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img" />
        <div class="cart-item-info">
          <div class="cart-item-header">
            <h4 class="cart-item-title">${item.title}</h4>
            <button class="cart-item-remove-btn" onclick="window.Cart.removeItem('${item.id}')" title="Удалить">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="cart-item-subtitle">${item.subtitle}</div>
          <div class="cart-item-bottom">
            <div class="quantity-controller">
              <button class="qty-btn" onclick="window.Cart.updateQuantity('${item.id}', -1)">−</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="window.Cart.updateQuantity('${item.id}', 1)">+</button>
            </div>
            <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Helpers
function formatPrice(num) {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " UZS";
}

// Global Toast System
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-message toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <div class="toast-content">${message}</div>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// Global Modals and Drawer Controls
function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('modal-overlay');
  if (drawer && overlay) {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('no-scroll');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('modal-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    // Only remove overlay if no other modal is open
    const openModals = document.querySelectorAll('.modal.active');
    if (openModals.length === 0) {
      overlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  }
}

function openQuickView(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quick-view-modal');
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('quick-view-content');

  content.innerHTML = `
    <div class="quickview-grid">
      <div class="quickview-image-wrap">
        <img src="${product.image}" alt="${product.title}" class="quickview-img" />
        <span class="product-badge badge-${product.badgeType}">${product.badge}</span>
      </div>
      <div class="quickview-details">
        <div class="kicker-tag">${product.categoryName.toUpperCase()}</div>
        <h2 class="quickview-title">${product.title}</h2>
        <div class="quickview-stems">✧ ${product.stems} · ${product.height}</div>
        
        <div class="quickview-price">${product.priceFormatted}</div>
        
        <p class="quickview-desc">${product.description}</p>
        
        <div class="quickview-features">
          <div class="quickview-feat-item">
            <span class="feat-icon">🌿</span>
            <span class="feat-text"><strong>Состав:</strong> ${product.composition}</span>
          </div>
          <div class="quickview-feat-item">
            <span class="feat-icon">🎀</span>
            <span class="feat-text"><strong>Упаковка:</strong> ${product.packaging}</span>
          </div>
          <div class="quickview-feat-item">
            <span class="feat-icon">⚡</span>
            <span class="feat-text"><strong>Доставка по Ташкенту:</strong> ${product.deliveryTime}</span>
          </div>
          <div class="quickview-feat-item">
            <span class="feat-icon">✉️</span>
            <span class="feat-text"><strong>В подарок:</strong> Фирменная открытка с сургучной печатью и подкормка Chrysal</span>
          </div>
        </div>

        <div class="quickview-actions">
          <button class="btn btn-primary btn-lg" onclick="window.Cart.addItem(PRODUCTS_DATA.find(p => p.id === '${product.id}')); closeQuickView(); showToast('${product.title} добавлен в корзину');">
            В КОРЗИНУ · ${product.priceFormatted}
          </button>
          <button class="btn btn-secondary btn-lg" onclick="closeQuickView(); window.openFastOrderModal(PRODUCTS_DATA.find(p => p.id === '${product.id}'));">
            КУПИТЬ В 1 КЛИК
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  const overlay = document.getElementById('modal-overlay');
  if (modal) modal.classList.remove('active');
  const openModals = document.querySelectorAll('.modal.active, .drawer.active');
  if (openModals.length === 0 && overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }
}

// 1-Click Fast Order Modal
let currentFastOrderProduct = null;

function openFastOrderModal(product) {
  currentFastOrderProduct = product;
  const modal = document.getElementById('fast-order-modal');
  const overlay = document.getElementById('modal-overlay');
  const productPreview = document.getElementById('fast-order-product-preview');

  if (productPreview) {
    productPreview.innerHTML = `
      <img src="${product.image}" alt="${product.title}" class="fast-order-thumb" />
      <div class="fast-order-info">
        <h4>${product.title}</h4>
        <p>${product.subtitle || product.stems || 'Премиальная флористика'}</p>
        <div class="fast-order-price">${product.priceFormatted || formatPrice(product.price)}</div>
      </div>
    `;
  }

  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeFastOrderModal() {
  const modal = document.getElementById('fast-order-modal');
  const overlay = document.getElementById('modal-overlay');
  if (modal) modal.classList.remove('active');
  const openModals = document.querySelectorAll('.modal.active, .drawer.active');
  if (openModals.length === 0 && overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }
}

// Checkout Modal for Full Cart
function openCheckoutModal() {
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  const overlay = document.getElementById('modal-overlay');
  const summaryEl = document.getElementById('checkout-order-summary');

  const subtotal = window.Cart.getSubtotal();
  const total = window.Cart.getTotal();

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="checkout-summary-list">
        ${window.Cart.items.map(item => `
          <div class="checkout-sum-item">
            <span>${item.title} × ${item.quantity}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
          </div>
        `).join('')}
      </div>
      <div class="checkout-sum-total">
        <span>К оплате:</span>
        <span class="total-highlight">${formatPrice(total)}</span>
      </div>
    `;
  }

  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  const overlay = document.getElementById('modal-overlay');
  if (modal) modal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

// Router & Screen Management
function navigateTo(routeId) {
  const validRoutes = ['home', 'catalog', 'roses', 'delivery'];
  if (!validRoutes.includes(routeId)) {
    routeId = 'home';
  }

  // Hide all screens
  document.querySelectorAll('.screen-view').forEach(screen => {
    screen.classList.remove('active');
  });

  // Show active screen
  const targetScreen = document.getElementById(`screen-${routeId}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  // Update navigation items active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.route === routeId) {
      link.classList.add('active');
    }
  });

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update location hash without trigger loop
  if (window.location.hash !== `#${routeId}`) {
    history.pushState(null, '', `#${routeId}`);
  }

  // Re-trigger AOS-like fade in
  if (targetScreen) {
    targetScreen.classList.add('fade-in');
    setTimeout(() => targetScreen.classList.remove('fade-in'), 600);
  }

  // Refresh AOS scroll positions for the new active view
  setTimeout(() => {
    if (window.AOS) {
      window.AOS.refreshHard();
    }
  }, 120);
}

// Render Products Grid in Catalog & Home
function renderCatalog(filter = 'all', sort = 'popular') {
  const grid = document.getElementById('catalog-products-grid');
  if (!grid) return;

  let filtered = [...PRODUCTS_DATA];
  if (filter !== 'all') {
    filtered = filtered.filter(p => p.category === filter);
  }

  if (sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  const countBadge = document.getElementById('catalog-items-count');
  if (countBadge) {
    countBadge.textContent = `Показано ${filtered.length} из ${PRODUCTS_DATA.length} букетов`;
  }

  grid.innerHTML = filtered.map((product, index) => `
    <div class="product-card" data-id="${product.id}" data-aos="fade-up" data-aos-duration="580" data-aos-delay="${(index % 4) * 60}">
      <div class="product-card-media" onclick="openQuickView('${product.id}')">
        <img src="${product.image}" alt="${product.title}" class="product-img" loading="lazy" decoding="async" />
        <span class="product-badge badge-${product.badgeType}">${product.badge}</span>
        <button class="fav-btn" onclick="event.stopPropagation(); toggleFavorite('${product.id}', this)" title="В избранное">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <div class="quick-view-overlay">БЫСТРЫЙ ПРОСМОТР</div>
      </div>
      <div class="product-card-body">
        <div class="product-meta">
          <span class="product-cat">${product.categoryName.toUpperCase()}</span>
          <span class="product-stems-tag">${product.stems}</span>
        </div>
        <h3 class="product-title" onclick="openQuickView('${product.id}')">${product.title}</h3>
        <div class="product-price-row">
          <div class="price-val">${product.priceFormatted}</div>
          <span class="delivery-pill">от 60 мин</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-primary btn-sm flex-1" onclick="window.Cart.addItem(PRODUCTS_DATA.find(p => p.id === '${product.id}')); showToast('${product.title} добавлен в корзину');">
            В КОРЗИНУ
          </button>
          <button class="btn btn-secondary btn-sm" onclick="openFastOrderModal(PRODUCTS_DATA.find(p => p.id === '${product.id}'));">
            В 1 КЛИК
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.AOS) {
    setTimeout(() => window.AOS.refresh(), 50);
  }
  if (window.initDragScroll) {
    setTimeout(window.initDragScroll, 60);
  }
}

function renderHomeBestsellers() {
  const container = document.getElementById('home-bestsellers-grid');
  if (!container) return;

  const bestsellers = PRODUCTS_DATA.filter(p => p.isBestseller).slice(0, 12);

  container.innerHTML = bestsellers.map((product, index) => `
    <div class="product-card" data-id="${product.id}" data-aos="fade-up" data-aos-duration="580" data-aos-delay="${(index % 4) * 60}">
      <div class="product-card-media" onclick="openQuickView('${product.id}')">
        <img src="${product.image}" alt="${product.title}" class="product-img" loading="lazy" decoding="async" />
        <span class="product-badge badge-${product.badgeType}">${product.badge}</span>
        <button class="fav-btn" onclick="event.stopPropagation(); toggleFavorite('${product.id}', this)" title="В избранное">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <div class="quick-view-overlay">БЫСТРЫЙ ПРОСМОТР</div>
      </div>
      <div class="product-card-body">
        <div class="product-meta">
          <span class="product-cat">${product.categoryName.toUpperCase()}</span>
          <span class="product-stems-tag">${product.stems}</span>
        </div>
        <h3 class="product-title" onclick="openQuickView('${product.id}')">${product.title}</h3>
        <div class="product-price-row">
          <div class="price-val">${product.priceFormatted}</div>
          <span class="delivery-pill">от 60 мин</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-primary btn-sm flex-1" onclick="window.Cart.addItem(PRODUCTS_DATA.find(p => p.id === '${product.id}')); showToast('${product.title} добавлен в корзину');">
            В КОРЗИНУ
          </button>
          <button class="btn btn-secondary btn-sm" onclick="openFastOrderModal(PRODUCTS_DATA.find(p => p.id === '${product.id}'));">
            В 1 КЛИК
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.AOS) {
    setTimeout(() => window.AOS.refresh(), 50);
  }
  if (window.initDragScroll) {
    setTimeout(window.initDragScroll, 60);
  }
}

// Render dedicated Savatlar (Flower Baskets) on Home page
function renderHomeSavatlar() {
  const container = document.getElementById('home-savatlar-grid');
  if (!container) return;

  const savatlarList = PRODUCTS_DATA.filter(p => p.category === 'savatlar');

  container.innerHTML = savatlarList.map((product, index) => `
    <div class="product-card" data-id="${product.id}" data-aos="fade-up" data-aos-duration="580" data-aos-delay="${(index % 3) * 60}">
      <div class="product-card-media" onclick="openQuickView('${product.id}')">
        <img src="${product.image}" alt="${product.title}" class="product-img" loading="lazy" decoding="async" />
        <span class="product-badge badge-${product.badgeType}">${product.badge}</span>
        <button class="fav-btn" onclick="event.stopPropagation(); toggleFavorite('${product.id}', this)" title="В избранное">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <div class="quick-view-overlay">БЫСТРЫЙ ПРОСМОТР</div>
      </div>
      <div class="product-card-body">
        <div class="product-meta">
          <span class="product-cat">КОРОЛЕВСКИЕ САВАТЛАР</span>
          <span class="product-stems-tag">${product.stems}</span>
        </div>
        <h3 class="product-title" onclick="openQuickView('${product.id}')">${product.title}</h3>
        <div class="product-price-row">
          <div class="price-val">${product.priceFormatted}</div>
          <span class="delivery-pill">VIP Аквабокс</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-primary btn-sm flex-1" onclick="window.Cart.addItem(PRODUCTS_DATA.find(p => p.id === '${product.id}')); showToast('${product.title} добавлен в корзину');">
            В КОРЗИНУ
          </button>
          <button class="btn btn-secondary btn-sm" onclick="openFastOrderModal(PRODUCTS_DATA.find(p => p.id === '${product.id}'));">
            В 1 КЛИК
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.AOS) {
    setTimeout(() => window.AOS.refresh(), 50);
  }
  if (window.initDragScroll) {
    setTimeout(window.initDragScroll, 60);
  }
}

// Direct filter and navigate to catalog category
function filterCatalogBy(category) {
  navigateTo('catalog');
  setTimeout(() => {
    document.querySelectorAll('.catalog-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === category);
    });
    const sortSelect = document.getElementById('catalog-sort-select');
    const sort = sortSelect ? sortSelect.value : 'popular';
    renderCatalog(category, sort);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 80);
}

function renderRosesMonobouquets() {
  const container = document.getElementById('roses-monobouquets-grid');
  if (!container) return;

  const rosesList = PRODUCTS_DATA.filter(p => p.category === 'roses' || p.category === 'boxes' || p.title.includes('Rose') || p.title.includes('Hatbox'));

  container.innerHTML = rosesList.map((product, index) => `
    <div class="product-card" data-id="${product.id}" data-aos="fade-up" data-aos-duration="580" data-aos-delay="${(index % 3) * 60}">
      <div class="product-card-media" onclick="openQuickView('${product.id}')">
        <img src="${product.image}" alt="${product.title}" class="product-img" loading="lazy" decoding="async" />
        <span class="product-badge badge-${product.badgeType}">${product.badge}</span>
        <button class="fav-btn" onclick="event.stopPropagation(); toggleFavorite('${product.id}', this)" title="В избранное">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <div class="quick-view-overlay">БЫСТРЫЙ ПРОСМОТР</div>
      </div>
      <div class="product-card-body">
        <div class="product-meta">
          <span class="product-cat">КОРОЛЕВСКИЕ РОЗЫ</span>
          <span class="product-stems-tag">${product.stems}</span>
        </div>
        <h3 class="product-title" onclick="openQuickView('${product.id}')">${product.title}</h3>
        <div class="product-price-row">
          <div class="price-val">${product.priceFormatted}</div>
          <span class="delivery-pill">60–90 мин</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-primary btn-sm flex-1" onclick="window.Cart.addItem(PRODUCTS_DATA.find(p => p.id === '${product.id}')); showToast('${product.title} добавлен в корзину');">
            В КОРЗИНУ
          </button>
          <button class="btn btn-secondary btn-sm" onclick="openFastOrderModal(PRODUCTS_DATA.find(p => p.id === '${product.id}'));">
            В 1 КЛИК
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.AOS) {
    setTimeout(() => window.AOS.refresh(), 50);
  }
}

// Favorites functionality
let favorites = JSON.parse(localStorage.getItem('prestige_favs') || '[]');

function toggleFavorite(id, btn) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(item => item !== id);
    btn.classList.remove('active');
    showToast('Удалено из избранного', 'info');
  } else {
    favorites.push(id);
    btn.classList.add('active');
    showToast('Добавлено в избранное', 'success');
  }
  localStorage.setItem('prestige_favs', JSON.stringify(favorites));
  updateFavoritesBadge();
}

function updateFavoritesBadge() {
  const badges = document.querySelectorAll('.fav-count-badge');
  badges.forEach(badge => {
    badge.textContent = favorites.length;
    badge.style.display = favorites.length > 0 ? 'flex' : 'none';
  });
}

// ==========================================================================
// Theme Management (Light Mode Default, Dark Mode Option)
// ==========================================================================
function getStoredTheme() {
  try {
    const saved = localStorage.getItem('prestige_theme');
    return saved === 'dark' ? 'dark' : 'light';
  } catch (e) {
    return 'light';
  }
}

function applyTheme(theme, notify = false) {
  const current = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', current);

  try {
    localStorage.setItem('prestige_theme', current);
  } catch (e) {}

  // Update desktop toggle button
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    if (current === 'dark') {
      toggleBtn.title = 'Переключить на светлую тему';
      toggleBtn.setAttribute('aria-label', 'Переключить на светлую тему');
    } else {
      toggleBtn.title = 'Переключить на тёмную тему';
      toggleBtn.setAttribute('aria-label', 'Переключить на тёмную тему');
    }
  }

  // Update mobile status text
  const mobileStatusText = document.getElementById('mobile-theme-text');
  if (mobileStatusText) {
    mobileStatusText.textContent = current === 'dark' ? 'Тёмная' : 'Светлая';
  }

  if (notify && typeof showToast === 'function') {
    const msg = current === 'dark'
      ? '🌙 Тёмная тема активирована'
      : '☀️ Светлая тема активирована';
    showToast(msg, 'info');
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.classList.add('theme-transitioning');
  applyTheme(newTheme, true);

  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 400);
}

function initTheme() {
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme, false);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }

  const mobileToggleBtn = document.getElementById('mobile-theme-toggle');
  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme (Defaults to Light Mode)
  initTheme();

  // Initialize AOS (Animate On Scroll)
  if (window.AOS) {
    window.AOS.init({
      duration: 580,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      once: true,
      mirror: false,
      offset: 35
    });
  }

  // Initialize Cart
  window.Cart = new CartStore();
  window.Cart.renderBadge();
  window.Cart.renderDrawer();
  updateFavoritesBadge();

  // Initialize Router
  const initialHash = window.location.hash.replace('#', '') || 'home';
  navigateTo(initialHash);

  window.addEventListener('hashchange', () => {
    const route = window.location.hash.replace('#', '') || 'home';
    navigateTo(route);
  });

  // Navigation Links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = link.dataset.route;
      navigateTo(route);
      // Close mobile menu if open
      const mobileNav = document.getElementById('mobile-nav');
      if (mobileNav) mobileNav.classList.remove('active');
    });
  });

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
    });
  }

  // Horizontal drag-to-scroll helper for products-grid
  function initDragScroll() {
    document.querySelectorAll('.products-grid').forEach(slider => {
      if (!slider || slider.dataset.dragInit) return;
      slider.dataset.dragInit = 'true';
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      slider.addEventListener('mousedown', (e) => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        isDown = true;
        slider.style.cursor = 'grabbing';
        slider.style.userSelect = 'none';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
      });

      window.addEventListener('mouseup', () => {
        if (isDown) {
          isDown = false;
          slider.style.cursor = '';
          slider.style.userSelect = '';
        }
      });

      slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.4;
        slider.scrollLeft = scrollLeft - walk;
      });
    });
  }
  window.initDragScroll = initDragScroll;

  // Render initial products
  renderHomeBestsellers();
  renderHomeSavatlar();
  renderCatalog('all', 'popular');
  renderRosesMonobouquets();
  setTimeout(initDragScroll, 80);

  // Initialize Grand Rose Builder
  if (document.getElementById('rose-builder-wrapper')) {
    window.roseBuilderInstance = new RoseBuilder();
  }

  // Category Filter Pills in Catalog
  document.querySelectorAll('.catalog-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.catalog-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const sortSelect = document.getElementById('catalog-sort-select');
      const sort = sortSelect ? sortSelect.value : 'popular';
      renderCatalog(filter, sort);
    });
  });

  // Sort dropdown
  const sortSelect = document.getElementById('catalog-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const activeFilterBtn = document.querySelector('.catalog-filter-btn.active');
      const filter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
      renderCatalog(filter, sortSelect.value);
    });
  }

  // Cart Drawer open/close buttons
  document.querySelectorAll('.cart-open-btn').forEach(btn => {
    btn.addEventListener('click', () => openCartDrawer());
  });

  const cartCloseBtn = document.getElementById('cart-drawer-close');
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => closeCartDrawer());

  // Modal Overlay click closes modals
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeCartDrawer();
      closeQuickView();
      closeFastOrderModal();
      closeCheckoutModal();
    });
  }

  // Promo code apply in cart
  const promoBtn = document.getElementById('cart-promo-apply-btn');
  const promoInput = document.getElementById('cart-promo-input');
  if (promoBtn && promoInput) {
    promoBtn.addEventListener('click', () => {
      const res = window.Cart.applyPromo(promoInput.value);
      showToast(res.message, res.success ? 'success' : 'error');
    });
  }

  // FAQ Accordions
  document.querySelectorAll('.faq-item-header').forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.closest('.faq-item');
      const wasOpen = parent.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
      if (!wasOpen) {
        parent.classList.add('active');
      }
    });
  });

  // Fast Order Form Submit
  const fastOrderForm = document.getElementById('fast-order-form');
  if (fastOrderForm) {
    fastOrderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = document.getElementById('fast-order-phone').value;
      const name = document.getElementById('fast-order-name').value;
      const address = document.getElementById('fast-order-address').value;
      
      closeFastOrderModal();
      showToast(`Благодарим, ${name}! Заказ принят. Консьерж свяжется по номеру ${phone} через 5 минут.`, 'success');
      fastOrderForm.reset();
    });
  }

  // Checkout Full Order Form Submit
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('checkout-name').value;
      const phone = document.getElementById('checkout-phone').value;
      
      window.Cart.clear();
      closeCheckoutModal();
      showToast(`Заказ оформлен! Наш консьерж свяжется с вами: ${phone}`, 'success');
      checkoutForm.reset();
    });
  }

  // Delivery Address Checker in Delivery screen
  const addressCheckBtn = document.getElementById('delivery-check-btn');
  const addressInput = document.getElementById('delivery-address-input');
  const checkResult = document.getElementById('delivery-check-result');

  if (addressCheckBtn && addressInput && checkResult) {
    addressCheckBtn.addEventListener('click', () => {
      const val = addressInput.value.trim().toLowerCase();
      if (!val) {
        showToast('Пожалуйста, введите адрес доставки', 'info');
        return;
      }

      if (val.includes('мирабад') || val.includes('яккасарай') || val.includes('юнусабад') || val.includes('шайхантахур') || val.includes('центр') || val.includes('темур') || val.includes('сити')) {
        checkResult.innerHTML = `
          <div class="check-result-success">
            <strong>Зона 1: Центральный Ташкент</strong><br/>
            Курьер в белых перчатках доставит букет за <strong>60 минут</strong>. Доставка <strong>БЕСПЛАТНА</strong> при заказе от 1 000 000 UZS.
          </div>
        `;
      } else if (val.includes('чиланзар') || val.includes('сергели') || val.includes('яшнабад') || val.includes('учтепа') || val.includes('алмазар')) {
        checkResult.innerHTML = `
          <div class="check-result-info">
            <strong>Зона 2: Расширенный Ташкент</strong><br/>
            Время доставки: <strong>90–120 минут</strong>. Фиксированный тариф доставки: <strong>50 000 UZS</strong> (Бесплатно от 2 000 000 UZS).
          </div>
        `;
      } else {
        checkResult.innerHTML = `
          <div class="check-result-warning">
            <strong>Зона 3: Ташкентская область</strong><br/>
            Индивидуальный консьерж-маршрут с термобоксом. Тариф: <strong>120 000 UZS</strong>. Точное время согласует менеджер.
          </div>
        `;
      }
      checkResult.style.display = 'block';
    });
  }

  // Language switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.dataset.lang;
      showToast(`Язык переключен: ${lang.toUpperCase()}`, 'info');
    });
  });

  // Initialize Prestige Luxury Intro & Welcome Animation
  initPrestigeIntroAnimation();
});

// ==========================================================================
// PRESTIGE LUXURY INTRO & WELCOME ANIMATION CONTROLLER
// ==========================================================================
function initPrestigeIntroAnimation() {
  const overlay = document.getElementById('prestige-intro-overlay');
  if (!overlay) return;

  const loaderPhase = document.getElementById('intro-loader-phase');
  const welcomePhase = document.getElementById('intro-welcome-phase');
  const counterVal = document.getElementById('intro-counter-val');
  const progressFill = document.getElementById('intro-progress-fill');
  const statusText = document.getElementById('intro-status-text');
  const skipBtn = document.getElementById('intro-skip-btn');
  const enterBtn = document.getElementById('intro-enter-btn');
  const cardTrigger = document.getElementById('welcome-card-click-trigger');
  const timerLine = document.getElementById('welcome-timer-line');

  let currentPercent = 0;
  let isClosed = false;
  let autoEnterTimer = null;
  let timerInterval = null;

  // Lock body scroll during intro
  document.body.classList.add('intro-active');

  function closeIntro() {
    if (isClosed) return;
    isClosed = true;

    if (autoEnterTimer) clearTimeout(autoEnterTimer);
    if (timerInterval) clearInterval(timerInterval);

    overlay.classList.add('intro-completed');
    document.body.classList.remove('intro-active');

    // Trigger AOS animations for page elements
    if (window.AOS) {
      setTimeout(() => window.AOS.refresh(), 100);
    }

    setTimeout(() => {
      overlay.style.display = 'none';
    }, 900);
  }

  function startWelcomePhase() {
    if (isClosed) return;

    // Transition out loader phase
    if (loaderPhase) loaderPhase.classList.add('phase-exit');

    // Transition in welcome phase
    setTimeout(() => {
      if (isClosed) return;
      if (welcomePhase) welcomePhase.classList.add('phase-active');

      // Animate progress line over 3.2 seconds
      const autoDismissDuration = 3200; // 3.2 seconds
      const startTime = Date.now();

      timerInterval = setInterval(() => {
        if (isClosed) {
          clearInterval(timerInterval);
          return;
        }
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, (elapsed / autoDismissDuration) * 100);
        if (timerLine) timerLine.style.width = pct + '%';
        if (pct >= 100) {
          clearInterval(timerInterval);
        }
      }, 30);

      autoEnterTimer = setTimeout(() => {
        closeIntro();
      }, autoDismissDuration);
    }, 400);
  }

  // Event Listeners for smooth close
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeIntro();
    });
  }
  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeIntro();
    });
  }
  if (cardTrigger) {
    cardTrigger.addEventListener('click', () => {
      closeIntro();
    });
  }
  overlay.addEventListener('click', (e) => {
    // If welcome phase is active and user clicked anywhere on overlay, close
    if (welcomePhase && welcomePhase.classList.contains('phase-active')) {
      closeIntro();
    }
  });

  // Keyboard accessibility (ESC or Space/Enter to enter)
  window.addEventListener('keydown', (e) => {
    if (!isClosed && (e.key === 'Escape' || e.key === 'Enter')) {
      closeIntro();
    }
  });

  // Status updates matching milestones
  const statusMessages = [
    { at: 0, text: 'Инициализация коллекции Prestige...' },
    { at: 35, text: 'Загрузка шедевров флористики...' },
    { at: 70, text: 'Подготовка персонального приветствия...' },
    { at: 96, text: 'Добро пожаловать в Prestige Gallery!' }
  ];

  // Number Counter Animation using requestAnimationFrame with easeOut
  const duration = 1800; // 1.8 seconds for smooth loading
  const startTimestamp = performance.now();

  function updateLoader(timestamp) {
    if (isClosed) return;

    const elapsed = timestamp - startTimestamp;
    const progress = Math.min(1, elapsed / duration);

    // Smooth cubic ease out
    const easeOut = 1 - Math.pow(1 - progress, 3);
    currentPercent = Math.round(easeOut * 100);

    if (counterVal) counterVal.textContent = currentPercent;
    if (progressFill) progressFill.style.width = currentPercent + '%';

    // Update status message
    for (let i = statusMessages.length - 1; i >= 0; i--) {
      if (currentPercent >= statusMessages[i].at) {
        if (statusText && statusText.textContent !== statusMessages[i].text) {
          statusText.textContent = statusMessages[i].text;
        }
        break;
      }
    }

    if (progress < 1) {
      requestAnimationFrame(updateLoader);
    } else {
      // Hit 100%
      if (counterVal) counterVal.textContent = '100';
      if (progressFill) {
        progressFill.style.width = '100%';
        progressFill.classList.add('fill-completed');
      }
      if (statusText) {
        statusText.textContent = 'Добро пожаловать в Prestige Gallery!';
      }

      setTimeout(() => {
        if (welcomePhase) {
          startWelcomePhase();
        } else {
          closeIntro();
        }
      }, 480);
    }
  }

  requestAnimationFrame(updateLoader);

  // Global helper to replay intro for testing/demo
  window.replayPrestigeIntro = function () {
    isClosed = false;
    overlay.style.display = 'flex';
    overlay.classList.remove('intro-completed');
    if (welcomePhase) welcomePhase.classList.remove('phase-active');
    if (loaderPhase) loaderPhase.classList.remove('phase-exit');
    if (progressFill) {
      progressFill.style.width = '0%';
      progressFill.classList.remove('fill-completed');
    }
    if (counterVal) counterVal.textContent = '0';
    if (timerLine) timerLine.style.width = '0%';
    initPrestigeIntroAnimation();
  };
}

// Expose globals
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
window.openFastOrderModal = openFastOrderModal;
window.closeFastOrderModal = closeFastOrderModal;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.navigateTo = navigateTo;
window.showToast = showToast;
window.toggleFavorite = toggleFavorite;
window.renderHomeSavatlar = renderHomeSavatlar;
window.filterCatalogBy = filterCatalogBy;
window.initPrestigeIntroAnimation = initPrestigeIntroAnimation;
window.toggleTheme = toggleTheme;
window.applyTheme = applyTheme;

