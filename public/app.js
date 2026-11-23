const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem("kravon_cart") || "[]"),
  currency: "USD",
  rates: { USD: 1.0, EUR: 0.92 },
  selectedCategory: "All",
  searchQuery: "",
  sortBy: "featured",
  activeModalProduct: null,
  activeModalVariant: null,
  appliedCoupon: null,
  currentPage: 1,
  pageSize: 16
};

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  bindEventListeners();
  bindPolicyHandlers();
  bindConciergeAndNewsletter();
  bindSupportDrawer();
  updateCartDisplay();
  await fetchSystemStatus();
  await loadCatalog();
}

function bindEventListeners() {
  const currencyPicker = document.getElementById("currencySelect");
  if (currencyPicker) {
    currencyPicker.addEventListener("change", (e) => {
      state.currency = e.target.value;
      renderCatalog();
      updateCartDisplay();
    });
  }

  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("searchClearBtn");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      state.currentPage = 1;
      if (clearBtn) {
        clearBtn.style.display = state.searchQuery ? "block" : "none";
      }
      renderCatalog();
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      state.searchQuery = "";
      state.currentPage = 1;
      clearBtn.style.display = "none";
      renderCatalog();
      searchInput.focus();
    });
  }

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      state.sortBy = e.target.value;
      renderCatalog();
    });
  }

  const bagTrigger = document.getElementById("bagTriggerBtn");
  const overlay = document.getElementById("drawerOverlay");
  const drawer = document.getElementById("cartDrawer");
  const closeDrawerBtn = document.getElementById("drawerCloseBtn");

  if (bagTrigger && overlay && drawer) {
    bagTrigger.addEventListener("click", () => openDrawer());
    overlay.addEventListener("click", () => closeDrawer());
  }

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener("click", () => closeDrawer());
  }

  const applyCouponBtn = document.getElementById("applyCouponBtn");
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener("click", () => handleApplyCoupon());
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => handleCheckoutExecution());
  }

  const custCountrySelect = document.getElementById("custCountry");
  if (custCountrySelect) {
    custCountrySelect.addEventListener("change", () => updateShippingEstimate());
  }
  updateShippingEstimate();

  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => closeModal());
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  const policyModalBackdrop = document.getElementById("policyModalBackdrop");
  const policyModalCloseBtn = document.getElementById("policyModalCloseBtn");
  if (policyModalCloseBtn) {
    policyModalCloseBtn.addEventListener("click", () => closePolicyModal());
  }
  if (policyModalBackdrop) {
    policyModalBackdrop.addEventListener("click", (e) => {
      if (e.target === policyModalBackdrop) closePolicyModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closePolicyModal();
      closeDrawer();
    }
  });
}

function formatPrice(usdAmount) {
  const rate = state.rates[state.currency] || 1.0;
  const converted = usdAmount * rate;
  const symbol = state.currency === "EUR" ? "€" : "$";
  const uzs = Math.round(usdAmount * 12850).toLocaleString();
  return `${symbol}${converted.toFixed(2)} <span class="uzs-tag">≈ ${uzs} UZS</span>`;
}

async function fetchSystemStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    if (data.rates) {
      state.rates = { ...state.rates, ...data.rates };
    }
  } catch (err) {}
}

async function loadCatalog() {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (data.success && Array.isArray(data.products)) {
      state.products = data.products;
      renderCategoryNav();
      renderCatalog();
    }
  } catch (err) {}
}

function renderCategoryNav() {
  const navContainer = document.getElementById("categoryNav");
  if (!navContainer) return;

  const categories = ["All", ...new Set(state.products.map(p => p.category))];

  navContainer.innerHTML = categories.map(cat => {
    const isActive = cat.toLowerCase() === state.selectedCategory.toLowerCase() ? "active" : "";
    const label = cat === "All" ? "All Items" : cat;
    return `<button class="cat-btn ${isActive}" data-category="${cat}">${label}</button>`;
  }).join("");

  navContainer.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.selectedCategory = btn.getAttribute("data-category");
      state.currentPage = 1;
      navContainer.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderCatalog();
    });
  });
}

function renderCatalog() {
  const container = document.getElementById("catalogGrid");
  if (!container) return;

  let filtered = [...state.products];

  if (state.selectedCategory !== "All") {
    filtered = filtered.filter(p => p.category.toLowerCase() === state.selectedCategory.toLowerCase());
  }

  if (state.searchQuery) {
    const q = state.searchQuery;
    filtered = filtered.filter(p => {
      const titleMatch = (p.title || "").toLowerCase().includes(q);
      const taglineMatch = (p.tagline || "").toLowerCase().includes(q);
      const descMatch = (p.description || "").toLowerCase().includes(q);
      const categoryMatch = (p.category || "").toLowerCase().includes(q);
      const tagsMatch = Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q));
      const matMatch = (p.materials || "").toLowerCase().includes(q);
      return titleMatch || taglineMatch || descMatch || categoryMatch || tagsMatch || matMatch;
    });
  }

  if (state.sortBy === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === "rating-desc") {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state-box">
      <h3 class="empty-state-title">No items found</h3>
      <p class="empty-state-sub">Try searching with another keyword or select a different category.</p>
    </div>`;
    renderPaginationControls(0);
    return;
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / state.pageSize) || 1;
  if (state.currentPage > totalPages) state.currentPage = 1;
  const start = (state.currentPage - 1) * state.pageSize;
  const paginated = filtered.slice(start, start + state.pageSize);

  container.innerHTML = paginated.map(product => {
    const primaryVariant = product.variants[0];
    const initialImg = product.images[0];

    return `
      <article class="product-card" id="card_${product.id}">
        <div class="card-img-wrap" onclick="openQuickView('${product.id}')" tabindex="0" role="button" aria-label="View ${product.title}">
          <img class="card-img" id="img_${product.id}" src="${initialImg}" alt="${product.title}" loading="lazy">
        </div>
        <div class="card-body">
          <div class="card-meta-row">
            <span class="rating-badge">★ ${(product.rating || 4.9).toFixed(1)} (${product.listedNum || product.reviewsCount || 100})</span>
            <span class="stock-badge">${(product.stockCount || 100).toLocaleString()} IN FACTORY</span>
          </div>
          <h3 class="card-title" onclick="openQuickView('${product.id}')">${product.title}</h3>

          <div class="swatch-row" role="group" aria-label="Color options">
            ${product.variants.map((v, i) => `
              <button 
                type="button"
                class="swatch-btn ${i === 0 ? "active" : ""}" 
                style="background: ${v.hex};" 
                title="${v.title}"
                aria-label="${v.title}"
                onclick="switchCardVariant('${product.id}', '${v.id}', ${v.imageIndex || 0}, this)">
              </button>
            `).join("")}
          </div>

          <div class="card-footer">
            <span class="card-price" id="price_${product.id}">${formatPrice(primaryVariant.price)}</span>
            <button class="btn-add" id="addBtn_${product.id}" onclick="pushItemToCart('${product.id}', '${primaryVariant.id}')">
              Add to Bag
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
  const wrap = document.getElementById("paginationWrap");
  if (!wrap) return;
  if (totalPages <= 1) {
    wrap.innerHTML = "";
    return;
  }

  let buttons = "";
  if (state.currentPage > 1) {
    buttons += `<button class="page-nav-btn" onclick="changePage(${state.currentPage - 1})">← Prev</button>`;
  }
  for (let i = 1; i <= totalPages; i++) {
    const active = i === state.currentPage ? "active" : "";
    buttons += `<button class="page-num-btn ${active}" onclick="changePage(${i})">${i}</button>`;
  }
  if (state.currentPage < totalPages) {
    buttons += `<button class="page-nav-btn" onclick="changePage(${state.currentPage + 1})">Next →</button>`;
  }
  wrap.innerHTML = `<div class="pagination-inner">${buttons}</div>`;
}

function changePage(page) {
  state.currentPage = page;
  renderCatalog();
  const target = document.getElementById("catalogGrid");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
window.changePage = changePage;

function switchCardVariant(productId, variantId, imageIndex, element) {
  const card = document.getElementById(`card_${productId}`);
  if (!card) return;

  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const variant = product.variants.find(v => v.id === variantId);
  if (!variant) return;

  const imgEl = document.getElementById(`img_${productId}`);
  if (imgEl && product.images && product.images[imageIndex]) {
    imgEl.src = product.images[imageIndex];
  }

  const priceEl = document.getElementById(`price_${productId}`);
  if (priceEl) {
    priceEl.innerHTML = formatPrice(variant.price);
  }

  const addBtn = document.getElementById(`addBtn_${productId}`);
  if (addBtn) {
    addBtn.setAttribute("onclick", `pushItemToCart('${product.id}', '${variant.id}')`);
  }

  card.querySelectorAll(".swatch-btn").forEach(btn => btn.classList.remove("active"));
  if (element) element.classList.add("active");
}

function openQuickView(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.activeModalProduct = product;
  state.activeModalVariant = product.variants[0];

  const modalBody = document.getElementById("modalBody");
  if (!modalBody) return;

  const primaryVariant = state.activeModalVariant;
  const initialImg = product.images[0];

  modalBody.innerHTML = `
    <div class="modal-grid">
      <div class="modal-gallery">
        <img id="modalMainImg" class="modal-stage-img" src="${initialImg}" alt="${product.title}">
        <div class="modal-gallery-thumbs" role="group" aria-label="Product thumbnails">
          ${product.images.map((img, idx) => `
            <img class="modal-thumb ${idx === 0 ? "active" : ""}" src="${img}" alt="Thumbnail ${idx + 1}" role="button" tabindex="0" onclick="chooseModalImage('${img}', this)">
          `).join("")}
        </div>
      </div>

      <div class="modal-info-panel">
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-gold); margin-bottom: 6px;">
          ITEM CODE: ${product.sku}
        </div>
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px; flex-wrap: wrap;">
          <span class="rating-badge" style="font-size: 12px;">★ ${(product.rating || 4.9).toFixed(1)} Atelier Score (${product.listedNum || product.reviewsCount || 100} Global Orders)</span>
          <span class="stock-badge" id="modalStockBadge" style="font-size: 11px; font-weight: 700;">${(primaryVariant.stockCount || product.stockCount || 100).toLocaleString()} UNITS IN FACTORY WAREHOUSE</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; line-height: 1.25; margin-bottom: 8px;">${product.title}</h2>
        <div style="font-size: 20px; font-weight: 700; font-family: var(--font-mono); color: var(--text-main); margin-bottom: 14px;" id="modalPrice">
          ${formatPrice(primaryVariant.price)}
        </div>

        <p style="font-size: 13px; color: var(--text-sub); line-height: 1.6; margin-bottom: 18px;">${product.description}</p>

        ${(product.category === "Apparel" || product.category === "Techwear" || product.category === "Winter Streetwear & Thermal Defense") ? `
          <div style="margin-bottom: 14px;">
            <button type="button" class="btn-size-guide" onclick="toggleSizeGuide()" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-sub); font-family: var(--font-mono); font-size: 11px; padding: 4px 10px; border-radius: 4px; cursor: pointer;">
              📐 Sizing Specifications (CM / IN)
            </button>
            <div id="sizeGuideBox" style="display: none; margin-top: 8px; padding: 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; font-size: 11px; font-family: var(--font-mono);">
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; text-align: center; color: var(--text-sub); border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
                <span>Size</span><span>Chest/Waist</span><span>Length</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; text-align: center; padding: 4px 0; color: var(--text-main);">
                <span>XS / S</span><span>36-38 in (94cm)</span><span>27 in (69cm)</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; text-align: center; padding: 4px 0; color: var(--text-main);">
                <span>M / L</span><span>40-42 in (104cm)</span><span>29 in (74cm)</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; text-align: center; padding: 4px 0; color: var(--text-main);">
                <span>XL</span><span>44-46 in (114cm)</span><span>31 in (79cm)</span>
              </div>
            </div>
          </div>
        ` : ""}

        <div style="margin-bottom: 18px;">
          <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-sub); margin-bottom: 8px;">
            SELECT VARIANT:
          </label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${product.variants.map((v, i) => `
              <button 
                type="button"
                class="variant-badge-btn ${i === 0 ? "active" : ""}" 
                data-vid="${v.id}"
                onclick="chooseModalVariant('${v.id}', ${v.imageIndex || 0}, this)">
                ${v.title}
              </button>
            `).join("")}
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 14px; margin-bottom: 18px; font-size: 12px; font-family: var(--font-mono); color: var(--text-sub);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Materials:</span>
            <span style="color: var(--text-main);">${product.materials || "Standard Composition"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Weight:</span>
            <span style="color: var(--text-main);">${product.weight || "12.4 oz"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Origin:</span>
            <span style="color: var(--text-main);">${product.origin || "Atelier Production"}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Shipping:</span>
            <span style="color: var(--accent-emerald);">Express Air Priority</span>
          </div>
        </div>

        <button class="btn-checkout-now" style="width: 100%;" onclick="commitModalToCart()">
          Add to Shopping Bag
        </button>
        <div class="modal-trust-tags">
          <span>🛡️ 30-Day Money-Back</span>
          <span>✈️ 7-12d Air Express</span>
          <span>🏛️ DDP Zero Customs</span>
          <span>🔍 100% QC Passed</span>
        </div>
        <a href="https://t.me/nova_archive_support" target="_blank" rel="noopener noreferrer" class="btn-tg-direct">
          💬 Telegram Orqali 1-Click Buyurtma Berish
        </a>
      </div>
    </div>
  `;

  const backdrop = document.getElementById("modalBackdrop");
  if (backdrop) {
    backdrop.classList.add("active");
    const closeBtn = document.getElementById("modalCloseBtn");
    if (closeBtn) closeBtn.focus();
  }
}

function chooseModalImage(imgUrl, element) {
  const mainImg = document.getElementById("modalMainImg");
  if (mainImg) mainImg.src = imgUrl;

  document.querySelectorAll(".modal-thumb").forEach(thumb => thumb.classList.remove("active"));
  if (element) element.classList.add("active");
}

function chooseModalVariant(variantId, imageIndex, element) {
  if (!state.activeModalProduct) return;

  const variant = state.activeModalProduct.variants.find(v => v.id === variantId);
  if (!variant) return;

  state.activeModalVariant = variant;

  const priceEl = document.getElementById("modalPrice");
  if (priceEl) {
    priceEl.innerHTML = formatPrice(variant.price);
  }

  const stockEl = document.getElementById("modalStockBadge");
  if (stockEl) {
    const liveCount = variant.stockCount || state.activeModalProduct.stockCount || 100;
    stockEl.textContent = `${liveCount.toLocaleString()} UNITS IN FACTORY WAREHOUSE`;
  }

  if (state.activeModalProduct.images && state.activeModalProduct.images[imageIndex]) {
    const targetImg = state.activeModalProduct.images[imageIndex];
    const mainImg = document.getElementById("modalMainImg");
    if (mainImg) mainImg.src = targetImg;

    const thumbs = document.querySelectorAll(".modal-thumb");
    if (thumbs[imageIndex]) {
      thumbs.forEach(t => t.classList.remove("active"));
      thumbs[imageIndex].classList.add("active");
    }
  }

  document.querySelectorAll(".variant-badge-btn").forEach(btn => btn.classList.remove("active"));
  if (element) element.classList.add("active");
}

function commitModalToCart() {
  if (!state.activeModalProduct || !state.activeModalVariant) return;
  pushItemToCart(state.activeModalProduct.id, state.activeModalVariant.id);
  closeModal();
}

function closeModal() {
  const backdrop = document.getElementById("modalBackdrop");
  if (backdrop) backdrop.classList.remove("active");
  state.activeModalProduct = null;
  state.activeModalVariant = null;
}

function toggleSizeGuide() {
  const box = document.getElementById("sizeGuideBox");
  if (box) {
    box.style.display = box.style.display === "none" ? "block" : "none";
  }
}

function pushItemToCart(productId, variantId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const variant = product.variants.find(v => v.id === variantId) || product.variants[0];
  const targetImage = product.images[variant.imageIndex || 0] || product.images[0];

  const existing = state.cart.find(item => item.id === productId && item.variantId === variant.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: product.id,
      variantId: variant.id,
      title: product.title,
      variantTitle: variant.title,
      price: variant.price,
      image: targetImage,
      quantity: 1
    });
  }

  saveCart();
  updateCartDisplay();
  openDrawer();
  showToast(`Added to bag: ${product.title}`);
}

function alterCartQty(productId, variantId, delta) {
  const item = state.cart.find(i => i.id === productId && i.variantId === variantId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    dropCartItem(productId, variantId);
  } else {
    saveCart();
    updateCartDisplay();
  }
}

function dropCartItem(productId, variantId) {
  state.cart = state.cart.filter(i => !(i.id === productId && i.variantId === variantId));
  saveCart();
  updateCartDisplay();
}

function saveCart() {
  localStorage.setItem("kravon_cart", JSON.stringify(state.cart));
}

function openDrawer() {
  const overlay = document.getElementById("drawerOverlay");
  const drawer = document.getElementById("cartDrawer");
  if (overlay && drawer) {
    overlay.classList.add("active");
    drawer.classList.add("active");
  }
}

function closeDrawer() {
  const overlay = document.getElementById("drawerOverlay");
  const drawer = document.getElementById("cartDrawer");
  if (overlay && drawer) {
    overlay.classList.remove("active");
    drawer.classList.remove("active");
  }
}

function updateCartDisplay() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("bagCountBadge");
  const drawerTag = document.getElementById("drawerCountTag");
  if (badge) badge.textContent = totalCount;
  if (drawerTag) drawerTag.textContent = `${totalCount} ${totalCount === 1 ? "ITEM" : "ITEMS"}`;

  const drawerContainer = document.getElementById("drawerItems");
  const checkoutForm = document.getElementById("checkoutFormSection");
  if (!drawerContainer) return;

  if (state.cart.length === 0) {
    drawerContainer.innerHTML = `
      <div class="drawer-empty-view">
        <svg class="empty-bag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <div style="font-size: 15px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">
          YOUR SHOPPING BAG IS EMPTY
        </div>
        <p style="font-size: 12px; color: var(--text-sub); line-height: 1.5; max-width: 260px; margin: 0 auto;">
          Add handcrafted anime artifacts or technical garments to initialize order.
        </p>
      </div>
    `;
    if (checkoutForm) checkoutForm.style.display = "none";
    updateLedger(0);
    return;
  }

  if (checkoutForm) checkoutForm.style.display = "block";

  drawerContainer.innerHTML = state.cart.map(item => `
    <div class="drawer-item">
      <img class="drawer-item-img" src="${item.image}" alt="${item.title}">
      <div class="drawer-item-info">
        <div class="drawer-item-name">${item.title}</div>
        <div class="drawer-item-sub">${item.variantTitle}</div>
        <div class="drawer-item-bottom">
          <div class="qty-stepper">
            <button class="qty-step-btn" onclick="alterCartQty('${item.id}', '${item.variantId}', -1)" aria-label="Decrease quantity">−</button>
            <span class="qty-step-val">${item.quantity}</span>
            <button class="qty-step-btn" onclick="alterCartQty('${item.id}', '${item.variantId}', 1)" aria-label="Increase quantity">+</button>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="drawer-item-price">${formatPrice(item.price * item.quantity)}</span>
            <button class="drawer-remove-item-btn" onclick="dropCartItem('${item.id}', '${item.variantId}')" title="Remove item" aria-label="Remove item">✕</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  const rawSubtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  updateLedger(rawSubtotal);
}

function updateLedger(rawSubtotal) {
  let discountAmount = 0;
  if (state.appliedCoupon === "VIP10" || state.appliedCoupon === "WELCOME10") {
    discountAmount = rawSubtotal * 0.10;
  }

  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const subEl = document.getElementById("ledgerSubtotal");
  const disEl = document.getElementById("ledgerDiscount");
  const totEl = document.getElementById("ledgerTotal");

  if (subEl) subEl.innerHTML = formatPrice(rawSubtotal);
  if (disEl) disEl.innerHTML = state.appliedCoupon ? `-${formatPrice(discountAmount)} (${state.appliedCoupon})` : "$0.00";
  if (totEl) totEl.innerHTML = formatPrice(finalTotal);

  const thresholdUsd = 200.0;
  const progressRatio = Math.min(1.0, rawSubtotal / thresholdUsd);
  const fillEl = document.getElementById("freeShipFill");
  const textEl = document.getElementById("freeShipText");

  if (fillEl) fillEl.style.width = `${progressRatio * 100}%`;
  if (textEl) {
    if (rawSubtotal >= thresholdUsd) {
      textEl.textContent = "COMPLIMENTARY EXPRESS SHIPPING UNLOCKED";
    } else {
      const needed = thresholdUsd - rawSubtotal;
      textEl.textContent = `Add ${formatPrice(needed)} more to unlock free express shipping.`;
    }
  }
}

const SHIPPING_ESTIMATES = {
  US: { time: "5–9 Business Days", carrier: "via CJPacket Sensitive Air Express", guarantee: "Customs Duty Free (DDP)" },
  GB: { time: "5–8 Business Days", carrier: "via Royal Mail Tracked Priority", guarantee: "VAT Included, No Import Fees" },
  DE: { time: "6–10 Business Days", carrier: "via DHL Express Germany Direct", guarantee: "EU VAT Cleared (IOSS)" },
  FR: { time: "6–10 Business Days", carrier: "via La Poste Colissimo Express", guarantee: "EU VAT Cleared (IOSS)" },
  CH: { time: "5–9 Business Days", carrier: "via Swiss Post Direct Freight", guarantee: "100% Insured Priority" },
  JP: { time: "4–7 Business Days", carrier: "via Japan Post / Sagawa Express", guarantee: "Tokyo Air Priority Direct" },
  UZ: { time: "7–14 Business Days", carrier: "via UzPost Priority Air Freight", guarantee: "Tashkent Hub Insured" },
  AE: { time: "5–9 Business Days", carrier: "via Emirates Post / Aramex Express", guarantee: "Dubai Hub Customs Cleared" },
  CA: { time: "6–11 Business Days", carrier: "via Canada Post Expedited Freight", guarantee: "Duties Pre-Paid" },
  AU: { time: "6–10 Business Days", carrier: "via Australia Post Express Air", guarantee: "GST Included" }
};

function updateShippingEstimate() {
  const select = document.getElementById("custCountry");
  if (!select) return;
  const countryCode = select.value || "US";
  const est = SHIPPING_ESTIMATES[countryCode] || SHIPPING_ESTIMATES.US;
  const timeEl = document.getElementById("estTime");
  const carrierEl = document.getElementById("estCarrier");
  const guarEl = document.getElementById("estGuarantee");
  if (timeEl) timeEl.textContent = est.time;
  if (carrierEl) carrierEl.textContent = est.carrier;
  if (guarEl) guarEl.textContent = est.guarantee;
}

function handleApplyCoupon() {
  const input = document.getElementById("couponInput");
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (code === "VIP10" || code === "WELCOME10") {
    state.appliedCoupon = code;
    input.disabled = true;
    updateCartDisplay();
    showToast(`${code} Applied: 10% Discount Activated`);
  } else {
    showToast("Invalid promotional code");
  }
}

async function handleCheckoutExecution() {
  if (state.cart.length === 0) {
    showToast("Shopping bag is empty");
    return;
  }

  const custName = document.getElementById("custName")?.value.trim();
  const custEmail = document.getElementById("custEmail")?.value.trim();
  const custPhone = document.getElementById("custPhone")?.value.trim();
  const custCountry = document.getElementById("custCountry")?.value || "US";
  const custAddress = document.getElementById("custAddress")?.value.trim();
  const custCity = document.getElementById("custCity")?.value.trim();
  const custProvince = document.getElementById("custProvince")?.value.trim();
  const custZip = document.getElementById("custZip")?.value.trim();

  if (!custName || !custEmail || !custAddress || !custCity || !custZip) {
    showToast("Please provide all required delivery details.");
    document.getElementById("custName")?.focus();
    return;
  }

  const btn = document.getElementById("checkoutBtn");
  btn.disabled = true;
  btn.innerHTML = `LOCKING ALLOCATION...`;

  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: state.cart,
        customerName: custName,
        customerEmail: custEmail,
        shippingPhone: custPhone || "+12125550199",
        shippingCountryCode: custCountry,
        shippingAddress: custAddress,
        shippingCity: custCity,
        shippingProvince: custProvince || custCity,
        shippingZip: custZip,
        discountCode: state.appliedCoupon,
        currency: state.currency
      })
    });

    const data = await res.json();
    if (data.success && data.checkoutUrl) {
      localStorage.removeItem("kravon_cart");
      state.cart = [];
      updateCartDisplay();
      window.location.href = data.checkoutUrl;
    } else {
      showToast(data.message || "Reservation could not be processed");
      btn.disabled = false;
      btn.innerHTML = "RESERVE VIP ALLOCATION ($0 TODAY)";
    }
  } catch (err) {
    showToast("Network connection timeout. Please retry.");
    btn.disabled = false;
    btn.innerHTML = "RESERVE VIP ALLOCATION ($0 TODAY)";
  }
}

function bindConciergeAndNewsletter() {
  const copyBtn = document.getElementById("copyConciergeBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText("concierge@kravon-archive.com").then(() => {
        const prev = copyBtn.textContent;
        copyBtn.textContent = "COPIED!";
        copyBtn.style.background = "var(--accent-emerald)";
        copyBtn.style.color = "#07080a";
        setTimeout(() => {
          copyBtn.textContent = prev;
          copyBtn.style.background = "";
          copyBtn.style.color = "";
        }, 2200);
      });
    });
  }

  const form = document.getElementById("newsletterForm");
  const input = document.getElementById("newsletterEmail");
  const feedback = document.getElementById("newsletterFeedback");
  if (form && input && feedback) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        feedback.style.color = "#ff1744";
        feedback.textContent = "Please enter a valid email address.";
        return;
      }
      try {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: val })
        });
        const data = await res.json();
        if (data.success) {
          input.value = "";
          feedback.style.color = "var(--accent-cyan)";
          feedback.textContent = "Subscribed to KRAVØN Atelier Bulletins.";
        } else {
          feedback.style.color = "#ff1744";
          feedback.textContent = data.message || "Subscription could not be processed.";
        }
      } catch (err) {
        feedback.style.color = "#ff1744";
        feedback.textContent = "Network error. Please try again later.";
      }
      setTimeout(() => {
        feedback.textContent = "";
      }, 5000);
    });
  }
}

const policyRegistry = {
  privacy: {
    title: "KRAVØN PRIVACY DIRECTIVE",
    badge: "GDPR · CCPA · ZERO ADVERTISING TRACKERS",
    content: `
      <p>KRAVØN operates under strict privacy and minimal retention standards. We collect only essential logistical data required to execute order fulfillment, generate cryptographic invoices, and synchronize courier tracking.</p>
      <h3>1. Logistical Information</h3>
      <p>Recipient names, email addresses, shipping destinations, and contact numbers are used solely to route parcels via international courier partners. Customer records are never sold, rented, or brokered.</p>
      <h3>2. Payment Security</h3>
      <p>All card payments are processed securely via Tier-1 PCI-DSS compliant gateways. Raw credit or debit card credentials are never saved on our servers.</p>
      <h3>3. Data Erasure Rights</h3>
      <p>To request permanent deletion of your order records, contact <strong style="color: var(--accent-cyan);">concierge@kravon-archive.com</strong>.</p>
    `,
    url: "/privacy.html"
  },
  terms: {
    title: "TERMS OF SERVICE",
    badge: "EDITION ALLOCATIONS · BINDING PROTOCOL",
    content: `
      <p>By purchasing from KRAVØN, you agree to our standard terms of sale.</p>
      <h3>1. Order Acceptance</h3>
      <p>All orders represent limited-batch productions. In the rare event of inventory exhaustion, an immediate full refund is returned to the original payment method.</p>
      <h3>2. Customs & Duties</h3>
      <p>Parcels ship internationally. Standard customs procedures apply according to destination territory regulations.</p>
    `,
    url: "/terms.html"
  },
  refund: {
    title: "30-DAY SATISFACTION & RETURN POLICY",
    badge: "30-DAY GUARANTEE · 100% REIMBURSEMENT",
    content: `
      <p>We provide a complete 30-day inspection period starting from the recorded delivery date.</p>
      <h3>1. Return Eligibility</h3>
      <p>Items must be in original condition with security tags and packaging intact.</p>
      <h3>2. Return Authorization</h3>
      <p>Contact <strong style="color: var(--accent-cyan);">concierge@kravon-archive.com</strong> with your order ID to receive a prepaid return label.</p>
    `,
    url: "/refund.html"
  },
  shipping: {
    title: "GLOBAL SHIPPING & LOGISTICS",
    badge: "24-48H DISPATCH · TRACKED AIR FREIGHT",
    content: `
      <p>All artifacts ship directly from specialized manufacturing centers to ensure authenticity and quality control.</p>
      <h3>1. Delivery Windows</h3>
      <ul>
        <li><strong>United States & Canada:</strong> 5–9 Business Days</li>
        <li><strong>Europe & UK:</strong> 6–10 Business Days</li>
        <li><strong>Asia-Pacific:</strong> 4–7 Business Days</li>
        <li><strong>Worldwide:</strong> 8–14 Business Days</li>
      </ul>
      <h3>2. Live Tracking</h3>
      <p>Every shipment includes an encrypted tracking number sent via email upon dispatch.</p>
    `,
    url: "/shipping.html"
  }
};

function bindPolicyHandlers() {
  document.querySelectorAll(".policy-link-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const policyKey = btn.getAttribute("data-policy");
      openPolicyModal(policyKey);
    });
  });
}

function openPolicyModal(policyKey) {
  const policy = policyRegistry[policyKey];
  if (!policy) return;

  const modalBody = document.getElementById("policyModalBody");
  if (!modalBody) return;

  modalBody.innerHTML = `
    <span class="policy-badge">${policy.badge}</span>
    <h2>${policy.title}</h2>
    ${policy.content}
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
      <a href="${policy.url}" style="font-size: 12px; font-family: var(--font-mono); color: var(--accent-cyan); text-decoration: underline;">
        Open Standalone Policy Document →
      </a>
      <button class="btn-coupon" onclick="closePolicyModal()">CLOSE</button>
    </div>
  `;

  const backdrop = document.getElementById("policyModalBackdrop");
  if (backdrop) backdrop.classList.add("active");
}

function closePolicyModal() {
  const backdrop = document.getElementById("policyModalBackdrop");
  if (backdrop) backdrop.classList.remove("active");
}

function showToast(msg) {
  let toast = document.getElementById("kravonToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "kravonToast";
    toast.style.position = "fixed";
    toast.style.bottom = "24px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "#13161f";
    toast.style.border = "1px solid #00e5ff";
    toast.style.color = "#f3f4f6";
    toast.style.padding = "10px 22px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "12px";
    toast.style.fontFamily = "var(--font-mono)";
    toast.style.zIndex = "99999";
    toast.style.boxShadow = "0 10px 30px rgba(0, 229, 255, 0.25)";
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2600);
}

function bindSupportDrawer() {
  const fab = document.getElementById("supportFabBtn");
  const drawerBackdrop = document.getElementById("supportDrawerBackdrop");
  const closeBtn = document.getElementById("supportDrawerCloseBtn");

  if (fab && drawerBackdrop) {
    fab.addEventListener("click", () => {
      drawerBackdrop.classList.add("active");
    });
  }

  if (closeBtn && drawerBackdrop) {
    closeBtn.addEventListener("click", () => {
      drawerBackdrop.classList.remove("active");
    });
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener("click", (e) => {
      if (e.target === drawerBackdrop) {
        drawerBackdrop.classList.remove("active");
      }
    });
  }
}
