import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { getAdminDb } from "../src/lib/firebase-admin";

const E164_REGEX = /^\+[1-9]\d{1,14}$/;

async function main() {
  const phone = process.argv[2];

  if (!phone || !E164_REGEX.test(phone)) {
    console.error("Usage: npx tsx scripts/add-admin.ts +1XXXXXXXXXX");
    console.error("Phone number must be in E.164 format");
    process.exit(1);
  }

  const db = getAdminDb();
  const ref = db.collection("allowedPhones").doc(phone);
  const existing = await ref.get();

  if (existing.exists) {
    console.log(`${phone} is already an admin`);
    process.exit(0);
  }

  await ref.set({
    addedAt: new Date(),
    addedBy: "cli",
  });

  console.log(`Added ${phone} as admin`);
}

main();
