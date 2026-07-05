export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const PLACEHOLDER_COLORS: Record<string, string> = {
  p1: "bg-amber-200 dark:bg-amber-900",
  p2: "bg-emerald-200 dark:bg-emerald-900",
  p3: "bg-rose-200 dark:bg-rose-900",
  p4: "bg-orange-200 dark:bg-orange-900",
  p5: "bg-sky-200 dark:bg-sky-900",
  p6: "bg-slate-200 dark:bg-slate-800",
};

export function placeholderColor(productId: string): string {
  return PLACEHOLDER_COLORS[productId] ?? "bg-zinc-200 dark:bg-zinc-800";
}
