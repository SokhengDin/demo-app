"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";

export default function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = use(searchParams);
  const router = useRouter();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const selectedPlan = formData.get("selectedPlan");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, company, selectedPlan }),
      });

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      router.push(`/checkout?email=${encodeURIComponent(email ?? "")}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-zinc-200 bg-white px-8 py-12 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Set up your profile
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Tell us a bit about yourself.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="Jane Doe"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="company" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Company
            </label>
            <input
              id="company"
              name="company"
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="Acme Inc."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="plan" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Plan
            </label>
            <select
              id="plan"
              name="selectedPlan"
              defaultValue="starter"
              className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </main>
    </div>
  );
}
