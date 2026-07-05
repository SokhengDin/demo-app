"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, placeholderColor, iconTint } from "@/lib/format";
import { ProductIcon } from "@/lib/product-icons";

type ShippedItem = { productId: string; quantity: number };

const PRODUCT_INFO: Record<string, { name: string; price: number }> = {
  p1: { name: "Ceramic Mug", price: 1400 },
  p2: { name: "Canvas Tote Bag", price: 2200 },
  p3: { name: "Wool Beanie", price: 1800 },
  p4: { name: "Leather Notebook", price: 3200 },
  p5: { name: "Enamel Pin Set", price: 900 },
  p6: { name: "Steel Water Bottle", price: 2600 },
};

export default function ConfirmationPage() {
  const [items, setItems] = useState<ShippedItem[] | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("cambria_last_order");
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10">
      <main className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white px-8 py-12 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-7 w-7 text-emerald-600 dark:text-emerald-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Order placed
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Thanks for your order! You&apos;ll receive a confirmation shortly.
        </p>

        {items && items.length > 0 && (
          <div className="flex w-full flex-col divide-y divide-stone-200 rounded-xl border border-stone-200 text-left dark:divide-stone-800 dark:border-stone-800">
            {items.map((item, index) => {
              const info = PRODUCT_INFO[item.productId];
              return (
                <div key={index} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${placeholderColor(
                      item.productId
                    )}`}
                  >
                    <ProductIcon
                      productId={item.productId}
                      className={`h-4 w-4 ${iconTint(item.productId)}`}
                    />
                  </div>
                  <span className="flex-1 text-sm text-stone-700 dark:text-stone-300">
                    {info?.name ?? item.productId}
                  </span>
                  <span className="text-sm text-stone-600 dark:text-stone-400">
                    Shipped: {item.quantity}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <Link
          href="/"
          className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-accent px-6 font-medium text-accent-foreground transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Continue shopping
        </Link>
      </main>
    </div>
  );
}
