// ── NYSE Calendar ─────────────────────────────────────────────────────────────
const NYSE_HOLIDAYS = new Set([
  "2025-01-01","2025-01-20","2025-02-17","2025-04-18","2025-05-26",
  "2025-06-19","2025-07-04","2025-09-01","2025-11-27","2025-12-25",
  "2026-01-01","2026-01-19","2026-02-16","2026-04-03","2026-05-25",
  "2026-06-19","2026-07-03","2026-09-07","2026-11-26","2026-12-25",
]);

const EARLY_CLOSE = new Set([
  "2025-07-03","2025-11-26","2025-12-24",
  "2026-07-02","2026-11-25","2026-12-24",
]);

const HOLIDAY_NAMES = {
  "2025-01-01":"New Year's Day","2025-01-20":"Martin Luther King Jr. Day",
  "2025-02-17":"Presidents' Day","2025-04-18":"Good Friday",
  "2025-05-26":"Memorial Day","2025-06-19":"Juneteenth",
  "2025-07-04":"Independence Day","2025-09-01":"Labor Day",
  "2025-11-27":"Thanksgiving Day","2025-12-25":"Christmas Day",
  "2026-01-01":"New Year's Day","2026-01-19":"Martin Luther King Jr. Day",
  "2026-02-16":"Presidents' Day","2026-04-03":"Good Friday",
  "2026-05-25":"Memorial Day","2026-06-19":"Juneteenth",
  "2026-07-03":"Independence Day (observed)","2026-09-07":"Labor Day",
  "2026-11-26":"Thanksgiving Day","2026-12-25":"Christmas Day",
};

function getNextTradingDay(from) {
  const d = new Date(from);
  for (let i = 1; i <= 10; i++) {
    d.setDate(d.getDate() + 1);
    const ds  = d.toISOString().split("T")[0];
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6 && !NYSE_HOLIDAYS.has(ds)) {
      return d.toLocaleDateString("en-US", {
        weekday: "long", month: "short", day: "numeric",
        timeZone: "America/New_York",
      }) + " at 9:30 AM ET";
    }
  }
  return "next trading day at 9:30 AM ET";
}

function countdown(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

// ── Main export ───────────────────────────────────────────────────────────────
export function getMarketStatus() {
  const etNow   = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  const dateStr = etNow.toISOString().split("T")[0];
  const dow     = etNow.getDay();
  const mins    = etNow.getHours() * 60 + etNow.getMinutes();
  const openAt  = 9 * 60 + 30;
  const isEC    = EARLY_CLOSE.has(dateStr);
  const closeAt = isEC ? 13 * 60 : 16 * 60;
  const next    = () => getNextTradingDay(etNow);

  if (dow === 0 || dow === 6)
    return { status:"CLOSED",      isOpen:false, reason:"Weekend — NYSE closed Saturday & Sunday",                      detail:`Reopens ${next()}`,                                        nextOpen:next() };
  if (NYSE_HOLIDAYS.has(dateStr))
    return { status:"HOLIDAY",     isOpen:false, reason:`Market holiday — ${HOLIDAY_NAMES[dateStr] ?? "NYSE Holiday"}`, detail:`Reopens ${next()}`,                                        nextOpen:next() };
  if (mins < openAt)
    return { status:"PRE_MARKET",  isOpen:false, reason:"Pre-market hours",                                             detail:`Opens in ${countdown(openAt - mins)} (9:30 AM ET)`,        nextOpen:"today at 9:30 AM ET" };
  if (mins < closeAt)
    return { status:"OPEN",        isOpen:true,  reason: isEC ? "Early session — closes 1:00 PM ET" : "Regular trading session", detail:`Closes in ${countdown(closeAt - mins)}`,         nextOpen:null };

  return   { status:"AFTER_HOURS", isOpen:false, reason:`After-hours — session ended at ${isEC?"1:00":"4:00"} PM ET`,  detail:`Next session: ${next()}`,                                  nextOpen:next() };
}

export const STATUS_STYLE = {
  OPEN:        { color:"#22c55e", bg:"rgba(34,197,94,0.08)",   border:"rgba(34,197,94,0.3)",   icon:"●", pulse:true  },
  PRE_MARKET:  { color:"#c9a84c", bg:"rgba(201,168,76,0.08)",  border:"rgba(201,168,76,0.3)",  icon:"◐", pulse:false },
  AFTER_HOURS: { color:"#9b4cc9", bg:"rgba(155,76,201,0.08)",  border:"rgba(155,76,201,0.3)",  icon:"◑", pulse:false },
  CLOSED:      { color:"#6b8aad", bg:"rgba(107,138,173,0.06)", border:"rgba(107,138,173,0.2)", icon:"○", pulse:false },
  HOLIDAY:     { color:"#c94c7a", bg:"rgba(201,76,122,0.08)",  border:"rgba(201,76,122,0.3)",  icon:"★", pulse:false },
};
