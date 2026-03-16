// app/api/admin/auth/route.js
import { cookies } from "next/headers";

export async function POST(req) {
  const { password } = await req.json();
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    return Response.json({ error: "Admin not configured" }, { status: 500 });
  }

  if (password !== ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  // Set a secure httpOnly cookie valid for 8 hours
  const cookieStore = await cookies();
  cookieStore.set("admin_session", process.env.ADMIN_PASSWORD, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return Response.json({ ok: true });
}
