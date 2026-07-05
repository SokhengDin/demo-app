"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

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
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
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
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-950">
        <Link
          href="/cart"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to cart
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-1 gap-10 px-8 py-10 sm:grid-cols-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Checkout
          </h1>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="address" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Shipping address
            </label>
            <input
              id="address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cardNumber" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Card number
            </label>
            <input
              id="cardNumber"
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <button
            type="submit"
            className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Place order
          </button>
        </form>

        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Order summary</h2>
          {cart.items.map((item, index) => {
            const info = PRODUCT_INFO[item.productId];
            return (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">
                  {info?.name ?? item.productId} × {item.quantity}
                </span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {info ? formatPrice(info.price * item.quantity) : "—"}
                </span>
              </div>
            );
          })}
          <div className="flex justify-between border-t border-zinc-200 pt-3 text-lg font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
