// app/dashboard/page.js  — PATCH INSTRUCTIONS
// Apply these 3 targeted search-and-replace fixes to your existing file.
// ─────────────────────────────────────────────────────────────────────────────
// The file is too large to replace wholesale, so these are surgical fixes.
// In your editor, find each OLD string and replace with NEW.
// ─────────────────────────────────────────────────────────────────────────────

// ════════════════════════════════════════════════════════════
// FIX 1 — Rate label: "~9%/yr/yr target" → "~9%/yr target"
// ════════════════════════════════════════════════════════════
// FIND (exact string in your dashboard/page.js):
//   pc.rate + "/yr target"
// or any variant that results in "~9%/yr/yr target" or "~16%/yr/yr"
//
// REPLACE WITH:
//   pc.rate ? pc.rate + " target" : "~9%/yr target"
//
// The rate strings already include "/yr" (e.g. "~9%/yr"), so just append " target":
//
// BEFORE:  <div ...>{pc.rate}/yr target</div>
// AFTER:   <div ...>{pc.rate} target</div>
//
// Find this pattern in the plan card section and remove the extra "/yr":

// SEARCH:   `${pc.rate}/yr`
// REPLACE:  `${pc.rate}`
// (this removes the hardcoded /yr that duplicates what's already in pc.rate)

// ════════════════════════════════════════════════════════════
// FIX 2 — Portfolio gain sign: "+-4.3%" → "-4.3%" (red) or "+4.3%" (green)
// ════════════════════════════════════════════════════════════
// Find the gain percentage display in the portfolio section.
// BEFORE (produces "+-4.3%" when negative):
//   `+${gainPct.toFixed(1)}%`
//   or: "+" + gainPct.toFixed(1) + "%"
//
// AFTER (correct sign logic):
//   `${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}%`
//
// And set the color conditionally:
//   color: gainPct >= 0 ? "var(--green)" : "var(--red)"
//
// Full corrected JSX for the gain display:
const GainDisplay = ({ gainPct }) => (
  <div style={{
    fontFamily: "DM Sans",
    fontWeight: 700,
    fontSize: 22,
    color: gainPct >= 0 ? "var(--green)" : "var(--red)",  // red when negative
  }}>
    {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
  </div>
);

// ════════════════════════════════════════════════════════════
// FIX 3 — Macro strip Real Drag: "-+2.43%" → "-2.43%"
// ════════════════════════════════════════════════════════════
// Find the Real Drag / inflation display in the macro strip section.
// BEFORE (produces "-+2.43%"):
//   `-+${(macroData.inflation * 100).toFixed(2)}%`
//   or: "-" + "+" + ...
//
// AFTER (correct — just prepend minus, no plus):
//   `-${(macroData.inflation * 100).toFixed(2)}%`
//
// Search for the string that produces Real Drag and fix:
// SEARCH:   "-+" + 
// REPLACE:  "-" +
//
// Or if it's template literal:
// SEARCH:   `-+${
// REPLACE:  `-${

// ════════════════════════════════════════════════════════════
// COPY-PASTE READY: complete corrected gain + drag display block
// Find your macro strip render and replace the values with these:
// ════════════════════════════════════════════════════════════

/*
// Real Drag display (in macro strip):
<span style={{ fontFamily:"DM Mono", fontSize:13, color:"var(--red)", fontWeight:600 }}>
  -{(macroData.inflation * 100).toFixed(2)}% Real Drag
</span>

// Portfolio gain display (in portfolio chart / history card):
<span style={{
  fontFamily: "DM Mono",
  fontWeight: 700,
  fontSize: 18,
  color: gainPct >= 0 ? "var(--green)" : "var(--red)",
}}>
  {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
</span>

// Plan rate label (in plan card header):
<div style={{ fontFamily:"DM Mono", fontSize:13, color:"var(--gold)" }}>
  {pc.rate} target
</div>
*/

export default null; // This file is a patch reference — not a standalone component
