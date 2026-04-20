import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET() {
  const db = getAdminDb();
  const snapshot = await db.collection("allowedPhones").get();

  const phones = snapshot.docs.map((doc) => ({
    phone: doc.id,
    name: (doc.data().name as string) ?? "",
    addedAt: doc.data().addedAt?.toDate().toISOString() ?? null,
  }));
  phones.sort((a, b) => (a.name || a.phone).localeCompare(b.name || b.phone));

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

  return NextResponse.json({ phones, loginInfo });
}
