import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white px-8 py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Order placed
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Thanks for your order! You&apos;ll receive a confirmation shortly.
        </p>
        <Link
          href="/"
          className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Continue shopping
        </Link>
      </main>
    </div>
  );
}
