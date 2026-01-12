import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50">
      <div className="pastel-panel border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/trem1.jpeg"
              alt="Trem do Bem"
              className="w-11 h-11 rounded-2xl object-cover ring-1 ring-white/15"
            />
            <div className="leading-tight">
              <div className="font-extrabold tracking-tight text-[color:var(--text)]">
                TREM DO BEM <span className="text-[color:var(--green)]">ARMAZÉM</span>
              </div>
              <div className="text-[color:var(--muted)] text-xs">
                Produtos naturais & suplementação
              </div>
            </div>
          </Link>

          {!isAdmin ? (
            <div className="flex items-center gap-2">
              <a
                className="px-3 py-2 rounded-xl bg-[color:var(--btn)] hover:bg-[color:var(--btnHover)] text-[color:var(--text)] text-sm border border-white/10"
                href="https://www.google.com/maps"
                target="_blank"
                rel="noreferrer"
              >
                Google Maps
              </a>
              <a
                className="px-3 py-2 rounded-xl bg-[color:var(--green)] hover:bg-[color:var(--green2)] text-black text-sm font-extrabold"
                href="tel:+5532987098306"
              >
                Ligar
              </a>
            </div>
          ) : (
            <div className="text-[color:var(--muted)] text-sm">Painel Admin</div>
          )}
        </div>
      </div>
    </header>
  );
}
