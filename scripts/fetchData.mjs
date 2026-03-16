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
  // ── GROUP A — Core US + Tech (19 ETFs) ──────────────────────────────────
  VTI:  { name:"Vanguard Total Market",    category:"total_market",  risk:"low",       leveraged:false, fallbackCagr:0.135, fallbackOpt:0.18,  group:"A" },
  ITOT: { name:"iShares Core S&P Total",   category:"total_market",  risk:"low",       leveraged:false, fallbackCagr:0.133, fallbackOpt:0.175, group:"A" },
  VOO:  { name:"Vanguard S&P 500",         category:"large_cap",     risk:"low",       leveraged:false, fallbackCagr:0.132, fallbackOpt:0.175, group:"A" },
  SPY:  { name:"SPDR S&P 500",             category:"large_cap",     risk:"low",       leveraged:false, fallbackCagr:0.131, fallbackOpt:0.172, group:"A" },
  QQQ:  { name:"Nasdaq-100",               category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.18,  fallbackOpt:0.25,  group:"A" },
  VGT:  { name:"Vanguard Info Tech",       category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.20,  fallbackOpt:0.28,  group:"A" },
  XLK:  { name:"Tech Select SPDR",         category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.195, fallbackOpt:0.27,  group:"A" },
  SCHD: { name:"Schwab Dividend",          category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.16,  group:"A" },
  VYM:  { name:"Vanguard High Dividend",   category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.115, fallbackOpt:0.155, group:"A" },
  DGRO: { name:"iShares Dividend Growth",  category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.125, fallbackOpt:0.165, group:"A" },
  XLE:  { name:"Energy Select SPDR",       category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.22,  group:"A" },
  XLF:  { name:"Financial Select SPDR",    category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.115, fallbackOpt:0.19,  group:"A" },
  XLV:  { name:"Health Care Select SPDR",  category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.105, fallbackOpt:0.17,  group:"A" },
  XLI:  { name:"Industrial Select SPDR",   category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.112, fallbackOpt:0.18,  group:"A" },
  TQQQ: { name:"3x Nasdaq (Leveraged)",    category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.38,  fallbackOpt:0.65,  group:"A" },
  SOXL: { name:"3x Semiconductors (Lev.)", category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.35,  fallbackOpt:0.60,  group:"A" },
  ARKK: { name:"ARK Innovation",           category:"aggressive",    risk:"high",      leveraged:false, fallbackCagr:0.22,  fallbackOpt:0.45,  group:"A" },
  UPRO: { name:"3x S&P 500 (Leveraged)",   category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.32,  fallbackOpt:0.55,  group:"A" },
  BND:  { name:"Vanguard Total Bond",      category:"bonds",         risk:"very_low",  leveraged:false, fallbackCagr:0.048, fallbackOpt:0.06,  group:"A" },
  // ── GROUP B — Small Cap + Crypto + Extended (14 ETFs) ────────────────────
  VB:   { name:"Vanguard Small-Cap",       category:"small_cap",     risk:"medium",    leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.18,  group:"B" },
  IJR:  { name:"iShares Small-Cap S&P",    category:"small_cap",     risk:"medium",    leveraged:false, fallbackCagr:0.115, fallbackOpt:0.175, group:"B" },
  IWM:  { name:"iShares Russell 2000",     category:"small_cap",     risk:"medium",    leveraged:false, fallbackCagr:0.11,  fallbackOpt:0.17,  group:"B" },
  BITO: { name:"ProShares Bitcoin ETF",    category:"crypto",        risk:"very_high", leveraged:false, fallbackCagr:0.45,  fallbackOpt:0.90,  group:"B" },
  IBIT: { name:"iShares Bitcoin Trust",    category:"crypto",        risk:"very_high", leveraged:false, fallbackCagr:0.50,  fallbackOpt:0.95,  group:"B" },
  HDV:  { name:"iShares Core Dividend",    category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.14,  group:"B" },
  DVYE: { name:"iShares EM Dividend",      category:"dividend",      risk:"medium",    leveraged:false, fallbackCagr:0.09,  fallbackOpt:0.14,  group:"B" },
  TLT:  { name:"iShares 20Y Treasury",     category:"bonds",         risk:"low",       leveraged:false, fallbackCagr:0.02,  fallbackOpt:0.08,  group:"B" },
  LQD:  { name:"iShares Corporate Bond",   category:"bonds",         risk:"low",       leveraged:false, fallbackCagr:0.04,  fallbackOpt:0.07,  group:"B" },
  XLP:  { name:"Consumer Staples SPDR",    category:"sector",        risk:"low",       leveraged:false, fallbackCagr:0.09,  fallbackOpt:0.13,  group:"B" },
  XLU:  { name:"Utilities Select SPDR",    category:"sector",        risk:"low",       leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.12,  group:"B" },
  XLB:  { name:"Materials Select SPDR",    category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.16,  group:"B" },
  XLC:  { name:"Communication Services",   category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.18,  group:"B" },
  // ── GROUP C — International + Real Estate + Commodities (9 ETFs) ─────────
  VEA:  { name:"Vanguard Developed Mkts",  category:"international", risk:"medium",    leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.14,  group:"C" },
  VWO:  { name:"Vanguard Emerging Mkts",   category:"international", risk:"high",      leveraged:false, fallbackCagr:0.07,  fallbackOpt:0.15,  group:"C" },
  EEM:  { name:"iShares Emerging Markets", category:"international", risk:"high",      leveraged:false, fallbackCagr:0.065, fallbackOpt:0.14,  group:"C" },
  VNQ:  { name:"Vanguard Real Estate",     category:"real_estate",   risk:"medium",    leveraged:false, fallbackCagr:0.09,  fallbackOpt:0.14,  group:"C" },
  XLRE: { name:"Real Estate Select SPDR",  category:"real_estate",   risk:"medium",    leveraged:false, fallbackCagr:0.085, fallbackOpt:0.13,  group:"C" },
  GLD:  { name:"SPDR Gold Shares",         category:"commodities",   risk:"medium",    leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.18,  group:"C" },
  IAU:  { name:"iShares Gold Trust",       category:"commodities",   risk:"medium",    leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.18,  group:"C" },
  DBC:  { name:"Invesco DB Commodity",     category:"commodities",   risk:"medium",    leveraged:false, fallbackCagr:0.05,  fallbackOpt:0.15,  group:"C" },
  VNQI: { name:"Vanguard Global ex-US RE", category:"real_estate",   risk:"medium",    leveraged:false, fallbackCagr:0.07,  fallbackOpt:0.12,  group:"C" },
};

const TICKERS = Object.keys(ETF_POOL);

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE RULES
// Defines which categories are eligible and how scoring weights work
// ─────────────────────────────────────────────────────────────────────────────
const PROFILES = {
  conservative: {
    eligible:    ["bonds","dividend","total_market","large_cap"],
    // Bonds MUST be included — they anchor the ~5% target
    required:    ["BND"],
    count:       4,
    weights:     { momentum:0.10, stability:0.70, trend:0.20 },
    targetCagr:  0.05,
    description: "~5% annual return — bonds + dividend stocks",
  },
  balanced: {
    eligible:    ["total_market","large_cap","tech_growth","dividend"],
    required:    [],
    count:       4,
    weights:     { momentum:0.40, stability:0.35, trend:0.25 },
    targetCagr:  0.09,
    description: "7-12% annual return — growth + stability",
  },
  aggressive: {
    eligible:    ["leveraged","aggressive","tech_growth"],
    required:    [],
    count:       4,
    weights:     { momentum:0.65, stability:0.05, trend:0.30 },
    targetCagr:  0.16,
    description: "12%+ annual return — high conviction growth",
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

function shouldRunScoring() {
  // Run scoring every trading day at close — selections update daily
  return true;
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
  const weekStart = new Date().toISOString().split('T')[0]; // today's date
  console.log(`\n[DAILY SELECTION] Date: ${weekStart}`);

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
    const eligible = TICKERS.filter(t => ETF_POOL[t] && cfg.eligible.includes(ETF_POOL[t]?.category));
    // Ensure required ETFs are always included
    const required = cfg.required || [];

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
  const runScoring = process.argv.includes("--score-now") || shouldRunScoring();
  const ms = getMarketStatus();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`ETF PLANNER — DATA FETCH`);
  console.log(`Time:    ${new Date().toLocaleString("en-US",{timeZone:"America/New_York"})} ET`);
  console.log(`Market:  ${ms.status} — ${ms.reason}`);
  console.log(`Scoring: will RUN after close data fetch`);
  console.log(`${"=".repeat(60)}\n`);

  // Update market status
  await updateMarketStatus();

  // Fetch all ETF data
  const { poolData, fred } = await fetchAllETFs();

  // Run weekly scoring on Mondays (or manual trigger)
  if (shouldRunScoring() || runScoring) {
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
  console.log(`Daily scoring: ${shouldRunScoring()||runScoring?"✓ ran":"skipped"}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
// ── Rotation logic ────────────────────────────────────────────────────────────
function getRotationGroup() {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return ["A","B","C"][weekNum % 3];
}
function getTickersForGroup(group) {
  return Object.entries(ETF_POOL).filter(([,m])=>m.group===group).map(([t])=>t);
}
const CORE_ANCHORS = ["BND","SCHD","VOO","QQQ","TQQQ"];
const ROTATION_GROUP = getRotationGroup();
const TICKERS = [...new Set([
  ...getTickersForGroup(ROTATION_GROUP),
  ...(ROTATION_GROUP !== "A" ? CORE_ANCHORS : []),
])];
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
  // ── GROUP A — Core US + Tech (19 ETFs) ──────────────────────────────────
  VTI:  { name:"Vanguard Total Market",    category:"total_market",  risk:"low",       leveraged:false, fallbackCagr:0.135, fallbackOpt:0.18,  group:"A" },
  ITOT: { name:"iShares Core S&P Total",   category:"total_market",  risk:"low",       leveraged:false, fallbackCagr:0.133, fallbackOpt:0.175, group:"A" },
  VOO:  { name:"Vanguard S&P 500",         category:"large_cap",     risk:"low",       leveraged:false, fallbackCagr:0.132, fallbackOpt:0.175, group:"A" },
  SPY:  { name:"SPDR S&P 500",             category:"large_cap",     risk:"low",       leveraged:false, fallbackCagr:0.131, fallbackOpt:0.172, group:"A" },
  QQQ:  { name:"Nasdaq-100",               category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.18,  fallbackOpt:0.25,  group:"A" },
  VGT:  { name:"Vanguard Info Tech",       category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.20,  fallbackOpt:0.28,  group:"A" },
  XLK:  { name:"Tech Select SPDR",         category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.195, fallbackOpt:0.27,  group:"A" },
  SCHD: { name:"Schwab Dividend",          category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.16,  group:"A" },
  VYM:  { name:"Vanguard High Dividend",   category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.115, fallbackOpt:0.155, group:"A" },
  DGRO: { name:"iShares Dividend Growth",  category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.125, fallbackOpt:0.165, group:"A" },
  XLE:  { name:"Energy Select SPDR",       category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.22,  group:"A" },
  XLF:  { name:"Financial Select SPDR",    category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.115, fallbackOpt:0.19,  group:"A" },
  XLV:  { name:"Health Care Select SPDR",  category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.105, fallbackOpt:0.17,  group:"A" },
  XLI:  { name:"Industrial Select SPDR",   category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.112, fallbackOpt:0.18,  group:"A" },
  TQQQ: { name:"3x Nasdaq (Leveraged)",    category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.38,  fallbackOpt:0.65,  group:"A" },
  SOXL: { name:"3x Semiconductors (Lev.)", category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.35,  fallbackOpt:0.60,  group:"A" },
  ARKK: { name:"ARK Innovation",           category:"aggressive",    risk:"high",      leveraged:false, fallbackCagr:0.22,  fallbackOpt:0.45,  group:"A" },
  UPRO: { name:"3x S&P 500 (Leveraged)",   category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.32,  fallbackOpt:0.55,  group:"A" },
  BND:  { name:"Vanguard Total Bond",      category:"bonds",         risk:"very_low",  leveraged:false, fallbackCagr:0.048, fallbackOpt:0.06,  group:"A" },
  // ── GROUP B — Small Cap + Crypto + Extended (14 ETFs) ────────────────────
  VB:   { name:"Vanguard Small-Cap",       category:"small_cap",     risk:"medium",    leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.18,  group:"B" },
  IJR:  { name:"iShares Small-Cap S&P",    category:"small_cap",     risk:"medium",    leveraged:false, fallbackCagr:0.115, fallbackOpt:0.175, group:"B" },
  IWM:  { name:"iShares Russell 2000",     category:"small_cap",     risk:"medium",    leveraged:false, fallbackCagr:0.11,  fallbackOpt:0.17,  group:"B" },
  BITO: { name:"ProShares Bitcoin ETF",    category:"crypto",        risk:"very_high", leveraged:false, fallbackCagr:0.45,  fallbackOpt:0.90,  group:"B" },
  IBIT: { name:"iShares Bitcoin Trust",    category:"crypto",        risk:"very_high", leveraged:false, fallbackCagr:0.50,  fallbackOpt:0.95,  group:"B" },
  HDV:  { name:"iShares Core Dividend",    category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.14,  group:"B" },
  DVYE: { name:"iShares EM Dividend",      category:"dividend",      risk:"medium",    leveraged:false, fallbackCagr:0.09,  fallbackOpt:0.14,  group:"B" },
  TLT:  { name:"iShares 20Y Treasury",     category:"bonds",         risk:"low",       leveraged:false, fallbackCagr:0.02,  fallbackOpt:0.08,  group:"B" },
  LQD:  { name:"iShares Corporate Bond",   category:"bonds",         risk:"low",       leveraged:false, fallbackCagr:0.04,  fallbackOpt:0.07,  group:"B" },
  XLP:  { name:"Consumer Staples SPDR",    category:"sector",        risk:"low",       leveraged:false, fallbackCagr:0.09,  fallbackOpt:0.13,  group:"B" },
  XLU:  { name:"Utilities Select SPDR",    category:"sector",        risk:"low",       leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.12,  group:"B" },
  XLB:  { name:"Materials Select SPDR",    category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.16,  group:"B" },
  XLC:  { name:"Communication Services",   category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.18,  group:"B" },
  // ── GROUP C — International + Real Estate + Commodities (9 ETFs) ─────────
  VEA:  { name:"Vanguard Developed Mkts",  category:"international", risk:"medium",    leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.14,  group:"C" },
  VWO:  { name:"Vanguard Emerging Mkts",   category:"international", risk:"high",      leveraged:false, fallbackCagr:0.07,  fallbackOpt:0.15,  group:"C" },
  EEM:  { name:"iShares Emerging Markets", category:"international", risk:"high",      leveraged:false, fallbackCagr:0.065, fallbackOpt:0.14,  group:"C" },
  VNQ:  { name:"Vanguard Real Estate",     category:"real_estate",   risk:"medium",    leveraged:false, fallbackCagr:0.09,  fallbackOpt:0.14,  group:"C" },
  XLRE: { name:"Real Estate Select SPDR",  category:"real_estate",   risk:"medium",    leveraged:false, fallbackCagr:0.085, fallbackOpt:0.13,  group:"C" },
  GLD:  { name:"SPDR Gold Shares",         category:"commodities",   risk:"medium",    leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.18,  group:"C" },
  IAU:  { name:"iShares Gold Trust",       category:"commodities",   risk:"medium",    leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.18,  group:"C" },
  DBC:  { name:"Invesco DB Commodity",     category:"commodities",   risk:"medium",    leveraged:false, fallbackCagr:0.05,  fallbackOpt:0.15,  group:"C" },
  VNQI: { name:"Vanguard Global ex-US RE", category:"real_estate",   risk:"medium",    leveraged:false, fallbackCagr:0.07,  fallbackOpt:0.12,  group:"C" },
};

const TICKERS = Object.keys(ETF_POOL);

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE RULES
// Defines which categories are eligible and how scoring weights work
// ─────────────────────────────────────────────────────────────────────────────
const PROFILES = {
  conservative: {
    eligible:    ["bonds","dividend","total_market","large_cap"],
    // Bonds MUST be included — they anchor the ~5% target
    required:    ["BND"],
    count:       4,
    weights:     { momentum:0.10, stability:0.70, trend:0.20 },
    targetCagr:  0.05,
    description: "~5% annual return — bonds + dividend stocks",
  },
  balanced: {
    eligible:    ["total_market","large_cap","tech_growth","dividend"],
    required:    [],
    count:       4,
    weights:     { momentum:0.40, stability:0.35, trend:0.25 },
    targetCagr:  0.09,
    description: "7-12% annual return — growth + stability",
  },
  aggressive: {
    eligible:    ["leveraged","aggressive","tech_growth"],
    required:    [],
    count:       4,
    weights:     { momentum:0.65, stability:0.05, trend:0.30 },
    targetCagr:  0.16,
    description: "12%+ annual return — high conviction growth",
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

function shouldRunScoring() {
  // Run scoring every trading day at close — selections update daily
  return true;
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
  const weekStart = new Date().toISOString().split('T')[0]; // today's date
  console.log(`\n[DAILY SELECTION] Date: ${weekStart}`);

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
    const eligible = TICKERS.filter(t => ETF_POOL[t] && cfg.eligible.includes(ETF_POOL[t]?.category));
    // Ensure required ETFs are always included
    const required = cfg.required || [];

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
  const runScoring = process.argv.includes("--score-now") || shouldRunScoring();
  const ms = getMarketStatus();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`ETF PLANNER — DATA FETCH`);
  console.log(`Time:    ${new Date().toLocaleString("en-US",{timeZone:"America/New_York"})} ET`);
  console.log(`Market:  ${ms.status} — ${ms.reason}`);
  console.log(`Scoring: will RUN after close data fetch`);
  console.log(`${"=".repeat(60)}\n`);

  // Update market status
  await updateMarketStatus();

  // Fetch all ETF data
  const { poolData, fred } = await fetchAllETFs();

  // Run weekly scoring on Mondays (or manual trigger)
  if (shouldRunScoring() || runScoring) {
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
  console.log(`Daily scoring: ${shouldRunScoring()||runScoring?"✓ ran":"skipped"}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
const FALLBACK = {
  VTI:{cagr:0.135,optimistic:0.18},  ITOT:{cagr:0.133,optimistic:0.175},
  VOO:{cagr:0.132,optimistic:0.175}, SPY:{cagr:0.131,optimistic:0.172},
  QQQ:{cagr:0.18, optimistic:0.25},  VGT:{cagr:0.20, optimistic:0.28},
  XLK:{cagr:0.195,optimistic:0.27},  SCHD:{cagr:0.12,optimistic:0.16},
  VYM:{cagr:0.115,optimistic:0.155}, DGRO:{cagr:0.125,optimistic:0.165},
  XLE:{cagr:0.10, optimistic:0.22},  XLF:{cagr:0.115,optimistic:0.19},
  XLV:{cagr:0.105,optimistic:0.17},  XLI:{cagr:0.112,optimistic:0.18},
  TQQQ:{cagr:0.38,optimistic:0.65},  SOXL:{cagr:0.35,optimistic:0.60},
  ARKK:{cagr:0.22,optimistic:0.45},  UPRO:{cagr:0.32,optimistic:0.55},
  BND:{cagr:0.048,optimistic:0.06},  VB:{cagr:0.12,optimistic:0.18},
  IJR:{cagr:0.115,optimistic:0.175}, IWM:{cagr:0.11,optimistic:0.17},
  BITO:{cagr:0.45,optimistic:0.90},  IBIT:{cagr:0.50,optimistic:0.95},
  HDV:{cagr:0.10,optimistic:0.14},   DVYE:{cagr:0.09,optimistic:0.14},
  TLT:{cagr:0.02,optimistic:0.08},   LQD:{cagr:0.04,optimistic:0.07},
  XLP:{cagr:0.09,optimistic:0.13},   XLU:{cagr:0.08,optimistic:0.12},
  XLB:{cagr:0.10,optimistic:0.16},   XLC:{cagr:0.12,optimistic:0.18},
  VEA:{cagr:0.08,optimistic:0.14},   VWO:{cagr:0.07,optimistic:0.15},
  EEM:{cagr:0.065,optimistic:0.14},  VNQ:{cagr:0.09,optimistic:0.14},
  XLRE:{cagr:0.085,optimistic:0.13}, GLD:{cagr:0.08,optimistic:0.18},
  IAU:{cagr:0.08,optimistic:0.18},   DBC:{cagr:0.05,optimistic:0.15},
  VNQI:{cagr:0.07,optimistic:0.12},
};
scripts/fetchData.mjs
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
  // ── GROUP A — Core US + Tech (19 ETFs) ──────────────────────────────────
  VTI:  { name:"Vanguard Total Market",    category:"total_market",  risk:"low",       leveraged:false, fallbackCagr:0.135, fallbackOpt:0.18,  group:"A" },
  ITOT: { name:"iShares Core S&P Total",   category:"total_market",  risk:"low",       leveraged:false, fallbackCagr:0.133, fallbackOpt:0.175, group:"A" },
  VOO:  { name:"Vanguard S&P 500",         category:"large_cap",     risk:"low",       leveraged:false, fallbackCagr:0.132, fallbackOpt:0.175, group:"A" },
  SPY:  { name:"SPDR S&P 500",             category:"large_cap",     risk:"low",       leveraged:false, fallbackCagr:0.131, fallbackOpt:0.172, group:"A" },
  QQQ:  { name:"Nasdaq-100",               category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.18,  fallbackOpt:0.25,  group:"A" },
  VGT:  { name:"Vanguard Info Tech",       category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.20,  fallbackOpt:0.28,  group:"A" },
  XLK:  { name:"Tech Select SPDR",         category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.195, fallbackOpt:0.27,  group:"A" },
  SCHD: { name:"Schwab Dividend",          category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.16,  group:"A" },
  VYM:  { name:"Vanguard High Dividend",   category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.115, fallbackOpt:0.155, group:"A" },
  DGRO: { name:"iShares Dividend Growth",  category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.125, fallbackOpt:0.165, group:"A" },
  XLE:  { name:"Energy Select SPDR",       category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.22,  group:"A" },
  XLF:  { name:"Financial Select SPDR",    category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.115, fallbackOpt:0.19,  group:"A" },
  XLV:  { name:"Health Care Select SPDR",  category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.105, fallbackOpt:0.17,  group:"A" },
  XLI:  { name:"Industrial Select SPDR",   category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.112, fallbackOpt:0.18,  group:"A" },
  TQQQ: { name:"3x Nasdaq (Leveraged)",    category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.38,  fallbackOpt:0.65,  group:"A" },
  SOXL: { name:"3x Semiconductors (Lev.)", category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.35,  fallbackOpt:0.60,  group:"A" },
  ARKK: { name:"ARK Innovation",           category:"aggressive",    risk:"high",      leveraged:false, fallbackCagr:0.22,  fallbackOpt:0.45,  group:"A" },
  UPRO: { name:"3x S&P 500 (Leveraged)",   category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.32,  fallbackOpt:0.55,  group:"A" },
  BND:  { name:"Vanguard Total Bond",      category:"bonds",         risk:"very_low",  leveraged:false, fallbackCagr:0.048, fallbackOpt:0.06,  group:"A" },
  // ── GROUP B — Small Cap + Crypto + Extended (14 ETFs) ────────────────────
  VB:   { name:"Vanguard Small-Cap",       category:"small_cap",     risk:"medium",    leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.18,  group:"B" },
  IJR:  { name:"iShares Small-Cap S&P",    category:"small_cap",     risk:"medium",    leveraged:false, fallbackCagr:0.115, fallbackOpt:0.175, group:"B" },
  IWM:  { name:"iShares Russell 2000",     category:"small_cap",     risk:"medium",    leveraged:false, fallbackCagr:0.11,  fallbackOpt:0.17,  group:"B" },
  BITO: { name:"ProShares Bitcoin ETF",    category:"crypto",        risk:"very_high", leveraged:false, fallbackCagr:0.45,  fallbackOpt:0.90,  group:"B" },
  IBIT: { name:"iShares Bitcoin Trust",    category:"crypto",        risk:"very_high", leveraged:false, fallbackCagr:0.50,  fallbackOpt:0.95,  group:"B" },
  HDV:  { name:"iShares Core Dividend",    category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.14,  group:"B" },
  DVYE: { name:"iShares EM Dividend",      category:"dividend",      risk:"medium",    leveraged:false, fallbackCagr:0.09,  fallbackOpt:0.14,  group:"B" },
  TLT:  { name:"iShares 20Y Treasury",     category:"bonds",         risk:"low",       leveraged:false, fallbackCagr:0.02,  fallbackOpt:0.08,  group:"B" },
  LQD:  { name:"iShares Corporate Bond",   category:"bonds",         risk:"low",       leveraged:false, fallbackCagr:0.04,  fallbackOpt:0.07,  group:"B" },
  XLP:  { name:"Consumer Staples SPDR",    category:"sector",        risk:"low",       leveraged:false, fallbackCagr:0.09,  fallbackOpt:0.13,  group:"B" },
  XLU:  { name:"Utilities Select SPDR",    category:"sector",        risk:"low",       leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.12,  group:"B" },
  XLB:  { name:"Materials Select SPDR",    category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.16,  group:"B" },
  XLC:  { name:"Communication Services",   category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.18,  group:"B" },
  // ── GROUP C — International + Real Estate + Commodities (9 ETFs) ─────────
  VEA:  { name:"Vanguard Developed Mkts",  category:"international", risk:"medium",    leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.14,  group:"C" },
  VWO:  { name:"Vanguard Emerging Mkts",   category:"international", risk:"high",      leveraged:false, fallbackCagr:0.07,  fallbackOpt:0.15,  group:"C" },
  EEM:  { name:"iShares Emerging Markets", category:"international", risk:"high",      leveraged:false, fallbackCagr:0.065, fallbackOpt:0.14,  group:"C" },
  VNQ:  { name:"Vanguard Real Estate",     category:"real_estate",   risk:"medium",    leveraged:false, fallbackCagr:0.09,  fallbackOpt:0.14,  group:"C" },
  XLRE: { name:"Real Estate Select SPDR",  category:"real_estate",   risk:"medium",    leveraged:false, fallbackCagr:0.085, fallbackOpt:0.13,  group:"C" },
  GLD:  { name:"SPDR Gold Shares",         category:"commodities",   risk:"medium",    leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.18,  group:"C" },
  IAU:  { name:"iShares Gold Trust",       category:"commodities",   risk:"medium",    leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.18,  group:"C" },
  DBC:  { name:"Invesco DB Commodity",     category:"commodities",   risk:"medium",    leveraged:false, fallbackCagr:0.05,  fallbackOpt:0.15,  group:"C" },
  VNQI: { name:"Vanguard Global ex-US RE", category:"real_estate",   risk:"medium",    leveraged:false, fallbackCagr:0.07,  fallbackOpt:0.12,  group:"C" },
};

const TICKERS = Object.keys(ETF_POOL);

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE RULES
// Defines which categories are eligible and how scoring weights work
// ─────────────────────────────────────────────────────────────────────────────
const PROFILES = {
  conservative: {
    eligible:    ["bonds","dividend","total_market","large_cap"],
    // Bonds MUST be included — they anchor the ~5% target
    required:    ["BND"],
    count:       4,
    weights:     { momentum:0.10, stability:0.70, trend:0.20 },
    targetCagr:  0.05,
    description: "~5% annual return — bonds + dividend stocks",
  },
  balanced: {
    eligible:    ["total_market","large_cap","tech_growth","dividend"],
    required:    [],
    count:       4,
    weights:     { momentum:0.40, stability:0.35, trend:0.25 },
    targetCagr:  0.09,
    description: "7-12% annual return — growth + stability",
  },
  aggressive: {
    eligible:    ["leveraged","aggressive","tech_growth"],
    required:    [],
    count:       4,
    weights:     { momentum:0.65, stability:0.05, trend:0.30 },
    targetCagr:  0.16,
    description: "12%+ annual return — high conviction growth",
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

function shouldRunScoring() {
  // Run scoring every trading day at close — selections update daily
  return true;
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
  const weekStart = new Date().toISOString().split('T')[0]; // today's date
  console.log(`\n[DAILY SELECTION] Date: ${weekStart}`);

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
    const eligible = TICKERS.filter(t => ETF_POOL[t] && cfg.eligible.includes(ETF_POOL[t]?.category));
    // Ensure required ETFs are always included
    const required = cfg.required || [];

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
  const runScoring = process.argv.includes("--score-now") || shouldRunScoring();
  const ms = getMarketStatus();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`ETF PLANNER — DATA FETCH`);
  console.log(`Time:    ${new Date().toLocaleString("en-US",{timeZone:"America/New_York"})} ET`);
  console.log(`Market:  ${ms.status} — ${ms.reason}`);
  console.log(`Scoring: will RUN after close data fetch`);
  console.log(`${"=".repeat(60)}\n`);

  // Update market status
  await updateMarketStatus();

  // Fetch all ETF data
  const { poolData, fred } = await fetchAllETFs();

  // Run weekly scoring on Mondays (or manual trigger)
  if (shouldRunScoring() || runScoring) {
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
  console.log(`Daily scoring: ${shouldRunScoring()||runScoring?"✓ ran":"skipped"}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
// ── Rotation logic ────────────────────────────────────────────────────────────
function getRotationGroup() {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return ["A","B","C"][weekNum % 3];
}
function getTickersForGroup(group) {
  return Object.entries(ETF_POOL).filter(([,m])=>m.group===group).map(([t])=>t);
}
const CORE_ANCHORS = ["BND","SCHD","VOO","QQQ","TQQQ"];
const ROTATION_GROUP = getRotationGroup();
const TICKERS = [...new Set([
  ...getTickersForGroup(ROTATION_GROUP),
  ...(ROTATION_GROUP !== "A" ? CORE_ANCHORS : []),
])];
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
  // ── GROUP A — Core US + Tech (19 ETFs) ──────────────────────────────────
  VTI:  { name:"Vanguard Total Market",    category:"total_market",  risk:"low",       leveraged:false, fallbackCagr:0.135, fallbackOpt:0.18,  group:"A" },
  ITOT: { name:"iShares Core S&P Total",   category:"total_market",  risk:"low",       leveraged:false, fallbackCagr:0.133, fallbackOpt:0.175, group:"A" },
  VOO:  { name:"Vanguard S&P 500",         category:"large_cap",     risk:"low",       leveraged:false, fallbackCagr:0.132, fallbackOpt:0.175, group:"A" },
  SPY:  { name:"SPDR S&P 500",             category:"large_cap",     risk:"low",       leveraged:false, fallbackCagr:0.131, fallbackOpt:0.172, group:"A" },
  QQQ:  { name:"Nasdaq-100",               category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.18,  fallbackOpt:0.25,  group:"A" },
  VGT:  { name:"Vanguard Info Tech",       category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.20,  fallbackOpt:0.28,  group:"A" },
  XLK:  { name:"Tech Select SPDR",         category:"tech_growth",   risk:"medium",    leveraged:false, fallbackCagr:0.195, fallbackOpt:0.27,  group:"A" },
  SCHD: { name:"Schwab Dividend",          category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.16,  group:"A" },
  VYM:  { name:"Vanguard High Dividend",   category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.115, fallbackOpt:0.155, group:"A" },
  DGRO: { name:"iShares Dividend Growth",  category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.125, fallbackOpt:0.165, group:"A" },
  XLE:  { name:"Energy Select SPDR",       category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.22,  group:"A" },
  XLF:  { name:"Financial Select SPDR",    category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.115, fallbackOpt:0.19,  group:"A" },
  XLV:  { name:"Health Care Select SPDR",  category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.105, fallbackOpt:0.17,  group:"A" },
  XLI:  { name:"Industrial Select SPDR",   category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.112, fallbackOpt:0.18,  group:"A" },
  TQQQ: { name:"3x Nasdaq (Leveraged)",    category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.38,  fallbackOpt:0.65,  group:"A" },
  SOXL: { name:"3x Semiconductors (Lev.)", category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.35,  fallbackOpt:0.60,  group:"A" },
  ARKK: { name:"ARK Innovation",           category:"aggressive",    risk:"high",      leveraged:false, fallbackCagr:0.22,  fallbackOpt:0.45,  group:"A" },
  UPRO: { name:"3x S&P 500 (Leveraged)",   category:"leveraged",     risk:"very_high", leveraged:true,  fallbackCagr:0.32,  fallbackOpt:0.55,  group:"A" },
  BND:  { name:"Vanguard Total Bond",      category:"bonds",         risk:"very_low",  leveraged:false, fallbackCagr:0.048, fallbackOpt:0.06,  group:"A" },
  // ── GROUP B — Small Cap + Crypto + Extended (14 ETFs) ────────────────────
  VB:   { name:"Vanguard Small-Cap",       category:"small_cap",     risk:"medium",    leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.18,  group:"B" },
  IJR:  { name:"iShares Small-Cap S&P",    category:"small_cap",     risk:"medium",    leveraged:false, fallbackCagr:0.115, fallbackOpt:0.175, group:"B" },
  IWM:  { name:"iShares Russell 2000",     category:"small_cap",     risk:"medium",    leveraged:false, fallbackCagr:0.11,  fallbackOpt:0.17,  group:"B" },
  BITO: { name:"ProShares Bitcoin ETF",    category:"crypto",        risk:"very_high", leveraged:false, fallbackCagr:0.45,  fallbackOpt:0.90,  group:"B" },
  IBIT: { name:"iShares Bitcoin Trust",    category:"crypto",        risk:"very_high", leveraged:false, fallbackCagr:0.50,  fallbackOpt:0.95,  group:"B" },
  HDV:  { name:"iShares Core Dividend",    category:"dividend",      risk:"low",       leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.14,  group:"B" },
  DVYE: { name:"iShares EM Dividend",      category:"dividend",      risk:"medium",    leveraged:false, fallbackCagr:0.09,  fallbackOpt:0.14,  group:"B" },
  TLT:  { name:"iShares 20Y Treasury",     category:"bonds",         risk:"low",       leveraged:false, fallbackCagr:0.02,  fallbackOpt:0.08,  group:"B" },
  LQD:  { name:"iShares Corporate Bond",   category:"bonds",         risk:"low",       leveraged:false, fallbackCagr:0.04,  fallbackOpt:0.07,  group:"B" },
  XLP:  { name:"Consumer Staples SPDR",    category:"sector",        risk:"low",       leveraged:false, fallbackCagr:0.09,  fallbackOpt:0.13,  group:"B" },
  XLU:  { name:"Utilities Select SPDR",    category:"sector",        risk:"low",       leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.12,  group:"B" },
  XLB:  { name:"Materials Select SPDR",    category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.10,  fallbackOpt:0.16,  group:"B" },
  XLC:  { name:"Communication Services",   category:"sector",        risk:"medium",    leveraged:false, fallbackCagr:0.12,  fallbackOpt:0.18,  group:"B" },
  // ── GROUP C — International + Real Estate + Commodities (9 ETFs) ─────────
  VEA:  { name:"Vanguard Developed Mkts",  category:"international", risk:"medium",    leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.14,  group:"C" },
  VWO:  { name:"Vanguard Emerging Mkts",   category:"international", risk:"high",      leveraged:false, fallbackCagr:0.07,  fallbackOpt:0.15,  group:"C" },
  EEM:  { name:"iShares Emerging Markets", category:"international", risk:"high",      leveraged:false, fallbackCagr:0.065, fallbackOpt:0.14,  group:"C" },
  VNQ:  { name:"Vanguard Real Estate",     category:"real_estate",   risk:"medium",    leveraged:false, fallbackCagr:0.09,  fallbackOpt:0.14,  group:"C" },
  XLRE: { name:"Real Estate Select SPDR",  category:"real_estate",   risk:"medium",    leveraged:false, fallbackCagr:0.085, fallbackOpt:0.13,  group:"C" },
  GLD:  { name:"SPDR Gold Shares",         category:"commodities",   risk:"medium",    leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.18,  group:"C" },
  IAU:  { name:"iShares Gold Trust",       category:"commodities",   risk:"medium",    leveraged:false, fallbackCagr:0.08,  fallbackOpt:0.18,  group:"C" },
  DBC:  { name:"Invesco DB Commodity",     category:"commodities",   risk:"medium",    leveraged:false, fallbackCagr:0.05,  fallbackOpt:0.15,  group:"C" },
  VNQI: { name:"Vanguard Global ex-US RE", category:"real_estate",   risk:"medium",    leveraged:false, fallbackCagr:0.07,  fallbackOpt:0.12,  group:"C" },
};

const TICKERS = Object.keys(ETF_POOL);

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE RULES
// Defines which categories are eligible and how scoring weights work
// ─────────────────────────────────────────────────────────────────────────────
const PROFILES = {
  conservative: {
    eligible:    ["bonds","dividend","total_market","large_cap"],
    // Bonds MUST be included — they anchor the ~5% target
    required:    ["BND"],
    count:       4,
    weights:     { momentum:0.10, stability:0.70, trend:0.20 },
    targetCagr:  0.05,
    description: "~5% annual return — bonds + dividend stocks",
  },
  balanced: {
    eligible:    ["total_market","large_cap","tech_growth","dividend"],
    required:    [],
    count:       4,
    weights:     { momentum:0.40, stability:0.35, trend:0.25 },
    targetCagr:  0.09,
    description: "7-12% annual return — growth + stability",
  },
  aggressive: {
    eligible:    ["leveraged","aggressive","tech_growth"],
    required:    [],
    count:       4,
    weights:     { momentum:0.65, stability:0.05, trend:0.30 },
    targetCagr:  0.16,
    description: "12%+ annual return — high conviction growth",
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

function shouldRunScoring() {
  // Run scoring every trading day at close — selections update daily
  return true;
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
  const weekStart = new Date().toISOString().split('T')[0]; // today's date
  console.log(`\n[DAILY SELECTION] Date: ${weekStart}`);

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
    const eligible = TICKERS.filter(t => ETF_POOL[t] && cfg.eligible.includes(ETF_POOL[t]?.category));
    // Ensure required ETFs are always included
    const required = cfg.required || [];

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
  const runScoring = process.argv.includes("--score-now") || shouldRunScoring();
  const ms = getMarketStatus();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`ETF PLANNER — DATA FETCH`);
  console.log(`Time:    ${new Date().toLocaleString("en-US",{timeZone:"America/New_York"})} ET`);
  console.log(`Market:  ${ms.status} — ${ms.reason}`);
  console.log(`Scoring: will RUN after close data fetch`);
  console.log(`${"=".repeat(60)}\n`);

  // Update market status
  await updateMarketStatus();

  // Fetch all ETF data
  const { poolData, fred } = await fetchAllETFs();

  // Run weekly scoring on Mondays (or manual trigger)
  if (shouldRunScoring() || runScoring) {
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
  console.log(`Daily scoring: ${shouldRunScoring()||runScoring?"✓ ran":"skipped"}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
