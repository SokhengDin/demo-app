"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, placeholderColor, iconTint } from "@/lib/format";
import { ProductIcon } from "@/lib/product-icons";

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
      <div className="flex flex-1 items-center justify-center">
        <p className="text-stone-600 dark:text-stone-400">Loading cart...</p>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const info = PRODUCT_INFO[item.productId];
    return sum + (info ? info.price * item.quantity : 0);
  }, 0);

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Your cart
          </h1>
          <Link
            href="/"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
          >
            Continue shopping
          </Link>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-stone-300 py-16 text-center dark:border-stone-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.25}
              className="h-10 w-10 text-stone-400 dark:text-stone-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.694 2.608-7.163.075-.302-.174-.585-.484-.585H5.106M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            <p className="text-stone-600 dark:text-stone-400">Your cart is empty.</p>
            <Link
              href="/"
              className="text-sm font-medium text-accent hover:underline"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
            {cart.items.map((item, index) => {
              const info = PRODUCT_INFO[item.productId];
              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg ${placeholderColor(
                        item.productId
                      )}`}
                    >
                      <ProductIcon
                        productId={item.productId}
                        className={`h-7 w-7 ${iconTint(item.productId)}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-50">
                        {info?.name ?? item.productId}
                      </p>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-stone-900 dark:text-stone-50">
                    {info ? formatPrice(info.price * item.quantity) : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleApplyDiscount} className="flex gap-3">
          <div className="relative flex-1">
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
                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Discount code"
              className="h-11 w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 text-stone-900 outline-none focus:border-accent dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            />
          </div>
          <button
            type="submit"
            className="flex h-11 items-center justify-center rounded-full border border-stone-300 px-5 font-medium text-stone-900 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-50 dark:hover:bg-stone-800"
          >
            Apply
          </button>
        </form>
        {discountMessage && (
          <p className="-mt-3 text-sm text-stone-600 dark:text-stone-400">{discountMessage}</p>
        )}

        <div className="flex items-center justify-between border-t border-stone-200 pt-4 dark:border-stone-800">
          <span className="text-lg font-medium text-stone-900 dark:text-stone-50">
            Subtotal
          </span>
          <span className="text-lg font-medium text-stone-900 dark:text-stone-50">
            {formatPrice(subtotal)}
          </span>
        </div>

        <Link
          href="/checkout"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-foreground transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Checkout
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </main>
    </div>
  );
}
