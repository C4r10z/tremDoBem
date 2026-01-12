export type Product = {
  id: string;
  name: string;
  pricePer100g: number;
  image: string;
  active: boolean;
};

export type OrderStatus = "PENDING" | "IN_DELIVERY" | "DELIVERED" | "CANCELED";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    address: string;
    reference?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    pricePer100g: number;
    grams: number;
    lineTotal: number;
    image: string;
  }>;
  totals: {
    subtotal: number;
  };
  notes?: string;
};

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3334";

function token() {
  return localStorage.getItem("tdb_admin_token") || "";
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);

  if (!res.ok) {
    let err: any = { status: res.status };
    try {
      err = { ...err, ...(await res.json()) };
    } catch {}
    throw err;
  }

  return res.json() as Promise<T>;
}

/* =========================
   PUBLIC
========================= */

export async function fetchPublicProducts() {
  return http<{ products: Product[] }>("/products/public");
}

/** Nome novo (se você quiser usar depois) */
export const getPublicProducts = fetchPublicProducts;

export async function createOrder(payload: {
  customer: { name: string; phone: string; address: string; reference?: string };
  items: Array<{ productId: string; grams: number }>;
  notes?: string;
}) {
  return http<{ order: Order }>("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Compat com seu código antigo */
export const checkout = createOrder;

/* =========================
   ADMIN AUTH
========================= */

export async function adminLogin(user: string, pass: string) {
  const data = await http<{ token: string; user: string }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, pass }),
  });

  localStorage.setItem("tdb_admin_token", data.token);
  return data;
}

export function adminLogout() {
  localStorage.removeItem("tdb_admin_token");
}

/* =========================
   ADMIN PRODUCTS
========================= */

export async function adminGetProducts() {
  return http<{ products: Product[] }>("/products", {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function adminSaveProduct(product: Product) {
  return http<{ product: Product }>("/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify(product),
  });
}

export async function adminSetProductActive(productId: string, active: boolean) {
  return http<{ product: Product }>(`/products/${productId}/active`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify({ active }),
  });
}

/** Nome novo (se quiser usar depois) */
export const adminListProducts = adminGetProducts;

/* =========================
   ADMIN ORDERS
========================= */

export async function adminGetOrders() {
  return http<{ orders: Order[] }>("/orders", {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function adminSetOrderStatus(orderId: string, status: OrderStatus) {
  return http<{ order: Order }>(`/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify({ status }),
  });
}

/** Nomes novos (se quiser usar depois) */
export const adminListOrders = adminGetOrders;
export const adminUpdateOrderStatus = adminSetOrderStatus;
