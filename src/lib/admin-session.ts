import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge/lib/next/tokens";
import { authConfig } from "@/lib/auth-config";

export async function getAdminToken() {
  const tokens = await getTokens(await cookies(), authConfig);
  return tokens?.decodedToken.admin === true ? tokens.decodedToken : null;
}

// Server actions are reachable from any route, so the proxy alone doesn't protect them
export async function requireAdmin() {
  const token = await getAdminToken();
  if (!token) throw new Error("Not authorized");
  return token;
}
