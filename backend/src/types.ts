export type Product = {
  id: string;
  name: string;
  pricePer100g: number;
  image: string;
  active: boolean;
};

export type Order = {
  id: string;
  createdAt: string;
  status: "PENDING" | "IN_DELIVERY" | "DELIVERED" | "CANCELED";
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
