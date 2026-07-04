"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = use(searchParams);
  const router = useRouter();
  const [plan, setPlan] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/34");
  const [cvc, setCvc] = useState("123");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) return;
    fetch(`/api/profile/lookup?email=${encodeURIComponent(email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPlan(data ? String(data.plan) : null))
      .catch(() => setPlan(null));
  }, [email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, cardNumber, expiry, cvc }),
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      router.push(`/welcome?email=${encodeURIComponent(email ?? "")}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-zinc-200 bg-white px-8 py-12 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Selected plan: <strong>{plan}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="expiry" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Expiry
              </label>
              <input
                id="expiry"
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="cvc" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                CVC
              </label>
              <input
                id="cvc"
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {loading ? "Processing..." : "Complete purchase"}
          </button>
        </form>
      </main>
    </div>
  );
}
