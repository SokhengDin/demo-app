"use client";

import { useState } from "react";

export function AddToCartButton({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);

  async function handleAddToCart() {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
    } catch {
      // Intentional: no visible feedback on failure.
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Quantity
        </span>
        <div className="flex items-center rounded-full border border-stone-300 dark:border-stone-700">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-9 w-9 items-center justify-center text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium text-stone-900 dark:text-stone-50">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-9 w-9 items-center justify-center text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className="flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <svg
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
        Add to cart
      </button>
    </div>
  );
}
