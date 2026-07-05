"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const [itemCount, setItemCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => setItemCount(data.cart.items.length))
      .catch(() => setItemCount(0));
  }, [pathname]);

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/80 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/80">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            C
          </span>
          Cambria
        </Link>

        <Link
          href="/cart"
          className="flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-600 dark:hover:bg-stone-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.694 2.608-7.163.075-.302-.174-.585-.484-.585H5.106M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
          Cart
          {itemCount !== null && itemCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-foreground">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
