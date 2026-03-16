// app/api/admin/debug/route.js
// TEMPORARY - delete after fixing
export async function GET() {
  return Response.json({
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    length: process.env.ADMIN_PASSWORD?.length || 0,
    first3: process.env.ADMIN_PASSWORD?.slice(0,3) || "missing",
  });
}
