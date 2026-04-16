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

export async function getAdminUsers() {
  const db = getAdminDb();
  const snapshot = await db.collection("allowedPhones").get();

  const phones = snapshot.docs.map((doc) => ({
    phone: doc.id,
    name: (doc.data().name as string) ?? "",
    addedAt: doc.data().addedAt?.toDate().toISOString() ?? null,
  }));
  phones.sort((a, b) =>
    (a.name || a.phone).localeCompare(b.name || b.phone)
  );

  const phoneNumbers = phones.map((p) => p.phone);
  const loginInfo: Record<
    string,
    { lastSignIn: string | null; created: string | null }
  > = {};

  if (phoneNumbers.length > 0) {
    const auth = getAdminAuth();
    const result = await auth.getUsers(
      phoneNumbers.map((phoneNumber) => ({ phoneNumber }))
    );
    for (const user of result.users) {
      if (user.phoneNumber) {
        loginInfo[user.phoneNumber] = {
          lastSignIn: user.metadata.lastSignInTime ?? null,
          created: user.metadata.creationTime ?? null,
        };
      }
    }
  }

  return { phones, loginInfo };
}

export async function revokeAdminClaim(phoneNumber: string) {
  const auth = getAdminAuth();
  const users = await auth.getUsers([{ phoneNumber }]);

  if (users.users.length > 0) {
    await auth.setCustomUserClaims(users.users[0].uid, { admin: false });
  }
}
