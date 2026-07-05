"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckoutSteps } from "../checkout-steps";

export default function ShippingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/checkout/shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address, city, postalCode, country }),
    });

    if (!res.ok) {
      setError("Please fill in every field.");
      return;
    }

    router.push("/checkout/payment");
  }

  return (
    <div className="flex flex-1 flex-col">
      <CheckoutSteps current="shipping" />

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Shipping address
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
              Street address
            </label>
            <input
              id="address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Market Street"
              className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 outline-none focus:border-accent dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="city" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                City
              </label>
              <input
                id="city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco"
                className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 outline-none focus:border-accent dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="postalCode" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Postal code
              </label>
              <input
                id="postalCode"
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="94103"
                className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 outline-none focus:border-accent dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="country" className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Country
            </label>
            <input
              id="country"
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="United States"
              className="h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-900 outline-none focus:border-accent dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-accent px-6 font-medium text-accent-foreground transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Continue to payment
          </button>
        </form>
      </main>
    </div>
  );
}
