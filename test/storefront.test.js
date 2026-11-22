import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { app } from "../server.js";
import { getOrderById, getSubscribers } from "../db.js";

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

describe("Kravon Production Storefront & Security Suite", () => {
  test("GET /api/status returns brand identity, currencies and catalog count", async () => {
    const res = await fetch(`${baseUrl}/api/status`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.status, "online");
    assert.equal(data.brand, "KRAVØN");
    assert.deepEqual(data.currencies, ["USD", "EUR"]);
    assert.ok(data.rates.EUR);
    assert.equal(data.catalogCount, 4);
  });

  test("Security headers are enforced across all responses", async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);

    assert.ok(res.headers.get("content-security-policy"));
    assert.equal(res.headers.get("x-frame-options"), "SAMEORIGIN");
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.ok(res.headers.get("strict-transport-security"));
    assert.equal(res.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  });

  test("GET /robots.txt and /sitemap.xml serve valid crawler directives", async () => {
    const robotsRes = await fetch(`${baseUrl}/robots.txt`);
    assert.equal(robotsRes.status, 200);
    const robotsText = await robotsRes.text();
    assert.match(robotsText, /User-agent: \*/);
    assert.match(robotsText, /Sitemap:/);

    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    assert.equal(sitemapRes.status, 200);
    const sitemapXml = await sitemapRes.text();
    assert.match(sitemapXml, /<urlset/);
    assert.match(sitemapXml, /kravon-archive\.com/);
    assert.match(sitemapXml, /cyberpunk-led-light-up-winged-mask/);
    assert.match(sitemapXml, /tracking/);
    assert.match(sitemapXml, /faq/);
  });

  test("GET /api/products returns rich technical specifications", async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.products.length, 4);

    const sample = data.products[0];
    assert.ok(sample.sku);
    assert.ok(sample.materials);
    assert.match(sample.weight, /oz/);
    assert.match(sample.dimensions, /in/);
    assert.ok(sample.origin);
    assert.ok(sample.variants.length > 0);
  });

  test("GET /api/products?category=Apparel filters accurately", async () => {
    const res = await fetch(`${baseUrl}/api/products?category=Apparel`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.products.length, 1);
    assert.equal(data.products[0].id, "prod_anime_3");
  });

  test("GET /api/products?search=Cyberpunk returns matching items", async () => {
    const res = await fetch(`${baseUrl}/api/products?search=Cyberpunk`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.products.length >= 1);
  });

  test("GET /api/products?sort=price-asc sorts products ascending", async () => {
    const res = await fetch(`${baseUrl}/api/products?sort=price-asc`);
    assert.equal(res.status, 200);

    const data = await res.json();
    for (let i = 0; i < data.products.length - 1; i++) {
      assert.ok(data.products[i].price <= data.products[i + 1].price);
    }
  });

  test("POST /api/checkout validates input and stores order in SQLite with PENDING_PAYMENT", async () => {
    const res = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: "prod_anime_1", variantId: "var_mask_cyan", quantity: 1 }
        ],
        customerName: "Elena Rostova",
        customerEmail: "elena@kravon.com",
        shippingPhone: "+12125550199",
        shippingAddress: "120 Broadway St, Suite 400",
        shippingCity: "New York",
        shippingProvince: "NY",
        shippingZip: "10005",
        shippingCountryCode: "US",
        discountCode: "VIP10"
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.subtotal, 118.00);
    assert.equal(data.totalAmount, 106.20);
    assert.equal(data.paymentStatus, "PENDING_PAYMENT");
    assert.ok(data.orderId);
    assert.match(data.checkoutUrl, /checkout\.html/);

    const persisted = getOrderById(data.orderId);
    assert.ok(persisted);
    assert.equal(persisted.orderId, data.orderId);
    assert.equal(persisted.customerName, "Elena Rostova");
    assert.equal(persisted.totalAmount, 106.20);
    assert.equal(persisted.paymentStatus, "PENDING_PAYMENT");
    assert.equal(persisted.status, "UNFULFILLED");
    assert.equal(persisted.items.length, 1);
  });

  test("POST /api/checkout rejects invalid and negative quantities", async () => {
    const res = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: "prod_anime_1", quantity: -2 }
        ],
        customerName: "Bad Actor",
        customerEmail: "bad@test.com",
        shippingAddress: "123 Street",
        shippingCity: "City",
        shippingZip: "10001"
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.message, "Invalid item quantity");
  });

  test("POST /api/checkout rejects invalid emails", async () => {
    const res = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: "prod_anime_1", quantity: 1 }
        ],
        customerName: "Bad Actor",
        customerEmail: "not-an-email",
        shippingAddress: "123 Street",
        shippingCity: "City",
        shippingZip: "10001"
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.message, "Valid email address required");
  });

  test("POST /api/checkout rejects unknown products (strict catalog authority)", async () => {
    const res = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: "phantom_rogue_product_99", quantity: 1, price: 1.00 }
        ],
        customerName: "Intruder",
        customerEmail: "intruder@kravon.com",
        shippingAddress: "123 Street",
        shippingCity: "City",
        shippingZip: "10001"
      })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /Product not found/);
  });

  test("POST /api/payment/simulate authorizes payment and routes order", async () => {
    const checkoutRes = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: "prod_anime_2", variantId: "var_jkt_m", quantity: 1 }
        ],
        customerName: "Kenji Sato",
        customerEmail: "kenji@kravon.com",
        shippingAddress: "450 Shibuya Crossing",
        shippingCity: "Tokyo",
        shippingZip: "150-0002",
        shippingCountryCode: "JP"
      })
    });
    const checkoutData = await checkoutRes.json();
    const orderId = checkoutData.orderId;

    const payRes = await fetch(`${baseUrl}/api/payment/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        paymentMethod: "CREDIT_CARD"
      })
    });
    assert.equal(payRes.status, 200);
    const payData = await payRes.json();
    assert.equal(payData.success, true);
    assert.ok(payData.fulfillment);

    const updated = getOrderById(orderId);
    assert.equal(updated.paymentStatus, "PAID");
    assert.equal(updated.status, "CONFIRMED_AND_ROUTED");
  });

  test("GET /api/track returns order state, timeline and masks PII", async () => {
    const checkoutRes = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: "prod_anime_4", variantId: "var_dagger_set", quantity: 1 }
        ],
        customerName: "Classified Buyer",
        customerEmail: "buyer@kravon.com",
        shippingAddress: "400 Intelligence Way",
        shippingCity: "Washington",
        shippingZip: "20001",
        shippingCountryCode: "US"
      })
    });
    const { orderId } = await checkoutRes.json();

    const trackRes = await fetch(`${baseUrl}/api/track?orderId=${orderId}`);
    assert.equal(trackRes.status, 200);
    const trackData = await trackRes.json();
    assert.equal(trackData.success, true);
    assert.equal(trackData.orderId, orderId);
    assert.equal(trackData.paymentStatus, "PENDING_PAYMENT");
    assert.ok(Array.isArray(trackData.timeline));
    assert.equal(trackData.timeline.length, 5);
  });

  test("POST /api/newsletter registers valid emails and rejects bad input", async () => {
    const badRes = await fetch(`${baseUrl}/api/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email" })
    });
    assert.equal(badRes.status, 400);

    const goodRes = await fetch(`${baseUrl}/api/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "collector@kravon.com" })
    });
    assert.equal(goodRes.status, 200);
    const goodData = await goodRes.json();
    assert.equal(goodData.success, true);
    assert.equal(goodData.subscriber, "collector@kravon.com");

    const subs = getSubscribers();
    assert.ok(subs.some(s => s.email === "collector@kravon.com"));
  });

  test("POST /api/2checkout/webhook blocks unauthenticated forgery with 401", async () => {
    const res = await fetch(`${baseUrl}/api/2checkout/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        REFNOEXT: "KR-FORGED-01",
        ORDERSTATUS: "COMPLETE"
      })
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.error, /Unauthorized/);
  });

  test("POST /api/2checkout/webhook accepts authorized requests and updates order", async () => {
    const webhookSecret = process.env.WEBHOOK_SECRET || "kravon_secure_webhook_secret_2026";
    const checkoutRes = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: "prod_anime_3", variantId: "var_hoodie_l", quantity: 1 }
        ],
        customerName: "Webhook Buyer",
        customerEmail: "buyer@kravon.com",
        shippingAddress: "77 Cyber Ave",
        shippingCity: "Berlin",
        shippingZip: "10115",
        shippingCountryCode: "DE"
      })
    });
    const { orderId } = await checkoutRes.json();

    const res = await fetch(`${baseUrl}/api/2checkout/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": webhookSecret
      },
      body: JSON.stringify({
        orderId,
        status: "COMPLETE"
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.orderId, orderId);

    const updated = getOrderById(orderId);
    assert.equal(updated.paymentStatus, "PAID");
    assert.equal(updated.status, "CONFIRMED_AND_ROUTED");
  });

  test("GET /api/cj/orders masks sensitive customer details without admin key", async () => {
    const res = await fetch(`${baseUrl}/api/cj/orders`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    if (data.orders.length > 0) {
      assert.match(data.orders[0].customerName, /\*\*\*/);
    }
  });

  test("GET /api/unknown-route returns 404 JSON rather than HTML", async () => {
    const res = await fetch(`${baseUrl}/api/unknown-route`);
    assert.equal(res.status, 404);

    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, "API endpoint not found");
  });

  test("GET /products/:handle returns dedicated SEO product page", async () => {
    const res = await fetch(`${baseUrl}/products/cyberpunk-led-light-up-winged-mask`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Cyberpunk LED Light-Up Winged Mask/);
    assert.match(html, /schema\.org/);
    assert.match(html, /KRAVØN Atelier/);
  });

  test("GET /tracking and /faq return HTTP 200 with dedicated markup", async () => {
    const trackRes = await fetch(`${baseUrl}/tracking`);
    assert.equal(trackRes.status, 200);
    const trackHtml = await trackRes.text();
    assert.match(trackHtml, /Live Order Telemetry/);

    const faqRes = await fetch(`${baseUrl}/faq`);
    assert.equal(faqRes.status, 200);
    const faqHtml = await faqRes.text();
    assert.match(faqHtml, /Atelier Inquiries/);
  });

  test("GET /void-unknown-page returns HTTP 404 rather than 200", async () => {
    const res = await fetch(`${baseUrl}/void-unknown-page-nonexistent`);
    assert.equal(res.status, 404);
    const html = await res.text();
    assert.match(html, /Void Coordinate Sequence/);
  });
});
