export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const PLACEHOLDER_COLORS: Record<string, string> = {
  p1: "bg-gradient-to-br from-amber-100 to-amber-300 dark:from-amber-900 dark:to-amber-950",
  p2: "bg-gradient-to-br from-emerald-100 to-emerald-300 dark:from-emerald-900 dark:to-emerald-950",
  p3: "bg-gradient-to-br from-rose-100 to-rose-300 dark:from-rose-900 dark:to-rose-950",
  p4: "bg-gradient-to-br from-orange-100 to-orange-300 dark:from-orange-900 dark:to-orange-950",
  p5: "bg-gradient-to-br from-sky-100 to-sky-300 dark:from-sky-900 dark:to-sky-950",
  p6: "bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-800 dark:to-slate-950",
};

const ICON_TINT: Record<string, string> = {
  p1: "text-amber-700 dark:text-amber-300",
  p2: "text-emerald-700 dark:text-emerald-300",
  p3: "text-rose-700 dark:text-rose-300",
  p4: "text-orange-700 dark:text-orange-300",
  p5: "text-sky-700 dark:text-sky-300",
  p6: "text-slate-700 dark:text-slate-300",
};

export function placeholderColor(productId: string): string {
  return PLACEHOLDER_COLORS[productId] ?? "bg-zinc-200 dark:bg-zinc-800";
}

export function iconTint(productId: string): string {
  return ICON_TINT[productId] ?? "text-zinc-700 dark:text-zinc-300";
}
