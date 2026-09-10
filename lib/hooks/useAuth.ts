"use client";

import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// One shared auth store for every client component that needs to know who
// the visitor is — the header, plant cards, the add-to-cart controls, and
// the cart/checkout guards.
//
// This used to be a per-component hook, which meant each of the 14 plant
// cards on /shop ran its own getUser() and profiles lookup: 16 auth
// requests and 30 profile queries for a single page load, every one of
// the auth calls returning 403 for signed-out visitors and logging an
// error to the console. Sharing one subscription collapses that to a
// single resolution.
//
// getSession() rather than getUser() on the way in: it reads the session
// that's already stored locally instead of making a round trip that 403s
// when nobody's signed in. That's the right trade here because this only
// drives what UI to show — the real enforcement is RLS on every query and
// the server-side guard on /admin, neither of which trusts this value.
export type AuthState = {
  user: User | null;
  isAdmin: boolean;
  /** True until the first resolution lands, so callers can avoid flashing. */
  loading: boolean;
};

const INITIAL: AuthState = { user: null, isAdmin: false, loading: true };

let state: AuthState = INITIAL;
let started = false;
const listeners = new Set<() => void>();

function emit(next: AuthState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;

  const supabase = createClient();

  async function resolve(user: User | null) {
    if (!user) {
      emit({ user: null, isAdmin: false, loading: false });
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    emit({ user, isAdmin: data?.is_admin ?? false, loading: false });
  }

  supabase.auth.getSession().then(({ data }) => {
    resolve(data.session?.user ?? null);
  });

  // Keeps the header and the buy controls correct after a sign-in or
  // sign-out without needing a full page reload.
  supabase.auth.onAuthStateChange((_event, session) => {
    resolve(session?.user ?? null);
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthState {
  return state;
}

function getServerSnapshot(): AuthState {
  return INITIAL;
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
