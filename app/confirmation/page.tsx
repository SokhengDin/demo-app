import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <main className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white px-8 py-12 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-7 w-7 text-emerald-600 dark:text-emerald-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Order placed
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Thanks for your order! You&apos;ll receive a confirmation shortly.
        </p>
        <Link
          href="/"
          className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-accent px-6 font-medium text-accent-foreground transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Continue shopping
        </Link>
      </main>
    </div>
  );
}
