"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

type Status = "verifying" | "success" | "error";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = use(searchParams);
  const [status, setStatus] = useState<Status>("verifying");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          setStatus("error");
          return;
        }

        const data = await res.json();
        setEmail(data.email);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }

    run();
  }, [token]);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white px-8 py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {status === "verifying" && (
          <p className="text-zinc-600 dark:text-zinc-400">Verifying your email...</p>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Email verified
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Thanks, your email is confirmed.
            </p>
            <Link
              href={`/profile?email=${encodeURIComponent(email ?? "")}`}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Continue to profile setup
            </Link>
          </>
        )}

        {status === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Something went wrong.
          </p>
        )}
      </main>
    </div>
  );
}
