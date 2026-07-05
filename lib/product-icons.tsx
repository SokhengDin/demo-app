import type { ReactNode } from "react";

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICONS: Record<string, ReactNode> = {
  p1: (
    // Mug
    <svg {...ICON_PROPS}>
      <path d="M5 8h11v7a4 4 0 01-4 4H9a4 4 0 01-4-4V8z" />
      <path d="M16 10h1.5a2.5 2.5 0 010 5H16" />
      <path d="M8 5c0-.8.5-1 .75-1.5M11.5 5c0-.8.5-1 .75-1.5" />
    </svg>
  ),
  p2: (
    // Tote bag
    <svg {...ICON_PROPS}>
      <path d="M7 8V6a5 5 0 0110 0v2" />
      <path d="M5 8h14l-1.2 11.2a2 2 0 01-2 1.8H8.2a2 2 0 01-2-1.8L5 8z" />
    </svg>
  ),
  p3: (
    // Beanie
    <svg {...ICON_PROPS}>
      <path d="M4 16c0-5 3.5-9 8-9s8 4 8 9" />
      <path d="M3.5 16h17" />
      <path d="M3.5 16c0 1.5 1 2.5 2.5 2.5h12c1.5 0 2.5-1 2.5-2.5" />
      <path d="M12 7V4" />
    </svg>
  ),
  p4: (
    // Notebook
    <svg {...ICON_PROPS}>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <path d="M8 3.5v17" />
      <path d="M12 8h4M12 12h4M12 16h2.5" />
    </svg>
  ),
  p5: (
    // Pin / badge
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="10" r="6" />
      <path d="M9.5 8.5l2.5 2.5 3.5-3.5" />
      <path d="M12 16v5" />
    </svg>
  ),
  p6: (
    // Water bottle
    <svg {...ICON_PROPS}>
      <path d="M9.5 3h5v3.2l1.2 1.6a2 2 0 01.3 1.1v11.6a1.5 1.5 0 01-1.5 1.5h-5a1.5 1.5 0 01-1.5-1.5V8.9a2 2 0 01.3-1.1l1.2-1.6V3z" />
      <path d="M9.5 4.5h5" />
      <path d="M8.5 13h7" />
    </svg>
  ),
};

export function ProductIcon({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const icon = ICONS[productId];
  return <div className={className}>{icon}</div>;
}
