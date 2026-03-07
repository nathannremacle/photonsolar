import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth-server";

export async function POST() {
  const cookie = `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  return NextResponse.json({ success: true }, {
    headers: { "Set-Cookie": cookie },
  });
}
