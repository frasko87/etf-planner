// app/api/cms/auth/route.js
// Validates writer credentials, returns session token

import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return Response.json({ error: "Missing credentials" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data: writer } = await supabase
      .from("writers")
      .select("id, name, email, writer_code, bio, active, password_hash")
      .eq("email", email.toLowerCase().trim())
      .eq("active", true)
      .single();

    if (!writer) return Response.json({ error: "Invalid email or password" }, { status: 401 });

    // MVP: plain text comparison (upgrade to bcrypt in production)
    if (writer.password_hash !== password) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Create a simple token: base64(writerId:writerCode:timestamp)
    const tokenPayload = `${writer.id}:${writer.writer_code}:${Date.now()}`;
    const token = Buffer.from(tokenPayload).toString("base64");

    // Store active token in DB (optional — for now just return it)
    const writerPublic = {
      id:          writer.id,
      name:        writer.name,
      email:       writer.email,
      writer_code: writer.writer_code,
      bio:         writer.bio,
    };

    return Response.json({ token, writer: writerPublic });
  } catch (e) {
    console.error("CMS auth error:", e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// Validate a token (called by other CMS routes)
export function validateToken(token) {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const [writerId, writerCode, timestamp] = decoded.split(":");
    // Token expires after 12 hours
    if (Date.now() - parseInt(timestamp) > 12 * 60 * 60 * 1000) return null;
    return { writerId: parseInt(writerId), writerCode };
  } catch {
    return null;
  }
}
