import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/admin-session";

// Lets the admin UI tell whether the server session cookie exists before rendering server data
export async function GET() {
  if (!(await getAdminToken())) {
    return NextResponse.json({ error: "No admin session" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
