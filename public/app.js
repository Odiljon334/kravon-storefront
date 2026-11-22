const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem("kravon_cart") || "[]"),
  selectedCategory: "All",
  searchQuery: "",
  sortBy: "featured",
  currency: "USD",
  rates: { USD: 1.0, EUR: 0.92 },
  currencySymbols: { USD: "$", EUR: "€" },
  appliedCoupon: null,
  activeModalProduct: null,
  selectedVariantId: null
};

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  bindEventListeners();
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
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener("click", () => closeDrawer());
    }
  }

  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  if (modalBackdrop && modalCloseBtn) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
    modalCloseBtn.addEventListener("click", () => closeModal());
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeDrawer();
    }
  });

  const applyCouponBtn = document.getElementById("applyCouponBtn");
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener("click", handleApplyCoupon);
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleCheckoutExecution);
  }
}

function formatPrice(usdAmount) {
  const rate = state.rates[state.currency] || 1.0;
  const symbol = state.currencySymbols[state.currency] || "$";
  const converted = usdAmount * rate;
  return `${symbol}${converted.toFixed(2)}`;
}

async function fetchSystemStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    if (data.rates) {
      state.rates = data.rates;
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
      <div class="empty-state-tag">ARCHIVE · STATUS 00</div>
      <h3 class="empty-state-title">HECH QANDAY BUYUM TOPILMADI</h3>
      <p class="empty-state-sub">Qidiruv yoki tanlangan toifa bo'yicha artefaktlar topilmadi. Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang.</p>
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
            <span class="stock-badge">${product.stockCount || 15} IN STOCK</span>
          </div>
          <h3 class="card-title" onclick="openQuickView('${product.id}')">${product.title}</h3>
          <p class="card-tagline">${product.tagline}</p>

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
              Add to Bag
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

  const variant = product.variants.find(v => v.id === variantId) || product.variants[0];

  card.querySelectorAll(".swatch-btn").forEach(btn => btn.classList.remove("active"));
  element.classList.add("active");

  const imgEl = document.getElementById(`img_${productId}`);
  if (imgEl && product.images[imageIndex]) {
    imgEl.src = product.images[imageIndex];
  }

  const priceEl = document.getElementById(`price_${productId}`);
  if (priceEl) {
    priceEl.textContent = formatPrice(variant.price);
  }

  const addBtn = document.getElementById(`addBtn_${productId}`);
  if (addBtn) {
    addBtn.setAttribute("onclick", `pushItemToCart('${productId}', '${variantId}')`);
  }
}

function openQuickView(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.activeModalProduct = product;
  const initialVariant = product.variants[0];
  state.selectedVariantId = initialVariant.id;

  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalBody = document.getElementById("modalBody");

  modalBody.innerHTML = `
    <div class="modal-grid">
      <div>
        <img id="modalMainImg" class="modal-stage-img" src="${product.images[0]}" alt="${product.title}">
        <div class="modal-gallery-thumbs" id="modalThumbsList">
          ${product.images.map((img, idx) => `
            <img 
              class="modal-thumb ${idx === 0 ? "active" : ""}" 
              src="${img}" 
              alt="${product.title}" 
              onclick="chooseModalImage('${img}', this)">
          `).join("")}
        </div>
      </div>

      <div style="display: flex; flex-direction: column;">
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent-gold); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px;">
          ${product.category} · OFFICIAL DROP
        </div>
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 6px; color: var(--text-main);">
          ${product.title}
        </h2>
        <div style="font-family: var(--font-mono); font-size: 20px; font-weight: 800; color: var(--text-main); margin-bottom: 14px;" id="modalPriceHeader">
          ${formatPrice(initialVariant.price)}
        </div>
        
        <p style="color: var(--text-sub); font-size: 13px; line-height: 1.5; margin-bottom: 18px;">
          ${product.description}
        </p>

        <div style="margin-bottom: 18px;">
          <div style="font-size: 12px; color: var(--text-sub); margin-bottom: 8px;">Select Edition / Size:</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="modalVariantList">
            ${product.variants.map((v, i) => `
              <button 
                class="variant-badge-btn ${i === 0 ? "active" : ""}" 
                onclick="chooseModalVariant('${v.id}', ${v.imageIndex || 0}, this)">
                ${v.title} (${formatPrice(v.price)})
              </button>
            `).join("")}
          </div>
        </div>

        <button id="modalAddBtn" class="btn-checkout-now" onclick="commitModalToCart()">
          Add to Bag · ${formatPrice(initialVariant.price)}
        </button>

        <div style="margin-top: 18px; padding: 14px; background: var(--bg-elevated); border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 12px; color: var(--text-sub); line-height: 1.7;">
          <div><strong style="color: var(--text-main);">Materials:</strong> ${product.materials}</div>
          <div><strong style="color: var(--text-main);">Weight:</strong> ${product.weight}</div>
          <div><strong style="color: var(--text-main);">Dimensions:</strong> ${product.dimensions}</div>
          <div><strong style="color: var(--text-main);">Origin Atelier:</strong> ${product.origin}</div>
        </div>
      </div>
    </div>
  `;

  modalBackdrop.classList.add("active");
}

function chooseModalImage(imgUrl, element) {
  const modalImg = document.getElementById("modalMainImg");
  if (modalImg) modalImg.src = imgUrl;

  const thumbs = document.querySelectorAll(".modal-thumb");
  thumbs.forEach(t => t.classList.remove("active"));
  if (element) element.classList.add("active");
}

function chooseModalVariant(variantId, imageIndex, element) {
  state.selectedVariantId = variantId;
  const product = state.activeModalProduct;
  if (!product) return;

  const variant = product.variants.find(v => v.id === variantId) || product.variants[0];

  const parent = document.getElementById("modalVariantList");
  if (parent) {
    parent.querySelectorAll(".variant-badge-btn").forEach(b => b.classList.remove("active"));
  }
  if (element) element.classList.add("active");

  const modalImg = document.getElementById("modalMainImg");
  if (modalImg && product.images[imageIndex]) {
    modalImg.src = product.images[imageIndex];
    const thumbs = document.querySelectorAll(".modal-thumb");
    thumbs.forEach((t, i) => {
      if (i === imageIndex) t.classList.add("active");
      else t.classList.remove("active");
    });
  }

  const priceHeader = document.getElementById("modalPriceHeader");
  if (priceHeader) {
    priceHeader.textContent = formatPrice(variant.price);
  }

  const addBtn = document.getElementById("modalAddBtn");
  if (addBtn) {
    addBtn.textContent = `Add to Bag · ${formatPrice(variant.price)}`;
  }
}

function commitModalToCart() {
  if (!state.activeModalProduct || !state.selectedVariantId) return;
  pushItemToCart(state.activeModalProduct.id, state.selectedVariantId);
  closeModal();
}

function closeModal() {
  const modalBackdrop = document.getElementById("modalBackdrop");
  if (modalBackdrop) {
    modalBackdrop.classList.remove("active");
  }
  state.activeModalProduct = null;
  state.selectedVariantId = null;
}

function pushItemToCart(productId, variantId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const variant = product.variants.find(v => v.id === variantId) || product.variants[0];
  const existingIdx = state.cart.findIndex(i => i.id === productId && i.variantId === variant.id);

  if (existingIdx > -1) {
    state.cart[existingIdx].quantity += 1;
  } else {
    state.cart.push({
      id: product.id,
      shopifyId: product.shopifyId,
      sku: product.sku,
      title: product.title,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      image: product.images[variant.imageIndex || 0] || product.images[0],
      quantity: 1
    });
  }

  saveCart();
  updateCartDisplay();
  openDrawer();
  showToast(`Added ${product.title} to bag`);
}

function alterCartQty(productId, variantId, delta) {
  const itemIndex = state.cart.findIndex(i => i.id === productId && i.variantId === variantId);
  if (itemIndex === -1) return;

  state.cart[itemIndex].quantity += delta;
  if (state.cart[itemIndex].quantity <= 0) {
    state.cart.splice(itemIndex, 1);
  }

  saveCart();
  updateCartDisplay();
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
  if (badge) badge.textContent = totalCount;

  const drawerContainer = document.getElementById("drawerItems");
  const checkoutForm = document.getElementById("checkoutFormSection");
  if (!drawerContainer) return;

  if (state.cart.length === 0) {
    drawerContainer.innerHTML = `
      <div style="text-align: center; padding: 48px 12px; color: var(--text-sub);">
        <div style="font-size: 32px; margin-bottom: 12px;">🛍</div>
        <div style="font-size: 15px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">Your Bag is Empty</div>
        <p style="font-size: 13px;">Explore the archive and add experimental editions.</p>
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
          <span class="drawer-item-price">${formatPrice(item.price * item.quantity)}</span>
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
      textEl.textContent = "Complimentary worldwide shipping unlocked.";
    } else {
      const needed = thresholdUsd - rawSubtotal;
      textEl.textContent = `Add ${formatPrice(needed)} more for complimentary shipping.`;
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
    showToast("VIP10 code applied (-10%)");
  } else {
    showToast("Invalid coupon code");
  }
}

async function handleCheckoutExecution() {
  if (state.cart.length === 0) {
    showToast("Your bag is empty");
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
    showToast("Iltimos, yetkazib berish manzilini to'ldiring");
    document.getElementById("custName")?.focus();
    return;
  }

  const btn = document.getElementById("checkoutBtn");
  btn.disabled = true;
  btn.innerHTML = `Buyurtma yuborilmoqda...`;

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
      showToast(data.message || "Checkout error");
      btn.disabled = false;
      btn.innerHTML = "Proceed to Checkout";
    }
  } catch (err) {
    showToast("Network error");
    btn.disabled = false;
    btn.innerHTML = "Proceed to Checkout";
  }
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
    toast.style.background = "#1b1e26";
    toast.style.border = "1px solid #3d4354";
    toast.style.color = "#f5f4ef";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "13px";
    toast.style.zIndex = "99999";
    toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.6)";
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2600);
}
