import express from "express";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { saveOrder, getOrders, getOrderById, updateOrderStatus, saveSubscriber, getSubscribers } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.loadEnvFile && fs.existsSync(path.join(__dirname, ".env"))) {
  process.loadEnvFile(path.join(__dirname, ".env"));
}

const app = express();
const PORT = process.env.PORT || 3000;
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "";
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";

const CJ_EMAIL = process.env.CJ_EMAIL || "";
const CJ_API_KEY = process.env.CJ_API_KEY || "";
const CJ_BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";

const TWOCHECKOUT_SELLER_ID = process.env.TWOCHECKOUT_SELLER_ID || "";
const TWOCHECKOUT_SECRET_KEY = process.env.TWOCHECKOUT_SECRET_KEY || "";
const TWOCHECKOUT_MODE = process.env.TWOCHECKOUT_MODE || "SANDBOX";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || (process.env.NODE_ENV === "test" ? "kravon_secure_webhook_secret_2026" : "");
const ADMIN_KEY = process.env.ADMIN_KEY || (process.env.NODE_ENV === "test" ? "kravon_admin_key_master_2026" : "");

let cjTokenCache = {
  token: process.env.CJ_ACCESS_TOKEN || "",
  expiresAt: Date.now() + (180 * 24 * 3600 * 1000)
};

const COUNTRY_NAMES = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  CH: "Switzerland",
  UZ: "Uzbekistan",
  AE: "United Arab Emirates",
  CA: "Canada",
  AU: "Australia",
  JP: "Japan"
};

let MOCK_PRODUCTS = [
  {
    id: "prod_anime_1",
    shopifyId: "gid:shopify:product:900101",
    sku: "KR-CYB-MASK-01",
    cjPid: "2611200537371608500",
    title: "Cyberpunk LED Light-Up Winged Mask",
    handle: "cyberpunk-led-light-up-winged-mask",
    category: "Cyberpunk Gear",
    price: 118.00,
    currency: "USD",
    rating: 4.9,
    reviewsCount: 142,
    stockCount: 25,
    availableForSale: true,
    tagline: "Futuristic dual-ring LED illuminated combat faceplate with modular braided accents.",
    description: "Engineered for festival stages and cyberpunk environments. Constructed with high-impact acrylic chassis, integrated dual LED halo illumination rings with multi-pattern pulse modes, and detachable braided cyber-cables.",
    materials: "Reinforced Polycarbonate Chassis, Dual LED Light Rings, Braided Nylon Cables",
    weight: "12.4 oz",
    dimensions: "9.4 × 7.1 × 4.7 in",
    origin: "Shenzhen Mecha Works",
    images: [
      "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/b5985e53-2f6b-44cf-9162-5e4031cba1f5_water.jpeg",
      "https://oss-cf.cjdropshipping.com/product/2026/11/20/05/49975949-708d-40ab-a6e0-ccb5590bdc7e_water.jpeg"
    ],
    variants: [
      { id: "var_mask_cyan", cjVid: "2611200537371609400", title: "Dual Halo Cyan", hex: "#00e5ff", price: 118.00, inStock: true, imageIndex: 0 },
      { id: "var_mask_red", cjVid: "2611200537371609401", title: "Cyber Crimson", hex: "#ff0055", price: 124.00, inStock: true, imageIndex: 1 }
    ],
    tags: ["Cyberpunk", "Cosplay", "LED Mask", "Techwear", "Futuristic"]
  },
  {
    id: "prod_anime_2",
    shopifyId: "gid:shopify:product:900102",
    sku: "KR-SAM-JKT-02",
    cjPid: "2610280840421601600",
    title: "Men's Black Samurai Raw-Edge Denim Jacket",
    handle: "mens-black-samurai-raw-edge-denim-jacket",
    category: "Techwear",
    price: 89.00,
    currency: "USD",
    rating: 4.8,
    reviewsCount: 96,
    stockCount: 19,
    availableForSale: true,
    tagline: "Heavyweight dark denim outerwear tailored with Japanese samurai drape silhouette.",
    description: "Distressed black raw-edge denim constructed with asymmetric paneling and reinforced stitching. Features Japanese neo-tokyo oversized cut, utility pockets and unstructured collar inspired by traditional ronin battle garments.",
    materials: "14oz Washed Black Cotton Denim, Custom Matte Black Hardware",
    weight: "28.2 oz",
    dimensions: "Oversized Tailored Fit",
    origin: "Kyoto Denim Atelier",
    images: [
      "https://cf.cjdropshipping.com/quick/product/f53c443a-bf62-41b7-bde3-5d8cfe4fa0a3.jpg"
    ],
    variants: [
      { id: "var_jkt_m", cjVid: "2610280840421602600", title: "Medium (M)", hex: "#16171a", price: 89.00, inStock: true, imageIndex: 0 },
      { id: "var_jkt_l", cjVid: "2610280840421602600", title: "Large (L)", hex: "#22242a", price: 89.00, inStock: true, imageIndex: 0 }
    ],
    tags: ["Samurai", "Denim Jacket", "Techwear", "Anime Streetwear", "Japanese"]
  },
  {
    id: "prod_anime_3",
    shopifyId: "gid:shopify:product:900103",
    sku: "KR-SWD-HOD-03",
    cjPid: "2113090605992165377",
    title: "Japanese Samurai Katana 3D Graphic Hoodie",
    handle: "japanese-samurai-katana-3d-graphic-hoodie",
    category: "Apparel",
    price: 44.00,
    currency: "USD",
    rating: 4.9,
    reviewsCount: 215,
    stockCount: 40,
    availableForSale: true,
    tagline: "High-density all-over graphic print featuring Japanese dual blade battle iconography.",
    description: "Premium fleece-lined pullover sweatshirt crafted with vibrant 3D dye-sublimation print that will never fade or crack. Features double-lined drawstring hood, kangaroo pouch pocket, and rib-knit cuffs.",
    materials: "Fleece-Lined Spandex Blend, Anti-Pill High Density Knit",
    weight: "18.5 oz",
    dimensions: "Relaxed Streetwear Fit",
    origin: "Osaka Streetwear Guild",
    images: [
      "https://cj-product-center.oss-accelerate.aliyuncs.com/supplier/1688/9f977c5b-dd48-46bd-bc49-2fc3be4fd8a1.jpg",
      "https://cj-product-center.oss-accelerate.aliyuncs.com/supplier/1688/2c932484-05f9-46b2-902b-6a02b62289d6.jpg"
    ],
    variants: [
      { id: "var_hoodie_l", cjVid: "2113090606143160322", title: "Katana Edition (L)", hex: "#1a1a24", price: 44.00, inStock: true, imageIndex: 0 },
      { id: "var_hoodie_xl", cjVid: "2113090606143160322", title: "Katana Edition (XL)", hex: "#111218", price: 44.00, inStock: true, imageIndex: 1 }
    ],
    tags: ["Katana", "Anime Hoodie", "Streetwear", "Japanese Style", "Apparel"]
  },
  {
    id: "prod_anime_4",
    shopifyId: "gid:shopify:product:900104",
    sku: "KR-NIN-BLD-04",
    cjPid: "2090192579438338049",
    title: "3-Piece Ninja Warrior Dagger Prop Set",
    handle: "3-piece-ninja-warrior-dagger-prop-set",
    category: "Artifacts",
    price: 54.00,
    currency: "USD",
    rating: 5.0,
    reviewsCount: 88,
    stockCount: 15,
    availableForSale: true,
    tagline: "Cosplay anime weapon triple-blade prop set with traditional braided tassels.",
    description: "Three-piece collector and cosplay prop set replicating curved ninja daggers with ergonomic hilt wrapping and blood-red flowing tassels. Lightweight, convention-safe construction with lifelike metallic finish.",
    materials: "Reinforced Safe Polymer Alloy, Woven Silk Tassels, Cord-Wrapped Grips",
    weight: "11.2 oz",
    dimensions: "12.2 in Blade Length",
    origin: "Edo Armory Workshop",
    images: [
      "https://cf.cjdropshipping.com/4e02226c-782e-4ac7-99e6-4ae6f4ed40db.png"
    ],
    variants: [
      { id: "var_dagger_set", cjVid: "2090192579601915905", title: "3-Blade Complete Set", hex: "#8b1111", price: 54.00, inStock: true, imageIndex: 0 }
    ],
    tags: ["Ninja", "Cosplay", "Katana", "Dagger", "Anime Props", "Artifacts"]
  }
];

const rateLimitMap = new Map();
function rateLimiter(limit = 120, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };
    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
    } else {
      record.count += 1;
    }
    rateLimitMap.set(ip, record);
    if (record.count > limit) {
      return res.status(429).json({ success: false, error: "Too many requests. Please slow down." });
    }
    next();
  };
}

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self' 'unsafe-inline' https: data: blob:; img-src 'self' https: data: blob:; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", rateLimiter(120, 60000));

async function getCJAccessToken() {
  if (cjTokenCache.token && Date.now() < cjTokenCache.expiresAt) {
    return cjTokenCache.token;
  }
  if (!CJ_EMAIL || !CJ_API_KEY) {
    return cjTokenCache.token || null;
  }
  try {
    const response = await fetch(`${CJ_BASE_URL}/authentication/getAccessToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
      },
      body: JSON.stringify({
        email: CJ_EMAIL,
        apiKey: CJ_API_KEY
      })
    });
    const result = await response.json();
    if (result.success && result.data && result.data.accessToken) {
      cjTokenCache = {
        token: result.data.accessToken,
        expiresAt: Date.now() + (180 * 24 * 3600 * 1000)
      };
      return cjTokenCache.token;
    }
  } catch (err) {
    process.stderr.write(`CJ_AUTH_ERROR: ${err.message}\n`);
  }
  return cjTokenCache.token;
}

async function createCJDropshippingOrder(orderInfo) {
  const token = await getCJAccessToken();
  if (!token) {
    return {
      success: false,
      mode: "fallback_simulation",
      trackingNumber: `CJ-TEST-${Math.floor(Math.random() * 8999999 + 1000000)}YQ`,
      carrier: "CJPacket Sensitive Pro (Sandbox Mode)",
      status: "SIMULATED_TEST_ROUTING",
      message: "CJ Token standby"
    };
  }

  const payload = {
    orderNumber: orderInfo.orderId,
    fromCountryCode: "CN",
    shippingCountryCode: orderInfo.shippingCountryCode || "US",
    shippingCountry: orderInfo.shippingCountry || "United States",
    shippingProvince: orderInfo.shippingProvince || "New York",
    shippingCity: orderInfo.shippingCity || "New York",
    shippingAddress: orderInfo.shippingAddress || "120 Broadway St",
    shippingCustomerName: orderInfo.customerName || "Kravon Client",
    shippingPhone: orderInfo.shippingPhone || orderInfo.phone || "+12125550199",
    shippingZip: orderInfo.shippingZip || orderInfo.zip || "10005",
    logisticName: "CJPacket Sensitive Pro",
    products: orderInfo.products.map(p => ({
      vid: p.cjVid || "1525003850212716544",
      quantity: Math.max(1, parseInt(p.quantity, 10) || 1)
    }))
  };

  try {
    const response = await fetch(`${CJ_BASE_URL}/shopping/order/createOrder`, {
      method: "POST",
      headers: {
        "CJ-Access-Token": token,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
      },
      body: JSON.stringify(payload)
    });
    const res = await response.json();
    if (res.success && res.data) {
      return {
        success: true,
        mode: "live_cj_open_api",
        cjOrderId: res.data,
        trackingNumber: null,
        carrier: "CJPacket Sensitive Pro",
        logisticName: "CJPacket Sensitive Pro",
        status: "PROCESSING_IN_CHINA_WAREHOUSE",
        trackingUrl: "https://cjdropshipping.com/my.html#/order-manage/order-list"
      };
    }
    return {
      success: false,
      mode: "api_fallback",
      error: res.message,
      trackingNumber: null,
      carrier: "CJPacket Sensitive Pro",
      status: "AWAITING_CARRIER_ASSIGNMENT"
    };
  } catch (err) {
    return {
      success: false,
      mode: "error_fallback",
      error: err.message,
      trackingNumber: null,
      carrier: "CJPacket Sensitive Pro",
      status: "AWAITING_CARRIER_ASSIGNMENT"
    };
  }
}

function verifyWebhookAuth(req) {
  if (!WEBHOOK_SECRET) {
    return false;
  }

  const tokenHeader = req.headers["x-webhook-secret"] || req.query.secret;
  if (tokenHeader && typeof tokenHeader === "string") {
    if (tokenHeader.length === WEBHOOK_SECRET.length && crypto.timingSafeEqual(Buffer.from(tokenHeader), Buffer.from(WEBHOOK_SECRET))) {
      return true;
    }
  }

  const authHeader = req.headers["authorization"];
  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token.length === WEBHOOK_SECRET.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(WEBHOOK_SECRET))) {
      return true;
    }
  }

  const sigHeader = req.headers["x-2checkout-signature"] || req.headers["x-webhook-signature"];
  if (sigHeader && typeof sigHeader === "string") {
    const payloadStr = JSON.stringify(req.body || {});
    const expectedSig = crypto.createHmac("sha256", WEBHOOK_SECRET).update(payloadStr).digest("hex");
    if (sigHeader.length === expectedSig.length && crypto.timingSafeEqual(Buffer.from(sigHeader), Buffer.from(expectedSig))) {
      return true;
    }
  }

  return false;
}

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://kravon-archive.com/sitemap.xml\n");
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  const today = new Date().toISOString().split("T")[0];
  const productEntries = MOCK_PRODUCTS.map(p => `
  <url>
    <loc>https://kravon-archive.com/products/${p.handle}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("");

  const staticEntries = [
    "",
    "tracking",
    "faq",
    "shipping.html",
    "refund.html",
    "privacy.html",
    "terms.html",
    "contact.html"
  ].map(slug => `
  <url>
    <loc>https://kravon-archive.com/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${slug === "" ? "1.0" : "0.5"}</priority>
  </url>`).join("");

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${productEntries}
</urlset>`);
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    brand: "KRAVØN",
    aesthetic: "Dark Cyberpunk Anime Luxury",
    serverTimestamp: new Date().toISOString(),
    currencies: ["USD", "EUR"],
    rates: { USD: 1.0, EUR: 0.92 },
    catalogCount: MOCK_PRODUCTS.length,
    shopifyStore: SHOPIFY_STORE_DOMAIN || "autonomous-archive",
    shopifyMode: (SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_ACCESS_TOKEN) ? "LIVE_STOREFRONT" : "AUTONOMOUS_HEADLESS"
  });
});

app.get("/api/cj/status", async (req, res) => {
  const token = await getCJAccessToken();
  const allOrders = getOrders(1000);
  res.json({
    success: true,
    engine: "CJ Dropshipping Direct API (Zero-KYC Mode)",
    openId: 66190,
    storeName: "Kravon Concept Store",
    email: CJ_EMAIL ? CJ_EMAIL.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "unconfigured",
    tokenActive: Boolean(token),
    pointsRemaining: 50000,
    totalOrdersHandled: allOrders.length
  });
});

app.get("/api/cj/orders", (req, res) => {
  const adminKey = req.headers["x-admin-key"] || req.query.adminKey;
  const allOrders = getOrders(100);

  if (adminKey) {
    if (!ADMIN_KEY || adminKey !== ADMIN_KEY) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Invalid admin key"
      });
    }
    return res.json({
      success: true,
      count: allOrders.length,
      orders: allOrders
    });
  }

  const masked = allOrders.map(o => ({
    orderId: o.orderId,
    timestamp: o.timestamp,
    customerName: o.customerName ? o.customerName[0] + "***" : "***",
    shippingCountry: o.shippingCountry || "United States",
    itemsCount: o.itemsCount,
    totalAmount: o.totalAmount,
    currency: o.currency,
    status: o.status,
    paymentStatus: o.paymentStatus
  }));

  res.json({
    success: true,
    count: masked.length,
    orders: masked
  });
});

app.get("/api/2checkout/config", (req, res) => {
  res.json({
    success: true,
    sellerId: TWOCHECKOUT_SELLER_ID,
    mode: TWOCHECKOUT_MODE,
    enabled: Boolean(TWOCHECKOUT_SELLER_ID),
    payoutProvider: "PAYONEER_UZB",
    gateway: "2Checkout (Verifone) Global Processing"
  });
});

app.post("/api/payment/create-session", (req, res) => {
  const { orderId } = req.body || {};
  if (!orderId) {
    return res.status(400).json({ success: false, error: "Missing orderId parameter" });
  }

  const order = getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }

  if (order.paymentStatus === "PAID") {
    return res.json({
      success: true,
      alreadyPaid: true,
      redirectUrl: `/checkout-success.html?orderId=${encodeURIComponent(orderId)}`
    });
  }

  if (TWOCHECKOUT_SELLER_ID) {
    const params = new URLSearchParams({
      merchant: TWOCHECKOUT_SELLER_ID,
      prod: order.items[0]?.title || "KRAVØN Artifact",
      price: order.totalAmount.toFixed(2),
      currency: order.currency,
      qty: "1",
      type: "PRODUCT",
      tangible: "1",
      refnoext: order.orderId,
      "return-type": "redirect",
      "return-url": `https://kravon-archive.com/checkout-success.html?orderId=${encodeURIComponent(order.orderId)}`
    });
    return res.json({
      success: true,
      mode: "LIVE_2CHECKOUT_HOSTED",
      checkoutUrl: `https://secure.2checkout.com/checkout/buy?${params.toString()}`
    });
  }

  res.json({
    success: true,
    mode: "SANDBOX_DEMO",
    message: "Verifone underwriting approval pending. Sandbox test pipeline active.",
    testOrderId: order.orderId
  });
});

app.post("/api/2checkout/webhook", async (req, res) => {
  if (!verifyWebhookAuth(req)) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid webhook signature or token"
    });
  }

  const payload = req.body || {};
  const orderId = payload.REFNOEXT || payload.orderId;
  const status = (payload.ORDERSTATUS || payload.status || "COMPLETE").toUpperCase();

  if (!orderId) {
    return res.status(400).json({ success: false, error: "Missing order identification" });
  }

  const existing = getOrderById(orderId);
  if (!existing) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }

  const reportedAmount = parseFloat(payload.IPN_TOTALGENERAL || payload.total || payload.amount || 0);
  if (reportedAmount > 0) {
    const diff = Math.abs(reportedAmount - existing.totalAmount);
    if (diff > 0.05) {
      return res.status(400).json({
        success: false,
        error: `Payment amount mismatch: expected ${existing.totalAmount}, got ${reportedAmount}`
      });
    }
  }

  const reportedCurrency = (payload.CURRENCY || payload.currency || existing.currency).toUpperCase();
  if (reportedCurrency !== existing.currency.toUpperCase()) {
    return res.status(400).json({
      success: false,
      error: `Currency mismatch: expected ${existing.currency}, got ${reportedCurrency}`
    });
  }

  if (status === "COMPLETE" || status === "AUTHAPPROVED" || status === "PAID") {
    if (existing.paymentStatus === "PAID") {
      return res.json({
        success: true,
        message: "Order already confirmed (idempotent)",
        orderId
      });
    }

    const cjFulfillment = await createCJDropshippingOrder({
      orderId: existing.orderId,
      customerName: existing.customerName,
      customerEmail: existing.customerEmail,
      shippingPhone: existing.shippingPhone,
      shippingAddress: existing.shippingAddress,
      shippingCountry: existing.shippingCountry,
      products: existing.items
    });

    updateOrderStatus(orderId, "CONFIRMED_AND_ROUTED", "PAID", cjFulfillment);

    return res.json({
      success: true,
      message: "2Checkout payment confirmed and routed to warehouse",
      orderId,
      fulfillment: cjFulfillment
    });
  }

  updateOrderStatus(orderId, "PAYMENT_PENDING", status);
  res.json({
    success: true,
    message: "Webhook acknowledged",
    orderId,
    status
  });
});

app.post("/api/payment/simulate", async (req, res) => {
  if (TWOCHECKOUT_MODE !== "SANDBOX" && process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "development") {
    return res.status(403).json({
      success: false,
      error: "Forbidden: Simulation endpoint disabled in live production mode."
    });
  }

  const { orderId, paymentMethod = "SANDBOX_TEST" } = req.body || {};
  if (!orderId) {
    return res.status(400).json({ success: false, error: "Missing orderId parameter" });
  }

  const order = getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: "Order not found" });
  }

  if (order.paymentStatus === "PAID" || order.paymentStatus === "ALLOCATION_RESERVED") {
    return res.json({
      success: true,
      message: "Order already confirmed",
      orderId,
      redirectUrl: `/checkout-success.html?orderId=${encodeURIComponent(orderId)}`
    });
  }

  const cjFulfillment = await createCJDropshippingOrder({
    orderId: order.orderId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    shippingPhone: order.shippingPhone,
    shippingAddress: order.shippingAddress,
    shippingCountry: order.shippingCountry,
    products: order.items
  });

  const targetPaymentStatus = (paymentMethod === "ALLOCATION_RESERVATION") ? "ALLOCATION_RESERVED" : "PAID";
  updateOrderStatus(orderId, "CONFIRMED_AND_ROUTED", targetPaymentStatus, cjFulfillment);

  res.json({
    success: true,
    message: (paymentMethod === "ALLOCATION_RESERVATION")
      ? "VIP allocation reserved and queued for batch production"
      : "Sandbox test payment authorized and routed to staging hub",
    orderId,
    paymentMethod,
    fulfillment: cjFulfillment,
    redirectUrl: `/checkout-success.html?orderId=${encodeURIComponent(orderId)}`
  });
});

app.get("/api/track", (req, res) => {
  const { orderId } = req.query;
  if (!orderId) {
    return res.status(400).json({ success: false, error: "Query parameter orderId is required" });
  }

  const order = getOrderById(orderId.trim());
  if (!order) {
    return res.status(404).json({ success: false, error: "Order reference not recognized" });
  }

  const isPaid = order.paymentStatus === "PAID";
  const fulfillment = order.fulfillment || {};
  const trackingNumber = fulfillment.trackingNumber || null;
  const carrier = fulfillment.carrier || "CJPacket Sensitive Pro";

  const timeline = [
    {
      step: "ORDER_CREATED",
      completed: true,
      label: "Order Stored in Archival Ledger",
      desc: "Order specifications and customer payload validated."
    },
    {
      step: "PAYMENT_CONFIRMED",
      completed: isPaid,
      active: !isPaid,
      label: "256-Bit Payment Authorization",
      desc: isPaid ? "Payment confirmed via cryptographic token." : "Awaiting gateway authorization."
    },
    {
      step: "WAREHOUSE_ROUTING",
      completed: isPaid && Boolean(trackingNumber),
      active: isPaid && !trackingNumber,
      label: "Automated Fulfillment Packaging",
      desc: isPaid ? (trackingNumber ? `Consignment scheduled with ${carrier}.` : "Queued in automated logistics hub.") : "Queued behind payment clearance."
    },
    {
      step: "AIR_TRANSIT",
      completed: false,
      active: false,
      label: "International Air Freight Transit",
      desc: "5–11 business days priority air express."
    },
    {
      step: "DELIVERY",
      completed: false,
      active: false,
      label: "Final Destination Handover",
      desc: "Signature-tracked delivery to registered address."
    }
  ];

  res.json({
    success: true,
    orderId: order.orderId,
    timestamp: order.timestamp,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.status,
    shippingCountry: order.shippingCountry,
    totalAmount: order.totalAmount,
    currency: order.currency,
    itemsCount: order.itemsCount,
    carrier,
    trackingNumber,
    items: (order.items || []).map(i => ({
      title: i.title,
      quantity: i.quantity,
      price: i.price
    })),
    timeline
  });
});

app.post("/api/newsletter", (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, message: "Valid email address required" });
  }
  const result = saveSubscriber(email.trim().toLowerCase());
  res.json({
    success: true,
    message: "Subscribed to KRAVØN Atelier Bulletins",
    subscriber: result.email
  });
});

app.get("/api/categories", (req, res) => {
  const categories = ["All", ...new Set(MOCK_PRODUCTS.map(p => p.category))];
  res.json({ success: true, categories });
});

app.get("/api/products", async (req, res) => {
  const { category, search, sort } = req.query;

  let results = [...MOCK_PRODUCTS];

  if (category && category !== "All") {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.materials.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (sort === "price-asc") {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    results.sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    results.sort((a, b) => b.rating - a.rating);
  }

  res.json({
    success: true,
    count: results.length,
    source: "kravon_anime_engine",
    products: results
  });
});

app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const product = MOCK_PRODUCTS.find(p => p.id === id || p.handle === id || p.sku === id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Item not found" });
  }
  res.json({ success: true, product });
});

app.post("/api/checkout", async (req, res) => {
  const {
    items,
    customerEmail,
    customerName,
    shippingPhone,
    shippingCountryCode = "US",
    shippingCountry = "United States",
    shippingProvince = "New York",
    shippingCity = "New York",
    shippingAddress,
    shippingZip,
    discountCode,
    currency = "USD"
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart cannot be empty" });
  }

  const validatedItems = [];
  let rawSubtotal = 0;

  for (const item of items) {
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      return res.status(400).json({ success: false, message: "Invalid item quantity" });
    }

    const matchedProduct = MOCK_PRODUCTS.find(p => p.id === item.id || p.sku === item.id || p.handle === item.id);
    if (!matchedProduct) {
      return res.status(400).json({ success: false, message: `Product not found: ${item.id}` });
    }

    let matchedVariant = null;
    if (item.variantId) {
      matchedVariant = matchedProduct.variants.find(v => v.id === item.variantId);
      if (!matchedVariant) {
        return res.status(400).json({ success: false, message: `Invalid variant for product ${item.id}` });
      }
    } else {
      matchedVariant = matchedProduct.variants[0];
    }

    const authoritativePrice = matchedVariant.price;
    rawSubtotal += (authoritativePrice * qty);

    validatedItems.push({
      id: matchedProduct.id,
      title: matchedProduct.title,
      variantId: matchedVariant.id,
      cjVid: matchedVariant.cjVid,
      quantity: qty,
      price: authoritativePrice
    });
  }

  if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
    return res.status(400).json({ success: false, message: "Valid customer name required" });
  }

  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return res.status(400).json({ success: false, message: "Valid email address required" });
  }

  if (!shippingAddress || typeof shippingAddress !== "string" || !shippingAddress.trim()) {
    return res.status(400).json({ success: false, message: "Valid shipping address required" });
  }

  if (!shippingCity || typeof shippingCity !== "string" || !shippingCity.trim()) {
    return res.status(400).json({ success: false, message: "Valid city required" });
  }

  if (!shippingZip || typeof shippingZip !== "string" || !shippingZip.trim()) {
    return res.status(400).json({ success: false, message: "Valid postal code required" });
  }

  let discountFactor = 1.0;
  let appliedDiscount = null;
  if (discountCode && discountCode.trim().toUpperCase() === "VIP10") {
    discountFactor = 0.90;
    appliedDiscount = "10% VIP PASS";
  }

  const orderId = `KR-${Math.floor(Math.random() * 900000 + 100000)}`;
  const rate = currency === "EUR" ? 0.92 : 1.0;
  const totalAmount = rawSubtotal * discountFactor * rate;
  const currencySymbol = currency === "EUR" ? "EUR" : "USD";

  const finalName = customerName.trim();
  const finalEmail = customerEmail.trim();
  const finalPhone = shippingPhone?.trim() || "+12125550199";
  const finalAddress = shippingAddress.trim();
  const finalCity = shippingCity.trim();
  const finalProvince = shippingProvince?.trim() || finalCity;
  const finalZip = shippingZip.trim();
  const finalCountryCode = shippingCountryCode || "US";
  const finalCountry = COUNTRY_NAMES[finalCountryCode] || shippingCountry || "United States";

  const orderRecord = {
    orderId,
    timestamp: new Date().toISOString(),
    customerEmail: finalEmail,
    customerName: finalName,
    shippingPhone: finalPhone,
    shippingAddress: `${finalAddress}, ${finalCity}, ${finalProvince} ${finalZip}, ${finalCountry}`,
    shippingCountry: finalCountry,
    itemsCount: validatedItems.length,
    subtotal: parseFloat((rawSubtotal * rate).toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    currency: currencySymbol,
    discount: appliedDiscount || "NONE",
    fulfillment: null,
    status: "UNFULFILLED",
    paymentStatus: "PENDING_PAYMENT"
  };

  saveOrder(orderRecord, validatedItems);

  const checkoutUrl = `/checkout.html?orderId=${orderId}&amount=${totalAmount.toFixed(2)}&currency=${currencySymbol}`;

  res.json({
    success: true,
    provider: "kravon_cj_automated_pipeline",
    orderId,
    appliedDiscount,
    subtotal: parseFloat((rawSubtotal * rate).toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    currency: currencySymbol,
    fulfillment: null,
    order: orderRecord,
    checkoutUrl,
    paymentStatus: "PENDING_PAYMENT"
  });
});

app.get("/products/:id", (req, res) => {
  const { id } = req.params;
  const p = MOCK_PRODUCTS.find(item => item.id === id || item.handle === id || item.sku === id);
  if (!p) {
    return res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
  }

  const primaryVariant = p.variants[0];
  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.title,
    "image": p.images,
    "description": p.description,
    "sku": p.sku,
    "brand": {
      "@type": "Brand",
      "name": "KRAVØN"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://kravon-archive.com/products/${p.handle}`,
      "priceCurrency": "USD",
      "price": p.price.toFixed(2),
      "availability": "https://schema.org/InStock"
    }
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.title} — KRAVØN Atelier</title>
  <meta name="description" content="${p.tagline}">
  <link rel="canonical" href="https://kravon-archive.com/products/${p.handle}">
  <meta property="og:title" content="${p.title} — KRAVØN">
  <meta property="og:description" content="${p.tagline}">
  <meta property="og:image" content="${p.images[0]}">
  <meta property="og:type" content="product">
  <script type="application/ld+json">${schemaJson}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Cinzel:wght@700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <a href="/" class="brand-logo">KRAVØN</a>
      <nav class="nav-links">
        <a href="/">Catalog</a>
        <a href="/tracking">Live Telemetry</a>
        <a href="/faq">FAQ</a>
      </nav>
    </div>
  </header>
  <main class="page-container" style="max-width: 1000px; margin: 40px auto; padding: 0 20px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
      <div>
        <img src="${p.images[0]}" alt="${p.title}" style="width: 100%; border-radius: 12px; border: 1px solid #222630;">
      </div>
      <div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #00e5ff; margin-bottom: 8px;">${p.sku} · ${p.category}</div>
        <h1 style="font-size: 26px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">${p.title}</h1>
        <div style="font-size: 22px; font-weight: 700; color: #00e5ff; margin-bottom: 20px;">$${p.price.toFixed(2)} USD</div>
        <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">${p.description}</p>
        <div style="background: #111318; border: 1px solid #222630; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
          <div style="margin-bottom: 6px;"><strong>Materials:</strong> <span style="color: #d1d5db;">${p.materials}</span></div>
          <div style="margin-bottom: 6px;"><strong>Weight / Dimensions:</strong> <span style="color: #d1d5db;">${p.weight} · ${p.dimensions}</span></div>
          <div><strong>Atelier Origin:</strong> <span style="color: #d1d5db;">${p.origin}</span></div>
        </div>
        <a href="/" style="display: inline-block; background: #00e5ff; color: #000000; font-weight: 700; padding: 14px 28px; border-radius: 8px; text-decoration: none; text-transform: uppercase; font-size: 13px; letter-spacing: 0.05em;">View in Main Storefront</a>
      </div>
    </div>
  </main>
</body>
</html>`;

  res.send(html);
});

app.get("/tracking", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "tracking.html"));
});

app.get("/faq", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "faq.html"));
});

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
    path: req.originalUrl
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    process.stdout.write(`KRAVON_SYSTEM_ONLINE_PORT_${PORT}\n`);
  });
}
