"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutSteps } from "../checkout-steps";
import { formatPrice, placeholderColor, iconTint } from "@/lib/format";
import { ProductIcon } from "@/lib/product-icons";

type CartItem = { productId: string; quantity: number };
type Cart = {
  items: CartItem[];
  discountPercent?: number;
  discount?: number;
  shipping?: { name: string; address: string; city: string; postalCode: string; country: string };
  payment?: { cardNumber: string };
};

const PRODUCT_INFO: Record<string, { name: string; price: number }> = {
  p1: { name: "Ceramic Mug", price: 1400 },
  p2: { name: "Canvas Tote Bag", price: 2200 },
  p3: { name: "Wool Beanie", price: 1800 },
  p4: { name: "Leather Notebook", price: 3200 },
  p5: { name: "Enamel Pin Set", price: 900 },
  p6: { name: "Steel Water Bottle", price: 2600 },
};

export default function ReviewPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => setCart(data.cart))
      .catch(() => setCart({ items: [] }));
  }, []);

  async function handlePlaceOrder() {
    setError(null);

    const res = await fetch("/api/checkout", { method: "POST" });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(
        data.error === "missing_shipping_info"
          ? "Your shipping information is missing. Please go back and re-enter it."
          : "Something went wrong placing your order."
      );
      return;
    }

    const data = await res.json();
    sessionStorage.setItem("cambria_last_order", JSON.stringify(data.items));
    router.push("/confirmation");
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
      <CheckoutSteps current="review" />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Review your order
        </h1>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="font-medium text-stone-900 dark:text-stone-50">Items</h2>
          <div className="mt-3 flex flex-col divide-y divide-stone-200 dark:divide-stone-800">
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
          <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-400">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-medium text-stone-900 dark:text-stone-50">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {cart.shipping && (
          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-medium text-stone-900 dark:text-stone-50">Shipping to</h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              {cart.shipping.name}
              <br />
              {cart.shipping.address}, {cart.shipping.city} {cart.shipping.postalCode}
              <br />
              {cart.shipping.country}
            </p>
          </div>
        )}

        {cart.payment && (
          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="font-medium text-stone-900 dark:text-stone-50">Payment</h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Card ending in {cart.payment.cardNumber.slice(-4)}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          onClick={handlePlaceOrder}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-accent-foreground transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Place order
        </button>
      </main>
    </div>
  );
}
