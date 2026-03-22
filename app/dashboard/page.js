// app/dashboard/page.js  — NAME PATCH
// ─────────────────────────────────────────────────────────────────────────────
// After the onboarding update, users will have user_metadata.first_name set.
// This patch makes the dashboard greeting use it properly.
//
// FIND the greeting line in your dashboard/page.js (search for "Hi,"):
//
//   Something like:
//   `Hi, ${user?.email?.split("@")[0] || "investor"} 👋`
//   or:
//   `Hi, ${user?.user_metadata?.full_name || user?.email?.split("@")[0]} 👋`
//
// REPLACE WITH this helper (add near the top of the component, after user is loaded):
// ─────────────────────────────────────────────────────────────────────────────

// ── Paste this function near the top of your dashboard component ─────────────
function getDisplayName(user) {
  if (!user) return "investor";
  const meta = user.user_metadata || {};
  // first_name is set by our new onboarding
  if (meta.first_name) return meta.first_name;
  // full_name fallback (Google OAuth) — take first word only
  if (meta.full_name) {
    const first = meta.full_name.trim().split(/\s+/)[0];
    if (first && first.length < 20) return first;
  }
  // email prefix fallback
  if (user.email) return user.email.split("@")[0];
  return "investor";
}

// ── Then change the greeting line to: ────────────────────────────────────────
//
//   Hi, {getDisplayName(user)} 👋
//
// That's the only change needed in dashboard/page.js.
// The function handles all cases:
//
//   New users (typed a name)  → "Hi, Francisco 👋"
//   New users (skipped)       → "Hi, franciscoanalytics 👋"  (email prefix, same as before)
//   Google OAuth users        → "Hi, Francisco 👋"  (first word of full_name)
//   Old users (no name set)   → "Hi, fran 👋"  (email prefix)
//
// ─────────────────────────────────────────────────────────────────────────────
// ALSO: Update the welcome email subject line in lib/email.js
//
// In sendWelcomeEmail(), find the subject and update to use name:
//
// FIND:
//   subject: `Your ${profile} ETF plan is live 🚀`
//
// REPLACE:
//   subject: `${firstName ? `${firstName}, your` : "Your"} ${profile} ETF plan is live 🚀`
//
// And pass firstName from user_plans or user_metadata when calling it.
// ─────────────────────────────────────────────────────────────────────────────
