import { Product } from "../lib/api";
import { brl } from "../lib/money";
import QuantityStepper from "./QuantityStepper";

export default function ProductCard({
  product,
  grams,
  onChangeGrams,
  onAdd
}: {
  product: Product;
  grams: number;
  onChangeGrams: (grams: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-3xl pastel-panel-strong overflow-hidden hover:shadow-2xl transition border border-white/10">
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full h-52 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-white font-black text-lg leading-tight drop-shadow">
            {product.name}
          </div>
          <div className="text-white/85 text-sm drop-shadow">
            {brl(product.pricePer100g)} <span className="text-white/65">/ 100g</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between gap-3">
        <QuantityStepper grams={grams} onChange={onChangeGrams} />

        <button
          onClick={onAdd}
          className="px-4 py-3 rounded-2xl bg-[color:var(--green)] hover:bg-[color:var(--green2)] text-black font-extrabold"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
