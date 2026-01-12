import fs from "node:fs";
import path from "node:path";
import { Product, Order } from "./types";
import { id, nowIso } from "./utils";

type DBShape = {
  products: Product[];
  orders: Order[];
};

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(DB_FILE)) {
    const seed: DBShape = {
      products: [
        {
          id: id("p_"),
          name: "Semente de Abóbora",
          pricePer100g: 8.9,
          image: "/images/produto1.jpeg",
          active: true
        },
        {
          id: id("p_"),
          name: "Castanha do Pará",
          pricePer100g: 19.99,
          image: "/images/produto2.jpeg",
          active: true
        },
        {
          id: id("p_"),
          name: "Canela Inteira",
          pricePer100g: 14.0,
          image: "/images/produto3.jpeg",
          active: true
        },
        {
          id: id("p_"),
          name: "Farinha de Açaí",
          pricePer100g: 19.0,
          image: "/images/produto4.jpeg",
          active: true
        }
      ],
      orders: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), "utf-8");
  }
}

export function readDb(): DBShape {
  ensureDb();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw) as DBShape;
}

export function writeDb(next: DBShape) {
  ensureDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(next, null, 2), "utf-8");
}

export function getPublicProducts() {
  const db = readDb();
  return db.products.filter(p => p.active);
}

export function getAllProducts() {
  return readDb().products;
}

export function upsertProduct(p: Product) {
  const db = readDb();
  const idx = db.products.findIndex(x => x.id === p.id);
  if (idx >= 0) db.products[idx] = p;
  else db.products.unshift(p);
  writeDb(db);
  return p;
}

export function setProductActive(id: string, active: boolean) {
  const db = readDb();
  const idx = db.products.findIndex(x => x.id === id);
  if (idx < 0) return null;
  db.products[idx].active = active;
  writeDb(db);
  return db.products[idx];
}

export function createOrder(order: Order) {
  const db = readDb();
  db.orders.unshift(order);
  writeDb(db);
  return order;
}

export function listOrders() {
  return readDb().orders;
}

export function updateOrderStatus(orderId: string, status: Order["status"]) {
  const db = readDb();
  const idx = db.orders.findIndex(o => o.id === orderId);
  if (idx < 0) return null;
  db.orders[idx].status = status;
  writeDb(db);
  return db.orders[idx];
}

export function seedTouch() {
  ensureDb();
  // garante que exista o arquivo; usado no boot
  return { ok: true, at: nowIso() };
}
