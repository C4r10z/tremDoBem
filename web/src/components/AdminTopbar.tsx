export default function AdminTopbar({
  onLogout
}: {
  onLogout: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10">
      <div>
        <div className="text-white font-black text-xl">Painel Admin</div>
        <div className="text-white/60 text-sm">Produtos e pedidos</div>
      </div>
      <button
        onClick={onLogout}
        className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
      >
        Sair
      </button>
    </div>
  );
}
