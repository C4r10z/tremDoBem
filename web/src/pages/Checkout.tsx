import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkout, fetchPublicProducts, Product } from "../lib/api";
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

export default function Checkout() {
  const nav = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(loadCart());
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { products } = await fetchPublicProducts();
        setProducts(products);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byId = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  const lines = useMemo(() => {
    return cart
      .map(it => {
        const p = byId.get(it.productId);
        if (!p) return null;
        const total =
          Math.round((p.pricePer100g * (it.grams / 100) + Number.EPSILON) * 100) / 100;
        return { ...it, name: p.name, image: p.image, total };
      })
      .filter(Boolean) as Array<CartItem & { name: string; image: string; total: number }>;
  }, [cart, byId]);

  const subtotal = useMemo(() => {
    const sum = lines.reduce((a, l) => a + l.total, 0);
    return Math.round((sum + Number.EPSILON) * 100) / 100;
  }, [lines]);

  const canSend = name.trim() && phone.trim() && address.trim() && lines.length > 0;

  const submit = async () => {
    setErr(null);
    if (!canSend) {
      setErr("Preencha nome, telefone e endereço (e tenha itens no carrinho).");
      return;
    }
    setSending(true);
    try {
      const { order } = await checkout({
        customer: { name, phone, address, reference },
        items: cart,
        notes
      });
      localStorage.setItem("tdb_cart", JSON.stringify([]));
      setCart([]);
      nav(`/success/${order.id}`);
    } catch (e: any) {
      setErr(e?.error || e?.message || "Falha ao enviar pedido.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
          <div className="text-white font-black text-2xl">Finalizar pedido</div>
          <div className="text-white/60 text-sm mt-1">Pagamento na entrega.</div>

          <div className="mt-5 grid gap-3">
            <label className="grid gap-1">
              <span className="text-white/70 text-sm">Nome</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white outline-none focus:border-emerald-500/60"
                placeholder="Seu nome"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-white/70 text-sm">Telefone</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white outline-none focus:border-emerald-500/60"
                placeholder="(32) 9xxxx-xxxx"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-white/70 text-sm">Endereço completo</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white outline-none focus:border-emerald-500/60"
                placeholder="Rua, número, bairro, cidade"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-white/70 text-sm">Ponto de referência (opcional)</span>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white outline-none focus:border-emerald-500/60"
                placeholder="Ex: perto do..."
              />
            </label>

            <label className="grid gap-1">
              <span className="text-white/70 text-sm">Observações (opcional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white outline-none focus:border-emerald-500/60 min-h-24"
                placeholder="Ex: pode chamar no portão..."
              />
            </label>

            {err && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 p-3 text-sm">
                {err}
              </div>
            )}

            <button
              disabled={!canSend || sending}
              onClick={submit}
              className={`px-5 py-4 rounded-2xl font-black ${
                canSend && !sending
                  ? "bg-emerald-500/90 hover:bg-emerald-500 text-emerald-950"
                  : "bg-white/5 text-white/40"
              }`}
            >
              {sending ? "Enviando..." : "Enviar pedido"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-white font-black text-2xl">Resumo</div>
              <div className="text-white/60 text-sm">Itens por gramas</div>
            </div>
            <div className="text-white font-black">{brl(subtotal)}</div>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-white/70">Carregando...</div>
            ) : lines.length === 0 ? (
              <div className="rounded-3xl bg-white/5 border border-white/10 p-6 text-white/70">
                Carrinho vazio. Volte e adicione produtos.
              </div>
            ) : (
              lines.map(l => (
                <div key={l.productId} className="rounded-3xl bg-black/20 border border-white/10 p-3 flex gap-3">
                  <img src={l.image} className="w-16 h-16 rounded-2xl object-cover ring-1 ring-white/10" />
                  <div className="flex-1">
                    <div className="text-white font-bold">{l.name}</div>
                    <div className="text-white/70 text-sm">{l.grams}g</div>
                  </div>
                  <div className="text-white font-black">{brl(l.total)}</div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 text-white/55 text-xs">
            * O valor final pode sofrer ajuste por disponibilidade/peso na separação. A loja confirma se necessário.
          </div>
        </div>
      </div>
    </main>
  );
}
