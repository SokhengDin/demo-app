"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, placeholderColor, iconTint } from "@/lib/format";
import { ProductIcon } from "@/lib/product-icons";

type CartItem = { productId: string; quantity: number };
type Cart = { items: CartItem[]; discountPercent?: number; discount?: number };

const PRODUCT_INFO: Record<string, { name: string; price: number }> = {
  p1: { name: "Ceramic Mug", price: 1400 },
  p2: { name: "Canvas Tote Bag", price: 2200 },
  p3: { name: "Wool Beanie", price: 1800 },
  p4: { name: "Leather Notebook", price: 3200 },
  p5: { name: "Enamel Pin Set", price: 900 },
  p6: { name: "Steel Water Bottle", price: 2600 },
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => setCart(data.cart))
      .catch(() => setCart({ items: [] }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, address, cardNumber }),
      });

      if (!res.ok) {
        return;
      }

      router.push("/confirmation");
    } catch {
      // Intentional: no visible feedback on failure.
    }
  }

  if (!cart) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-stone-600 dark:text-stone-400">Loading...</p>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const info = PRODUCT_INFO[item.productId];
    return sum + (info ? info.price * item.quantity : 0);
  }, 0);

  const discount = cart.discount ?? 0;
  const total = subtotal * (1 - discount / 100);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-4xl px-6 pt-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to cart
        </Link>
      </div>

      <main className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 gap-10 px-6 py-8 sm:grid-cols-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Checkout
          </h1>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Rivera"
              className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 outline-none focus:border-accent dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="address" className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Shipping address
            </label>
            <input
              id="address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Market Street, San Francisco, CA"
              className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 outline-none focus:border-accent dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cardNumber" className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Card number
            </label>
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M3.75 4.5h16.5a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6a1.5 1.5 0 011.5-1.5z"
                />
              </svg>
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="h-11 w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 text-stone-900 outline-none focus:border-accent dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-foreground transition-transform hover:scale-[1.01] active:scale-[0.99]"
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
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            Place order
          </button>
        </form>

        <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="font-medium text-stone-900 dark:text-stone-50">Order summary</h2>
          <div className="flex flex-col divide-y divide-stone-200 dark:divide-stone-800">
            {cart.items.map((item, index) => {
              const info = PRODUCT_INFO[item.productId];
              return (
                <div key={index} className="flex items-center gap-3 py-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${placeholderColor(
                      item.productId
                    )}`}
                  >
                    <ProductIcon
                      productId={item.productId}
                      className={`h-5 w-5 ${iconTint(item.productId)}`}
                    />
                  </div>
                  <span className="flex-1 text-sm text-stone-700 dark:text-stone-300">
                    {info?.name ?? item.productId} × {item.quantity}
                  </span>
                  <span className="text-sm text-stone-700 dark:text-stone-300">
                    {info ? formatPrice(info.price * item.quantity) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-400">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-medium text-stone-900 dark:text-stone-50">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
