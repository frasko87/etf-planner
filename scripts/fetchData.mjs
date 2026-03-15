// scripts/fetchData.mjs
// Runs via GitHub Actions at NYSE open + close every trading day.
// On Mondays also runs the weekly scoring engine.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load .env.local when running locally (GitHub Actions uses real env vars)
try {
  const env = readFileSync(".env.local", "utf8");
  env.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  });
  console.log("✓ Loaded .env.local");
} catch(e) {
  console.log("No .env.local — using environment variables");
}

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);


const KEYS = {
  av:   process.env.ALPHA_VANTAGE_KEY,
  fh:   process.env.FINNHUB_KEY,
  poly: process.env.POLYGON_KEY,
  fred: process.env.FRED_KEY,
};

// ─────────────────────────────────────────────────────────────────────────────
// ETF POOL — 18 ETFs across all categories
// ─────────────────────────────────────────────────────────────────────────────
const ETF_POOL = {
  // Total Market
  VTI:  { name:"Vanguard Total Market",    category:"total_market",  risk:"low",       leveraged:false, fallbackCagr:0.135, fallbackOpt:0.18  },
  ITOT: { name:"iShares Core S&P Total",   category:"total_market",  risk:"low",       leveraged:false, fallbackCagr:0.133, fallbackOpt:0.175 },
  // Large Cap
  VOO:  { name:"Vanguard S&P 500",         category:"large_cap",     risk:"low",       leveraged:false, fallbackCagr:0.132, fallbackOpt:0.175 },
  SPY:  { name:"SPDR S&P 500",             category:"large_cap",     risk:"low",       leveraged:false, fallbackCagr:0.131, fallbackOpt:0.172 },
  // Tech Growth
  QQQ:  { name:"Nasdaq-100",               category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.18,  fallbackOpt:0.25  },
  VGT:  { name:"Vanguard Info Tech",       category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.20,  fallbackOpt:0.28  },
  XLK:  { name:"Tech Select SPDR",         category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.195, fallbackOpt:0.27  },
  // Dividend
  SCHD: { name:"Schwab Dividend",          category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.16  },
  VYM:  { name:"Vanguard High Dividend",   category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.115, fallbackOpt:0.155 },
  DGRO: { name:"iShares Dividend Growth",  category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.125, fallbackOpt:0.165 },
  // Sector
  XLE:  { name:"Energy Select SPDR",       category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.22  },
  XLF:  { name:"Financial Select SPDR",    category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.115, fallbackOpt:0.19  },
  XLV:  { name:"Health Care Select SPDR",  category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.105, fallbackOpt:0.17  },
  XLI:  { name:"Industrial Select SPDR",   category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.112, fallbackOpt:0.18  },
  // Aggressive / Leveraged
  TQQQ: { name:"3x Nasdaq (Leveraged)",    category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.38,  fallbackOpt:0.65  },
  SOXL: { name:"3x Semiconductors (Lev.)", category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.35,  fallbackOpt:0.60  },
  ARKK: { name:"ARK Innovation",           category:"aggressive",    risk:"high",      leveraged:false, fallbackCagr:0.22,  fallbackOpt:0.45  },
  UPRO: { name:"3x S&P 500 (Leveraged)",   category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.32,  fallbackOpt:0.55  },
};

const TICKERS = Object.keys(ETF_POOL);

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE RULES
// Defines which categories are eligible and how scoring weights work
// ─────────────────────────────────────────────────────────────────────────────
const PROFILES = {
  conservative: {
    eligible:    ["total_market","large_cap","dividend"],
    count:       4,
    weights:     { momentum:0.20, stability:0.55, trend:0.25 },
    // Stability is most important — penalize volatile ETFs heavily
    description: "Low volatility, dividend-paying, broad market",
  },
  balanced: {
    eligible:    ["total_market","large_cap","tech_growth","dividend","sector"],
    count:       5,
    weights:     { momentum:0.40, stability:0.35, trend:0.25 },
    // Balance growth and stability
    description: "Mix of growth and stability",
  },
  aggressive: {
    eligible:    ["leveraged","aggressive","tech_growth"],
    count:       4,
    weights:     { momentum:0.60, stability:0.10, trend:0.30 },
    // Momentum is king — volatility is acceptable
    description: "High momentum leveraged ETFs",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MARKET STATUS
// ─────────────────────────────────────────────────────────────────────────────
const HOLIDAYS = new Set([
  "2025-01-01","2025-01-20","2025-02-17","2025-04-18","2025-05-26",
  "2025-06-19","2025-07-04","2025-09-01","2025-11-27","2025-12-25",
  "2026-01-01","2026-01-19","2026-02-16","2026-04-03","2026-05-25",
  "2026-06-19","2026-07-03","2026-09-07","2026-11-26","2026-12-25",
]);

function getMarketStatus() {
  const etNow   = new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"}));
  const dateStr = etNow.toISOString().split("T")[0];
  const dow     = etNow.getDay();
  const mins    = etNow.getHours()*60+etNow.getMinutes();
  if (dow===0||dow===6)         return { status:"CLOSED",  isOpen:false, reason:"Weekend" };
  if (HOLIDAYS.has(dateStr))    return { status:"HOLIDAY", isOpen:false, reason:"NYSE Holiday" };
  if (mins<9*60+30)             return { status:"PRE_MARKET", isOpen:false, reason:"Pre-market" };
  if (mins<16*60)               return { status:"OPEN",    isOpen:true,  reason:"Regular session" };
  return                               { status:"AFTER_HOURS", isOpen:false, reason:"After hours" };
}

function getWeekStart(date = new Date()) {
  const d = new Date(date.toLocaleString("en-US",{timeZone:"America/New_York"}));
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function isMonday() {
  const d = new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"}));
  return d.getDay() === 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA FETCHERS
// ─────────────────────────────────────────────────────────────────────────────
async function fetchAV(ticker) {
  if (!KEYS.av) throw new Error("No AV key");
  const res  = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${ticker}&apikey=${KEYS.av}`);
  const json = await res.json();
  if (json["Note"]||json["Information"]) throw new Error("AV rate limited");
  const series = json["Monthly Adjusted Time Series"];
  if (!series) throw new Error("No series");

  const prices = Object.entries(series)
    .map(([date,v])=>({date,close:parseFloat(v["5. adjusted close"])}))
    .sort((a,b)=>new Date(a.date)-new Date(b.date));

  const slice = prices.slice(-61);
  const yrs   = (new Date(slice.at(-1).date)-new Date(slice[0].date))/(1000*60*60*24*365.25);
  const cagr  = Math.pow(slice.at(-1).close/slice[0].close,1/yrs)-1;

  // Momentum — 1m, 3m, 6m
  const last  = prices.length;
  const mom1m = last>1  ? (prices[last-1].close/prices[last-2].close)-1 : null;
  const mom3m = last>3  ? (prices[last-1].close/prices[last-4].close)-1 : null;
  const mom6m = last>6  ? (prices[last-1].close/prices[last-7].close)-1 : null;

  // Volatility — std dev of last 12 monthly returns
  const monthlyReturns = [];
  for (let i=1; i<Math.min(13,prices.length); i++)
    monthlyReturns.push(prices[last-i].close/prices[last-i-1].close-1);
  const mean = monthlyReturns.reduce((a,b)=>a+b,0)/monthlyReturns.length;
  const variance = monthlyReturns.reduce((a,b)=>a+(b-mean)**2,0)/monthlyReturns.length;
  const volatility = Math.sqrt(variance);

  // Trend — price vs 12-month average (momentum proxy)
  const avg12 = prices.slice(-12).reduce((a,b)=>a+b.close,0)/12;
  const trend = (prices.at(-1).close - avg12) / avg12;

  // Optimistic — 75th pct rolling 12mo
  const rolls=[];
  for(let i=12;i<prices.length;i++) rolls.push(prices[i].close/prices[i-12].close-1);
  rolls.sort((a,b)=>a-b);
  const optimistic = rolls[Math.floor(rolls.length*0.75)];

  const jan = prices.find(p=>new Date(p.date).getFullYear()===new Date(prices.at(-1).date).getFullYear());
  const ytd = jan?(prices.at(-1).close-jan.close)/jan.close:null;

  return { price:prices.at(-1).close, cagr, optimistic, ytd, mom1m, mom3m, mom6m, volatility, trend };
}

async function fetchFinnhub(ticker) {
  if (!KEYS.fh) throw new Error("No FH key");
  const [qr,mr] = await Promise.all([
    fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${KEYS.fh}`),
    fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${KEYS.fh}`),
  ]);
  const q=await qr.json(), m=(await mr.json()).metric||{};
  if (!q.c) throw new Error("No FH quote");
  return { price:q.c, prevClose:q.pc, change:q.pc?(q.c-q.pc)/q.pc:null, high52w:m["52WeekHigh"], low52w:m["52WeekLow"] };
}

async function fetchFRED() {
  if (!KEYS.fred) throw new Error("No FRED key");
  const base = "https://api.stlouisfed.org/fred/series/observations";
  const [cr,fr] = await Promise.all([
    fetch(`${base}?series_id=CPIAUCSL&api_key=${KEYS.fred}&file_type=json&sort_order=desc&limit=13`),
    fetch(`${base}?series_id=FEDFUNDS&api_key=${KEYS.fred}&file_type=json&sort_order=desc&limit=1`),
  ]);
  const cpi=await cr.json(), ff=await fr.json();
  const obs=cpi.observations||[];
  if (!obs.length) throw new Error("No FRED data");
  return {
    inflation:(parseFloat(obs[0].value)-parseFloat(obs[12].value))/parseFloat(obs[12].value),
    fedRate:parseFloat(ff.observations?.[0]?.value)/100,
    cpiDate:obs[0].date,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORING ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function scoreETF(ticker, data, profile) {
  const cfg = PROFILES[profile];

  // Momentum score — weighted average of 1m, 3m, 6m momentum
  // Normalize to 0-1 scale based on reasonable ranges
  const mom = ((data.mom1m??0)*0.5 + (data.mom3m??0)*0.3 + (data.mom6m??0)*0.2);
  const scoreMomentum = Math.min(Math.max((mom + 0.15) / 0.30, 0), 1); // -15% to +15% range

  // Stability score — inverse of volatility (lower vol = higher score)
  // Also penalize leveraged ETFs in non-aggressive profiles
  const penaltyLeveraged = (ETF_POOL[ticker].leveraged && profile !== "aggressive") ? 0.5 : 1;
  const scoreStability   = Math.min(Math.max(1 - (data.volatility / 0.08), 0), 1) * penaltyLeveraged;
  // 0.08 = ~8% monthly std dev is the ceiling we consider "max risk"

  // Trend score — is price above its 12-month average? (positive = bullish)
  const scoreTrend = Math.min(Math.max((data.trend + 0.10) / 0.20, 0), 1); // -10% to +10% range

  // Composite score
  const score =
    scoreMomentum * cfg.weights.momentum +
    scoreStability * cfg.weights.stability +
    scoreTrend    * cfg.weights.trend;

  return {
    score:           parseFloat(score.toFixed(4)),
    score_momentum:  parseFloat(scoreMomentum.toFixed(4)),
    score_stability: parseFloat(scoreStability.toFixed(4)),
    score_trend:     parseFloat(scoreTrend.toFixed(4)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ALLOCATION ENGINE
// Distributes % weights based on score within selected ETFs
// ─────────────────────────────────────────────────────────────────────────────
function computeAllocations(selectedTickers, scores) {
  const totalScore = selectedTickers.reduce((a,t) => a + (scores[t]?.score ?? 0.5), 0);
  const raw = {};
  selectedTickers.forEach(t => {
    raw[t] = (scores[t]?.score ?? 0.5) / totalScore;
  });

  // Round to nearest 5% and ensure sum = 100
  const rounded = {};
  let remaining = 100;
  const sorted  = [...selectedTickers].sort((a,b) => (raw[b]??0) - (raw[a]??0));

  sorted.forEach((t, i) => {
    if (i === sorted.length - 1) {
      rounded[t] = remaining; // last one gets remainder
    } else {
      const pct = Math.round(raw[t] * 100 / 5) * 5;
      rounded[t] = Math.max(pct, 10); // minimum 10% allocation
      remaining -= rounded[t];
    }
  });

  return rounded;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE SUMMARY
// Human-readable explanation of what changed week over week
// ─────────────────────────────────────────────────────────────────────────────
function buildChangeSummary(currentTickers, prevTickers, scores) {
  if (!prevTickers?.length) return "Initial selection";

  const added   = currentTickers.filter(t => !prevTickers.includes(t));
  const removed = prevTickers.filter(t => !currentTickers.includes(t));

  if (!added.length && !removed.length) return "No changes — same ETFs selected";

  const parts = [];
  added.forEach((t,i) => {
    const reason = scores[t]?.score_momentum > 0.6 ? "↑ momentum" :
                   scores[t]?.score_trend    > 0.6 ? "↑ trend"    : "↑ score";
    const out = removed[i] ? `${removed[i]} → ${t} (${reason})` : `Added ${t} (${reason})`;
    parts.push(out);
  });
  removed.slice(added.length).forEach(t => parts.push(`Removed ${t}`));

  return parts.join(" · ");
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FETCH JOB
// ─────────────────────────────────────────────────────────────────────────────
async function fetchAllETFs() {
  console.log(`\n[${new Date().toISOString()}] Starting ETF pool fetch...`);

  // 1. FRED macro data
  let fred = { inflation:0.03, fedRate:0.053 };
  try {
    fred = await fetchFRED();
    console.log(`FRED ✓ inflation ${(fred.inflation*100).toFixed(2)}% | fed rate ${(fred.fedRate*100).toFixed(2)}%`);
    await supabase.from("macro_data").upsert({ id:"current", inflation:fred.inflation, fed_rate:fred.fedRate, cpi_date:fred.cpiDate, fetched_at:new Date().toISOString() });
  } catch(e) { console.error(`FRED ✗ ${e.message}`); }

  // 2. Fetch each ETF
  const poolData = {};
  for (const ticker of TICKERS) {
    let av=null, fh=null;
    const meta = ETF_POOL[ticker];

    try {
      av = await fetchAV(ticker);
      console.log(`  AV ✓ ${ticker} $${av.price?.toFixed(2)} | mom1m ${(av.mom1m*100)?.toFixed(1)}% | vol ${(av.volatility*100)?.toFixed(1)}%`);
    } catch(e) { console.error(`  AV ✗ ${ticker} ${e.message}`); }
    await new Promise(r=>setTimeout(r,600)); // AV rate limit

    try {
      fh = await fetchFinnhub(ticker);
      console.log(`  FH ✓ ${ticker} $${fh.price?.toFixed(2)} change ${(fh.change*100)?.toFixed(2)}%`);
    } catch(e) { console.error(`  FH ✗ ${ticker} ${e.message}`); }

    // Cross-reference prices
    const prices  = [av?.price, fh?.price].filter(Boolean);
    const avgPrice = prices.length ? prices.reduce((a,b)=>a+b)/prices.length : null;
    const cagr     = av?.cagr ?? meta.fallbackCagr;
    const realCagr = cagr - fred.inflation;

    const row = {
      ticker,
      price:          avgPrice,
      price_prev:     fh?.prevClose ?? null,
      change_pct:     fh?.change    ?? null,
      mom_1m:         av?.mom1m     ?? null,
      mom_3m:         av?.mom3m     ?? null,
      mom_6m:         av?.mom6m     ?? null,
      volatility_30d: av?.volatility ?? null,
      trend_score:    av?.trend     ?? null,
      cagr,
      real_cagr:      realCagr,
      optimistic:     av?.optimistic ?? meta.fallbackOpt,
      ytd:            av?.ytd       ?? null,
      high_52w:       fh?.high52w   ?? null,
      low_52w:        fh?.low52w    ?? null,
      sources_used:   [av,fh].filter(Boolean).length,
      confidence:     [av,fh].filter(Boolean).length === 2 ? "high" : [av,fh].filter(Boolean).length === 1 ? "medium" : "none",
      fetched_at:     new Date().toISOString(),
      market_status:  getMarketStatus().status,
    };

    poolData[ticker] = { ...row, meta };

    const { error } = await supabase.from("etf_pool").upsert(row);
    if (error) console.error(`  DB ✗ ${ticker} ${error.message}`);
    else       console.log(`  DB ✓ ${ticker} saved`);
  }

  return { poolData, fred };
}

// ─────────────────────────────────────────────────────────────────────────────
// WEEKLY SELECTION JOB — runs on Monday
// ─────────────────────────────────────────────────────────────────────────────
async function runWeeklySelection(poolData) {
  const weekStart = getWeekStart();
  console.log(`\n[WEEKLY SELECTION] Week of ${weekStart}`);

  // Get last week's selections for comparison
  const { data: prevSelections } = await supabase
    .from("weekly_selections")
    .select("*")
    .eq("is_current", true);

  const prevByProfile = {};
  (prevSelections || []).forEach(s => { prevByProfile[s.profile] = s; });

  // Mark all current selections as not current
  await supabase.from("weekly_selections").update({ is_current:false }).eq("is_current", true);

  // Score and select for each profile
  for (const [profile, cfg] of Object.entries(PROFILES)) {
    console.log(`\n  Scoring profile: ${profile.toUpperCase()}`);

    // Filter eligible ETFs
    const eligible = TICKERS.filter(t => cfg.eligible.includes(ETF_POOL[t].category));

    // Score each eligible ETF
    const scores = {};
    for (const ticker of eligible) {
      const data = poolData[ticker];
      if (!data) continue;
      scores[ticker] = scoreETF(ticker, data, profile);
      console.log(`    ${ticker}: score ${scores[ticker].score.toFixed(3)} | mom ${scores[ticker].score_momentum.toFixed(2)} | stab ${scores[ticker].score_stability.toFixed(2)} | trend ${scores[ticker].score_trend.toFixed(2)}`);
    }

    // Sort by score and pick top N
    const ranked = eligible
      .filter(t => scores[t])
      .sort((a,b) => scores[b].score - scores[a].score);

    const selected = ranked.slice(0, cfg.count);
    const allocations = computeAllocations(selected, scores);

    console.log(`  → Selected: ${selected.join(", ")}`);
    console.log(`  → Allocations: ${JSON.stringify(allocations)}`);

    // Save scores to DB
    for (let i=0; i<ranked.length; i++) {
      const t = ranked[i];
      await supabase.from("etf_scores").insert({
        ticker:          t,
        profile,
        score:           scores[t].score,
        score_momentum:  scores[t].score_momentum,
        score_stability: scores[t].score_stability,
        score_trend:     scores[t].score_trend,
        rank:            i + 1,
        selected:        i < cfg.count,
        week_start:      weekStart,
      });
    }

    // Build change summary
    const prev = prevByProfile[profile];
    const prevTickers = prev?.tickers ?? [];
    const changed = JSON.stringify([...selected].sort()) !== JSON.stringify([...prevTickers].sort());
    const changeSummary = buildChangeSummary(selected, prevTickers, scores);

    // Save weekly selection
    await supabase.from("weekly_selections").insert({
      profile,
      week_start:       weekStart,
      tickers:          selected,
      allocations:      allocations,
      prev_tickers:     prevTickers,
      prev_allocations: prev?.allocations ?? null,
      changed,
      change_summary:   changeSummary,
      is_current:       true,
    });

    console.log(`  → Changed: ${changed} — ${changeSummary}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKET STATUS UPDATER
// ─────────────────────────────────────────────────────────────────────────────
async function updateMarketStatus() {
  const ms = getMarketStatus();
  await supabase.from("market_status").upsert({
    id:"current", is_open:ms.isOpen, status:ms.status,
    reason:ms.reason, updated_at:new Date().toISOString(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const isManual = process.argv.includes("--fetch-now");
  const runScoring = process.argv.includes("--score-now") || isMonday();
  const ms = getMarketStatus();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`ETF PLANNER — DATA FETCH`);
  console.log(`Time:    ${new Date().toLocaleString("en-US",{timeZone:"America/New_York"})} ET`);
  console.log(`Market:  ${ms.status} — ${ms.reason}`);
  console.log(`Monday:  ${isMonday()} → scoring engine will ${isMonday()||isManual?"RUN":"SKIP"}`);
  console.log(`${"=".repeat(60)}\n`);

  // Update market status
  await updateMarketStatus();

  // Fetch all ETF data
  const { poolData, fred } = await fetchAllETFs();

  // Run weekly scoring on Mondays (or manual trigger)
  if (isMonday() || runScoring) {
    await runWeeklySelection(poolData);
  } else {
    console.log("\n[SCORING] Not Monday — skipping weekly selection update");
  }

  // Log the run
  await supabase.from("fetch_log").insert({
    trigger:         isManual ? "manual" : ms.isOpen ? "market_open" : "market_close",
    market_status:   ms.status,
    tickers_fetched: TICKERS,
    sources_active:  Object.entries(KEYS).filter(([,v])=>v).map(([k])=>k),
    success_count:   Object.keys(poolData).length,
    fetched_at:      new Date().toISOString(),
  });

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Done — ${TICKERS.length} ETFs processed`);
  console.log(`Weekly scoring: ${isMonday()||runScoring?"✓ ran":"skipped"}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
