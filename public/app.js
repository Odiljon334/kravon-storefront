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
  appliedCoupon: null
};

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  bindEventListeners();
  bindPolicyHandlers();
  bindConciergeAndNewsletter();
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
  return `${symbol}${converted.toFixed(2)}`;
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
      navContainer.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderCatalog();
    });
  });
}

function filterByCategory(cat) {
  state.selectedCategory = cat;
  const navContainer = document.getElementById("categoryNav");
  if (navContainer) {
    navContainer.querySelectorAll(".cat-btn").forEach(b => {
      if (b.getAttribute("data-category") === cat) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }
  renderCatalog();
  const catalogGrid = document.getElementById("catalogGrid");
  if (catalogGrid) {
    catalogGrid.scrollIntoView({ behavior: "smooth" });
  }
}

function renderCatalog() {
  const container = document.getElementById("catalogGrid");
  if (!container) return;

  let filtered = [...state.products];

  if (state.selectedCategory !== "All") {
    filtered = filtered.filter(p => p.category.toLowerCase() === state.selectedCategory.toLowerCase());
  }

  if (state.searchQuery) {
    filtered = filtered.filter(p => {
      const q = state.searchQuery;
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
      <h3 class="empty-state-title">No artifacts found</h3>
      <p class="empty-state-sub">Try searching with another keyword or select a different category.</p>
    </div>`;
    return;
  }

  container.innerHTML = filtered.map(product => {
    const primaryVariant = product.variants[0];
    const initialImg = product.images[0];

    return `
      <div class="product-card" id="card_${product.id}">
        <div class="card-img-wrap" onclick="openQuickView('${product.id}')">
          <img class="card-img" id="img_${product.id}" src="${initialImg}" alt="${product.title}" loading="lazy">
        </div>
        <div class="card-body">
          <div class="card-meta-row">
            <span class="rating-badge">★ ${product.rating || "4.9"} (${product.reviewsCount || 100})</span>
            <span class="stock-badge">${product.stockCount || 15} UNITS ALLOCATED</span>
          </div>
          <h3 class="card-title" onclick="openQuickView('${product.id}')">${product.title}</h3>

          <div class="swatch-row">
            ${product.variants.map((v, i) => `
              <div 
                class="swatch-btn ${i === 0 ? "active" : ""}" 
                style="background: ${v.hex};" 
                title="${v.title}"
                onclick="switchCardVariant('${product.id}', '${v.id}', ${v.imageIndex || 0}, this)">
              </div>
            `).join("")}
          </div>

          <div class="card-footer">
            <span class="card-price" id="price_${product.id}">${formatPrice(primaryVariant.price)}</span>
            <button class="btn-add" id="addBtn_${product.id}" onclick="pushItemToCart('${product.id}', '${primaryVariant.id}')">
              Acquire Edition
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

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
    priceEl.textContent = formatPrice(variant.price);
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
        <div class="modal-gallery-thumbs">
          ${product.images.map((img, idx) => `
            <img class="modal-thumb ${idx === 0 ? "active" : ""}" src="${img}" alt="Thumbnail ${idx + 1}" onclick="chooseModalImage('${img}', this)">
          `).join("")}
        </div>
      </div>

      <div class="modal-info-panel">
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-gold); margin-bottom: 6px;">
          SPECIFICATION :: ${product.sku}
        </div>
        <h2 style="font-size: 22px; font-weight: 800; line-height: 1.25; margin-bottom: 8px;">${product.title}</h2>
        <div style="font-size: 20px; font-weight: 700; font-family: var(--font-mono); color: var(--text-main); margin-bottom: 14px;" id="modalPrice">
          ${formatPrice(primaryVariant.price)}
        </div>

        <p style="font-size: 13px; color: var(--text-sub); line-height: 1.6; margin-bottom: 18px;">${product.description}</p>

        <div style="margin-bottom: 18px;">
          <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-sub); margin-bottom: 8px;">
            SELECT VARIANT ALLOCATION:
          </label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${product.variants.map((v, i) => `
              <button 
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
            <span>Composition:</span>
            <span style="color: var(--text-main);">${product.materials || "High-Impact Chassis"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Mass Spec:</span>
            <span style="color: var(--text-main);">${product.weight || "12.4 oz"}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Origin Hub:</span>
            <span style="color: var(--text-main);">${product.origin || "Tokyo Atelier"}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Fulfillment:</span>
            <span style="color: var(--accent-emerald);">Direct Air Priority</span>
          </div>
        </div>

        <button class="btn-checkout-now" style="width: 100%;" onclick="commitModalToCart()">
          Reserve & Add to Archive Bag
        </button>
      </div>
    </div>
  `;

  const backdrop = document.getElementById("modalBackdrop");
  if (backdrop) backdrop.classList.add("active");
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
    priceEl.textContent = formatPrice(variant.price);
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
  showToast(`Reserved: ${product.title}`);
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
          YOUR ARCHIVE BAG IS EMPTY
        </div>
        <p style="font-size: 12px; color: var(--text-sub); line-height: 1.5; max-width: 260px; margin: 0 auto;">
          Acquire limited-edition technical garments or faceplates to initialize shipment.
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
            <button class="qty-step-btn" onclick="alterCartQty('${item.id}', '${item.variantId}', -1)">−</button>
            <span class="qty-step-val">${item.quantity}</span>
            <button class="qty-step-btn" onclick="alterCartQty('${item.id}', '${item.variantId}', 1)">+</button>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="drawer-item-price">${formatPrice(item.price * item.quantity)}</span>
            <button class="drawer-remove-item-btn" onclick="dropCartItem('${item.id}', '${item.variantId}')" title="Remove item">✕</button>
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
  if (state.appliedCoupon === "VIP10") {
    discountAmount = rawSubtotal * 0.10;
  }

  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const subEl = document.getElementById("ledgerSubtotal");
  const disEl = document.getElementById("ledgerDiscount");
  const totEl = document.getElementById("ledgerTotal");

  if (subEl) subEl.textContent = formatPrice(rawSubtotal);
  if (disEl) disEl.textContent = state.appliedCoupon ? `-${formatPrice(discountAmount)} (${state.appliedCoupon})` : "$0.00";
  if (totEl) totEl.textContent = formatPrice(finalTotal);

  const thresholdUsd = 200.0;
  const progressRatio = Math.min(1.0, rawSubtotal / thresholdUsd);
  const fillEl = document.getElementById("freeShipFill");
  const textEl = document.getElementById("freeShipText");

  if (fillEl) fillEl.style.width = `${progressRatio * 100}%`;
  if (textEl) {
    if (rawSubtotal >= thresholdUsd) {
      textEl.textContent = "COMPLIMENTARY WORLDWIDE EXPRESS FREIGHT UNLOCKED";
    } else {
      const needed = thresholdUsd - rawSubtotal;
      textEl.textContent = `Acquire ${formatPrice(needed)} more to unlock complimentary freight.`;
    }
  }
}

function handleApplyCoupon() {
  const input = document.getElementById("couponInput");
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (code === "VIP10") {
    state.appliedCoupon = "VIP10";
    input.disabled = true;
    updateCartDisplay();
    showToast("VIP10 Applied: 10% Allocation Discount Activated");
  } else {
    showToast("Invalid promotional code");
  }
}

async function handleCheckoutExecution() {
  if (state.cart.length === 0) {
    showToast("Archive bag is empty");
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

  if (!custName || !custAddress || !custCity || !custZip) {
    showToast("Please provide all required destination telemetry fields.");
    document.getElementById("custName")?.focus();
    return;
  }

  const btn = document.getElementById("checkoutBtn");
  btn.disabled = true;
  btn.innerHTML = `TRANSMITTING ENCRYPTED ORDER...`;

  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: state.cart,
        customerName: custName,
        customerEmail: custEmail || "client@kravon-archive.com",
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
      showToast(data.message || "Checkout telemetry interrupted");
      btn.disabled = false;
      btn.innerHTML = "PROCEED TO SECURE CHECKOUT";
    }
  } catch (err) {
    showToast("Carrier API network timeout");
    btn.disabled = false;
    btn.innerHTML = "PROCEED TO SECURE CHECKOUT";
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
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val || !val.includes("@")) {
        feedback.style.color = "#ff1744";
        feedback.textContent = "INVALID TRANSMISSION: VALID EMAIL REQUIRED";
        return;
      }
      input.value = "";
      feedback.style.color = "var(--accent-cyan)";
      feedback.textContent = "TRANSMISSION CONFIRMED :: ACCESS KEY DISPATCHED TO ARCHIVE";
      setTimeout(() => {
        feedback.textContent = "";
      }, 5000);
    });
  }
}

const policyRegistry = {
  privacy: {
    title: "KRAVØN PRIVACY PROTOCOL",
    badge: "SPEC :: GDPR · CCPA · ZERO ADVERTISING TRACKERS",
    content: `
      <p>KRAVØN operates under strict zero-knowledge telemetry standards. We collect only essential logistical data required to execute order fulfillment, generate cryptographic invoices, and synchronize courier telemetry.</p>
      <h3>1. Minimal Logistical Telemetry</h3>
      <p>Recipient names, electronic mail, physical shipping coordinates, and phone numbers are collected exclusively to route parcels via CJ Dropshipping and international courier partners. Data is never monetized, brokered, or rented.</p>
      <h3>2. Payment Tokenization</h3>
      <p>Credit and debit card credentials are tokenized directly with Tier-1 PCI-DSS certified payment processors (2Checkout / Verifone). Zero card numbers are ever stored in raw text on KRAVØN servers.</p>
      <h3>3. Autonomous Data Expiration</h3>
      <p>Logistics telemetry is retained for 90 days following confirmed parcel delivery to support returns and warranty verification, after which identifying coordinates are purged.</p>
      <h3>4. Client Data Rights</h3>
      <p>To request permanent erasure of your order telemetry, transmit your directive to <strong style="color: var(--accent-cyan);">concierge@kravon-archive.com</strong>.</p>
    `,
    url: "/privacy.html"
  },
  terms: {
    title: "TERMS OF ENGAGEMENT & ARCHIVE CONDITIONS",
    badge: "SPEC :: LIMITED RUN ALLOCATIONS · BINDING PROTOCOL",
    content: `
      <p>By browsing the KRAVØN concept store or acquiring serialized artifact editions, you enter into a binding agreement with KRAVØN ARCHIVE CO.</p>
      <h3>1. Allocation & Order Acceptance</h3>
      <p>All items represent limited-run productions. Placing an acquisition request authorizes payment verification and automated factory routing. If an allocation is depleted, full reimbursement is issued instantly.</p>
      <h3>2. Tariffs & Customs Telemetry</h3>
      <p>All items ship under DDU/DDP terms depending on destination territory. Recipients are responsible for regional customs formalities if mandated by destination customs authorities.</p>
      <h3>3. Intellectual Property</h3>
      <p>All faceplate industrial designs, bespoke denim patterns, and graphic prints are proprietary intellectual property of KRAVØN ARCHIVE and affiliated Japanese design ateliers.</p>
    `,
    url: "/terms.html"
  },
  refund: {
    title: "30-DAY INSPECTION PROTOCOL & REFUND POLICY",
    badge: "SPEC :: ZERO RISK GUARANTEE · 100% REIMBURSEMENT",
    content: `
      <p>We provide an uncompromising 30-day inspection period from the delivery date recorded on courier telemetry.</p>
      <h3>1. Inspection Criteria</h3>
      <p>Artifacts must remain in unaltered condition with security tags and original protective packaging intact. LED faceplates and battery assemblies must remain un-modified.</p>
      <h3>2. Initiating Return Authorization</h3>
      <p>Contact <strong style="color: var(--accent-cyan);">concierge@kravon-archive.com</strong> with your order identification number. Our concierge provides a prepaid international return shipping label within 4 hours.</p>
      <h3>3. Reimbursement Processing</h3>
      <p>Upon physical reception and laboratory inspection at our Zurich or Tokyo atelier hub, 100% of the acquisition price is credited to your original payment instrument within 48 business hours.</p>
    `,
    url: "/refund.html"
  },
  shipping: {
    title: "GLOBAL LOGISTICS & FREIGHT PROTOCOL",
    badge: "SPEC :: 24-48H PRIORITY DISPATCH · DIRECT ATELIER FREIGHT",
    content: `
      <p>Artifacts are fulfilled direct from specialized production armories in Tokyo, Shenzhen, and Kyoto to ensure authenticity and reduce intermediate distribution markups.</p>
      <h3>1. Dispatch Timetable</h3>
      <p>Standard orders undergo quality inspection and are dispatched within 24 to 48 hours. Serialized prop blades undergo manual calibration before packaging.</p>
      <h3>2. Transit Windows</h3>
      <ul>
        <li><strong>United States & Canada:</strong> 5–9 Business Days (Expedited Air Freight)</li>
        <li><strong>European Union & UK:</strong> 6–10 Business Days (Direct Priority)</li>
        <li><strong>Asia-Pacific:</strong> 4–7 Business Days (Tokyo Direct Hub)</li>
        <li><strong>Global / Rest of World:</strong> 8–14 Business Days</li>
      </ul>
      <h3>3. Real-Time Telemetry</h3>
      <p>Upon departure, a cryptographic tracking URL is dispatched to your electronic mail, providing satellite coordinate tracking at every checkpoint.</p>
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
        Open Standalone Legal Document →
      </a>
      <button class="btn-coupon" onclick="closePolicyModal()">CLOSE DIRECTIVE</button>
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
