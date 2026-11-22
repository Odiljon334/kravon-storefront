import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "../server.js";
import { getOrderById } from "../db.js";

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

  test("POST /api/checkout validates input and stores order in SQLite database", async () => {
    const res = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: "prod_anime_1", variantId: "var_mask_cyan", price: 118.00, quantity: 1 }
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
    assert.ok(data.orderId);

    const persisted = getOrderById(data.orderId);
    assert.ok(persisted);
    assert.equal(persisted.orderId, data.orderId);
    assert.equal(persisted.customerName, "Elena Rostova");
    assert.equal(persisted.totalAmount, 106.20);
    assert.equal(persisted.items.length, 1);
  });

  test("POST /api/checkout rejects invalid and negative quantities", async () => {
    const res = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: "prod_anime_1", quantity: -2, price: 118.00 }
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
          { id: "prod_anime_1", quantity: 1, price: 118.00 }
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
    const res = await fetch(`${baseUrl}/api/2checkout/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": webhookSecret
      },
      body: JSON.stringify({
        orderId: "KR-TEST-AUTH-99",
        status: "COMPLETE"
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.orderId, "KR-TEST-AUTH-99");
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
});
