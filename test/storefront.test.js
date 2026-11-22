import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "../server.js";

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

describe("Kravon Headless Storefront Suite", () => {
  test("GET /api/status returns brand identity, USD and EUR currencies and inventory", async () => {
    const res = await fetch(`${baseUrl}/api/status`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.status, "online");
    assert.equal(data.brand, "KRAVØN");
    assert.deepEqual(data.currencies, ["USD", "EUR"]);
    assert.ok(data.rates.EUR);
    assert.equal(data.catalogCount, 4);
  });

  test("GET /api/products returns rich technical specifications in US imperial units", async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.products));
    assert.equal(data.products.length, 4);

    const sample = data.products[0];
    assert.ok(sample.sku);
    assert.ok(sample.materials);
    assert.match(sample.weight, /oz/);
    assert.match(sample.dimensions, /in/);
    assert.ok(sample.origin);
    assert.ok(sample.variants.length > 0);
  });

  test("GET /api/products?category=Apparel filters correctly", async () => {
    const res = await fetch(`${baseUrl}/api/products?category=Apparel`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.products.length, 1);
    assert.equal(data.products[0].id, "prod_anime_3");
  });

  test("GET /api/products?search=Cyberpunk returns matching artifacts", async () => {
    const res = await fetch(`${baseUrl}/api/products?search=Cyberpunk`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.products.length >= 1);
  });

  test("GET /api/products?sort=price-asc verifies ascending sorting", async () => {
    const res = await fetch(`${baseUrl}/api/products?sort=price-asc`);
    assert.equal(res.status, 200);

    const data = await res.json();
    for (let i = 0; i < data.products.length - 1; i++) {
      assert.ok(data.products[i].price <= data.products[i + 1].price);
    }
  });

  test("POST /api/checkout routes directly to CJ Dropshipping fulfillment", async () => {
    const res = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: "prod_anime_1", variantId: "var_mask_cyan", price: 118.00, quantity: 1 }
        ],
        customerName: "Test Suite Buyer",
        customerEmail: "qa@kravon.com",
        shippingPhone: "12125550199",
        shippingAddress: "120 Broadway",
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
    assert.ok(data.fulfillment);
    assert.ok(data.checkoutUrl.includes("checkout-success.html"));
  });

  test("GET /api/2checkout/config returns gateway configuration and Payoneer integration", async () => {
    const res = await fetch(`${baseUrl}/api/2checkout/config`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.payoutProvider, "PAYONEER_UZB");
    assert.ok(data.gateway);
  });

  test("POST /api/2checkout/webhook processes order status notification", async () => {
    const res = await fetch(`${baseUrl}/api/2checkout/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        REFNOEXT: "KR-TEST-2CO-01",
        ORDERSTATUS: "COMPLETE"
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.orderId, "KR-TEST-2CO-01");
  });

  test("GET /api/unknown-route returns 404 JSON rather than HTML", async () => {
    const res = await fetch(`${baseUrl}/api/unknown-route`);
    assert.equal(res.status, 404);

    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, "API endpoint not found");
  });

  test("GET /api/cj/orders masks sensitive customer details by default", async () => {
    const res = await fetch(`${baseUrl}/api/cj/orders`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.orders));
    if (data.orders.length > 0) {
      const first = data.orders[0];
      assert.ok(!first.shippingAddress);
      assert.ok(first.customerName.includes("***"));
    }
  });
});
