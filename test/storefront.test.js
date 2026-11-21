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
    assert.ok(data.catalogCount >= 6);
  });

  test("GET /api/products returns rich technical specifications in US imperial units", async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.products));

    const sample = data.products[0];
    assert.ok(sample.sku);
    assert.ok(sample.materials);
    assert.match(sample.weight, /lbs|oz/);
    assert.match(sample.dimensions, /in/);
    assert.ok(sample.origin);
    assert.ok(sample.variants.length > 0);
  });

  test("GET /api/products?category=Artifacts filters correctly", async () => {
    const res = await fetch(`${baseUrl}/api/products?category=Artifacts`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.products.length >= 1);
  });

  test("GET /api/products?search=Titanium returns matching artifacts", async () => {
    const res = await fetch(`${baseUrl}/api/products?search=Titanium`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.products.length >= 2);
  });

  test("GET /api/products?sort=price-asc verifies ascending sorting", async () => {
    const res = await fetch(`${baseUrl}/api/products?sort=price-asc`);
    assert.equal(res.status, 200);

    const data = await res.json();
    for (let i = 0; i < data.products.length - 1; i++) {
      assert.ok(data.products[i].price <= data.products[i + 1].price);
    }
  });

  test("POST /api/checkout applies coupon discount factor", async () => {
    const res = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: "prod_2", variantId: "var_2_raw", price: 280.00, quantity: 1 }
        ],
        discountCode: "VIP10"
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.subtotal, 280.00);
    assert.equal(data.totalAmount, 252.00);
  });
});