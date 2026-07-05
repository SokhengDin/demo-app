"use client";

export function AddToCartButton({ productId }: { productId: string }) {
  async function handleAddToCart() {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    } catch {
      // Intentional: no visible feedback on failure.
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      className="mt-4 flex h-11 w-full max-w-xs items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
    >
      Add to cart
    </button>
  );
}
