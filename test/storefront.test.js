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
  test("GET /api/status returns brand identity, USD and EUR currencies and 0 inventory", async () => {
    const res = await fetch(`${baseUrl}/api/status`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.status, "online");
    assert.equal(data.brand, "KRAVØN");
    assert.deepEqual(data.currencies, ["USD", "EUR"]);
    assert.ok(data.rates.EUR);
    assert.equal(data.catalogCount, 0);
  });

  test("GET /api/products returns empty array when catalog is cleared", async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.products));
    assert.equal(data.products.length, 0);
  });

  test("POST /api/checkout handles direct order dispatch", async () => {
    const res = await fetch(`${baseUrl}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { id: "custom_item", price: 50.00, quantity: 1 }
        ],
        customerName: "Test Buyer",
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
    assert.equal(data.subtotal, 50.00);
    assert.equal(data.totalAmount, 45.00);
    assert.ok(data.fulfillment);
  });
});
