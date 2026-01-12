import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";
import { fetchPublicProducts, Product } from "../lib/api";
import { brl } from "../lib/money";

type CartItem = { productId: string; grams: number };

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("tdb_cart");
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>(loadCart());
  const [drawer, setDrawer] = useState(false);

  // grams “por produto” para adicionar
  const [gramsDraft, setGramsDraft] = useState<Record<string, number>>({});

  useEffect(() => {
    localStorage.setItem("tdb_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    (async () => {
      try {
        const { products } = await fetchPublicProducts();
        setProducts(products);
        // inicializa drafts
        const init: Record<string, number> = {};
        for (const p of products) init[p.id] = 100;
        setGramsDraft(init);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cartCount = cart.reduce((a, i) => a + i.grams / 100, 0);
  const subtotal = useMemo(() => {
    const byId = new Map(products.map(p => [p.id, p]));
    const sum = cart.reduce((acc, it) => {
      const p = byId.get(it.productId);
      if (!p) return acc;
      return acc + p.pricePer100g * (it.grams / 100);
    }, 0);
    return Math.round((sum + Number.EPSILON) * 100) / 100;
  }, [cart, products]);

  const addToCart = (productId: string) => {
    const grams = gramsDraft[productId] || 100;
    setCart(prev => {
      const idx = prev.findIndex(x => x.productId === productId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], grams: next[idx].grams + grams };
        return next;
      }
      return [...prev, { productId, grams }];
    });
    setDrawer(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <div className="mt-10 flex items-end justify-between gap-3">
          <div>
            <div className="text-white font-black text-2xl">Produtos</div>
            <div className="text-white/65 text-sm">
              Escolha e ajuste a quantidade em <b>100g</b>.
            </div>
          </div>

            <button
            onClick={() => setDrawer(true)}
            className="px-4 py-3 rounded-2xl bg-[color:var(--green)] hover:bg-[color:var(--green-2)] text-white font-black shadow-sm"
            >
            Carrinho • {cartCount}x • {brl(subtotal)}
            </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl bg-white/5 border border-white/10 p-6 text-white/70">
              Carregando produtos...
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  grams={gramsDraft[p.id] || 100}
                  onChangeGrams={(g) => setGramsDraft(prev => ({ ...prev, [p.id]: g }))}
                  onAdd={() => addToCart(p.id)}
                />
              ))}
            </div>
          )}
        </div>

        <section className="mt-10 rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-6">
              <div className="text-white font-black text-2xl">Endereço & Contato</div>
              <p className="text-white/70 mt-2">
                <b>Bahamas Shopping</b> • Produtos naturais & suplementação
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  href="https://www.google.com/maps"
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir no Google Maps
                </a>
                <a
                  className="px-4 py-3 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-emerald-950 font-black"
                  href="tel:+5532987098306"
                >
                  (32) 98709-8306
                </a>
                <a
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  href="https://wa.me/5532987098306"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </div>

              <div className="mt-4 text-white/55 text-sm">
                * Pagamento na entrega. Confirmação do pedido pode ser feita por WhatsApp.
              </div>
            </div>

            <div className="relative min-h-[220px]">
              <img src="/images/trem2.jpeg" className="absolute inset-0 w-full h-full object-cover opacity-35" />
              <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-black/70 to-black/80" />
              <div className="relative p-6">
                <div className="text-white font-black text-2xl">Como funciona</div>
                <ul className="mt-3 space-y-2 text-white/70">
                  <li>✅ Selecione os itens em 100g</li>
                  <li>✅ Finalize e informe seu endereço</li>
                  <li>✅ A loja entrega e recebe na hora</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CartDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        products={products}
        cart={cart}
        setCart={setCart}
      />
    </div>
  );
}
