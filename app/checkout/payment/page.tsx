"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckoutSteps } from "../checkout-steps";

export default function PaymentPage() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/34");
  const [cvc, setCvc] = useState("123");
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      cardNumber,
      expiry,
      cvc,
      // Intentional bug: when sameAsShipping is true, billingAddress is
      // never populated from the shipping address (or anything else) — the
      // UI assumes the checkbox means the backend won't need it. It does.
      ...(sameAsShipping ? {} : { billingAddress }),
    };

    const res = await fetch("/api/checkout/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Intentional bug: generic message regardless of status code — the
      // 422 response's `fields` object is never read or displayed, so the
      // specific missing-field reason is invisible in the UI.
      setError("Something went wrong, please try again.");
      return;
    }

    router.push("/checkout/review");
  }

  return (
    <div className="flex flex-1 flex-col">
      <CheckoutSteps current="payment" />

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Payment
          </h1>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cardNumber" className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Card number
            </label>
            <input
              id="cardNumber"
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 outline-none focus:border-accent dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="expiry" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Expiry
              </label>
              <input
                id="expiry"
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 outline-none focus:border-accent dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cvc" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                CVC
              </label>
              <input
                id="cvc"
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 outline-none focus:border-accent dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 pt-2 text-sm font-medium text-stone-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={sameAsShipping}
              onChange={(e) => setSameAsShipping(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-accent focus:ring-accent dark:border-stone-700"
            />
            Same as shipping address
          </label>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="billingAddress"
              className={`text-sm font-medium ${
                sameAsShipping
                  ? "text-stone-400 dark:text-stone-600"
                  : "text-stone-700 dark:text-stone-300"
              }`}
            >
              Billing address
            </label>
            <input
              id="billingAddress"
              type="text"
              disabled={sameAsShipping}
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder={sameAsShipping ? "Using shipping address" : "123 Market Street"}
              className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 outline-none focus:border-accent disabled:bg-stone-100 disabled:text-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50 dark:disabled:bg-stone-800 dark:disabled:text-stone-600"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-accent px-6 font-medium text-accent-foreground transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Continue to review
          </button>
        </form>
      </main>
    </div>
  );
}
