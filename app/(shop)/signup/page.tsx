"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // If email confirmation is required (the default), Supabase returns
      // a user but no session yet — the account can't sign in until they
      // click the link in their inbox.
      if (!data.session) {
        setConfirmEmailSent(true);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmEmailSent) {
    return (
      <main className="mx-auto max-w-sm px-6 py-20 text-center">
        <h1 className="font-display text-2xl italic text-forest">
          Check your inbox
        </h1>
        <p className="mt-3 font-body text-sm text-forest/60">
          We sent a confirmation link to {email}. Click it to activate your
          account, then come back and sign in.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-clay px-8 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
        >
          Go to sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-3xl italic text-forest">
        Create an account
      </h1>
      <p className="mt-2 font-body text-sm text-forest/60">
        Save your details and track your orders.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block font-body text-sm text-forest/70">
          Full name
          <input
            type="text"
            required
            maxLength={100}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep"
          />
        </label>
        <label className="block font-body text-sm text-forest/70">
          Email
          <input
            type="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep"
          />
        </label>
        <label className="block font-body text-sm text-forest/70">
          Password
          <input
            type="password"
            required
            minLength={6}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep"
          />
          {/* The FAQ and privacy pages say this too, but someone signing up
              may never have opened either — and this is the moment the
              choice actually gets made. */}
          <span className="mt-1 block font-body text-xs text-forest/50">
            Prairie Garden is a demo project — please pick something you
            don&apos;t use on other sites.
          </span>
        </label>

        {error && (
          <p className="font-body text-sm text-clay" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-clay px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 font-body text-sm text-forest/60">
        Already have an account?{" "}
        <Link href="/login" className="text-clay hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
