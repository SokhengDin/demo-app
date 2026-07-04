export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white px-8 py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome to Cambria
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You&apos;re all set, <strong>{email}</strong>. Your account is ready
          to go.
        </p>
      </main>
    </div>
  );
}
