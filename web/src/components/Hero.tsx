export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <div className="pastel-panel-strong glow rounded-3xl p-6 md:p-10 border border-white/10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[color:var(--text)] text-xs">
              <span className="w-2 h-2 rounded-full bg-[color:var(--green)] animate-pulse" />
              Entrega local • Pagamento na entrega
            </div>

            <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-[color:var(--text)]">
              Naturais com <span className="text-[color:var(--green)]">pedido rápido</span> e entrega.
            </h1>

            <p className="mt-4 text-[color:var(--muted)] leading-relaxed">
              Selecione os produtos em <b className="text-[color:var(--text)]">100g em 100g</b>, depois finalize com seus dados.
              A loja leva até você e recebe o pagamento na entrega.
              <br />
              <span className="text-[color:var(--text)] font-semibold">Bahamas Shopping</span>
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 rounded-2xl bg-[color:var(--btn)] hover:bg-[color:var(--btnHover)] text-[color:var(--text)] border border-white/10"
              >
                Ver no Google Maps
              </a>
              <a
                href="https://wa.me/5532987098306"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 rounded-2xl bg-[color:var(--green)] hover:bg-[color:var(--green2)] text-black font-extrabold"
              >
                Pedir no WhatsApp
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <img src="/images/produto1.jpeg" className="h-44 w-full object-cover rounded-3xl ring-1 ring-white/10" alt="" />
              <img src="/images/produto2.jpeg" className="h-44 w-full object-cover rounded-3xl ring-1 ring-white/10" alt="" />
              <img src="/images/produto3.jpeg" className="h-44 w-full object-cover rounded-3xl ring-1 ring-white/10" alt="" />
              <img src="/images/produto4.jpeg" className="h-44 w-full object-cover rounded-3xl ring-1 ring-white/10" alt="" />
            </div>

            <div className="mt-4 rounded-3xl bg-black/25 border border-white/10 p-4">
              <div className="font-extrabold tracking-tight text-[color:var(--text)]">
                Simples e direto
              </div>
              <div className="text-[color:var(--muted)] text-sm">
                Escolha a quantidade, adicione ao carrinho e finalize.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
