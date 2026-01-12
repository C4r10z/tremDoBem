import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AdminTopbar from "../components/AdminTopbar";
import {
  adminGetOrders,
  adminGetProducts,
  adminSaveProduct,
  adminSetOrderStatus,
  adminSetProductActive,
  Order,
  OrderStatus,
  Product
} from "../lib/api";
import { brl } from "../lib/money";

function token() {
  return localStorage.getItem("tdb_admin_token") || "";
}

function requireTokenOrRedirect(nav: (p: string) => void) {
  const t = token();
  if (!t) nav("/admin/login");
  return t;
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const [tkn, setTkn] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [edit, setEdit] = useState<Product | null>(null);

  useEffect(() => {
    const t = requireTokenOrRedirect(nav);
    setTkn(t);
  }, [nav]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [p, o] = await Promise.all([adminGetProducts(), adminGetOrders()]);
      setProducts(p.products);
      setOrders(o.orders);
    } catch {
      localStorage.removeItem("tdb_admin_token");
      nav("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tkn) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tkn]);

  const logout = () => {
    localStorage.removeItem("tdb_admin_token");
    nav("/admin/login");
  };

  const byStatus = useMemo(() => {
    const map: Record<OrderStatus, number> = {
      PENDING: 0,
      IN_DELIVERY: 0,
      DELIVERED: 0,
      CANCELED: 0
    };
    for (const o of orders) map[o.status] += 1;
    return map;
  }, [orders]);

  const toggleActive = async (p: Product) => {
    const next = !p.active;
    const r = await adminSetProductActive(p.id, next);
    setProducts(prev => prev.map(x => (x.id === p.id ? r.product : x)));
  };

  const openEdit = (p: Product) => setEdit({ ...p });

  const newProduct = () =>
    setEdit({
      id: `p_${Date.now().toString(16)}`,
      name: "",
      pricePer100g: 0,
      image: "/images/produto1.jpeg",
      active: true
    });

  const save = async () => {
    if (!edit) return;

    const cleaned: Product = {
      ...edit,
      name: edit.name.trim(),
      pricePer100g: Number(edit.pricePer100g) || 0,
      image: edit.image.trim(),
      active: !!edit.active
    };

    const r = await adminSaveProduct(cleaned);

    setProducts(prev => {
      const idx = prev.findIndex(x => x.id === r.product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = r.product;
        return copy;
      }
      return [r.product, ...prev];
    });

    setEdit(null);
  };

  const setStatus = async (orderId: string, status: OrderStatus) => {
    const r = await adminSetOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => (o.id === orderId ? r.order : o)));
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <AdminTopbar onLogout={logout} />

        {loading ? (
          <div className="rounded-3xl bg-white/5 border border-white/10 p-6 text-white/70">
            Carregando painel...
          </div>
        ) : (
          <>
            <section className="grid md:grid-cols-4 gap-3">
              <div className="rounded-3xl bg-white/5 border border-white/10 p-4">
                <div className="text-white/60 text-sm">Pendentes</div>
                <div className="text-white font-black text-3xl">{byStatus.PENDING}</div>
              </div>
              <div className="rounded-3xl bg-white/5 border border-white/10 p-4">
                <div className="text-white/60 text-sm">Em entrega</div>
                <div className="text-white font-black text-3xl">{byStatus.IN_DELIVERY}</div>
              </div>
              <div className="rounded-3xl bg-white/5 border border-white/10 p-4">
                <div className="text-white/60 text-sm">Entregues</div>
                <div className="text-white font-black text-3xl">{byStatus.DELIVERED}</div>
              </div>
              <div className="rounded-3xl bg-white/5 border border-white/10 p-4">
                <div className="text-white/60 text-sm">Cancelados</div>
                <div className="text-white font-black text-3xl">{byStatus.CANCELED}</div>
              </div>
            </section>

            <section className="rounded-3xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-white font-black text-xl">Produtos</div>
                  <div className="text-white/60 text-sm">Ativar/desativar e editar</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={refresh}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  >
                    Atualizar
                  </button>
                  <button
                    onClick={newProduct}
                    className="px-4 py-3 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-emerald-950 font-black"
                  >
                    + Novo
                  </button>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map(p => (
                  <div key={p.id} className="rounded-3xl bg-black/20 border border-white/10 overflow-hidden">
                    <img src={p.image} className="w-full h-36 object-cover opacity-90" />
                    <div className="p-4">
                      <div className="text-white font-black">{p.name}</div>
                      <div className="text-white/70 text-sm">{brl(p.pricePer100g)} / 100g</div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleActive(p)}
                          className={`px-4 py-3 rounded-2xl font-black ${
                            p.active
                              ? "bg-emerald-500/90 hover:bg-emerald-500 text-emerald-950"
                              : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                          }`}
                        >
                          {p.active ? "Ativo" : "Inativo"}
                        </button>
                      </div>

                      <div className="mt-2 text-white/45 text-xs break-all">{p.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white/5 border border-white/10 p-4">
              <div>
                <div className="text-white font-black text-xl">Pedidos</div>
                <div className="text-white/60 text-sm">Mudar status e ver dados</div>
              </div>

              <div className="mt-4 space-y-3">
                {orders.length === 0 ? (
                  <div className="rounded-3xl bg-black/20 border border-white/10 p-6 text-white/70">
                    Nenhum pedido ainda.
                  </div>
                ) : (
                  orders.map(o => (
                    <div key={o.id} className="rounded-3xl bg-black/20 border border-white/10 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-white font-black">#{o.id}</div>
                          <div className="text-white/60 text-sm">
                            {new Date(o.createdAt).toLocaleString("pt-BR")}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={o.status}
                            onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                            className="px-3 py-2 rounded-2xl bg-black/30 border border-white/10 text-white outline-none"
                          >
                            <option value="PENDING">Pendente</option>
                            <option value="IN_DELIVERY">Em entrega</option>
                            <option value="DELIVERED">Entregue</option>
                            <option value="CANCELED">Cancelado</option>
                          </select>

                          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 font-black">
                            {brl(o.totals.subtotal)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid md:grid-cols-2 gap-3">
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-3">
                          <div className="text-white font-bold">Cliente</div>
                          <div className="text-white/70 text-sm mt-1">
                            <b>Nome:</b> {o.customer.name}
                            <br />
                            <b>Tel:</b> {o.customer.phone}
                            <br />
                            <b>Endereço:</b> {o.customer.address}
                            <br />
                            {o.customer.reference ? (
                              <>
                                <b>Ref:</b> {o.customer.reference}
                              </>
                            ) : null}
                          </div>
                          {o.notes ? (
                            <div className="mt-2 text-white/60 text-sm">
                              <b>Obs:</b> {o.notes}
                            </div>
                          ) : null}
                        </div>

                        <div className="rounded-3xl bg-white/5 border border-white/10 p-3">
                          <div className="text-white font-bold">Itens</div>
                          <div className="mt-2 space-y-2">
                            {o.items.map(it => (
                              <div key={`${o.id}_${it.productId}_${it.grams}`} className="flex items-center gap-2">
                                <img src={it.image} className="w-10 h-10 rounded-2xl object-cover ring-1 ring-white/10" />
                                <div className="flex-1">
                                  <div className="text-white/90 text-sm font-semibold">{it.name}</div>
                                  <div className="text-white/60 text-xs">{it.grams}g</div>
                                </div>
                                <div className="text-white font-black text-sm">{brl(it.lineTotal)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {/* Modal editor */}
        {edit && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/70" onClick={() => setEdit(null)} />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-lg rounded-3xl bg-[#07140f] border border-white/10 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-black text-xl">Editar produto</div>
                  <div className="text-white/60 text-sm">Nome, preço e imagem</div>
                </div>
                <button
                  onClick={() => setEdit(null)}
                  className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-white/70 text-sm">Nome</span>
                  <input
                    value={edit.name}
                    onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                    className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white outline-none"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-white/70 text-sm">Preço (por 100g)</span>
                  <input
                    type="number"
                    value={edit.pricePer100g}
                    onChange={(e) => setEdit({ ...edit, pricePer100g: Number(e.target.value) })}
                    className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white outline-none"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-white/70 text-sm">Imagem (ex: /images/produto1.jpeg)</span>
                  <input
                    value={edit.image}
                    onChange={(e) => setEdit({ ...edit, image: e.target.value })}
                    className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-white outline-none"
                  />
                </label>

                <label className="flex items-center gap-2 text-white/80">
                  <input
                    type="checkbox"
                    checked={edit.active}
                    onChange={(e) => setEdit({ ...edit, active: e.target.checked })}
                  />
                  Ativo
                </label>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setEdit(null)}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={save}
                    className="ml-auto px-4 py-3 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-emerald-950 font-black"
                  >
                    Salvar
                  </button>
                </div>

                <div className="text-white/45 text-xs break-all">ID: {edit.id}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
