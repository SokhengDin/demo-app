import Link from "next/link";
import { signups } from "@/lib/store";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const signup = email ? signups.get(email) : undefined;
  const token = signup?.verificationToken;
  const verificationUrl = token ? `/verify?vtoken=${token}` : null;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white px-8 py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Check your email
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We sent a verification link to <strong>{email}</strong>. Since this
          is a demo, here it is directly:
        </p>

        {verificationUrl ? (
          <Link
            href={verificationUrl}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Verify email
          </Link>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400">
            No pending signup found for that email.
          </p>
        )}
      </main>
    </div>
  );
}
