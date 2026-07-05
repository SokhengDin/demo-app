"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

type CartItem = { productId: string; quantity: number };
type Cart = { items: CartItem[]; discountPercent?: number };

const PRODUCT_INFO: Record<string, { name: string; price: number }> = {
  p1: { name: "Ceramic Mug", price: 1400 },
  p2: { name: "Canvas Tote Bag", price: 2200 },
  p3: { name: "Wool Beanie", price: 1800 },
  p4: { name: "Leather Notebook", price: 3200 },
  p5: { name: "Enamel Pin Set", price: 900 },
  p6: { name: "Steel Water Bottle", price: 2600 },
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [code, setCode] = useState("");
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => setCart(data.cart))
      .catch(() => setCart({ items: [] }));
  }, []);

  async function handleApplyDiscount(e: React.FormEvent) {
    e.preventDefault();
    setDiscountMessage(null);

    const res = await fetch("/api/cart/discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      const data = await res.json();
      setDiscountMessage(
        data.discountPercent > 0
          ? `Applied ${data.discountPercent}% off.`
          : "That code isn't valid."
      );
      const cartRes = await fetch("/api/cart");
      const cartData = await cartRes.json();
      setCart(cartData.cart);
    }
  }

  if (!cart) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Loading cart...</p>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const info = PRODUCT_INFO[item.productId];
    return sum + (info ? info.price * item.quantity : 0);
  }, 0);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Continue shopping
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Your cart
        </h1>

        {cart.items.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">Your cart is empty.</p>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
            {cart.items.map((item, index) => {
              const info = PRODUCT_INFO[item.productId];
              return (
                <div
                  key={index}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {info?.name ?? item.productId}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-zinc-900 dark:text-zinc-50">
                    {info ? formatPrice(info.price * item.quantity) : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleApplyDiscount} className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Discount code"
            className="h-11 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            className="flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Apply
          </button>
        </form>
        {discountMessage && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{discountMessage}</p>
        )}

        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <span className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Subtotal
          </span>
          <span className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {formatPrice(subtotal)}
          </span>
        </div>

        <Link
          href="/checkout"
          className="flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Checkout
        </Link>
      </main>
    </div>
  );
}
