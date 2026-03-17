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
  if (!selectedTickers || selectedTickers.length === 0) return {};

  // Use score if available, otherwise equal weight
  const weights = {};
  selectedTickers.forEach(t => {
    const score = scores?.[t]?.score;
    weights[t] = (typeof score === "number" && score > 0) ? score : 0.5;
  });

  const totalWeight = Object.values(weights).reduce((a,b) => a+b, 0);

  // Round to nearest 5% and ensure sum = 100
  const rounded = {};
  let remaining = 100;
  const sorted = [...selectedTickers].sort((a,b) => weights[b] - weights[a]);

  sorted.forEach((t, i) => {
    if (i === sorted.length - 1) {
      rounded[t] = Math.max(remaining, 5); // last gets remainder, min 5%
    } else {
      const pct = Math.round((weights[t] / totalWeight) * 100 / 5) * 5;
      rounded[t] = Math.max(pct, 10); // minimum 10%
      remaining -= rounded[t];
    }
  });

  // Verify all values are numbers
  selectedTickers.forEach(t => {
    if (typeof rounded[t] !== "number" || isNaN(rounded[t])) {
      rounded[t] = Math.floor(100 / selectedTickers.length);
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
// STOCK METADATA — industry, description, color for known tickers
// ─────────────────────────────────────────────────────────────────────────────
const STOCK_META = {
  NVDA: { name:"Nvidia Corporation",    industry:"Semiconductors",    color:"#76b900", founded:"1993", employees:"29,600",
    description:"The dominant AI chip maker. Nvidia's GPUs power virtually every major AI model — from ChatGPT to Gemini. Revenue grew 265% YoY in 2024.",
    why_notable:"Nvidia became the most valuable company on Earth in 2024. Its H100 and B200 GPUs are the picks-and-shovels of the AI gold rush." },
  AAPL: { name:"Apple Inc.",            industry:"Consumer Tech",     color:"#555555", founded:"1976", employees:"161,000",
    description:"The world's most valuable consumer tech company. iPhone, Mac, iPad, Apple Watch and a rapidly growing services business including App Store, Apple TV+ and Apple Pay.",
    why_notable:"Apple crossed $100B in services revenue in 2024. Its App Store alone generates more profit than most Fortune 500 companies." },
  MSFT: { name:"Microsoft Corporation", industry:"Cloud / AI",        color:"#00a4ef", founded:"1975", employees:"221,000",
    description:"Microsoft's $13B bet on OpenAI paid off massively. Azure AI services grow 60%+ annually. Copilot is now embedded in every Microsoft 365 product.",
    why_notable:"Microsoft became the first company to deeply integrate AI across its entire product suite — from Excel to Teams to Visual Studio." },
  AMZN: { name:"Amazon.com Inc.",       industry:"E-commerce / Cloud",color:"#ff9900", founded:"1994", employees:"1,500,000",
    description:"Amazon dominates both e-commerce (38% US market share) and cloud computing (AWS holds 31% of global cloud market). AWS is the profit engine funding everything else.",
    why_notable:"AWS generated over $90B in revenue in 2024. Amazon's advertising business alone is now larger than the entire Netflix." },
  META: { name:"Meta Platforms",        industry:"Social Media / AI", color:"#0082fb", founded:"2004", employees:"67,000",
    description:"Facebook's parent company transformed itself into an AI powerhouse. Meta AI is used by over 700M people monthly across WhatsApp, Instagram and Facebook.",
    why_notable:"Meta's 'year of efficiency' turned a struggling company into a profit machine. Their open-source Llama AI model is used by millions of developers worldwide." },
  GOOGL:{ name:"Alphabet Inc.",         industry:"Search / AI / Cloud",color:"#4285f4", founded:"1998", employees:"182,000",
    description:"Google's parent company controls 91% of global search. YouTube is the world's second-largest search engine. Google Cloud is the fastest-growing major cloud platform at 28% growth.",
    why_notable:"Gemini Ultra became the first AI model to outperform GPT-4 on major benchmarks. Google processes over 8.5 billion searches daily." },
  TSLA: { name:"Tesla Inc.",            industry:"EVs / AI",          color:"#cc0000", founded:"2003", employees:"127,000",
    description:"Tesla leads the EV market globally and is expanding into energy storage, robotics (Optimus robot) and autonomous driving (FSD). Its Dojo supercomputer rivals Nvidia for AI training.",
    why_notable:"Tesla delivered 1.8M vehicles in 2023. Full Self-Driving subscriptions reached 500,000+ users. The Cybertruck launched to record demand." },
  AVGO: { name:"Broadcom Inc.",         industry:"Semiconductors",    color:"#cc0000", founded:"1991", employees:"20,000",
    description:"Broadcom makes the networking chips that power the internet — switches, routers, storage controllers. Its $69B acquisition of VMware made it a cloud software giant too.",
    why_notable:"Broadcom supplies custom AI chips to Google and Meta, making it the second-biggest AI chip company behind Nvidia. VMware integration adds $4B+ in annual software revenue." },
  LLY:  { name:"Eli Lilly",             industry:"Pharmaceuticals",   color:"#e4003a", founded:"1876", employees:"43,000",
    description:"Eli Lilly makes Mounjaro and Zepbound — the GLP-1 weight loss drugs that have taken the world by storm. Demand so far exceeds supply that pharmacies are rationing doses.",
    why_notable:"Lilly became the most valuable healthcare company in history in 2024. GLP-1 drugs may reduce cardiovascular disease by 20%, expanding the addressable market massively." },
  JPM:  { name:"JPMorgan Chase",        industry:"Banking",           color:"#005eb8", founded:"1799", employees:"308,000",
    description:"The largest US bank by assets. JPMorgan manages $3.9 trillion in assets, processes $10 trillion in payments daily, and serves 82 million US households.",
    why_notable:"Under Jamie Dimon, JPMorgan emerged as the strongest US bank after the 2023 regional banking crisis, acquiring First Republic Bank and gaining $500B in deposits." },
  XOM:  { name:"ExxonMobil",            industry:"Energy",            color:"#cc0000", founded:"1870", employees:"62,000",
    description:"The largest US oil company. ExxonMobil produces 3.7M barrels of oil equivalent per day, operates the world's largest refining network, and is expanding into lithium mining.",
    why_notable:"ExxonMobil's $60B acquisition of Pioneer Natural Resources made it the dominant force in the Permian Basin — the most productive oil field in US history." },
  V:    { name:"Visa Inc.",             industry:"Payments",          color:"#1a1f71", founded:"1958", employees:"26,500",
    description:"Visa processes over $15 trillion in payment volume annually across 4 billion cards in 200+ countries. It takes a tiny cut of every tap, swipe and click — and owns none of the credit risk.",
    why_notable:"Visa processes 240M transactions daily. As cash disappears globally, Visa's TAM expands to $185 trillion in total consumer spending that could shift to digital payments." },
  UNH:  { name:"UnitedHealth Group",    industry:"Healthcare",        color:"#286ce2", founded:"1977", employees:"440,000",
    description:"The largest US health insurer with 52 million members. UnitedHealth's Optum division is the largest employer of physicians in America, reshaping how healthcare is delivered.",
    why_notable:"UnitedHealth generates $370B+ in annual revenue — more than Apple. Optum's data-driven care model is cutting hospital readmission rates by 25%." },
};

// Top stocks to track for "Stock of the Month" — focused on S&P 500 large caps
const WATCHLIST = ["NVDA","AAPL","MSFT","AMZN","META","GOOGL","TSLA","AVGO","LLY","JPM","XOM","V","UNH"];

// ─────────────────────────────────────────────────────────────────────────────
// ETF METADATA AUTO-GENERATOR
// When a new ETF is fetched that has no metadata in the DB,
// calls Claude to generate description, holdings, pros/cons automatically
// ─────────────────────────────────────────────────────────────────────────────

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

async function generateEtfMetadata(ticker, etfData) {
  console.log(`\n[META] Generating metadata for ${ticker}...`);

  const prompt = `You are a financial data assistant. Generate structured metadata for the ETF ticker: ${ticker}

ETF data available:
- Price: ${etfData.price || "unknown"}
- CAGR: ${etfData.cagr ? (etfData.cagr * 100).toFixed(1) + "%" : "unknown"}
- Category: ${etfData.category || "unknown"}

Return ONLY a valid JSON object with these exact fields:
{
  "name": "Full official name of the ETF",
  "color": "A hex color that represents this ETF's brand or category (e.g. #00b96b for Vanguard, #8b5cf6 for Nasdaq/tech, #ff6b35 for leveraged)",
  "risk": "One of: Very Low, Low, Low-Med, Medium, High, Very High",
  "category": "Short category like: Total Market, Large Cap, Tech, Dividend, Bonds, Leveraged, Energy, Healthcare, International, Real Estate, Commodities",
  "leveraged": false or true,
  "description": "2-3 sentence plain English explanation of what this ETF holds and how it works. Be specific about the index it tracks.",
  "why": "1-2 sentences on why investors choose this ETF and what role it plays in a portfolio.",
  "expense": "Expense ratio as string e.g. '0.03%'",
  "inception": "Year as string e.g. '2010'",
  "aum": "Assets under management as string e.g. '$50B+'",
  "top_holdings": [{"n": "Company Name", "pct": "X.X%"}, ...] up to 7 holdings,
  "pros": ["Pro 1", "Pro 2", "Pro 3", "Pro 4"] - 3-4 genuine advantages,
  "cons": ["Con 1", "Con 2", "Con 3"] - 2-3 genuine disadvantages,
  "warning": null or a warning string only for leveraged/high-risk ETFs
}

Return ONLY the JSON, no markdown, no explanation.`;

  try {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "API error");

    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const meta = JSON.parse(clean);

    // Save to Supabase
    const { error } = await supabase.from("etf_metadata").upsert({
      ticker:       ticker.toUpperCase(),
      name:         meta.name,
      color:        meta.color || "#00b96b",
      risk:         meta.risk,
      category:     meta.category,
      leveraged:    meta.leveraged || false,
      description:  meta.description,
      why:          meta.why,
      expense:      meta.expense,
      inception:    meta.inception,
      aum:          meta.aum,
      top_holdings: meta.top_holdings,
      pros:         meta.pros,
      cons:         meta.cons,
      warning:      meta.warning || null,
      generated_at: new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    });

    if (error) throw error;
    console.log(`[META] ✓ ${ticker} metadata saved`);
    return meta;
  } catch(e) {
    console.error(`[META] Failed for ${ticker}:`, e.message);
    return null;
  }
}

async function ensureEtfMetadata(tickers, etfPoolData) {
  // Check which tickers are missing metadata
  const { data: existing } = await supabase
    .from("etf_metadata")
    .select("ticker")
    .in("ticker", tickers.map(t => t.toUpperCase()));

  const existingSet = new Set((existing || []).map(r => r.ticker));
  const missing = tickers.filter(t => !existingSet.has(t.toUpperCase()));

  if (!missing.length) {
    console.log(`[META] All ${tickers.length} ETFs have metadata ✓`);
    return;
  }

  console.log(`[META] Generating metadata for ${missing.length} new ETFs: ${missing.join(", ")}`);

  for (const ticker of missing) {
    const etfData = etfPoolData?.find(r => r.ticker === ticker) || {};
    await generateEtfMetadata(ticker, etfData);
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 1000));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STOCK OF THE MONTH FETCHER
// Runs on the 1st trading day of each month
// Picks the stock with the best 1-month return from the watchlist
// ─────────────────────────────────────────────────────────────────────────────
async function updateStockOfMonth() {
  const monthKey = new Date().toISOString().slice(0, 7);

  // Check if already done this month
  const { data: existing } = await supabase
    .from("stock_of_month")
    .select("ticker")
    .eq("month_key", monthKey)
    .single();

  if (existing) {
    console.log(`[STOCK] Already set for ${monthKey}: ${existing.ticker}`);
    return;
  }

  console.log(`\n[STOCK OF THE MONTH] Evaluating ${WATCHLIST.length} stocks...`);

  const results = [];

  for (const ticker of WATCHLIST) {
    try {
      // Fetch monthly data from Alpha Vantage
      const res  = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${ticker}&apikey=${KEYS.av}`);
      const json = await res.json();
      if (json["Note"] || json["Information"]) { console.log(`  AV rate limited — stopping`); break; }

      const series = json["Monthly Adjusted Time Series"];
      if (!series) continue;

      const prices = Object.entries(series)
        .map(([date, v]) => ({ date, close: parseFloat(v["5. adjusted close"]) }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (prices.length < 2) continue;

      const last  = prices[prices.length - 1];
      const prev  = prices[prices.length - 2];
      const change1m = (last.close - prev.close) / prev.close;

      // YTD
      const janPrice = prices.find(p => new Date(p.date).getFullYear() === new Date(last.date).getFullYear());
      const ytd = janPrice ? (last.close - janPrice.close) / janPrice.close : null;

      results.push({ ticker, price: last.close, change1m, ytd });
      console.log(`  ${ticker}: 1M ${(change1m*100).toFixed(1)}% | YTD ${ytd?(ytd*100).toFixed(1)+"%":"—"}`);

      await new Promise(r => setTimeout(r, 600)); // AV rate limit
    } catch(e) {
      console.error(`  ${ticker} failed: ${e.message}`);
    }
  }

  if (!results.length) {
    console.log("[STOCK] No results — skipping");
    return;
  }

  // Pick the top performer by 1-month return
  const winner = results.sort((a, b) => b.change1m - a.change1m)[0];
  const meta   = STOCK_META[winner.ticker];

  if (!meta) {
    console.log(`[STOCK] No metadata for ${winner.ticker} — skipping`);
    return;
  }

  // Fetch P/E ratio and market cap from Finnhub
  let pe_ratio = "—", market_cap = "—";
  try {
    const fhRes  = await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${winner.ticker}&metric=all&token=${KEYS.fh}`);
    const fhData = (await fhRes.json()).metric || {};
    pe_ratio   = fhData.peBasicExclExtraTTM ? `${fhData.peBasicExclExtraTTM.toFixed(0)}x` : "—";
    market_cap = fhData.marketCapitalization
      ? fhData.marketCapitalization > 1000
        ? `$${(fhData.marketCapitalization/1000).toFixed(1)}T`
        : `$${fhData.marketCapitalization.toFixed(0)}B`
      : "—";
  } catch(e) {
    console.error(`  Finnhub metrics failed: ${e.message}`);
  }

  const row = {
    month_key:   monthKey,
    ticker:      winner.ticker,
    name:        meta.name,
    price:       winner.price,
    change_1m:   winner.change1m,
    change_ytd:  winner.ytd,
    market_cap,
    pe_ratio,
    industry:    meta.industry,
    founded:     meta.founded,
    employees:   meta.employees,
    description: meta.description,
    why_notable: meta.why_notable,
    color:       meta.color,
    fetched_at:  new Date().toISOString(),
  };

  const { error } = await supabase.from("stock_of_month").upsert(row);
  if (error) console.error(`[STOCK] DB error: ${error.message}`);
  else console.log(`\n[STOCK] Winner: ${winner.ticker} +${(winner.change1m*100).toFixed(1)}% → saved for ${monthKey}`);
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

  // Update stock of the month (runs on 1st of month or manual trigger)
  const isFirstOfMonth = new Date().getDate() === 1;
  if (isFirstOfMonth || process.argv.includes("--score-now")) {
    await updateStockOfMonth();
  }

  // Auto-generate metadata for any new ETFs (runs daily, skips already done)
  try {
    const allTrackedTickers = [
      ...new Set([
        ...Object.keys(ETF_META),
        "XLE","XLF","XLV","XLI","XLC","XLB","XLU","XLP",
        "VB","IJR","IWM","TLT","LQD","VEA","VWO","EEM",
        "VNQ","GLD","IAU","DBC","BITO","IBIT","DVYE","HDV"
      ])
    ];
    await ensureEtfMetadata(allTrackedTickers, poolData || []);
  } catch(e) {
    console.error("[META] Metadata check failed:", e.message);
  }

  // Run daily scoring on all trading days
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
