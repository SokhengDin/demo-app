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
      className="mt-2 flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
  );
}
