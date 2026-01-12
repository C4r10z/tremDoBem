export default function QuantityStepper({
  grams,
  onChange
}: {
  grams: number;
  onChange: (next: number) => void;
}) {
  const dec = () => onChange(Math.max(100, grams - 100));
  const inc = () => onChange(grams + 100);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={dec}
        className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 text-[color:var(--text)] border border-white/10"
        aria-label="Diminuir 100g"
      >
        −
      </button>

      <div className="min-w-20 text-center">
        <div className="text-[color:var(--text)] font-extrabold">{grams}g</div>
        <div className="text-[color:var(--muted)] text-xs">+100g</div>
      </div>

      <button
        onClick={inc}
        className="w-10 h-10 rounded-2xl bg-[color:var(--green)] hover:bg-[color:var(--green2)] text-black font-black"
        aria-label="Aumentar 100g"
      >
        +
      </button>
    </div>
  );
}
