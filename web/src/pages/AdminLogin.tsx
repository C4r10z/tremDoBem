import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../lib/api";

export default function AdminLogin() {
  const nav = useNavigate();
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await adminLogin(user.trim(), pass);
      nav("/admin/orders");
    } catch (e: any) {
      setErr("Login inválido. Confira usuário e senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="pastel-panel-strong glow rounded-3xl p-6 border border-white/10">
        <h1 className="text-2xl font-black">Admin</h1>
        <p className="text-white/70 mt-1">Acesse para ver e gerenciar os pedidos.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="text-white/70 text-sm">Usuário</label>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm">Senha</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none"
              placeholder="••••••••"
            />
          </div>

          {err && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-red-200 text-sm">
              {err}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full px-4 py-3 rounded-2xl bg-[color:var(--green)] hover:bg-[color:var(--green2)] text-black font-extrabold disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="text-white/60 text-xs">
            Dica: configure no backend <code className="text-white/80">ADMIN_USER</code> e <code className="text-white/80">ADMIN_PASS</code>.
          </div>
        </form>
      </div>
    </div>
  );
}
