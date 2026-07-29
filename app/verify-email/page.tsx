import Link from "next/link";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    status?: string;
    email?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;

  const rateLimited = params.status === "already-sent";
  const email = params.email?.trim();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to HireLens
          </Link>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Email verification
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              {rateLimited
                ? "Check your email"
                : "Verify your email"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {rateLimited
                ? "A verification email was recently requested for this address. Please check your inbox and spam folder before trying again."
                : "Your recruiter account has been created. Verify your email before signing in to HireLens."}
            </p>
          </div>

          {email ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Verification email
              </p>
              <p className="mt-1 break-all font-medium text-slate-900">
                {email}
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-indigo-900">
            Open the verification link sent to your email. After your email is
            verified, return to HireLens and sign in to your recruiter account.
          </div>

          <p className="text-sm text-slate-500">
            Didn&apos;t see the email? Check your spam or junk folder as well.
          </p>

          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}