import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/admin-session";
import { getResources } from "@/app/admin/actions/resources";

// SWR revalidates through this route rather than calling the server action directly,
// which triggers router updates during render (see /api/admin/users)
export async function GET() {
  if (!(await getAdminToken())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  return NextResponse.json(await getResources());
}
