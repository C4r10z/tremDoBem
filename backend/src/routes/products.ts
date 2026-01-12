import { Router } from "express";
import { requireAdmin } from "../middleware/admin";
import { store } from "../store/store";

type Product = {
  id: string;
  name: string;
  pricePer100g: number;
  image: string;
  active: boolean;
};

export const productsRouter = Router();

/** PUBLIC: somente ativos */
productsRouter.get("/public", (_req, res) => {
  const products = store.products.filter((p: Product) => p.active);
  return res.json({ products });
});

/** ADMIN: listar tudo */
productsRouter.get("/", requireAdmin, (_req, res) => {
  return res.json({ products: store.products });
});

/** ADMIN: salvar (cria/atualiza por id) */
productsRouter.post("/", requireAdmin, (req, res) => {
  const body = req.body as Partial<Product>;

  if (!body?.id || !body?.name) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const product: Product = {
    id: String(body.id),
    name: String(body.name),
    pricePer100g: Number(body.pricePer100g) || 0,
    image: String(body.image || "/images/produto1.jpeg"),
    active: Boolean(body.active),
  };

  const idx = store.products.findIndex((p: Product) => p.id === product.id);
  if (idx >= 0) store.products[idx] = product;
  else store.products.unshift(product);

  return res.json({ product });
});

/** ADMIN: ativar/desativar */
productsRouter.patch("/:id/active", requireAdmin, (req, res) => {
  const { id } = req.params as { id: string };
  const { active } = req.body as { active?: boolean };

  const p = store.products.find((x: Product) => x.id === id);
  if (!p) return res.status(404).json({ error: "product_not_found" });

  p.active = Boolean(active);
  return res.json({ product: p });
});
