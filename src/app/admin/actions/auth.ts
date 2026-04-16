"use server";

import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

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

export async function revokeAdminClaim(phoneNumber: string) {
  const auth = getAdminAuth();
  const users = await auth.getUsers([{ phoneNumber }]);

  if (users.users.length > 0) {
    await auth.setCustomUserClaims(users.users[0].uid, { admin: false });
  }
}
