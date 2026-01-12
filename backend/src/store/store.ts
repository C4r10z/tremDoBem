export type Product = {
  id: string;
  name: string;
  pricePer100g: number;
  image: string;
  active: boolean;
};

export type OrderStatus = "PENDING" | "IN_DELIVERY" | "DELIVERED" | "CANCELED";

export type OrderItem = {
  productId: string;
  name: string;
  pricePer100g: number;
  grams: number;
  lineTotal: number;
  image: string;
};

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
  items: OrderItem[];
  totals: { subtotal: number };
  notes?: string;
};

export const store = {
  products: [
    { id: "p_semente_abobora", name: "Semente de abóbora", pricePer100g: 8.9, image: "/images/produto1.jpeg", active: true },
    { id: "p_castanha_para", name: "Castanha do pará", pricePer100g: 19.99, image: "/images/produto2.jpeg", active: true },
    { id: "p_canela_inteira", name: "Canela Inteira", pricePer100g: 14.0, image: "/images/produto3.jpeg", active: true },
    { id: "p_farinha_acai", name: "Farinha de Açaí", pricePer100g: 19.0, image: "/images/produto4.jpeg", active: true },
  ] as Product[],
  orders: [] as Order[],
};
