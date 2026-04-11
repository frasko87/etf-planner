// middleware.js
// Handles: auth protection + language detection + blog routing

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["en", "es"];
const DEFAULT_LOCALE    = "en";

// Detect user's preferred language from Accept-Language header
function getLocale(request) {
  const acceptLang = request.headers.get("accept-language") || "";
  const preferred  = acceptLang.split(",")[0]?.split("-")[0]?.toLowerCase();
  return SUPPORTED_LOCALES.includes(preferred) ? preferred : DEFAULT_LOCALE;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Language redirect ────────────────────────────────────────────────────────
  // If user goes to / and their browser is Spanish → redirect to /es
  // Only on the root — guide/blog/etc are language-prefixed separately
  if (pathname === "/" || pathname === "") {
    const storedLang = request.cookies.get("etfplan_lang")?.value;
    const lang = storedLang || getLocale(request);
    if (lang === "es") {
      const url = request.nextUrl.clone();
      url.pathname = "/es";
      return NextResponse.redirect(url);
    }
  }

  // ── Auth protection ──────────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll()  { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/login",
  ],
};
