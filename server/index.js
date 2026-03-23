const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { initDb } = require("./db");

const ORDER_STATUSES = new Set([
  "sent",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "canceled",
]);

const { db, dbPath } = initDb();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const ORDER_ID_PREFIX = "TLP-";
const ORDER_ID_BYTES = 12;
const MAX_ID_GENERATION_RETRIES = 5;

function generateOrderId() {
  return `${ORDER_ID_PREFIX}${crypto.randomBytes(ORDER_ID_BYTES).toString("hex").toUpperCase()}`;
}

function generateUniqueOrderId() {
  const exists = db.prepare("SELECT 1 FROM orders WHERE id = ?");
  for (let attempt = 0; attempt < MAX_ID_GENERATION_RETRIES; attempt += 1) {
    const id = generateOrderId();
    if (!exists.get(id)) {
      return id;
    }
  }

  throw new Error("Failed to generate a unique order ID");
}

function parseOrderRow(row) {
  if (!row) return null;
  let payload = {};
  try {
    payload = JSON.parse(row.payload_json);
  } catch {
    payload = {};
  }

  return {
    id: row.id,
    created_at: row.created_at,
    status: row.status,
    payload,
  };
}

function requireAdminToken(req, res, next) {
  const configuredToken = process.env.ADMIN_TOKEN;
  if (!configuredToken) {
    return res.status(500).json({ error: "ADMIN_TOKEN is not configured" });
  }

  const auth = req.get("authorization") || "";
  const expected = `Bearer ${configuredToken}`;
  if (auth !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/orders", (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return res.status(400).json({ error: "Payload must be a JSON object" });
  }

  let id;
  try {
    id = generateUniqueOrderId();
  } catch {
    return res.status(503).json({ error: "Could not generate order ID. Please retry." });
  }
  const createdAt = new Date().toISOString();
  const status = "sent";

  db.prepare(
    "INSERT INTO orders (id, created_at, payload_json, status) VALUES (?, ?, ?, ?)"
  ).run(id, createdAt, JSON.stringify(payload), status);

  return res.status(201).json({ id });
});

app.get("/api/orders/:id", (req, res) => {
  const row = db
    .prepare("SELECT id, created_at, payload_json, status FROM orders WHERE id = ?")
    .get(req.params.id);

  if (!row) {
    return res.status(404).json({ error: "Order not found" });
  }

  return res.json(parseOrderRow(row));
});

app.patch("/api/orders/:id/status", requireAdminToken, (req, res) => {
  const { status } = req.body || {};
  if (!ORDER_STATUSES.has(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const update = db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  if (update.changes === 0) {
    return res.status(404).json({ error: "Order not found" });
  }

  const row = db
    .prepare("SELECT id, created_at, payload_json, status FROM orders WHERE id = ?")
    .get(req.params.id);

  return res.json(parseOrderRow(row));
});

app.get("/api/admin/orders", requireAdminToken, (req, res) => {
  const { status } = req.query;

  let rows;
  if (status) {
    if (!ORDER_STATUSES.has(status)) {
      return res.status(400).json({ error: "Invalid status filter" });
    }
    rows = db
      .prepare(
        "SELECT id, created_at, payload_json, status FROM orders WHERE status = ? ORDER BY created_at DESC"
      )
      .all(status);
  } else {
    rows = db
      .prepare("SELECT id, created_at, payload_json, status FROM orders ORDER BY created_at DESC")
      .all();
  }

  return res.json(rows.map(parseOrderRow));
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`[orders-server] listening on :${PORT}`);
  console.log(`[orders-server] DB_PATH=${dbPath}`);
});
