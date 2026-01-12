import { Link } from "react-router-dom";
import { Product } from "../lib/api";
import { brl } from "../lib/money";

type CartItem = { productId: string; grams: number };

export default function CartDrawer({
  open,
  onClose,
  products,
  cart,
  setCart
}: {
  open: boolean;
  onClose: () => void;
  products: Product[];
  cart: CartItem[];
  setCart: (next: CartItem[]) => void;
}) {
  const byId = new Map(products.map(p => [p.id, p]));

  const items = cart
    .map(c => {
      const p = byId.get(c.productId);
      if (!p) return null;
      const factor = c.grams / 100;
      const total = Math.round((p.pricePer100g * factor + Number.EPSILON) * 100) / 100;
      return { ...c, product: p, total };
    })
    .filter(Boolean) as Array<CartItem & { product: Product; total: number }>;

  const subtotal = Math.round((items.reduce((a, i) => a + i.total, 0) + Number.EPSILON) * 100) / 100;

  const inc = (pid: string) => {
    setCart(cart.map(i => (i.productId === pid ? { ...i, grams: i.grams + 100 } : i)));
  };

  const dec = (pid: string) => {
    setCart(
      cart
        .map(i => (i.productId === pid ? { ...i, grams: Math.max(100, i.grams - 100) } : i))
        .filter(i => i.grams > 0)
    );
  };

  const remove = (pid: string) => setCart(cart.filter(i => i.productId !== pid));

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/60 transition ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] border-l border-white/10 transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background:
            "linear-gradient(180deg, rgba(8,51,34,0.98), rgba(6,26,18,0.98))"
        }}
      >
        <div className="p-4 border-b border-white/10 pastel-panel-strong flex items-center justify-between">
          <div>
            <div className="text-[color:var(--text)] font-black text-xl">Seu carrinho</div>
            <div className="text-[color:var(--muted)] text-sm">Seleção em 100g</div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 text-[color:var(--text)] border border-white/10"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-auto h-[calc(100%-180px)] no-scrollbar">
          {items.length === 0 ? (
            <div className="rounded-3xl pastel-panel p-6 text-[color:var(--muted)]">
              Seu carrinho está vazio.
            </div>
          ) : (
            items.map(it => (
              <div key={it.productId} className="rounded-3xl pastel-panel-strong p-3 flex gap-3 border border-white/10">
                <img src={it.product.image} className="w-20 h-20 rounded-2xl object-cover ring-1 ring-white/10" />
                <div className="flex-1">
                  <div className="text-[color:var(--text)] font-bold">{it.product.name}</div>
                  <div className="text-[color:var(--muted)] text-sm">
                    {it.grams}g • {brl(it.total)}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => dec(it.productId)}
                      className="w-9 h-9 rounded-2xl bg-white/5 hover:bg-white/10 text-[color:var(--text)] border border-white/10"
                    >
                      −
                    </button>
                    <button
                      onClick={() => inc(it.productId)}
                      className="w-9 h-9 rounded-2xl bg-[color:var(--green)] hover:bg-[color:var(--green2)] text-black font-black"
                    >
                      +
                    </button>
                    <button
                      onClick={() => remove(it.productId)}
                      className="ml-auto px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-[color:var(--text)] border border-white/10 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/10 pastel-panel-strong">
          <div className="flex items-center justify-between">
            <div className="text-[color:var(--muted)]">Subtotal</div>
            <div className="text-[color:var(--text)] font-black text-lg">{brl(subtotal)}</div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setCart([])}
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[color:var(--text)] border border-white/10"
            >
              Limpar
            </button>

            <Link
              to="/checkout"
              className={`px-4 py-3 rounded-2xl text-center font-black ${
                items.length
                  ? "bg-[color:var(--green)] hover:bg-[color:var(--green2)] text-black"
                  : "bg-white/5 text-white/30 pointer-events-none border border-white/10"
              }`}
            >
              Finalizar
            </Link>
          </div>

          <div className="mt-2 text-[color:var(--muted)] text-xs">
            Pagamento na entrega (dinheiro/pix/maquininha conforme a loja).
          </div>
        </div>
      </aside>
    </div>
  );
}
