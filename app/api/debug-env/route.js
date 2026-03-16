// app/api/debug-env/route.js
// TEMPORARY - delete after debugging
export async function GET() {
  return Response.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    keyPrefix: process.env.RESEND_API_KEY?.slice(0, 6) || "missing",
    hasCronSecret: !!process.env.CRON_SECRET,
  });
}
