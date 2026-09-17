import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { authConfig } from "@/lib/auth-config";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function getAdminToken() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return null;

  // getTokens only checks the cookie signature and decodes the ID token; expiry and
  // revocation are left to the proxy, which lets invalid sessions through to API routes
  // and server actions. Verify here so an expired or revoked session is rejected.
  try {
    const decoded = await getAdminAuth().verifyIdToken(tokens.token, true);
    return decoded.admin === true ? decoded : null;
  } catch {
    return null;
  }
}

// Server actions are reachable from any route, so the proxy alone doesn't protect them
export async function requireAdmin() {
  const token = await getAdminToken();
  if (!token) throw new Error("Not authorized");
  return token;
}
