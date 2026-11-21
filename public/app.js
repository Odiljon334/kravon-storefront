const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem("kravon_cart") || "[]"),
  selectedCategory: "All",
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
    const label = cat === "All" ? "All Artifacts" : cat;
    const isActive = state.selectedCategory.toLowerCase() === cat.toLowerCase() ? "active" : "";
    return `<button class="cat-btn ${isActive}" data-category="${cat}">${label}</button>`;
  }).join("");

  navContainer.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      navContainer.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.selectedCategory = btn.dataset.category;
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

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state-box">
      <div class="empty-state-tag">ARCHIVE // STATUS 00</div>
      <h3 class="empty-state-title">ARXIVDA HECH QANDAY BUYUM QOLMADI</h3>
      <p class="empty-state-sub">Barcha artefaktlar va buyumlar katalogdan to'liq o'chirildi. Yangi eksklyuziv ob'ektlar kiritilishi kutilmoqda.</p>
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
          <h3 class="card-title" onclick="openQuickView('${product.id}')">${product.title}</h3>
          <p class="card-tagline">${product.tagline}</p>

          <div class="swatch-row">
            ${product.variants.map((v, i) => `
              <div 
                class="swatch-btn ${i === 0 ? "active" : ""}" 
                style="background: ${v.hex};" 
                title="${v.title}"
                onclick="switchCardVariant('${product.id}', '${v.id}', ${v.imageIndex}, this)">
              </div>
            `).join("")}
          </div>

          <div class="card-footer">
            <span class="card-price">${formatPrice(product.price)}</span>
            <button class="btn-add" onclick="pushItemToCart('${product.id}', '${primaryVariant.id}')">
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

  card.querySelectorAll(".swatch-btn").forEach(btn => btn.classList.remove("active"));
  element.classList.add("active");

  const imgEl = document.getElementById(`img_${productId}`);
  if (imgEl && product.images[imageIndex]) {
    imgEl.src = product.images[imageIndex];
  }

  const addBtn = card.querySelector(".btn-add");
  if (addBtn) {
    addBtn.setAttribute("onclick", `pushItemToCart('${productId}', '${variantId}')`);
  }
}

function openQuickView(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.activeModalProduct = product;
  state.selectedVariantId = product.variants[0].id;

  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalBody = document.getElementById("modalBody");

  modalBody.innerHTML = `
    <div class="modal-grid">
      <div>
        <img id="modalMainImg" class="modal-stage-img" src="${product.images[0]}" alt="${product.title}">
      </div>

      <div style="display: flex; flex-direction: column;">
        <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 6px; color: var(--text-main);">
          ${product.title}
        </h2>
        <div style="font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 14px;">
          ${formatPrice(product.price)}
        </div>
        
        <p style="color: var(--text-sub); font-size: 13px; line-height: 1.5; margin-bottom: 18px;">
          ${product.description}
        </p>

        <div style="margin-bottom: 18px;">
          <div style="font-size: 12px; color: var(--text-sub); margin-bottom: 8px;">Edition Variant:</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${product.variants.map((v, i) => `
              <button 
                class="btn-add ${i === 0 ? "active" : ""}" 
                style="padding: 6px 12px; font-size: 12px;"
                onclick="chooseModalVariant('${v.id}', ${v.imageIndex}, this)">
                ${v.title}
              </button>
            `).join("")}
          </div>
        </div>

        <button class="btn-checkout-now" onclick="commitModalToCart()">
          Add to Bag · ${formatPrice(product.price)}
        </button>

        <div style="margin-top: 18px; padding: 14px; background: var(--bg-elevated); border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 12px; color: var(--text-sub); line-height: 1.7;">
          <div><strong style="color: var(--text-main);">Materials:</strong> ${product.materials}</div>
          <div><strong style="color: var(--text-main);">Weight:</strong> ${product.weight}</div>
          <div><strong style="color: var(--text-main);">Dimensions:</strong> ${product.dimensions}</div>
          <div><strong style="color: var(--text-main);">Origin:</strong> ${product.origin}</div>
        </div>
      </div>
    </div>
  `;

  modalBackdrop.classList.add("active");
}

function chooseModalVariant(variantId, imageIndex, element) {
  state.selectedVariantId = variantId;
  element.parentElement.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  element.classList.add("active");

  const product = state.activeModalProduct;
  if (!product) return;

  const modalImg = document.getElementById("modalMainImg");
  if (modalImg && product.images[imageIndex]) {
    modalImg.src = product.images[imageIndex];
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
  if (badge) {
    badge.textContent = totalCount;
  }

  const drawerContainer = document.getElementById("drawerItems");
  if (!drawerContainer) return;

  if (state.cart.length === 0) {
    drawerContainer.innerHTML = `
      <div style="padding: 48px 16px; text-align: center; color: var(--text-sub); font-size: 13px;">
        Your bag is empty.
      </div>
    `;
  } else {
    drawerContainer.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image}" alt="${item.title}">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-variant">${item.sku} · ${item.variantTitle}</div>
          <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
          
          <div class="qty-control">
            <button class="btn-qty" onclick="alterCartQty('${item.id}', '${item.variantId}', -1)">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="btn-qty" onclick="alterCartQty('${item.id}', '${item.variantId}', 1)">+</button>
            <button class="btn-remove" onclick="dropCartItem('${item.id}', '${item.variantId}')">Remove</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  const rawSubtotal = state.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  let discountAmount = 0;
  if (state.appliedCoupon === "VIP10") {
    discountAmount = rawSubtotal * 0.10;
  }
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const subtotalEl = document.getElementById("ledgerSubtotal");
  const discountEl = document.getElementById("ledgerDiscount");
  const totalEl = document.getElementById("ledgerTotal");

  if (subtotalEl) subtotalEl.textContent = formatPrice(rawSubtotal);
  if (discountEl) discountEl.textContent = `-${formatPrice(discountAmount)}`;
  if (totalEl) totalEl.textContent = formatPrice(finalTotal);

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

  const btn = document.getElementById("checkoutBtn");
  btn.disabled = true;
  btn.innerHTML = `Connecting to checkout...`;

  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: state.cart,
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
    toast.style.background = "#1f2127";
    toast.style.border = "1px solid #3b3f4c";
    toast.style.color = "#f5f4ef";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "13px";
    toast.style.zIndex = "99999";
    toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.5)";
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2400);
}