"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      // A transient system error (rate limit, mail server down) says
      // nothing about whether this specific email has an account, so it's
      // safe to surface honestly — unlike "no account found", which stays
      // hidden behind the generic "check your inbox" below so this form
      // can't be used to check who's signed up.
      if (resetError?.status && (resetError.status === 429 || resetError.status >= 500)) {
        setError(
          "We couldn't send that right now — too many requests recently. Please wait a bit and try again."
        );
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <main className="mx-auto max-w-sm px-6 py-20 text-center">
        <h1 className="font-display text-2xl italic text-forest">
          Check your inbox
        </h1>
        <p className="mt-3 font-body text-sm text-forest/60">
          If an account exists for {email}, we&apos;ve sent a link to reset
          your password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-clay px-8 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
        >
          Back to sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-3xl italic text-forest">
        Reset your password
      </h1>
      <p className="mt-2 font-body text-sm text-forest/60">
        Enter your email and we&apos;ll send you a link to set a new
        password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 font-body text-sm text-forest/60">
        <Link href="/login" className="text-clay hover:underline">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
