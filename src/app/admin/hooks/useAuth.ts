"use client";

import { useState, useEffect } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Fires on token refreshes too, so a newly granted admin claim shows up without a reload
    return onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        setIsAdmin(tokenResult.claims.admin === true);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });
  }, []);

  return {
    user,
    loading,
    isAdmin,
    signOut: () => auth.signOut(),
    refreshToken: () => user?.getIdToken(true),
  };
}
