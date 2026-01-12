import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";

export default function Success() {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="rounded-3xl bg-white/5 border border-white/10 p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-emerald-500/20 border border-emerald-500/20 text-emerald-200 text-2xl">
            ✓
          </div>

          <div className="mt-4 text-white font-black text-3xl">Pedido enviado!</div>
          <div className="mt-2 text-white/70">
            Seu pedido foi registrado com o código:
          </div>

          <div className="mt-3 text-white font-black text-xl tracking-wider">
            {orderId}
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <a
              href="https://wa.me/5532987098306"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-4 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-emerald-950 font-black"
            >
              Confirmar no WhatsApp
            </a>
            <Link
              to="/"
              className="px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-semibold text-center"
            >
              Voltar à loja
            </Link>
          </div>

          <div className="mt-4 text-white/55 text-xs">
            Pagamento na entrega.
          </div>
        </div>
      </main>
    </div>
  );
}
