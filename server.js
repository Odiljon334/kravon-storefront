import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "";
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const MOCK_PRODUCTS = [
  {
    id: "prod_1",
    shopifyId: "gid://shopify/Product/800101",
    sku: "KR-ANM-01",
    title: "Zero-G Ferrofluid Monolith",
    handle: "zero-g-ferrofluid-monolith",
    category: "Anomalies",
    price: 340.00,
    currency: "USD",
    rating: 4.9,
    reviewsCount: 184,
    stockCount: 6,
    availableForSale: true,
    tagline: "Suspended magnetic fluid monolith reacting to ambient electromagnetic fields.",
    description: "Hermetically sealed optical chamber housing nanoscale ferromagnetic particles in non-polar suspension. Interacts organically with integrated neodymium magnetic dials and ambient electromagnetic radiation.",
    materials: "Borosilicate Glass, Aerospace 6061 Billet, Hydrocarbon Ferrofluid",
    weight: "3.2 lbs",
    dimensions: "8.4 × 3.2 in Cylinder",
    origin: "Zurich Physics Atelier",
    images: [
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "var_1_obsidian", title: "Obsidian Core", hex: "#111215", price: 340.00, inStock: true, imageIndex: 0 },
      { id: "var_1_titanium", title: "Raw Titanium", hex: "#7a7974", price: 375.00, inStock: true, imageIndex: 1 }
    ],
    tags: ["Ferrofluid", "Anomaly", "Electromagnetic", "Titanium"]
  },
  {
    id: "prod_2",
    shopifyId: "gid://shopify/Product/800102",
    sku: "KR-ART-02",
    title: "Synthetic Aerogel Matrix Vault",
    handle: "synthetic-aerogel-matrix-vault",
    category: "Artifacts",
    price: 280.00,
    currency: "USD",
    rating: 4.9,
    reviewsCount: 112,
    stockCount: 4,
    availableForSale: true,
    tagline: "99.8% air silica aerogel matrix encased in an airtight sapphire vault.",
    description: "Ultra-low-density mesoporous silica matrix known as frozen smoke. Scatters ambient Rayleigh wavelengths identically to the upper stratosphere. Encased in a vacuum-sealed grade 5 titanium monocoque.",
    materials: "Grade 5 Titanium, Anti-reflective Sapphire Crystal, Silica Aerogel",
    weight: "5.4 oz",
    dimensions: "2.5 × 2.5 × 2.5 in",
    origin: "Tsukuba Materials Institute",
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "var_2_raw", title: "Bead-Blasted Ti", hex: "#8c8b86", price: 280.00, inStock: true, imageIndex: 0 },
      { id: "var_2_dlc", title: "DLC Basalt", hex: "#16171a", price: 315.00, inStock: true, imageIndex: 1 }
    ],
    tags: ["Aerogel", "Grade 5 Titanium", "Sapphire", "Titanium"]
  },
  {
    id: "prod_3",
    shopifyId: "gid://shopify/Product/800103",
    sku: "KR-INS-03",
    title: "Obelisk Harmonic Synth Sculpture",
    handle: "obelisk-harmonic-synth-sculpture",
    category: "Instruments",
    price: 520.00,
    currency: "USD",
    rating: 5.0,
    reviewsCount: 79,
    stockCount: 3,
    availableForSale: true,
    tagline: "Monolithic cast-iron drone synthesizer tuned to sub-harmonic frequencies.",
    description: "Screen-less analog sound monument generating continuous binaural drones and microtonal oscillations via solid bronze touch sensors. Built with discrete transistors and warm voltage filters.",
    materials: "Cast Iron Monolith, Phosphor Bronze Plates, Analog Voltage Core",
    weight: "6.8 lbs",
    dimensions: "14.2 × 4.0 × 3.5 in",
    origin: "Stockholm Sound Atelier",
    images: [
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "var_3_iron", title: "Cast Iron", hex: "#1f2024", price: 520.00, inStock: true, imageIndex: 0 },
      { id: "var_3_bronze", title: "Oxidized Patina", hex: "#4a4e44", price: 560.00, inStock: true, imageIndex: 1 }
    ],
    tags: ["Synthesizer", "Analog", "Monolith", "Acoustics"]
  },
  {
    id: "prod_4",
    shopifyId: "gid://shopify/Product/800104",
    sku: "KR-ART-04",
    title: "Widmanstätten Meteorite Talisman",
    handle: "widmanstatten-meteorite-talisman",
    category: "Artifacts",
    price: 195.00,
    currency: "USD",
    rating: 4.9,
    reviewsCount: 247,
    stockCount: 8,
    availableForSale: true,
    tagline: "4.5-billion-year-old Muonionalusta meteorite slab with octahedral crystal lattice.",
    description: "Solid extraterrestrial slab cut from the core of an ancient asteroid. Nitric acid-etched to reveal irreplaceable Widmanstätten crystal structures formed over millions of years of vacuum cooling.",
    materials: "Muonionalusta Meteorite, Grade 5 Titanium Monocoque, Rhodium Seal",
    weight: "2.8 oz",
    dimensions: "2.8 × 1.6 × 0.25 in",
    origin: "Kiruna Deep Borehole, Sweden",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "var_4_raw", title: "Natural Lattice", hex: "#6e6d68", price: 195.00, inStock: true, imageIndex: 0 },
      { id: "var_4_dark", title: "Dark Rhodium", hex: "#232428", price: 225.00, inStock: true, imageIndex: 1 }
    ],
    tags: ["Meteorite", "Widmanstatten", "Extraterrestrial", "Titanium"]
  },
  {
    id: "prod_5",
    shopifyId: "gid://shopify/Product/800105",
    sku: "KR-WVR-05",
    title: "Obsidian Mineral Shield Shroud",
    handle: "obsidian-mineral-shield-shroud",
    category: "Wearables",
    price: 390.00,
    currency: "USD",
    rating: 4.8,
    reviewsCount: 136,
    stockCount: 5,
    availableForSale: true,
    tagline: "Thermal-shielding basalt yarn cloak with integrated Faraday signal damping.",
    description: "Unisex architectural cloak woven from continuous molten basalt rock fibers and silver micro-ripstop. Incorporates a hermetic signal-blocking inner pocket and Fidlock magnetic closure.",
    materials: "Basalt Mineral Fiber, Silver Shielding Mesh, Fidlock V-Buckle",
    weight: "1.4 lbs",
    dimensions: "Unisex Architectural Oversized Fit",
    origin: "Reykjavik / Milan",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544022613-e87ce7526edb?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "var_5_basalt", title: "Basalt Charcoal", hex: "#1c1d20", price: 390.00, inStock: true, imageIndex: 0 },
      { id: "var_5_ash", title: "Mineral Ash", hex: "#3e4438", price: 410.00, inStock: true, imageIndex: 1 }
    ],
    tags: ["Basalt Fiber", "Faraday Shield", "Wearable", "Fidlock"]
  },
  {
    id: "prod_6",
    shopifyId: "gid://shopify/Product/800106",
    sku: "KR-CUR-06",
    title: "Bismuth Crystallized Prismatic Monolith",
    handle: "bismuth-crystallized-prismatic-monolith",
    category: "Curiosities",
    price: 145.00,
    currency: "USD",
    rating: 4.9,
    reviewsCount: 380,
    stockCount: 11,
    availableForSale: true,
    tagline: "Laboratory-crystallized high-purity bismuth displaying hopper-step iridescent geometry.",
    description: "Heavy elemental crystal grown through controlled thermal reduction. Surface features natural interference oxide coloration spanning deep gold, violet, and electric teal mounted on a machined basalt pedestal.",
    materials: "99.99% Elemental Bismuth (Bi-83), Machined Basalt Stone",
    weight: "2.1 lbs",
    dimensions: "4.2 × 3.8 × 3.0 in",
    origin: "Freiburg Mineral Lab",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
    ],
    variants: [
      { id: "var_6_spectral", title: "Spectral Iridescent", hex: "#8c6b99", price: 145.00, inStock: true, imageIndex: 0 },
      { id: "var_6_gold", title: "Deep Aurum", hex: "#a67c47", price: 165.00, inStock: true, imageIndex: 1 }
    ],
    tags: ["Bismuth", "Elemental", "Crystal", "Mineral"]
  }
];

async function queryShopifyStorefront(query, variables = {}) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    return null;
  }

  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN
      },
      body: JSON.stringify({ query, variables })
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    return null;
  }
}

app.get("/api/status", async (req, res) => {
  const shopifyActive = Boolean(SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_ACCESS_TOKEN);

  res.json({
    status: "online",
    brand: "KRAVØN",
    environment: shopifyActive ? "shopify_live" : "concept_archive",
    currencies: ["USD", "EUR"],
    rates: {
      USD: 1.0,
      EUR: 0.92
    },
    catalogCount: MOCK_PRODUCTS.length
  });
});

app.get("/api/products", async (req, res) => {
  const { category, search, sort } = req.query;

  if (SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    const shopifyQuery = `
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              productType
              totalInventory
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                    }
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const liveData = await queryShopifyStorefront(shopifyQuery, { first: 20 });
    if (liveData?.products?.edges) {
      const liveProducts = liveData.products.edges.map(({ node }) => ({
        id: node.id.replace("gid://shopify/Product/", "live_"),
        shopifyId: node.id,
        sku: `KR-LIVE-${node.id.slice(-4)}`,
        title: node.title,
        handle: node.handle,
        category: node.productType || "Artifacts",
        price: parseFloat(node.priceRange.minVariantPrice.amount),
        currency: node.priceRange.minVariantPrice.currencyCode,
        rating: 4.9,
        reviewsCount: 88,
        stockCount: node.totalInventory || 12,
        availableForSale: true,
        tagline: node.description.slice(0, 75),
        description: node.description,
        materials: "Precision Composite",
        weight: "1.2 lbs",
        dimensions: "Modular",
        origin: "Zurich / Tokyo",
        images: node.images.edges.map(e => e.node.url),
        variants: node.variants.edges.map(({ node: v }, idx) => ({
          id: v.id,
          title: v.title,
          hex: idx === 0 ? "#111215" : "#7a7974",
          price: parseFloat(v.price.amount),
          inStock: v.availableForSale,
          imageIndex: 0
        })),
        tags: ["Live", "Shopify"]
      }));

      return res.json({
        success: true,
        count: liveProducts.length,
        source: "shopify_storefront_api",
        products: liveProducts
      });
    }
  }

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
    source: "mock_engine",
    products: results
  });
});

app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const product = MOCK_PRODUCTS.find(p => p.id === id || p.handle === id || p.shopifyId === id || p.sku === id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Item not found" });
  }
  res.json({ success: true, product });
});

app.post("/api/checkout", async (req, res) => {
  const { items, customerEmail, discountCode, currency = "USD" } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart cannot be empty" });
  }

  let discountFactor = 1.0;
  let appliedDiscount = null;
  if (discountCode && discountCode.trim().toUpperCase() === "VIP10") {
    discountFactor = 0.90;
    appliedDiscount = "10% VIP PASS";
  }

  if (SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    const cartMutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const lines = items.map(item => ({
      merchandiseId: item.variantId || item.id,
      quantity: item.quantity || 1
    }));

    const cartData = await queryShopifyStorefront(cartMutation, {
      input: {
        lines,
        buyerIdentity: customerEmail ? { email: customerEmail } : undefined,
        discountCodes: discountCode ? [discountCode.trim()] : undefined
      }
    });

    if (cartData?.cartCreate?.cart?.checkoutUrl) {
      return res.json({
        success: true,
        provider: "shopify_hosted",
        checkoutUrl: cartData.cartCreate.cart.checkoutUrl,
        cartId: cartData.cartCreate.cart.id
      });
    }
  }

  const orderId = `KR-${Math.floor(Math.random() * 900000 + 100000)}`;
  const rate = currency === "EUR" ? 0.92 : 1.0;
  const rawSubtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalAmount = rawSubtotal * discountFactor * rate;
  const currencySymbol = currency === "EUR" ? "EUR" : "USD";

  res.json({
    success: true,
    provider: "kravon_gateway",
    orderId,
    appliedDiscount,
    subtotal: parseFloat((rawSubtotal * rate).toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    currency: currencySymbol,
    checkoutUrl: `/checkout-success.html?orderId=${orderId}&total=${totalAmount.toFixed(2)}&currency=${currencySymbol}&discount=${appliedDiscount || "NONE"}`
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    process.stdout.write(`KRAVON_SYSTEM_ONLINE_PORT_${PORT}\n`);
  });
}