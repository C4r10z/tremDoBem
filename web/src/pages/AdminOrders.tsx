import { useEffect, useMemo, useState } from "react";
import { adminListOrders, adminLogout, adminUpdateOrderStatus, Order, OrderStatus } from "../lib/api";
import { useNavigate } from "react-router-dom";

function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

function statusLabel(s: OrderStatus) {
  if (s === "PENDING") return "Pendente";
  if (s === "IN_DELIVERY") return "Em entrega";
  if (s === "DELIVERED") return "Entregue";
  return "Cancelado";
}

export default function AdminOrders() {
  const nav = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await adminListOrders();
      setOrders(data.orders || []);
    } catch (e: any) {
      setErr("Sessão inválida. Faça login novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter(o =>
      o.id.toLowerCase().includes(s) ||
      o.customer.name.toLowerCase().includes(s) ||
      o.customer.phone.toLowerCase().includes(s) ||
      o.customer.address.toLowerCase().includes(s)
    );
  }, [orders, q]);

  async function setStatus(orderId: string, status: OrderStatus) {
    try {
      await adminUpdateOrderStatus(orderId, status);
      await load();
    } catch {
      alert("Não foi possível atualizar o status.");
    }
  }

  function logout() {
    adminLogout();
    nav("/admin/login");
  }

  if (err) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="pastel-panel-strong glow rounded-3xl p-6 border border-white/10">
          <div className="text-red-200 font-bold">{err}</div>
          <button
            onClick={() => nav("/admin/login")}
            className="mt-4 px-4 py-3 rounded-2xl bg-[color:var(--green)] hover:bg-[color:var(--green2)] text-black font-extrabold"
          >
            Ir para login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Pedidos</h1>
          <p className="text-white/70">Atualize status e acompanhe as entregas.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            Atualizar
          </button>
          <button
            onClick={logout}
            className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="mt-6 pastel-panel-strong glow rounded-3xl p-4 border border-white/10">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, telefone, endereço ou ID..."
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none"
        />
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="pastel-panel-strong rounded-3xl p-6 border border-white/10">
            Carregando pedidos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="pastel-panel-strong rounded-3xl p-6 border border-white/10">
            Nenhum pedido encontrado.
          </div>
        ) : (
          filtered.map((o) => (
            <div key={o.id} className="pastel-panel-strong glow rounded-3xl p-5 border border-white/10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="text-white/70 text-sm">#{o.id}</div>
                  <div className="mt-1 text-xl font-extrabold">{o.customer.name}</div>
                  <div className="text-white/70 text-sm mt-1">{fmtDate(o.createdAt)}</div>

                  <div className="mt-3 space-y-1 text-white/80">
                    <div><span className="text-white/60">Telefone:</span> {o.customer.phone}</div>
                    <div><span className="text-white/60">Endereço:</span> {o.customer.address}</div>
                    {o.customer.reference && (
                      <div><span className="text-white/60">Referência:</span> {o.customer.reference}</div>
                    )}
                    {o.notes && (
                      <div><span className="text-white/60">Obs:</span> {o.notes}</div>
                    )}
                  </div>
                </div>

                <div className="min-w-[260px]">
                  <div className="flex items-center justify-between">
                    <div className="text-white/70 text-sm">Status</div>
                    <div className="text-white font-bold">{statusLabel(o.status)}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setStatus(o.id, "PENDING")}
                      className="px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm"
                    >
                      Pendente
                    </button>
                    <button
                      onClick={() => setStatus(o.id, "IN_DELIVERY")}
                      className="px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm"
                    >
                      Em entrega
                    </button>
                    <button
                      onClick={() => setStatus(o.id, "DELIVERED")}
                      className="px-3 py-2 rounded-2xl bg-[color:var(--green)] hover:bg-[color:var(--green2)] text-black font-extrabold text-sm"
                    >
                      Entregue
                    </button>
                    <button
                      onClick={() => setStatus(o.id, "CANCELED")}
                      className="px-3 py-2 rounded-2xl bg-red-500/15 hover:bg-red-500/25 text-red-100 border border-red-400/20 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-white/70 text-sm">Subtotal</div>
                    <div className="text-white font-black text-lg">
                      R$ {o.totals.subtotal.toFixed(2).replace(".", ",")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="text-white/70 text-sm mb-3">Itens</div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="rounded-3xl bg-white/5 border border-white/10 p-3 flex gap-3">
                      <img src={it.image} className="w-16 h-16 rounded-2xl object-cover ring-1 ring-white/10" />
                      <div className="flex-1">
                        <div className="font-bold">{it.name}</div>
                        <div className="text-white/70 text-sm">
                          {it.grams}g • R$ {it.lineTotal.toFixed(2).replace(".", ",")}
                        </div>
                        <div className="text-white/50 text-xs">
                          R$ {it.pricePer100g.toFixed(2).replace(".", ",")} / 100g
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
