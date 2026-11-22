import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.NODE_ENV === "test"
  ? path.join(dataDir, "storefront_test.db")
  : path.join(dataDir, "storefront.db");

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    shipping_phone TEXT,
    shipping_address TEXT,
    shipping_country TEXT,
    items_count INTEGER DEFAULT 0,
    subtotal REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    discount TEXT DEFAULT 'NONE',
    fulfillment_status TEXT DEFAULT 'UNFULFILLED',
    fulfillment_json TEXT,
    payment_status TEXT DEFAULT 'PENDING_PAYMENT'
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT,
    variant_id TEXT,
    title TEXT,
    quantity INTEGER DEFAULT 1,
    price REAL DEFAULT 0,
    cj_vid TEXT,
    FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    timestamp TEXT NOT NULL,
    source TEXT DEFAULT 'storefront'
  );

  CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp DESC);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
`);

export function saveOrder(order, items = []) {
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      order_id, timestamp, customer_name, customer_email,
      shipping_phone, shipping_address, shipping_country,
      items_count, subtotal, total_amount, currency,
      discount, fulfillment_status, fulfillment_json, payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO order_items (
      order_id, product_id, variant_id, title, quantity, price, cj_vid
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec("BEGIN TRANSACTION");
  try {
    insertOrder.run(
      order.orderId,
      order.timestamp,
      order.customerName,
      order.customerEmail,
      order.shippingPhone,
      order.shippingAddress,
      order.shippingCountry,
      order.itemsCount,
      order.subtotal,
      order.totalAmount,
      order.currency,
      order.discount,
      order.status || "UNFULFILLED",
      JSON.stringify(order.fulfillment || {}),
      order.paymentStatus || "PENDING_PAYMENT"
    );

    for (const item of items) {
      insertItem.run(
        order.orderId,
        item.id,
        item.variantId || null,
        item.title,
        item.quantity,
        item.price,
        item.cjVid || null
      );
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }

  return order;
}

export function getOrders(limit = 50) {
  const query = db.prepare(`
    SELECT * FROM orders ORDER BY timestamp DESC LIMIT ?
  `);
  const rows = query.all(limit);

  return rows.map(r => ({
    orderId: r.order_id,
    timestamp: r.timestamp,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    shippingPhone: r.shipping_phone,
    shippingAddress: r.shipping_address,
    shippingCountry: r.shipping_country,
    itemsCount: r.items_count,
    subtotal: r.subtotal,
    totalAmount: r.total_amount,
    currency: r.currency,
    discount: r.discount,
    status: r.fulfillment_status,
    fulfillment: r.fulfillment_json ? JSON.parse(r.fulfillment_json) : null,
    paymentStatus: r.payment_status
  }));
}

export function getOrderById(orderId) {
  const query = db.prepare(`
    SELECT * FROM orders WHERE order_id = ?
  `);
  const row = query.get(orderId);
  if (!row) return null;

  const itemsQuery = db.prepare(`
    SELECT * FROM order_items WHERE order_id = ?
  `);
  const items = itemsQuery.all(orderId);

  return {
    orderId: row.order_id,
    timestamp: row.timestamp,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    shippingPhone: row.shipping_phone,
    shippingAddress: row.shipping_address,
    shippingCountry: row.shipping_country,
    itemsCount: row.items_count,
    subtotal: row.subtotal,
    totalAmount: row.total_amount,
    currency: row.currency,
    discount: row.discount,
    status: row.fulfillment_status,
    fulfillment: row.fulfillment_json ? JSON.parse(row.fulfillment_json) : null,
    paymentStatus: row.payment_status,
    items: items.map(i => ({
      productId: i.product_id,
      variantId: i.variant_id,
      title: i.title,
      quantity: i.quantity,
      price: i.price,
      cjVid: i.cj_vid
    }))
  };
}

export function updateOrderStatus(orderId, fulfillmentStatus, paymentStatus, fulfillmentJson = null) {
  if (fulfillmentJson) {
    const update = db.prepare(`
      UPDATE orders
      SET fulfillment_status = COALESCE(?, fulfillment_status),
          payment_status = COALESCE(?, payment_status),
          fulfillment_json = COALESCE(?, fulfillment_json)
      WHERE order_id = ?
    `);
    update.run(fulfillmentStatus || null, paymentStatus || null, JSON.stringify(fulfillmentJson), orderId);
  } else {
    const update = db.prepare(`
      UPDATE orders
      SET fulfillment_status = COALESCE(?, fulfillment_status),
          payment_status = COALESCE(?, payment_status)
      WHERE order_id = ?
    `);
    update.run(fulfillmentStatus || null, paymentStatus || null, orderId);
  }
}

export function saveSubscriber(email, source = "storefront") {
  const stmt = db.prepare(`
    INSERT INTO subscribers (email, timestamp, source)
    VALUES (?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET timestamp = excluded.timestamp
  `);
  stmt.run(email, new Date().toISOString(), source);
  return { email, status: "subscribed" };
}

export function getSubscribers() {
  const stmt = db.prepare(`
    SELECT * FROM subscribers ORDER BY timestamp DESC
  `);
  return stmt.all();
}

export function closeDatabase() {
  db.close();
}
