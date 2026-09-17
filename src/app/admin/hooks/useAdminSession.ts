"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ADMIN_DEFAULT_TAB } from "@/app/admin/config";

type SessionState = { uid: string | null; active: boolean; error: string };

// The browser can be signed in to Firebase while the server session cookie is missing
// (expired, cleared, or a failed login). Server-rendered admin pages would then redirect
// back to /admin in a loop, so the dashboard waits until the session exists.
export function useAdminSession(user: User | null, isAdmin: boolean) {
  const [state, setState] = useState<SessionState>({
    uid: null,
    active: false,
    error: "",
  });
  const uid = user && isAdmin ? user.uid : null;

  useEffect(() => {
    if (!user || !uid) return;
    let cancelled = false;

    const fail = async () => {
      setState({
        uid: null,
        active: false,
        error: "Couldn't start an admin session. Try signing in again.",
      });
      await auth.signOut();
    };

    (async () => {
      const check = await fetch("/api/admin/session", { cache: "no-store" });
      if (cancelled) return;
      if (check.ok) {
        setState({ uid, active: true, error: "" });
        return;
      }

      // A revoked or deleted Firebase login throws when refreshing its ID token
      const login = await fetch("/api/admin/login", {
        method: "POST",
        headers: { Authorization: `Bearer ${await user.getIdToken(true)}` },
      });
      if (cancelled) return;
      if (!login.ok) {
        await fail();
        return;
      }

      // Pages rendered before the cookie existed have no data, so reload through the proxy
      window.location.replace(
        window.location.pathname === "/admin" ? ADMIN_DEFAULT_TAB : window.location.href
      );
    })().catch(() => {
      if (!cancelled) fail();
    });

    return () => {
      cancelled = true;
    };
  }, [user, uid]);

  return {
    active: uid !== null && state.uid === uid && state.active,
    error: state.error,
  };
}
