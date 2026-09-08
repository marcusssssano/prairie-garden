"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // The reset-link email points here with a recovery token in the URL;
    // the browser client exchanges it automatically and fires this event.
    // Also check for an already-established session in case that exchange
    // finished before this listener attached.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStatus("ready");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus("ready");
    });

    // No recovery event and no session after a moment means this wasn't
    // reached via a valid reset link (expired, already used, or someone
    // just navigated here directly).
    const timeout = setTimeout(() => {
      setStatus((current) => (current === "checking" ? "invalid" : current));
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="mx-auto max-w-sm px-6 py-20 text-center">
        <h1 className="font-display text-2xl italic text-forest">
          Password updated
        </h1>
        <p className="mt-3 font-body text-sm text-forest/60">
          Your password has been changed. You&apos;re signed in with it now.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-clay px-8 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
          onClick={() => router.refresh()}
        >
          Continue to Prairie Garden
        </Link>
      </main>
    );
  }

  if (status === "checking") {
    return (
      <main className="mx-auto max-w-sm px-6 py-20 text-center">
        <p className="font-body text-sm text-forest/60">
          Checking your reset link…
        </p>
      </main>
    );
  }

  if (status === "invalid") {
    return (
      <main className="mx-auto max-w-sm px-6 py-20 text-center">
        <h1 className="font-display text-2xl italic text-forest">
          This link isn&apos;t valid
        </h1>
        <p className="mt-3 font-body text-sm text-forest/60">
          It may have expired or already been used. Request a new one below.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block rounded-full bg-clay px-8 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
        >
          Request a new link
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-3xl italic text-forest">
        Set a new password
      </h1>
      <p className="mt-2 font-body text-sm text-forest/60">
        Choose a new password for your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block font-body text-sm text-forest/70">
          New password
          <input
            type="password"
            required
            minLength={6}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep"
          />
        </label>
        <label className="block font-body text-sm text-forest/70">
          Confirm new password
          <input
            type="password"
            required
            minLength={6}
            maxLength={128}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </main>
  );
}
