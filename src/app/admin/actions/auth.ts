"use server";

import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-session";

// Runs before the session cookie exists, so it checks the ID token and allowlist instead of requireAdmin
export async function verifyAndSetAdminClaim(idToken: string) {
  const decoded = await getAdminAuth().verifyIdToken(idToken);
  const phone = decoded.phone_number;

  if (!phone) {
    return { success: false, error: "No phone number associated with account" };
  }

  const doc = await getAdminDb()
    .collection("allowedPhones")
    .doc(phone)
    .get();

  if (!doc.exists) {
    return { success: false, error: "Phone number not authorized" };
  }

  await getAdminAuth().setCustomUserClaims(decoded.uid, { admin: true });
  return { success: true };
}

export async function removeAdmin(phoneNumber: string) {
  const token = await requireAdmin();
  if (token.phone_number === phoneNumber) {
    throw new Error("Admins can't remove themselves");
  }

  // Revoke before deleting the allowlist entry, so a failure leaves nothing half-removed.
  // Revoking refresh tokens makes getAdminToken reject their existing session right away.
  const auth = getAdminAuth();
  const { users } = await auth.getUsers([{ phoneNumber }]);
  for (const user of users) {
    await auth.setCustomUserClaims(user.uid, { admin: false });
    await auth.revokeRefreshTokens(user.uid);
  }

  await getAdminDb().collection("allowedPhones").doc(phoneNumber).delete();
}
