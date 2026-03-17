"use client";
import { useState, useEffect } from "react";
import Onboarding from "./Onboarding";

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { getMarketStatus, STATUS_STYLE } from "../../lib/market";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ── ETF full metadata (all 18) ────────────────────────────────────────────────
const ETF_META = {
  VTI:  { name:"Vanguard Total Market",    color:"#00b96b", risk:"Low",       leveraged:false, category:"Total Market", fallbackCagr:0.135, fallbackOpt:0.18,
    topHoldings:["Apple","Microsoft","Nvidia","Amazon","Alphabet"],
    description:"Tracks the entire US stock market — over 3,700 stocks across all sectors and sizes." },
  ITOT: { name:"iShares Core S&P Total",   color:"#22c55e", risk:"Low",       leveraged:false, category:"Total Market", fallbackCagr:0.133, fallbackOpt:0.175,
    topHoldings:["Apple","Microsoft","Nvidia","Amazon","Meta"],
    description:"Broad exposure to the entire US equity market, similar to VTI from iShares." },
  VOO:  { name:"Vanguard S&P 500",         color:"#3b82f6", risk:"Low",       leveraged:false, category:"Large Cap",    fallbackCagr:0.132, fallbackOpt:0.175,
    topHoldings:["Apple","Microsoft","Nvidia","Amazon","Alphabet"],
    description:"Tracks the S&P 500 — the 500 largest US companies. The gold standard of index investing." },
  SPY:  { name:"SPDR S&P 500",             color:"#60a5fa", risk:"Low",       leveraged:false, category:"Large Cap",    fallbackCagr:0.131, fallbackOpt:0.172,
    topHoldings:["Apple","Microsoft","Nvidia","Amazon","Meta"],
    description:"The original S&P 500 ETF. Tracks the same 500 companies as VOO with slightly higher fees." },
  QQQ:  { name:"Nasdaq-100",               color:"#8b5cf6", risk:"Medium",    leveraged:false, category:"Tech Growth",  fallbackCagr:0.18,  fallbackOpt:0.25,
    topHoldings:["Apple","Microsoft","Nvidia","Amazon","Meta"],
    description:"Top 100 non-financial Nasdaq companies. Heavy tech concentration — the growth engine of the US market." },
  VGT:  { name:"Vanguard Info Tech",       color:"#a78bfa", risk:"Medium",    leveraged:false, category:"Tech",         fallbackCagr:0.20,  fallbackOpt:0.28,
    topHoldings:["Apple","Nvidia","Microsoft","Broadcom","Salesforce"],
    description:"Pure technology sector exposure. Focuses on semiconductors, software, and IT services." },
  XLK:  { name:"Tech Select SPDR",         color:"#7c3aed", risk:"Medium",    leveraged:false, category:"Tech",         fallbackCagr:0.195, fallbackOpt:0.27,
    topHoldings:["Nvidia","Apple","Microsoft","Broadcom","Salesforce"],
    description:"Technology sector of the S&P 500. Similar to VGT with slightly different weightings." },
  SCHD: { name:"Schwab Dividend",          color:"#c9a84c", risk:"Low",       leveraged:false, category:"Dividend",     fallbackCagr:0.12,  fallbackOpt:0.16,
    topHoldings:["Altria","Cisco","Verizon","Coca-Cola","AbbVie"],
    description:"High-quality dividend stocks screened for consistent payout growth. Steady income + growth." },
  VYM:  { name:"Vanguard High Dividend",   color:"#d97706", risk:"Low",       leveraged:false, category:"Dividend",     fallbackCagr:0.115, fallbackOpt:0.155,
    topHoldings:["JPMorgan","ExxonMobil","Johnson & Johnson","Procter & Gamble","Home Depot"],
    description:"Focuses on stocks with above-average dividend yields. Defensive and income-generating." },
  DGRO: { name:"iShares Dividend Growth",  color:"#f59e0b", risk:"Low",       leveraged:false, category:"Dividend",     fallbackCagr:0.125, fallbackOpt:0.165,
    topHoldings:["Microsoft","Apple","JPMorgan","Exxon","UnitedHealth"],
    description:"Companies with 5+ years of consecutive dividend growth. Quality filter for stable compounders." },
  XLE:  { name:"Energy Select SPDR",       color:"#10b981", risk:"Medium",    leveraged:false, category:"Energy",       fallbackCagr:0.10,  fallbackOpt:0.22,
    topHoldings:["ExxonMobil","Chevron","ConocoPhillips","EOG Resources","Schlumberger"],
    description:"US energy sector — oil, gas, and energy equipment companies. Cyclical but high dividend yields." },
  XLF:  { name:"Financial Select SPDR",    color:"#06b6d4", risk:"Medium",    leveraged:false, category:"Financials",   fallbackCagr:0.115, fallbackOpt:0.19,
    topHoldings:["Berkshire Hathaway","JPMorgan","Visa","Mastercard","Bank of America"],
    description:"US financial sector — banks, insurance, and payment processors. Benefits from rising rates." },
  XLV:  { name:"Health Care Select SPDR",  color:"#ec4899", risk:"Medium",    leveraged:false, category:"Healthcare",   fallbackCagr:0.105, fallbackOpt:0.17,
    topHoldings:["UnitedHealth","Johnson & Johnson","Eli Lilly","AbbVie","Thermo Fisher"],
    description:"US healthcare sector — pharma, biotech, medical devices, and health insurers. Defensive growth." },
  XLI:  { name:"Industrial Select SPDR",   color:"#14b8a6", risk:"Medium",    leveraged:false, category:"Industrials",  fallbackCagr:0.112, fallbackOpt:0.18,
    topHoldings:["GE Aerospace","Caterpillar","RTX","Honeywell","Union Pacific"],
    description:"US industrial companies — aerospace, defense, transportation, and machinery manufacturers." },
  TQQQ: { name:"3x Nasdaq (Leveraged)",    color:"#ff6b35", risk:"Very High", leveraged:true,  category:"Leveraged",    fallbackCagr:0.38,  fallbackOpt:0.65,
    topHoldings:["3x Nasdaq-100 Swap","QQQ derivatives","Daily reset"],
    description:"Delivers 3x the daily return of the Nasdaq-100. Extreme gains in bull markets, extreme losses in downturns. Not for long-term hold." },
  SOXL: { name:"3x Semiconductors (Lev.)", color:"#ff4757", risk:"Very High", leveraged:true,  category:"Leveraged",    fallbackCagr:0.35,  fallbackOpt:0.60,
    topHoldings:["3x PHLX Semiconductor Swap","Nvidia","AMD","ASML","TSMC derivatives"],
    description:"3x daily return of semiconductor stocks. Maximum AI/chip exposure. Extremely volatile — weekly monitoring required." },
  ARKK: { name:"ARK Innovation",           color:"#ff6b9d", risk:"High",      leveraged:false, category:"Innovation",   fallbackCagr:0.22,  fallbackOpt:0.45,
    topHoldings:["Tesla","Roku","Coinbase","UiPath","Palantir"],
    description:"Cathie Wood's flagship fund. Bets on disruptive innovation — AI, genomics, fintech, robotics. High conviction, high volatility." },
  UPRO: { name:"3x S&P 500 (Leveraged)",   color:"#ff8c00", risk:"Very High", leveraged:true,  category:"Leveraged",    fallbackCagr:0.32,  fallbackOpt:0.55,
    topHoldings:["3x S&P 500 Swap","SPY derivatives","Daily reset"],
    description:"Delivers 3x the daily return of the S&P 500. Amplifies both gains and losses. Only suitable for short-term tactical positions." },
  BND:  { name:"Vanguard Total Bond Market",  color:"#64748b", risk:"Very Low", leveraged:false, category:"Bonds",         fallbackCagr:0.048, fallbackOpt:0.06,
    topHoldings:["US Treasury Bonds","Corporate Bonds","Mortgage-backed","Agency Bonds","TIPS"],
    description:"The entire US investment-grade bond market. Stable income, low volatility, acts as a portfolio anchor in downturns." },
};

// ── Stock of the Month — rotates monthly, purely informational ───────────────
const STOCKS_OF_MONTH = {
  "2026-03": { ticker:"NVDA", name:"Nvidia Corporation", price:"$875.40", change:"+18.2%", industry:"Semiconductors", market_cap:"$2.1T", pe_ratio:"47x", ytd:"+24.3%", founded:"1993", employees:"29,600", description:"The dominant force in AI chips. Nvidia's H100 and B200 GPUs power virtually every major AI model — from ChatGPT to Gemini. Revenue grew 265% year-over-year in 2024.", why_notable:"Nvidia became the most valuable company on Earth in 2024, overtaking Apple and Microsoft. Its GPUs are the 'picks and shovels' of the AI gold rush.", color:"#76b900" },
  "2026-02": { ticker:"META", name:"Meta Platforms", price:"$512.30", change:"+12.8%", industry:"Social Media / AI", market_cap:"$1.3T", pe_ratio:"28x", ytd:"+15.1%", founded:"2004", employees:"67,000", description:"Facebook's parent company transformed itself into an AI powerhouse. Meta AI is now used by over 700 million people monthly across WhatsApp, Instagram and Facebook.", why_notable:"Meta's 'year of efficiency' in 2023 turned a struggling company into a profit machine. Their open-source AI model Llama is used by millions of developers worldwide.", color:"#0082fb" },
  "2026-01": { ticker:"TSLA", name:"Tesla Inc.", price:"$248.10", change:"+9.4%", industry:"Electric Vehicles / AI", market_cap:"$790B", pe_ratio:"72x", ytd:"+9.4%", founded:"2003", employees:"127,000", description:"Tesla leads the EV market globally and is expanding into energy storage, robotics (Optimus) and autonomous driving (FSD). Its Dojo supercomputer rivals Nvidia for AI training.", why_notable:"Tesla delivered over 1.8 million vehicles in 2023. The Cybertruck launched to record pre-orders. Full Self-Driving subscriptions reached 500,000+ users.", color:"#cc0000" },
  "2025-12": { ticker:"MSFT", name:"Microsoft Corporation", price:"$416.50", change:"+8.1%", industry:"Cloud / AI Software", market_cap:"$3.1T", pe_ratio:"36x", ytd:"+18.2%", founded:"1975", employees:"221,000", description:"Microsoft's $13B bet on OpenAI paid off massively. Azure AI services are growing at 60%+ annually. Copilot is now embedded in every Microsoft 365 product used by 400M+ people.", why_notable:"Microsoft became the first company to deeply integrate AI into its entire product suite — from Excel to Teams to Visual Studio. Azure is now the #2 cloud platform globally.", color:"#00a4ef" },
};

function getStockOfMonth() {
  const key = new Date().toISOString().slice(0,7);
  return STOCKS_OF_MONTH[key] || STOCKS_OF_MONTH["2026-03"];
}

const PROFILE_CONFIG = {
  conservative: {
    label:"Conservative", icon:"🛡️", desc:"~5% annual return · Very low risk",
    accentColor:"#3b82f6", rate:"~5%/yr",
    targetReturn: 0.055,
    subtitle: "Bonds + dividend stocks. Slow, steady, reliable.",
    warning: null,
  },
  balanced: {
    label:"Balanced", icon:"⚖️", desc:"7–12% annual return · Moderate risk",
    accentColor:"#c9a84c", rate:"~9%/yr",
    targetReturn: 0.09,
    subtitle: "Mix of growth ETFs and stable large-cap stocks.",
    warning: null,
  },
  aggressive: {
    label:"Aggressive", icon:"🚀", desc:"12%+ annual return · High risk",
    accentColor:"#ff4757", rate:"~16%/yr",
    targetReturn: 0.16,
    subtitle: "Growth-focused. Includes leveraged positions.",
    warning:"⚠️ This plan uses leveraged ETFs (TQQQ). These can lose 50–90% of value in a downturn. Only invest money you can afford to lose completely.",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt     = n => n!=null ? n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}) : "—";
const fmtD    = n => n!=null ? `$${Number(n).toFixed(2)}` : "—";
const fmtPct  = n => n!=null ? `${n>=0?"+":""}${(n*100).toFixed(2)}%` : "—";
const timeAgo = iso => { if(!iso) return "—"; const s=Math.floor((Date.now()-new Date(iso))/1000); return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:`${Math.floor(s/3600)}h ago`; };

// ── Projection engine ────────────────────────────────────────────────────────
// profileTarget drives the projection — this is the declared annual target
// Conservative ~5%, Balanced ~9%, Aggressive ~16%
// Live ETF data only adjusts the OPTIMISTIC scenario, not the base projection
function project(monthly, allocations, etfPool, months, opt=false, profileTarget=null) {
  if (!allocations || Object.keys(allocations).length === 0) return monthly * months;

  let monthlyRate;

  if (profileTarget !== null) {
    if (opt) {
      // Optimistic: target + 30% upside
      monthlyRate = (profileTarget * 1.30) / 12;
    } else {
      // Expected: exactly the profile target — clear and honest
      monthlyRate = profileTarget / 12;
    }
  } else {
    // No profile target — use live CAGR weighted by allocation
    monthlyRate = Object.entries(allocations).reduce((acc,[t,pct]) => {
      const row    = etfPool?.find(r=>r.ticker===t);
      const meta   = ETF_META[t];
      const pctNum = parseFloat(pct) || 0;
      const annual = opt
        ? (row?.optimistic ?? meta?.fallbackOpt  ?? 0.18)
        : (row?.cagr       ?? meta?.fallbackCagr ?? 0.10);
      return acc + (annual/12)*(pctNum/100);
    }, 0);
  }

  if (monthlyRate === 0) return monthly * months;
  let total = 0;
  for (let i=0;i<months;i++) total=(total+monthly)*(1+monthlyRate);
  return total;
}

const ChartTip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:"#fff",border:"1px solid #e8e8e2",borderRadius:8,padding:"10px 14px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
      <p style={{fontFamily:"DM Mono",fontSize:11,color:"#7a7a8a",marginBottom:6}}>Month {label}</p>
      {payload.map(p=><p key={p.name} style={{fontFamily:"DM Mono",fontSize:12,color:p.color,margin:"2px 0"}}>{p.name}: {fmt(p.value)}</p>)}
    </div>
  );
};

// ── ETF Comparison Card ───────────────────────────────────────────────────────
function EtfCompareCard({ ticker, isNew, isRemoved, poolRow }) {
  const meta = ETF_META[ticker] || { name:ticker, color:"#888", risk:"—", leveraged:false, category:"—", topHoldings:[], description:"" };
  return (
    <div style={{
      background: isNew ? "rgba(0,185,107,0.03)" : isRemoved ? "rgba(255,71,87,0.03)" : "white",
      border: `1.5px solid ${isNew ? "rgba(0,185,107,0.3)" : isRemoved ? "rgba(255,71,87,0.3)" : meta.color+"33"}`,
      borderRadius:14, padding:"clamp(14px,2vw,18px)", position:"relative", opacity: isRemoved ? 0.6 : 1,
      transition:"transform 0.15s, box-shadow 0.15s",
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="var(--shadow2)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="none";}}>
      {isNew     && <div style={{position:"absolute",top:-9,right:10,fontFamily:"DM Mono",fontSize:9,background:"#00b96b",color:"white",padding:"2px 8px",borderRadius:10,boxShadow:"0 2px 8px rgba(0,185,107,0.3)"}}>NEW</div>}
      {isRemoved && <div style={{position:"absolute",top:-9,right:10,fontFamily:"DM Mono",fontSize:9,background:"#ff4757",color:"white",padding:"2px 8px",borderRadius:10}}>OUT</div>}

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <a href={`/etf/${ticker}`} style={{fontFamily:"DM Mono",fontSize:14,color:meta.color,fontWeight:600,textDecoration:"none"}}>{ticker} ↗</a>
          {meta.leveraged && <span style={{fontFamily:"DM Mono",fontSize:8,padding:"1px 5px",borderRadius:3,background:"rgba(255,71,87,0.1)",color:"#ff4757"}}>3X</span>}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"DM Mono",fontSize:12,color:"var(--text)",fontWeight:500}}>{fmtD(poolRow?.price)}</div>
          <div style={{fontFamily:"DM Mono",fontSize:9,color:poolRow?.change_pct>=0?"var(--green)":"#ff4757"}}>{fmtPct(poolRow?.change_pct)}</div>
        </div>
      </div>

      {/* Name */}
      <div style={{fontFamily:"DM Sans",fontWeight:500,fontSize:12,color:"var(--text)",marginBottom:4}}>{meta.name}</div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
        <div style={{background:"var(--bg3)",borderRadius:6,padding:"5px 8px"}}>
          <div style={{fontFamily:"DM Mono",fontSize:8,color:"var(--muted2)",marginBottom:1}}>CAGR</div>
          <div style={{fontFamily:"DM Mono",fontSize:12,color:"var(--text)",fontWeight:500}}>{fmtPct(poolRow?.cagr ?? meta.fallbackCagr)}</div>
        </div>
        <div style={{background:"var(--bg3)",borderRadius:6,padding:"5px 8px"}}>
          <div style={{fontFamily:"DM Mono",fontSize:8,color:"var(--muted2)",marginBottom:1}}>1M MOM</div>
          <div style={{fontFamily:"DM Mono",fontSize:12,fontWeight:500,color:(poolRow?.mom_1m??0)>=0?"var(--green)":"#ff4757"}}>{fmtPct(poolRow?.mom_1m)}</div>
        </div>
      </div>

      {/* Top holdings */}
      {meta.topHoldings?.length > 0 && (
        <div>
          <div style={{fontFamily:"DM Mono",fontSize:8,color:"var(--muted2)",marginBottom:5,letterSpacing:0.5}}>TOP HOLDINGS</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
            {meta.topHoldings.slice(0,3).map(h=>(
              <span key={h} style={{fontFamily:"DM Sans",fontSize:10,padding:"2px 7px",background:"var(--bg3)",borderRadius:4,color:"var(--muted)",border:"1px solid var(--border)"}}>{h}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [user,         setUser]         = useState(null);
  const [etfPool,      setEtfPool]      = useState([]);
  const [selections,   setSelections]   = useState({});   // { conservative: {...}, balanced: {...}, aggressive: {...} }
  const [macroData,    setMacroData]    = useState(null);
  const [fetchLog,     setFetchLog]     = useState([]);
  const [ms,           setMs]           = useState(getMarketStatus());
  const [loading,      setLoading]      = useState(true);

  // UI state
  const [amount,       setAmount]       = useState(100);
  const [risk,         setRisk]         = useState("balanced");
  const [view,         setView]         = useState("dashboard");
  const [activeMonth,  setActiveMonth]  = useState(1);
  const [showScores,   setShowScores]   = useState(false);
  const [news,         setNews]         = useState([]);
  const [newsLoading,  setNewsLoading]  = useState(true);
  const [userPlan,     setUserPlan]     = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [showPlanSwap,   setShowPlanSwap]   = useState(false);
  const [cardFlipped,    setCardFlipped]    = useState(false);
  const [showStockDetail, setShowStockDetail] = useState(false);
  const [stockOfMonth,   setStockOfMonth]   = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
      const { data:{ user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const [{ data:pool }, { data:sels }, { data:macro }, { data:logs }] = await Promise.all([
        supabase.from("etf_pool").select("*").order("ticker"),
        supabase.from("weekly_selections").select("*").eq("is_current", true),
        supabase.from("macro_data").select("*").eq("id","current").single(),
        supabase.from("fetch_log").select("*").order("fetched_at",{ascending:false}).limit(3),
      ]);

      setEtfPool(pool || []);

      // Index selections by profile
      const selByProfile = {};
      (sels || []).forEach(s => { selByProfile[s.profile] = s; });
      setSelections(selByProfile);

      setMacroData(macro);
      setFetchLog(logs || []);

      // Load user's saved plan + monthly history
      const [planResult, historyResult] = await Promise.allSettled([
        supabase.from("user_plans").select("*").eq("user_id", user.id).single(),
        supabase.from("user_monthly_actions").select("*").eq("user_id", user.id).order("month_key", { ascending:false }).limit(6),
      ]);
      const savedPlan = planResult.status === "fulfilled" ? planResult.value?.data : null;
      const history   = historyResult.status === "fulfilled" ? historyResult.value?.data : [];

      if (savedPlan) {
        setUserPlan(savedPlan);
        setAmount(savedPlan.amount);
        setRisk(savedPlan.profile);
        setMonthlyHistory(history || []);
      } else {
        // First time user — show onboarding
        setShowOnboarding(true);
      }

      // Auto-create monthly action for current month if missing
      if (savedPlan && (!history || !history.find(a => a.month_key === new Date().toISOString().slice(0,7)))) {
        const monthKey = new Date().toISOString().slice(0,7);
        const prof = savedPlan.profile;
        const profileSels = selByProfile[prof];
        const tickers = profileSels?.tickers || [];
        const allocations = profileSels?.allocations || {};
        if (tickers.length > 0) {
          await supabase.from("user_monthly_actions").upsert({
            user_id:    user.id,
            month_key:  monthKey,
            profile:    prof,
            amount:     savedPlan.amount,
            tickers,
            allocations,
            created_at: new Date().toISOString(),
          }, { onConflict: "user_id,month_key" });
          // Refresh history
          const { data: freshHistory } = await supabase
            .from("user_monthly_actions")
            .select("*")
            .eq("user_id", user.id)
            .order("month_key", { ascending: false })
            .limit(12);
          setMonthlyHistory(freshHistory || []);
        }
      }

      // Load stock of the month from DB
      const monthKey = new Date().toISOString().slice(0,7);
      try {
        const { data:stockData } = await supabase
          .from("stock_of_month")
          .select("*")
          .eq("month_key", monthKey)
          .single();
        if (stockData) setStockOfMonth(stockData);
      } catch(e) { /* table may not exist yet */ }

      setLoading(false);
      } catch(e) {
        console.error("Dashboard load error:", e);
        setLoading(false);
      }
    };
    load();
    // Fetch market news
    fetch("/api/news")
      .then(r=>r.json())
      .then(d=>{ setNews(d.items||[]); setNewsLoading(false); })
      .catch(()=>setNewsLoading(false));

    const t = setInterval(()=>setMs(getMarketStatus()), 60_000);
    return ()=>clearInterval(t);
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      // Delete user data first
      await supabase.from("user_monthly_actions").delete().eq("user_id", user.id);
      await supabase.from("user_plans").delete().eq("user_id", user.id);
      await supabase.from("email_preferences").delete().eq("user_id", user.id);
      // Delete auth user via API route
      const { data: { session } } = await supabase.auth.getSession();
      await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      await supabase.auth.signOut();
      router.push("/");
    } catch(e) {
      console.error("Delete failed:", e);
      setDeleting(false);
    }
  };

  // Auto-create a monthly action entry for the current month if one doesn't exist
  const createMonthlyActionIfNeeded = async (profile, amt) => {
    if (!user) return;
    const monthKey = new Date().toISOString().slice(0, 7);
    const profileSels = selections[profile] || FALLBACK_PLANS[profile];
    const tickers = profileSels?.tickers || FALLBACK_PLANS[profile]?.tickers || [];
    const allocations = profileSels?.allocations || FALLBACK_PLANS[profile]?.allocations || {};

    // Check if already exists
    const { data: existing } = await supabase
      .from("user_monthly_actions")
      .select("month_key")
      .eq("user_id", user.id)
      .eq("month_key", monthKey)
      .single();

    if (existing) return; // already exists

    await supabase.from("user_monthly_actions").insert({
      user_id:     user.id,
      month_key:   monthKey,
      profile,
      amount:      amt,
      tickers,
      allocations,
      created_at:  new Date().toISOString(),
    });

    // Refresh monthly history
    const { data: history } = await supabase
      .from("user_monthly_actions")
      .select("*")
      .eq("user_id", user.id)
      .order("month_key", { ascending: false })
      .limit(12);
    setMonthlyHistory(history || []);
  };

  const handleOnboardingComplete = async ({ profile, amount: amt }) => {
    setRisk(profile);
    setAmount(amt);
    setUserPlan({ profile, amount: amt });
    setShowOnboarding(false);
    // Auto-create this month's action entry so user can mark as bought
    await createMonthlyActionIfNeeded(profile, amt);
  };

  const handlePlanChange = async (newProfile, newAmount) => {
    setRisk(newProfile);
    setAmount(newAmount);
    await supabase.from("user_plans").upsert({
      user_id: user.id, profile: newProfile, amount: newAmount,
      updated_at: new Date().toISOString(),
    });
    setUserPlan({ profile: newProfile, amount: newAmount });
    await createMonthlyActionIfNeeded(newProfile, newAmount);
  };

  const [markingBought, setMarkingBought] = useState(null);

  const handleMarkBought = async (monthKey, tickers) => {
    setMarkingBought(monthKey);
    try {
      // Capture current prices as entry prices
      const entryPrices = {};
      const amountsInvested = {};
      const action = monthlyHistory.find(a => a.month_key === monthKey);
      tickers.forEach(t => {
        const currentPrice = etfPool.find(r => r.ticker === t)?.price;
        if (currentPrice) entryPrices[t] = currentPrice;
        const pct = parseFloat(action?.allocations?.[t]) || (100/tickers.length);
        amountsInvested[t] = Math.round((action?.amount || amount) * pct / 100);
      });

      await supabase.from("user_monthly_actions")
        .update({
          entry_prices:     entryPrices,
          amounts_invested: amountsInvested,
          bought_at:        new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("month_key", monthKey);

      // Refresh history
      const { data: history } = await supabase
        .from("user_monthly_actions")
        .select("*")
        .eq("user_id", user.id)
        .order("month_key", { ascending: false })
        .limit(12);
      setMonthlyHistory(history || []);
    } catch(e) {
      console.error("Mark bought failed:", e);
    }
    setMarkingBought(null);
  };
  const width  = useWindowWidth();
  const isMob  = width < 640;
  const isTab  = width < 1024;

  // Read ?tab= param safely client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["dashboard","plan","library"].includes(tab)) {
        setView(tab);
      }
    }
  }, []);

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)"}}>
      <span style={{fontFamily:"DM Mono",fontSize:12,color:"var(--muted)"}}>Loading your dashboard…</span>
    </div>
  );

  if (showOnboarding) return (
    <Onboarding user={user} onComplete={handleOnboardingComplete} />
  );

  // Fallback allocations — tuned for target return tiers
  // Conservative ~5%: bonds anchor stability, dividends provide income
  // Balanced 7-12%: large-cap growth with dividend ballast
  // Aggressive 12%+: pure growth + leveraged exposure, no bonds
  const FALLBACK_PLANS = {
    conservative: { tickers:["BND","SCHD","VTI","VOO"],       allocations:{ BND:40, SCHD:30, VTI:20, VOO:10 } },
    balanced:     { tickers:["VOO","VTI","QQQ","SCHD"],       allocations:{ VOO:40, VTI:25, QQQ:25, SCHD:10 } },
    aggressive:   { tickers:["QQQ","VGT","TQQQ","ARKK"],      allocations:{ QQQ:35, VGT:25, TQQQ:25, ARKK:15 } },
  };

  // Current plan selection — use live DB data or fallback
  const currentSel   = selections[risk];
  const fallback     = FALLBACK_PLANS[risk];
  const curTickers   = currentSel?.tickers   || fallback.tickers;
  const prevTickers  = currentSel?.prev_tickers || [];
  const usingFallback = !currentSel;
  const pc           = PROFILE_CONFIG[risk];

  // Allocations — build from whatever tickers we're actually showing
  const allocs = (() => {
    const rawAllocs = currentSel?.allocations || {};

    // DB allocations can be stored as numbers or strings — normalise all to numbers
    const parsed = {};
    Object.entries(rawAllocs).forEach(([k,v]) => { parsed[k] = parseFloat(v) || 0; });
    const allocSum = Object.values(parsed).reduce((a,b) => a+b, 0);

    // Case 1: DB has allocations covering ALL current tickers with valid sum
    if (allocSum >= 80 && curTickers.every(t => parsed[t] > 0)) {
      // Rescale to exactly 100% in case of rounding
      const scale = 100 / allocSum;
      const normalized = {};
      curTickers.forEach((t,i,arr) => {
        normalized[t] = i === arr.length-1
          ? 100 - Object.values(normalized).reduce((a,b)=>a+b,0)
          : Math.round(parsed[t] * scale);
      });
      return normalized;
    }

    // Case 2: No live selections or using same tickers as fallback — use plan defaults
    if (!currentSel) return fallback.allocations;

    // Case 3: Live tickers but missing/zero allocations — use score-weighted equal split
    const n = curTickers.length;
    const base = Math.floor(100 / n / 5) * 5;
    const equal = {};
    let rem = 100;
    curTickers.forEach((t,i) => {
      equal[t] = i === n-1 ? rem : base;
      rem -= base;
    });
    return equal;
  })();
  const prevAllocs = currentSel?.prev_allocations || {};

  // Added / removed this week
  const addedETFs   = curTickers.filter(t => !prevTickers.includes(t));
  const removedETFs = prevTickers.filter(t => !curTickers.includes(t));
  const unchangedETFs = curTickers.filter(t => prevTickers.includes(t));

  // Start projection from user's actual start date (or today if no plan yet)
  const planStartDate = userPlan?.started_at ? new Date(userPlan.started_at) : new Date();

  // Chart + table
  const chartData = Array.from({length:25},(_,m)=>({
    month: (() => {
      if (m === 0) return "Now";
      const d = new Date(planStartDate.getFullYear(), planStartDate.getMonth() + m);
      return d.toLocaleString("default",{month:"short", year:"2-digit"});
    })(),
    invested:amount*m,
    expected:   m===0?0:project(amount,allocs,etfPool,m,false,pc.targetReturn),
    optimistic: m===0?0:project(amount,allocs,etfPool,m,true,pc.targetReturn),
  }));
  const tableData = Array.from({length:12},(_,i)=>{
    const m=i+1, invested=amount*m;
    const exp=project(amount,allocs,etfPool,m,false,pc.targetReturn);
    const labelDate = new Date(planStartDate.getFullYear(), planStartDate.getMonth() + i);
    return { month:m, label:labelDate.toLocaleString("default",{month:"short", year: labelDate.getFullYear() !== planStartDate.getFullYear() ? "2-digit" : undefined}), invested, expected:exp, optimistic:project(amount,allocs,etfPool,m,true,pc.targetReturn), gain:exp-invested };
  });
  const projs = { 1:{exp:project(amount,allocs,etfPool,1,false,pc.targetReturn),opt:project(amount,allocs,etfPool,1,true,pc.targetReturn)}, 6:{exp:project(amount,allocs,etfPool,6,false,pc.targetReturn),opt:project(amount,allocs,etfPool,6,true,pc.targetReturn)}, 12:{exp:project(amount,allocs,etfPool,12,false,pc.targetReturn),opt:project(amount,allocs,etfPool,12,true,pc.targetReturn)}, 60:{exp:project(amount,allocs,etfPool,60,false,pc.targetReturn),opt:project(amount,allocs,etfPool,60,true,pc.targetReturn)} };
  const pieData = curTickers.map(t=>({name:t,value:allocs[t]||0,color:ETF_META[t]?.color||"#888"}));
  const sc = STATUS_STYLE[ms.status] || STATUS_STYLE.CLOSED;

  const card  = {background:"white",border:"1px solid var(--border)",borderRadius:16,padding:22,boxShadow:"var(--shadow2)"};
  const lbl   = {fontFamily:"DM Mono",fontSize:11,letterSpacing:2,color:"var(--muted2)",marginBottom:18,textTransform:"uppercase"};

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)"}}>

      {/* Nav */}
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:`0 ${isMob?"14px":"32px"}`,height:60,background:"rgba(248,248,245,0.97)",backdropFilter:"blur(12px)",borderBottom:"1px solid var(--border)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:isMob?10:24}}>
          <Link href="/" className="pixel" style={{fontSize:10,color:"var(--text)",textDecoration:"none",flexShrink:0}}>ETF<span style={{color:"var(--green)"}}>.</span>PLAN</Link>
          {!isMob && (
            <div style={{display:"flex",gap:3}}>
              {[
                {label:"Dashboard",v:"dashboard"},
                {label:"My Plan",  v:"plan"     },
                {label:"Library",  v:"library"  },
              ].map(tab=>(
                <button key={tab.v} onClick={()=>setView(tab.v)} style={{
                  fontFamily:"DM Sans",fontSize:13,fontWeight:view===tab.v?600:400,
                  color:view===tab.v?"var(--text)":"var(--muted)",
                  background:view===tab.v?"white":"transparent",
                  border:view===tab.v?"1px solid var(--border)":"1px solid transparent",
                  borderRadius:8,padding:"6px 12px",cursor:"pointer",
                  boxShadow:view===tab.v?"var(--shadow)":"none",transition:"all 0.15s",
                }}>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {isMob && (
            <div style={{display:"flex",gap:3}}>
              {[
                {v:"dashboard", label:"Home"},
                {v:"plan",      label:"My Plan"},
                {v:"library",   label:"Library"},
              ].map(tab=>(
                <button key={tab.v} onClick={()=>setView(tab.v)} style={{
                  fontFamily:"DM Sans",fontSize:12,fontWeight:view===tab.v?600:400,
                  color:view===tab.v?"var(--text)":"var(--muted)",
                  background:view===tab.v?"white":"transparent",
                  border:view===tab.v?"1px solid var(--border)":"1px solid transparent",
                  borderRadius:8,padding:"6px 10px",cursor:"pointer",
                  boxShadow:view===tab.v?"var(--shadow)":"none",
                  whiteSpace:"nowrap",
                }}>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          <Link href="/" style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted)",padding:"6px 12px",border:"1px solid var(--border)",borderRadius:8,textDecoration:"none",display:isMob?"none":"block"}}>← Home</Link>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setShowDeleteConfirm(true)} style={{fontFamily:"DM Sans",fontSize:isMob?11:12,color:"#ff4757",background:"none",border:"1px solid rgba(255,71,87,0.2)",borderRadius:8,padding:isMob?"6px 8px":"6px 10px",cursor:"pointer"}}>Delete account</button>
            <button onClick={handleLogout} style={{fontFamily:"DM Sans",fontSize:isMob?12:13,color:"var(--muted)",background:"none",border:"1px solid var(--border)",borderRadius:8,padding:isMob?"6px 10px":"6px 12px",cursor:"pointer"}}>Log out</button>
          </div>

          {/* Delete account modal */}
          {showDeleteConfirm && (
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setShowDeleteConfirm(false)}>
              <div style={{background:"white",borderRadius:20,padding:32,maxWidth:420,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
                <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:20,color:"#1a1a2e",marginBottom:8}}>Delete account</div>
                <div style={{fontFamily:"DM Sans",fontSize:14,color:"var(--muted)",lineHeight:1.7,marginBottom:20}}>
                  This will permanently delete your account, plan and all history. This cannot be undone.
                </div>
                <div style={{background:"rgba(255,71,87,0.04)",border:"1px solid rgba(255,71,87,0.15)",borderRadius:10,padding:"12px 16px",marginBottom:20}}>
                  <div style={{fontFamily:"DM Mono",fontSize:11,color:"#ff4757",marginBottom:8}}>Type DELETE to confirm</div>
                  <input
                    value={deleteConfirmText}
                    onChange={e=>setDeleteConfirmText(e.target.value.toUpperCase())}
                    placeholder="DELETE"
                    style={{width:"100%",fontFamily:"DM Mono",fontSize:14,padding:"8px 12px",border:"1px solid rgba(255,71,87,0.3)",borderRadius:8,outline:"none",color:"#ff4757",background:"white"}}
                  />
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>{setShowDeleteConfirm(false);setDeleteConfirmText("");}} style={{flex:1,fontFamily:"DM Sans",fontSize:14,padding:"10px",border:"1px solid var(--border)",borderRadius:10,cursor:"pointer",background:"var(--bg3)",color:"var(--muted)"}}>Cancel</button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE" || deleting}
                    style={{flex:1,fontFamily:"DM Sans",fontWeight:600,fontSize:14,padding:"10px",border:"none",borderRadius:10,cursor:deleteConfirmText==="DELETE"?"pointer":"not-allowed",background:deleteConfirmText==="DELETE"?"#ff4757":"rgba(255,71,87,0.2)",color:"white"}}>
                    {deleting ? "Deleting..." : "Delete forever"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div style={{maxWidth:1160,margin:"0 auto",padding:isMob?"16px 14px 60px":"36px 24px 96px"}}>

        {view === "dashboard" && <>

          {/* Dashboard greeting header */}
          <div style={{background:"var(--text)",borderRadius:16,padding:"clamp(20px,3vw,28px) clamp(20px,4vw,32px)",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div>
              <div className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:8}}>YOUR DASHBOARD</div>
              <h1 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(24px,4vw,34px)",color:"white",margin:0,letterSpacing:"-1px",lineHeight:1.1}}>
                {(() => {
                  const raw = user?.email?.split("@")[0] || "";
                  // Clean up common email patterns: john.doe → John, john_doe → John
                  const name = raw.split(/[._+-]/)[0];
                  const clean = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                  return clean ? `Hi, ${clean} 👋` : "Your Dashboard";
                })()}
              </h1>
              <p style={{fontFamily:"DM Sans",fontSize:15,color:"rgba(255,255,255,0.4)",margin:"6px 0 0",lineHeight:1.5}}>
                Save smarter. Grow your money monthly.
              </p>
            </div>
            <div style={{display:"flex",gap:10}}>
              {[
                {l:"ETFs tracked",v:"Daily"},
                {l:"Next update",v:ms.isOpen?"4:05 PM ET":"Market open"},
              ].map(s=>(
                <div key={s.l} style={{background:"rgba(255,255,255,0.05)",borderRadius:10,padding:"10px 16px",textAlign:"center",border:"1px solid rgba(255,255,255,0.08)"}}>
                  <div className="mono" style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:3}}>{s.l.toUpperCase()}</div>
                  <div style={{fontFamily:"DM Sans",fontWeight:600,fontSize:14,color:"white"}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── New user CTA — shows if first visit ─────────────────────────── */}
          {monthlyHistory.length === 0 && !userPlan?.has_bought && (
            <div style={{
              background:"linear-gradient(135deg,rgba(0,185,107,0.1),rgba(0,185,107,0.03))",
              border:"2px solid rgba(0,185,107,0.3)",borderRadius:16,
              padding:"clamp(20px,3vw,28px)",marginBottom:20,
              display:"flex",justifyContent:"space-between",alignItems:"center",
              flexWrap:"wrap",gap:16,
            }}>
              <div style={{display:"flex",alignItems:"center",gap:16,flex:1}}>
                <div style={{width:52,height:52,borderRadius:14,background:"rgba(0,185,107,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>
                  🛒
                </div>
                <div>
                  <h3 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(16px,3vw,20px)",color:"var(--text)",margin:"0 0 4px",letterSpacing:"-0.3px"}}>
                    Ready to make your first purchase?
                  </h3>
                  <p style={{fontFamily:"DM Sans",fontSize:"clamp(12px,2vw,14px)",color:"var(--muted)",margin:0,lineHeight:1.6}}>
                    Your plan is set. Follow our step-by-step guide to buy your first ETFs in 15 minutes.
                  </p>
                </div>
              </div>
              <button onClick={()=>setView("library")} style={{
                fontFamily:"DM Sans",fontWeight:700,fontSize:14,color:"white",
                background:"var(--green)",border:"none",borderRadius:10,
                padding:"12px 22px",cursor:"pointer",flexShrink:0,
                boxShadow:"0 4px 16px rgba(0,185,107,0.3)",whiteSpace:"nowrap",
              }}>
                How to buy ETFs →
              </button>
            </div>
          )}

          {/* Market status */}
          <div style={{background:sc.bg,border:`1.5px solid ${sc.border}`,borderRadius:16,padding:"clamp(16px,3vw,24px) clamp(16px,3vw,28px)",marginBottom:24,boxShadow:"var(--shadow)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{color:sc.color,fontSize:13,animation:sc.pulse?"pulse 1.5s infinite":"none"}}>{sc.icon}</span>
                  <span style={{fontFamily:"DM Mono",fontSize:12,color:sc.color,letterSpacing:2,fontWeight:500}}>{ms.status.replace("_"," ")}</span>
                </div>
                <div style={{fontFamily:"DM Sans",fontWeight:800,fontSize:"clamp(22px,3.5vw,30px)",color:"var(--text)",marginBottom:6,letterSpacing:"-0.5px"}}>{ms.reason}</div>
                <div style={{fontFamily:"DM Sans",fontSize:16,color:"var(--muted)",lineHeight:1.7}}>{ms.detail}</div>
                {ms.nextOpen && <div style={{fontFamily:"DM Mono",fontSize:11,color:sc.color,marginTop:10}}>Next session → {ms.nextOpen}</div>}
              </div>
              <div style={{textAlign:isMob?"left":"right",display:"flex",flexDirection:isMob?"row":"column",flexWrap:"wrap",gap:isMob?16:12}}>
                {[
                  {l:"LAST DATA FETCH",   v: fetchLog[0] ? `${fetchLog[0].trigger?.replace("_"," ")} · ${timeAgo(fetchLog[0].fetched_at)}` : "—"},
                  {l:"NEXT FETCH",        v: ms.isOpen ? "at 4:05 PM ET close" : "at next open 9:30 AM ET"},
                  {l:"NEXT SELECTION",    v: "Today at 4:05 PM ET close"},
                ].map(x=>(
                  <div key={x.l} style={{textAlign:"right"}}>
                    <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",marginBottom:2}}>{x.l}</div>
                    <div style={{fontFamily:"DM Mono",fontSize:12,color:"var(--muted)"}}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
            {!ms.isOpen && (
              <div style={{marginTop:16,padding:"12px 16px",background:"rgba(0,0,0,0.03)",borderRadius:10,fontFamily:"DM Sans",fontSize:13,color:"var(--muted)",lineHeight:1.7,border:"1px solid var(--border)"}}>
                📊 Prices shown are from the last market close. Projections and ETF selections remain valid — they use multi-year historical data, not live ticks.
              </div>
            )}
          </div>

          {/* ── Returning user: Your Plan summary ──────────────────────────── */}
          {userPlan ? (
            <div style={{display:"grid",gridTemplateColumns:isTab?"1fr":"1fr 1fr",gap:isMob?14:20,marginBottom:24,alignItems:"start"}}>

              {/* Left: This month's action card */}
              <div style={{background:"var(--text)",borderRadius:16,padding:"clamp(20px,3vw,28px)",boxShadow:"var(--shadow2)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:10}}>
                  <div>
                    <div className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:1.5,marginBottom:8}}>YOUR PLAN</div>
                    <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(22px,4vw,30px)",color:"white",letterSpacing:"-0.5px"}}>
                      {pc.icon} {pc.label}
                    </div>
                    <div className="mono" style={{fontSize:12,color:pc.accentColor,marginTop:4}}>{pc.rate || "~"+Math.round((pc.targetReturn||0.09)*100)+"%"}/yr target</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:4}}>MONTHLY</div>
                    <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:36,color:"white",lineHeight:1}}>${amount}</div>
                    <button onClick={()=>setShowPlanSwap(!showPlanSwap)} style={{fontFamily:"DM Mono",fontSize:10,color:"rgba(255,255,255,0.4)",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,cursor:"pointer",marginTop:4,padding:"3px 8px"}}>
                      {showPlanSwap ? "✕ cancel" : "change plan"}
                    </button>
                    {showPlanSwap && (
                      <div style={{marginTop:12,background:"rgba(255,255,255,0.06)",borderRadius:12,padding:"12px",border:"1px solid rgba(255,255,255,0.1)"}}>
                        <div className="mono" style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:10,letterSpacing:1}}>SWITCH TO</div>
                        {Object.entries(PROFILE_CONFIG).filter(([k])=>k!==risk).map(([key,p])=>(
                          <button key={key} onClick={async()=>{
                            await handlePlanChange(key, amount);
                            setShowPlanSwap(false);
                          }} style={{
                            display:"flex",justifyContent:"space-between",alignItems:"center",
                            width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${p.accentColor}44`,
                            background:`${p.accentColor}0a`,cursor:"pointer",marginBottom:6,
                          }}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span>{p.icon}</span>
                              <span style={{fontFamily:"DM Sans",fontWeight:600,fontSize:14,color:"white"}}>{p.label}</span>
                              <span className="mono" style={{fontSize:10,color:p.accentColor}}>{p.rate}</span>
                            </div>
                            <span style={{fontFamily:"DM Sans",fontWeight:700,fontSize:15,color:p.accentColor}}>
                              +{fmt(project(amount,FALLBACK_PLANS[key].allocations,etfPool,60,false,p.targetReturn)-amount*60)}/5yr
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* This month's ETFs to buy */}
                <div style={{marginBottom:16}}>
                  <div className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:1,marginBottom:10}}>
                    BUY THIS MONTH — {new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"}).toUpperCase()}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
                    {curTickers.map((t,i)=>{
                      const pct   = typeof allocs[t]==="number" ? allocs[t] : parseInt(allocs[t])||0;
                      const meta  = ETF_META[t]||{color:"#888",name:t};
                      const dollars = Math.round(amount*pct/100);
                      return (
                        <div key={t} style={{background:"rgba(255,255,255,0.07)",borderRadius:10,padding:"12px 14px",border:`1px solid ${meta.color}33`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                            <a href={`/etf/${t}`} style={{fontFamily:"DM Mono",fontSize:13,color:meta.color,fontWeight:600,textDecoration:"none"}}>{t}</a>
                            <span style={{fontFamily:"DM Sans",fontWeight:700,fontSize:17,color:"white"}}>${dollars}</span>
                          </div>
                          <div style={{fontFamily:"DM Sans",fontSize:12,color:"rgba(255,255,255,0.4)"}}>{pct}% of your ${amount}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick projection */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:8,paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                  {[
                    {l:"12 months",v:fmt(projs[12].exp),gain:fmt(projs[12].exp-amount*12)},
                    {l:"5 year gain",v:"+"+fmt(projs[60].exp-amount*60),gain:null},
                    {l:"Risk level",v:pc.label,gain:null},
                  ].map(s=>(
                    <div key={s.l} style={{textAlign:"center"}}>
                      <div className="mono" style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:4}}>{s.l.toUpperCase()}</div>
                      <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:isMob?15:18,color:s.gain?"white":pc.accentColor}}>{s.v}</div>
                      {s.gain && <div className="mono" style={{fontSize:9,color:"var(--green)",marginTop:2}}>+{s.gain} gain</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Current ETF selection panel */}
              <div style={{background:"white",border:"1px solid var(--border)",borderRadius:16,padding:"clamp(18px,3vw,24px)",boxShadow:"var(--shadow2)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{height:3,width:20,background:pc.accentColor,borderRadius:2}}/>
                    <div className="mono" style={{fontSize:11,letterSpacing:2,color:"var(--muted2)"}}>THIS WEEK'S PICKS</div>
                  </div>
                  {currentSel?.changed && (
                    <span style={{fontFamily:"DM Mono",fontSize:9,padding:"4px 12px",borderRadius:10,background:"rgba(0,185,107,0.08)",color:"var(--green)",border:"1px solid rgba(0,185,107,0.2)"}}>UPDATED TODAY</span>
                  )}
                </div>
                {currentSel?.change_summary && currentSel.changed && (
                  <div style={{padding:"10px 14px",background:"rgba(0,185,107,0.04)",border:"1px solid rgba(0,185,107,0.15)",borderRadius:10,marginBottom:16}}>
                    <span style={{fontFamily:"DM Mono",fontSize:10,color:"var(--green)"}}>↻ {currentSel.change_summary}</span>
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"repeat(auto-fill,minmax(min(100%,180px),1fr))",gap:10}}>
                  {curTickers.map(t=>(
                    <EtfCompareCard key={t} ticker={t} isNew={addedETFs.includes(t)} isRemoved={false} poolRow={etfPool.find(r=>r.ticker===t)}/>
                  ))}
                </div>
                {usingFallback && (
                  <div style={{padding:"10px 14px",background:"var(--gold2)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:10,marginTop:14}}>
                    <span style={{fontFamily:"DM Mono",fontSize:10,color:"#8a6a1a"}}>🕐 Live picks update at today's market close</span>
                  </div>
                )}
              </div>
            </div>

          ) : (

            // ── New user: plan builder (should not normally appear after onboarding) ──
            <div style={{display:"grid",gridTemplateColumns:isTab?"1fr":"420px 1fr",gap:isMob?16:20,marginBottom:24,alignItems:"start"}}>
              <div style={card}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
                  <div style={{height:3,width:24,background:"var(--green)",borderRadius:2}}/>
                  <div className="mono" style={{fontSize:10,letterSpacing:2,color:"var(--muted2)"}}>BUILD YOUR PLAN</div>
                </div>
                <div style={{marginBottom:24}}>
                  <div style={{fontFamily:"DM Sans",fontSize:17,color:"var(--text)",fontWeight:600,marginBottom:14}}>How much per month?</div>
                  <div style={{display:"flex",gap:8,background:"var(--bg3)",borderRadius:12,padding:4}}>
                    {[50,100,150].map(v=>(
                      <button key={v} onClick={()=>setAmount(v)} style={{flex:1,padding:isMob?"11px 0":"13px 0",borderRadius:9,border:"none",cursor:"pointer",transition:"all 0.2s",background:amount===v?"white":"transparent",color:amount===v?"var(--text)":"var(--muted)",fontFamily:"DM Sans",fontWeight:amount===v?700:400,fontSize:isMob?18:22,boxShadow:amount===v?"var(--shadow2)":"none"}}>
                        ${v}<span style={{fontFamily:"DM Mono",fontSize:"clamp(9px,1.5vw,10px)",opacity:0.45}}>/mo</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{background:"var(--text)",borderRadius:12,padding:"16px 18px",marginBottom:24,border:`1px solid ${pc.accentColor}44`}}>
                  <div style={{fontFamily:"DM Mono",fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:10,letterSpacing:1}}>LIVE PROJECTION PREVIEW</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                    {[{l:"1 mo",mo:1},{l:"6 mo",mo:6},{l:"12 mo",mo:12}].map(x=>{
                      const exp  = project(amount,allocs,etfPool,x.mo,false,pc.targetReturn);
                      const gain = exp - amount*x.mo;
                      return (
                        <div key={x.l} style={{textAlign:"center"}}>
                          <div style={{fontFamily:"DM Mono",fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{x.l}</div>
                          <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:18,color:"white"}}>{fmt(exp)}</div>
                          <div style={{fontFamily:"DM Mono",fontSize:10,color:"#00ff88"}}>+{fmt(gain)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button onClick={()=>setShowOnboarding(true)} style={{width:"100%",padding:"18px 0",borderRadius:12,border:"none",cursor:"pointer",background:"var(--green)",color:"white",fontFamily:"DM Sans",fontWeight:700,fontSize:17,boxShadow:"0 6px 24px rgba(0,185,107,0.4)"}}>
                  Set up my plan →
                </button>
              </div>
              <div style={card}>
                <div className="mono" style={{fontSize:10,letterSpacing:2,color:"var(--muted2)",marginBottom:16}}>THIS WEEK'S PICKS</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
                  {curTickers.map(t=>(<EtfCompareCard key={t} ticker={t} isNew={false} isRemoved={false} poolRow={etfPool.find(r=>r.ticker===t)}/>))}
                </div>
              </div>
            </div>
          )}

        {/* ── Monthly History ─────────────────────────────────────────────── */}
          {monthlyHistory.length > 0 && (
            <div style={{background:"white",border:"1px solid var(--border)",borderRadius:16,padding:"clamp(18px,3vw,24px)",boxShadow:"var(--shadow2)",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
                <div style={{height:3,width:20,background:"var(--gold)",borderRadius:2}}/>
                <div className="mono" style={{fontSize:11,letterSpacing:2,color:"var(--text)",fontWeight:500}}>YOUR MONTHLY HISTORY</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {monthlyHistory.map((action) => {
                  const monthLabel = new Date(action.month_key+"-01").toLocaleDateString("en-US",{month:"long",year:"numeric"});
                  const isCurrentMonth = action.month_key === new Date().toISOString().slice(0,7);
                  const tickers = action.tickers || [];
                  const totalPct = tickers.reduce((s,t)=>s+(parseFloat(action.allocations?.[t])||0),0)||100;
                  // Build pie segments
                  let cumulative = 0;
                  const segments = tickers.map(t=>{
                    const pct = (parseFloat(action.allocations?.[t])||25)/totalPct*100;
                    const meta = ETF_META[t]||{color:"#888"};
                    const start = cumulative;
                    cumulative += pct;
                    return {t, pct, color:meta.color, start};
                  });

                  return (
                    <div key={action.month_key} style={{
                      border:`1.5px solid ${isCurrentMonth?"rgba(0,185,107,0.3)":"var(--border)"}`,
                      background: isCurrentMonth?"rgba(0,185,107,0.02)":"white",
                      borderRadius:14,padding:"clamp(14px,2.5vw,20px)",
                      boxShadow:"var(--shadow)",
                    }}>
                      {/* Header */}
                      {(() => {
                        const isBought = action.entry_prices && Object.values(action.entry_prices).some(v => v != null);
                        const isLoading = markingBought === action.month_key;
                        return (
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:isMob?"flex-start":"center",marginBottom:16,flexWrap:"wrap",gap:8,flexDirection:isMob?"column":"row"}}>
                            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                              <div className="mono" style={{fontSize:14,color:"var(--text)",fontWeight:500}}>{monthLabel}</div>
                              {isCurrentMonth && <span style={{fontFamily:"DM Mono",fontSize:9,padding:"3px 10px",borderRadius:10,background:"rgba(0,185,107,0.1)",color:"var(--green)",border:"1px solid rgba(0,185,107,0.2)"}}>THIS MONTH</span>}
                              {isBought
                                ? <span style={{fontFamily:"DM Mono",fontSize:9,padding:"3px 10px",borderRadius:10,background:"rgba(0,185,107,0.08)",color:"var(--green)",border:"1px solid rgba(0,185,107,0.2)"}}>✓ BOUGHT</span>
                                : <span style={{fontFamily:"DM Mono",fontSize:9,padding:"3px 10px",borderRadius:10,background:"rgba(255,165,0,0.1)",color:"#f59e0b",border:"1px solid rgba(255,165,0,0.3)"}}>⏳ PENDING PURCHASE</span>
                              }
                            </div>
                            <div style={{display:"flex",flexDirection:"column",alignItems:isMob?"flex-start":"flex-end",gap:8}}>
                              <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:18,color:"var(--text)"}}>${action.amount} <span style={{fontSize:13,fontWeight:400,color:"var(--muted)"}}>invested</span></div>
                              {!isBought && (
                                <button
                                  onClick={() => handleMarkBought(action.month_key, action.tickers || [])}
                                  disabled={isLoading}
                                  style={{
                                    fontFamily:"DM Sans",fontWeight:600,fontSize:13,
                                    color:"white",background:isLoading?"var(--muted)":"var(--green)",
                                    border:"none",borderRadius:8,padding:"8px 16px",
                                    cursor:isLoading?"not-allowed":"pointer",
                                    boxShadow:"0 2px 8px rgba(0,185,107,0.3)",
                                    whiteSpace:"nowrap",width:isMob?"100%":"auto",
                                  }}>
                                  {isLoading ? "Saving..." : "✓ Mark as bought"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"160px 1fr",gap:16,alignItems:"center"}}>
                        {/* Pie chart */}
                        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                          <svg viewBox="0 0 120 120" width={isMob?100:120} height={isMob?100:120} style={{transform:"rotate(-90deg)"}}>
                            <circle cx="60" cy="60" r="44" fill="none" stroke="var(--bg3)" strokeWidth="22"/>
                            {segments.map((seg,i)=>{
                              const circ = 2*Math.PI*44;
                              const dash = (seg.pct/100)*circ;
                              const offset = circ - (seg.start/100)*circ;
                              return (
                                <circle key={i} cx="60" cy="60" r="44" fill="none"
                                  stroke={seg.color} strokeWidth="22"
                                  strokeDasharray={`${dash} ${circ-dash}`}
                                  strokeDashoffset={offset}/>
                              );
                            })}
                          </svg>
                          <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",textAlign:"center"}}>allocation</div>
                        </div>

                        {/* ETF list */}
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,160px),1fr))",gap:8}}>
                          {tickers.map(t=>{
                            const meta = ETF_META[t]||{color:"#888",name:t};
                            const pct  = parseFloat(action.allocations?.[t])||25;
                            const dollars = action.amounts_invested?.[t] || Math.round(action.amount*pct/100);
                            const entryPrice = action.entry_prices?.[t];
                            const currentPrice = etfPool.find(r=>r.ticker===t)?.price;
                            const gain = entryPrice&&currentPrice ? ((currentPrice-entryPrice)/entryPrice*dollars) : null;
                            return (
                              <div key={t} style={{background:"white",borderRadius:10,padding:"10px 12px",border:`1.5px solid ${meta.color}22`}}>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                                  <span className="mono" style={{fontSize:13,color:meta.color,fontWeight:600}}>{t}</span>
                                  <span style={{fontFamily:"DM Sans",fontWeight:600,fontSize:14,color:"var(--text)"}}>${dollars}</span>
                                </div>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                  <span className="mono" style={{fontSize:10,color:"var(--muted2)"}}>{Math.round(pct)}%</span>
                                  {gain!==null
                                    ? <span className="mono" style={{fontSize:10,color:gain>=0?"var(--green)":"#ff4757",fontWeight:500}}>{gain>=0?"+":""}{gain.toFixed(2)}</span>
                                    : <span className="mono" style={{fontSize:9,color:"var(--muted2)"}}>pending</span>
                                  }
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legend */}
                      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:14,paddingTop:12,borderTop:"1px solid var(--border)"}}>
                        {tickers.map(t=>{
                          const meta = ETF_META[t]||{color:"#888",name:t};
                          return (
                            <div key={t} style={{display:"flex",alignItems:"center",gap:6}}>
                              <div style={{width:8,height:8,borderRadius:"50%",background:meta.color}}/>
                              <span style={{fontFamily:"DM Sans",fontSize:12,color:"var(--muted)"}}>{t} — {meta.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* ── Stock of the Month ─────────────────────────────────────────── */}
          {(() => {
            const stock = stockOfMonth || getStockOfMonth(); // DB first, fallback to hardcoded
            const monthName = new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"});
            return (
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{height:3,width:24,background:"var(--gold)",borderRadius:2}}/>
                    <div className="mono" style={{fontSize:11,letterSpacing:2,color:"var(--text)",fontWeight:500}}>STOCK OF THE MONTH</div>
                  </div>
                  <div className="mono" style={{fontSize:10,color:"var(--muted2)"}}>{monthName} · Not a recommendation</div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"300px 1fr",gap:14,alignItems:"start"}}>

                  {/* Flip card */}
                  <div
                    onClick={()=>setCardFlipped(f=>!f)}
                    style={{cursor:"pointer",perspective:"1000px",height:200}}
                  >
                    <div style={{
                      position:"relative",width:"100%",height:"100%",
                      transformStyle:"preserve-3d",
                      transition:"transform 0.6s cubic-bezier(0.4,0,0.2,1)",
                      transform: cardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}>
                      {/* Front */}
                      <div style={{
                        position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",
                        background:`linear-gradient(135deg, ${stock.color}22, ${stock.color}08)`,
                        border:`2px solid ${stock.color}44`,
                        borderRadius:16,padding:"clamp(18px,3vw,24px)",
                        display:"flex",flexDirection:"column",justifyContent:"space-between",
                      }}>
                        <div>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                            <div>
                              <div style={{fontFamily:"DM Mono",fontSize:24,fontWeight:700,color:stock.color,letterSpacing:"-0.5px"}}>{stock.ticker}</div>
                              <div style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted)",marginTop:2}}>{stock.name}</div>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:20,color:"var(--text)"}}>{stock.price!=null?"$"+Number(stock.price).toFixed(2):stock.price}</div>
                              <div style={{fontFamily:"DM Mono",fontSize:12,color:(stock.change_1m??0)>=0?"var(--green)":"#ff4757",fontWeight:500}}>{stock.change_1m!=null?(stock.change_1m>=0?"+":"")+(stock.change_1m*100).toFixed(1)+"%":stock.change} MTD</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:10}}>
                            {[{l:"Market Cap",v:stock.market_cap},{l:"P/E Ratio",v:stock.pe_ratio},{l:"YTD",v:stock.change_ytd!=null?((stock.change_ytd>=0?"+":"")+(stock.change_ytd*100).toFixed(1)+"%"):stock.ytd}].map(s=>(
                              <div key={s.l} style={{background:"rgba(0,0,0,0.04)",borderRadius:8,padding:"5px 10px"}}>
                                <div className="mono" style={{fontSize:8,color:"var(--muted2)",marginBottom:1}}>{s.l}</div>
                                <div style={{fontFamily:"DM Sans",fontWeight:600,fontSize:12,color:"var(--text)"}}>{s.v}</div>
                              </div>
                            ))}
                          </div>
                          <div className="mono" style={{fontSize:9,color:"var(--muted2)",textAlign:"center"}}>tap to flip ↺</div>
                        </div>
                      </div>

                      {/* Back */}
                      <div style={{
                        position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",
                        transform:"rotateY(180deg)",
                        background:"var(--text)",
                        borderRadius:16,padding:"clamp(18px,3vw,24px)",
                        display:"flex",flexDirection:"column",justifyContent:"space-between",
                      }}>
                        <div>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                            <span className="mono" style={{fontSize:14,color:stock.color,fontWeight:700}}>{stock.ticker}</span>
                            <span style={{fontFamily:"DM Mono",fontSize:9,padding:"2px 8px",borderRadius:6,background:`${stock.color}22`,color:stock.color}}>{stock.industry}</span>
                          </div>
                          <p style={{fontFamily:"DM Sans",fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.7,margin:0}}>
                            {stock.description}
                          </p>
                        </div>
                        <button
                          onClick={e=>{e.stopPropagation();setShowStockDetail(true);}}
                          style={{fontFamily:"DM Sans",fontWeight:600,fontSize:13,color:stock.color,background:`${stock.color}15`,border:`1px solid ${stock.color}33`,borderRadius:8,padding:"8px 0",cursor:"pointer",width:"100%"}}>
                          See full details →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Why notable */}
                  <div style={{background:"white",border:"1px solid var(--border)",borderRadius:16,padding:"clamp(16px,2.5vw,22px)",boxShadow:"var(--shadow)",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                    <div>
                      <div className="mono" style={{fontSize:9,color:"var(--muted2)",letterSpacing:1,marginBottom:10}}>WHY IT'S TRENDING</div>
                      <p style={{fontFamily:"DM Sans",fontSize:"clamp(13px,2vw,14px)",color:"var(--muted)",lineHeight:1.75,margin:0}}>{stock.why_notable}</p>
                    </div>
                    <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div className="mono" style={{fontSize:9,color:"var(--muted2)",marginBottom:3}}>INDUSTRY</div>
                        <div style={{fontFamily:"DM Sans",fontWeight:500,fontSize:13,color:"var(--text)"}}>{stock.industry}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div className="mono" style={{fontSize:9,color:"var(--muted2)",marginBottom:3}}>FOUNDED</div>
                        <div style={{fontFamily:"DM Sans",fontWeight:500,fontSize:13,color:"var(--text)"}}>{stock.founded}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div className="mono" style={{fontSize:9,color:"var(--muted2)",marginBottom:3}}>EMPLOYEES</div>
                        <div style={{fontFamily:"DM Sans",fontWeight:500,fontSize:13,color:"var(--text)"}}>{stock.employees}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock detail modal */}
                {showStockDetail && (
                  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setShowStockDetail(false)}>
                    <div style={{background:"white",borderRadius:20,padding:"clamp(24px,4vw,36px)",maxWidth:520,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
                        <div>
                          <div style={{fontFamily:"DM Mono",fontSize:22,fontWeight:700,color:stock.color}}>{stock.ticker}</div>
                          <div style={{fontFamily:"DM Sans",fontSize:14,color:"var(--muted)",marginTop:2}}>{stock.name}</div>
                        </div>
                        <button onClick={()=>setShowStockDetail(false)} style={{background:"var(--bg3)",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontFamily:"DM Mono",fontSize:12,color:"var(--muted)"}}>✕ close</button>
                      </div>

                      <div style={{background:`${stock.color}08`,border:`1px solid ${stock.color}22`,borderRadius:12,padding:"16px",marginBottom:20}}>
                        <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"repeat(3,1fr)",gap:10}}>
                          {[{l:"Price",v:stock.price!=null?"$"+Number(stock.price).toFixed(2):stock.price_display||"—"},{l:"MTD Change",v:stock.change,c:"var(--green)"},{l:"YTD",v:stock.ytd,c:"var(--green)"},{l:"Market Cap",v:stock.market_cap},{l:"P/E Ratio",v:stock.pe_ratio},{l:"Industry",v:stock.industry}].map(s=>(
                            <div key={s.l}>
                              <div className="mono" style={{fontSize:9,color:"var(--muted2)",marginBottom:3}}>{s.l}</div>
                              <div style={{fontFamily:"DM Sans",fontWeight:600,fontSize:13,color:s.c||"var(--text)"}}>{s.v}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <h3 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:8}}>About {stock.ticker}</h3>
                      <p style={{fontFamily:"DM Sans",fontSize:14,color:"var(--muted)",lineHeight:1.8,marginBottom:16}}>{stock.description}</p>

                      <h3 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:8}}>Why it's in the spotlight</h3>
                      <p style={{fontFamily:"DM Sans",fontSize:14,color:"var(--muted)",lineHeight:1.8,marginBottom:20}}>{stock.why_notable}</p>

                      <div style={{background:"var(--bg3)",borderRadius:10,padding:"12px 16px"}}>
                        <p style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",margin:0,lineHeight:1.7}}>
                          ⚠️ This is not a recommendation to buy or sell {stock.ticker}. ETF.PLAN is an ETF-focused tool. Individual stocks carry higher risk than diversified ETFs.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

        {/* ── Portfolio Growth Chart ──────────────────────────────────────── */}
          {monthlyHistory.length > 0 && (
            <div style={{background:"white",border:"1px solid var(--border)",borderRadius:16,padding:"clamp(18px,3vw,24px)",boxShadow:"var(--shadow2)",marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{height:3,width:24,background:"var(--green)",borderRadius:2}}/>
                  <div className="mono" style={{fontSize:11,letterSpacing:2,color:"var(--text)",fontWeight:500}}>PORTFOLIO GROWTH</div>
                </div>
                <button onClick={()=>setShowComparison(!showComparison)} style={{
                  fontFamily:"DM Mono",fontSize:10,color:"var(--green)",
                  background:"var(--green2)",border:"1px solid rgba(0,185,107,0.2)",
                  borderRadius:8,padding:"5px 12px",cursor:"pointer",
                }}>
                  {showComparison ? "Hide comparison" : "Compare plans →"}
                </button>
              </div>

              {!showComparison ? (
                // ── Actual portfolio chart ──────────────────────────────────
                (() => {
                  const invested = monthlyHistory.reduce((s,a)=>s+a.amount,0);
                  const chartPoints = [...monthlyHistory].reverse().map((action, i) => {
                    const tickers = action.tickers || [];
                    const currentVal = tickers.reduce((s,t)=>{
                      const ep = action.entry_prices?.[t];
                      const cp = etfPool.find(r=>r.ticker===t)?.price;
                      const dollars = action.amounts_invested?.[t] || Math.round(action.amount*(action.allocations?.[t]||25)/100);
                      return s + (ep&&cp ? dollars*(cp/ep) : dollars);
                    }, 0);
                    return { month: new Date(action.month_key+"-01").toLocaleDateString("en-US",{month:"short"}), invested: action.amount*(i+1), value: currentVal + action.amount*i };
                  });

                  const totalInvested = invested;
                  const estimatedValue = chartPoints[chartPoints.length-1]?.value || invested;
                  const gain = estimatedValue - totalInvested;
                  const gainPct = totalInvested > 0 ? (gain/totalInvested*100).toFixed(1) : "0.0";

                  return (
                    <div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                        {[
                          {l:"Total Invested",  v:fmt(totalInvested),  c:"var(--muted)"},
                          {l:"Current Value",   v:fmt(estimatedValue), c:"var(--text)"},
                          {l:"Total Gain",      v:`+${gainPct}%`,      c:"var(--green)"},
                        ].map(s=>(
                          <div key={s.l} style={{background:"var(--bg3)",borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
                            <div className="mono" style={{fontSize:9,color:"var(--muted2)",marginBottom:4}}>{s.l}</div>
                            <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(18px,3vw,26px)",color:s.c}}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={chartPoints} margin={{top:5,right:5,bottom:0,left:0}}>
                          <defs>
                            <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00b96b" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#00b96b" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#d4d4cc" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#d4d4cc" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" tick={{fontFamily:"DM Mono",fontSize:9,fill:"var(--muted2)"}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fontFamily:"DM Mono",fontSize:9,fill:"var(--muted2)"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
                          <Tooltip content={({active,payload,label})=>active&&payload?.length?(<div style={{background:"white",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",boxShadow:"var(--shadow)"}}>
                            <p style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",marginBottom:4}}>{label}</p>
                            {payload.map(p=>(<p key={p.name} style={{fontFamily:"DM Mono",fontSize:11,color:p.color}}>{p.name}: {fmt(p.value)}</p>))}
                          </div>):null}/>
                          <Area type="monotone" dataKey="invested" stroke="#d4d4cc" strokeWidth={1.5} fill="url(#gI)" name="Invested"/>
                          <Area type="monotone" dataKey="value" stroke="#00b96b" strokeWidth={2} fill="url(#gV)" name="Value"/>
                        </AreaChart>
                      </ResponsiveContainer>
                      <p className="mono" style={{fontSize:10,color:"var(--muted2)",textAlign:"center",marginTop:10}}>
                        Based on entry prices vs current prices · Updates daily at market close
                      </p>
                    </div>
                  );
                })()
              ) : (
                // ── Comparison mode ──────────────────────────────────────────
                <div>
                  <p style={{fontFamily:"DM Sans",fontSize:14,color:"var(--muted)",marginBottom:20,textAlign:"center"}}>
                    What would ${amount}/month look like over 5 years across all three plans?
                  </p>
                  <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"repeat(3,1fr)",gap:14,marginBottom:20}}>
                    {Object.entries(PROFILE_CONFIG).map(([key,p])=>{
                      const fb = FALLBACK_PLANS[key];
                      const gain5  = project(amount,fb.allocations,etfPool,60,false,p.targetReturn)-amount*60;
                      const total5 = project(amount,fb.allocations,etfPool,60,false,p.targetReturn);
                      const gain12 = project(amount,fb.allocations,etfPool,12,false,p.targetReturn)-amount*12;
                      const isActive = key===risk;
                      return (
                        <div key={key} style={{
                          border:`2px solid ${isActive?p.accentColor:"var(--border)"}`,
                          borderRadius:14,padding:"clamp(16px,2.5vw,22px)",
                          background:isActive?`${p.accentColor}05`:"white",
                          position:"relative",
                        }}>
                          {isActive && <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",fontFamily:"DM Mono",fontSize:9,background:p.accentColor,color:"white",padding:"2px 10px",borderRadius:10}}>YOUR PLAN</div>}
                          <div style={{textAlign:"center",marginBottom:14}}>
                            <div style={{fontSize:28,marginBottom:6}}>{p.icon}</div>
                            <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:18,color:"var(--text)"}}>{p.label}</div>
                            <div className="mono" style={{fontSize:11,color:p.accentColor,marginTop:2}}>{p.rate}</div>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",gap:10}}>
                            {[
                              {l:"After 12 months",  v:fmt(project(amount,fb.allocations,etfPool,12,false,p.targetReturn)), gain:fmt(gain12)},
                              {l:"After 5 years",    v:fmt(total5), gain:fmt(gain5)},
                            ].map(s=>(
                              <div key={s.l} style={{background:"var(--bg3)",borderRadius:8,padding:"10px 12px"}}>
                                <div className="mono" style={{fontSize:9,color:"var(--muted2)",marginBottom:3}}>{s.l.toUpperCase()}</div>
                                <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:20,color:"var(--text)"}}>{s.v}</div>
                                <div className="mono" style={{fontSize:10,color:"var(--green)"}}>+{s.gain} gain</div>
                              </div>
                            ))}
                          </div>
                          {key !== risk && (
                            <button onClick={()=>{ handlePlanChange(key,amount); setShowComparison(false); }} style={{
                              width:"100%",marginTop:12,padding:"10px 0",borderRadius:8,
                              border:`1px solid ${p.accentColor}44`,background:`${p.accentColor}08`,
                              color:p.accentColor,fontFamily:"DM Sans",fontWeight:600,fontSize:13,cursor:"pointer",
                            }}>
                              Switch to {p.label} →
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mono" style={{fontSize:10,color:"var(--muted2)",textAlign:"center"}}>
                    Based on target annual returns · ${amount}/month · Past performance ≠ future results
                  </p>
                </div>
              )}
            </div>
          )}

        {/* ── Market News ───────────────────────────────────────────────────── */}
          <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:16,padding:"clamp(16px,3vw,22px)",marginBottom:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{height:3,width:24,background:"var(--green)",borderRadius:2}}/>
                <div className="mono" style={{fontSize:11,letterSpacing:2,color:"var(--text)",fontWeight:500}}>MARKET NEWS</div>
              </div>
              <a href="https://finance.yahoo.com/topic/etfs/" target="_blank" rel="noreferrer"
                style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",letterSpacing:0.5,whiteSpace:"nowrap"}}>
                via Yahoo Finance ↗
              </a>
            </div>
            {newsLoading ? (
              <div style={{display:"flex",gap:10,flexDirection:"column"}}>
                {[1,2,3].map(i=>(
                  <div key={i} style={{height:52,background:"var(--bg3)",borderRadius:8,animation:"pulse 1.5s infinite"}}/>
                ))}
              </div>
            ) : news.length === 0 ? (
              <div style={{fontFamily:"DM Sans",fontSize:14,color:"var(--muted2)",textAlign:"center",padding:"20px 0"}}>No news available right now</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column"}}>
                {news.map((item,i)=>(
                  <a key={i} href={item.link} target="_blank" rel="noreferrer"
                    style={{display:"block",textDecoration:"none",padding:"clamp(10px,2vw,13px) 0",borderBottom:i<news.length-1?"1px solid var(--border)":"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:isMob?8:16}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{
                          fontFamily:"DM Sans",fontSize:"clamp(14px,2vw,15px)",fontWeight:500,
                          color:"var(--text)",lineHeight:1.55,marginBottom:isMob?0:3,
                          // On mobile: clamp to 2 lines
                          display:"-webkit-box",WebkitLineClamp:isMob?2:3,
                          WebkitBoxOrient:"vertical",overflow:"hidden",
                        }}>
                          {item.title}
                        </div>
                        {!isMob && item.desc && (
                          <div style={{fontFamily:"DM Sans",fontSize:12,color:"var(--muted2)",lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {item.desc}
                          </div>
                        )}
                      </div>
                      <div style={{flexShrink:0,textAlign:"right",minWidth:isMob?32:48}}>
                        {!isMob && (
                          <div style={{fontFamily:"DM Mono",fontSize:9,color:"var(--muted2)",whiteSpace:"nowrap",marginBottom:2}}>
                            {item.pubDate ? new Date(item.pubDate).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : ""}
                          </div>
                        )}
                        <div style={{fontFamily:"DM Mono",fontSize:11,color:"var(--green)"}}>↗</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>


          {/* Macro strip — dark style like homepage */}
          {macroData && (
            <div style={{background:"var(--text)",borderRadius:16,padding:"clamp(18px,3vw,24px) clamp(16px,3vw,28px)",marginTop:4}}>
              <div style={{display:"flex",gap:isMob?16:40,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
                <div className="mono" style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,0.3)"}}>MACRO — FRED</div>
                <div style={{display:"flex",gap:isMob?20:40,flexWrap:"wrap"}}>
                  {[
                    {l:"CPI Inflation",  v:fmtPct(macroData.inflation), c:"#ff6b6b"},
                    {l:"Fed Funds Rate", v:fmtPct(macroData.fed_rate),  c:"#a78bfa"},
                    {l:"Real Drag",      v:`−${fmtPct(macroData.inflation)}`, c:"#fbbf24"},
                    {l:"CPI Date",       v:macroData.cpi_date||"—",     c:"rgba(255,255,255,0.4)"},
                  ].map(x=>(
                    <div key={x.l}>
                      <div style={{fontFamily:"DM Mono",fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:4,letterSpacing:0.5}}>{x.l}</div>
                      <div style={{fontFamily:"DM Mono",fontSize:isMob?14:17,fontWeight:600,color:x.c}}>{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Instagram link in footer */}
              <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",marginTop:16,paddingTop:14,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                <a href="https://www.instagram.com/etfplan/" target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:7,fontFamily:"DM Sans",fontSize:12,color:"rgba(255,255,255,0.4)",textDecoration:"none"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                  </svg>
                  Follow @etfplan on Instagram
                </a>
                <span style={{fontFamily:"DM Mono",fontSize:9,color:"rgba(255,255,255,0.2)"}}>Not financial advice · Past performance ≠ future results</span>
              </div>
            </div>
          )}


        </>}

        {view === "library" && (
          <div style={{maxWidth:900,margin:"0 auto"}}>
            {/* Library header */}
            <div style={{background:"var(--text)",borderRadius:16,padding:"clamp(24px,4vw,36px)",marginBottom:24}}>
              <div className="mono" style={{fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:10}}>RESOURCE LIBRARY</div>
              <h2 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(26px,5vw,40px)",color:"white",margin:"0 0 8px",letterSpacing:"-1px",lineHeight:1.1}}>
                Everything you need to invest smarter 📚
              </h2>
              <p style={{fontFamily:"DM Sans",fontSize:"clamp(14px,2vw,17px)",color:"rgba(255,255,255,0.45)",margin:0,lineHeight:1.7}}>
                From opening your first brokerage account to understanding ETF strategies — all in one place.
              </p>
            </div>

            {/* ── HOW TO BUY YOUR FIRST ETF ── */}
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <div style={{height:3,width:24,background:"var(--green)",borderRadius:2}}/>
                <div className="mono" style={{fontSize:11,letterSpacing:2,color:"var(--text)",fontWeight:500}}>HOW TO BUY YOUR FIRST ETF</div>
              </div>

              {/* Pinned CTA card */}
              <div style={{background:"linear-gradient(135deg,rgba(0,185,107,0.08),rgba(0,185,107,0.02))",border:"1.5px solid rgba(0,185,107,0.25)",borderRadius:16,padding:"clamp(20px,3vw,28px)",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16,marginBottom:20}}>
                  <div>
                    <h3 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(18px,3vw,24px)",color:"var(--text)",margin:"0 0 8px",letterSpacing:"-0.3px"}}>
                      Never bought an ETF before? Start here.
                    </h3>
                    <p style={{fontFamily:"DM Sans",fontSize:"clamp(13px,2vw,15px)",color:"var(--muted)",margin:0,lineHeight:1.7}}>
                      Follow these 4 steps and you'll be invested in your first ETF in under 15 minutes.
                    </p>
                  </div>
                  <div className="mono" style={{fontSize:10,padding:"4px 12px",borderRadius:10,background:"rgba(0,185,107,0.1)",color:"var(--green)",border:"1px solid rgba(0,185,107,0.2)",whiteSpace:"nowrap",alignSelf:"flex-start"}}>
                    ⏱ 15 min · One time setup
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"repeat(2,1fr)",gap:10}}>
                  {[
                    { n:"01", icon:"🏦", title:"Choose your platform", desc:"Open a free account on Robinhood, eToro, Vanguard or Interactive Brokers. All are regulated, commission-free for ETFs and take under 10 minutes to sign up.", link:"/guide/platforms", cta:"Compare platforms →", color:"#3b82f6" },
                    { n:"02", icon:"💳", title:"Fund your account", desc:"Connect your bank account and transfer your first month's amount ($50, $100 or $150). Most platforms process transfers in 1–3 business days.", link:null, cta:null, color:"#c9a84c" },
                    { n:"03", icon:"🔍", title:"Search your ETF ticker", desc:"In the search bar, type the ticker symbol from your plan — e.g. VOO, QQQ or VTI. Click the result to open the ETF page.", link:null, cta:null, color:"#8b5cf6" },
                    { n:"04", icon:"✅", title:"Buy the dollar amount", desc:"Select 'Buy', choose 'Dollar amount' (not shares), type your allocated amount (e.g. $40), confirm and submit. You're now an investor.", link:null, cta:null, color:"#00b96b" },
                  ].map(step=>(
                    <div key={step.n} style={{background:"white",borderRadius:12,padding:"clamp(14px,2.5vw,18px)",border:`1px solid ${step.color}22`,boxShadow:"var(--shadow)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:32,height:32,borderRadius:10,background:`${step.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{step.icon}</div>
                          <div>
                            <div className="mono" style={{fontSize:9,color:step.color,letterSpacing:1,marginBottom:1}}>STEP {step.n}</div>
                            <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(14px,2vw,15px)",color:"var(--text)"}}>{step.title}</div>
                          </div>
                        </div>
                      </div>
                      <div style={{fontFamily:"DM Sans",fontSize:"clamp(12px,1.8vw,13px)",color:"var(--muted)",lineHeight:1.75}}>{step.desc}</div>
                      {step.link && (
                        <Link href={step.link} style={{display:"inline-block",fontFamily:"DM Mono",fontSize:11,color:step.color,marginTop:10,textDecoration:"none",fontWeight:500}}>{step.cta}</Link>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{marginTop:16,padding:"12px 16px",background:"rgba(0,0,0,0.03)",borderRadius:10,border:"1px solid var(--border)"}}>
                  <p style={{fontFamily:"DM Sans",fontSize:"clamp(11px,1.8vw,13px)",color:"var(--muted2)",margin:0,lineHeight:1.7}}>
                    💡 <strong style={{color:"var(--text)"}}>Tip:</strong> Set up a monthly automatic transfer from your bank to your broker on the same day each month. Then just log in once and buy — takes 2 minutes after the first time.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Quick guides ── */}
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <div style={{height:3,width:24,background:"#3b82f6",borderRadius:2}}/>
                <div className="mono" style={{fontSize:11,letterSpacing:2,color:"var(--text)",fontWeight:500}}>GUIDES</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"repeat(2,1fr)",gap:12}}>
                {[
                  { icon:"🧭", title:"What are ETFs?", desc:"The complete beginner's guide. What they are, why they work, and how to start with $50/month.", link:"/guide/what-are-etfs", tag:"Beginner", color:"#00b96b" },
                  { icon:"⚖️", title:"Picking your risk level", desc:"Conservative vs Balanced vs Aggressive — what the numbers actually mean for your money.", link:"/guide/risk-levels", tag:"Beginner", color:"#3b82f6" },
                  { icon:"🏦", title:"Which platform to use", desc:"Robinhood, eToro, Vanguard, Interactive Brokers — fees, features and who each is best for.", link:"/guide/platforms", tag:"Beginner", color:"#c9a84c" },
                  { icon:"📈", title:"Dollar-cost averaging", desc:"Why investing the same amount every month beats trying to time the market — with real data.", link:"/guide/dollar-cost-averaging", tag:"Strategy", color:"#8b5cf6" },
                ].map(g=>(
                  <Link key={g.title} href={g.link} style={{
                    display:"block",textDecoration:"none",
                    background:"white",border:"1px solid var(--border)",borderRadius:14,
                    padding:"clamp(16px,2.5vw,22px)",boxShadow:"var(--shadow)",
                    transition:"transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="var(--shadow2)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="var(--shadow)";}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <span style={{fontSize:26}}>{g.icon}</span>
                      <span style={{fontFamily:"DM Mono",fontSize:10,padding:"3px 10px",borderRadius:6,background:`${g.color}10`,color:g.color,border:`1px solid ${g.color}22`}}>{g.tag}</span>
                    </div>
                    <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(15px,2.5vw,17px)",color:"var(--text)",marginBottom:8}}>{g.title}</div>
                    <div style={{fontFamily:"DM Sans",fontSize:"clamp(13px,2vw,14px)",color:"var(--muted)",lineHeight:1.75}}>{g.desc}</div>
                    <div style={{fontFamily:"DM Mono",fontSize:11,color:"var(--green)",marginTop:12,fontWeight:500}}>Read guide →</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ETF Glossary */}
            <div style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <div style={{height:3,width:24,background:"var(--gold)",borderRadius:2}}/>
                <div className="mono" style={{fontSize:11,letterSpacing:2,color:"var(--text)",fontWeight:500}}>YOUR ETFs — CLICK FOR FULL DETAILS</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:isMob?"repeat(2,1fr)":"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
                {Object.entries(ETF_META).filter(([,m])=>!m.leveraged).slice(0,8).map(([ticker,meta])=>(
                  <Link key={ticker} href={`/etf/${ticker}`} style={{
                    display:"block",textDecoration:"none",
                    background:"white",border:`1.5px solid ${meta.color}22`,borderRadius:12,
                    padding:"clamp(14px,2vw,18px)",boxShadow:"var(--shadow)",
                    transition:"transform 0.15s",
                  }}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform=""}>
                    <div style={{fontFamily:"DM Mono",fontSize:14,color:meta.color,fontWeight:600,marginBottom:5}}>{ticker}</div>
                    <div style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted)",marginBottom:8}}>{meta.name}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontFamily:"DM Mono",fontSize:9,color:"var(--muted2)"}}>{meta.risk} risk</span>
                      <span style={{fontFamily:"DM Mono",fontSize:9,color:"var(--green)"}}>Details →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Key concepts */}
            <div style={{background:"white",border:"1px solid var(--border)",borderRadius:16,padding:"clamp(18px,3vw,24px)",boxShadow:"var(--shadow2)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <div style={{height:3,width:24,background:"#8b5cf6",borderRadius:2}}/>
                <div className="mono" style={{fontSize:12,letterSpacing:2,color:"var(--text)",fontWeight:500}}>KEY CONCEPTS — INVESTING GLOSSARY</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {[
                  { term:"CAGR", def:"Compound Annual Growth Rate — the average yearly return assuming reinvestment. A CAGR of 10% means $100 becomes $110 after year 1, $121 after year 2, not $120." },
                  { term:"Expense Ratio", def:"The annual fee the ETF charges, taken from your returns. VOO charges 0.03% — for every $1,000 invested, you pay just $0.30/year." },
                  { term:"Momentum", def:"How much a stock or ETF has moved recently. Positive 1M momentum means it's been rising this month. Our engine uses this to pick this week's ETFs." },
                  { term:"Dollar-Cost Averaging", def:"Investing the same amount every month regardless of price. Proven to outperform trying to time the market for most investors." },
                  { term:"Diversification", def:"Spreading money across many assets so no single failure destroys your portfolio. VTI owns 3,700 companies — if one fails, 3,699 others cover it." },
                  { term:"Leveraged ETF", def:"Amplifies daily returns by 2x or 3x using derivatives. TQQQ goes up 3% when QQQ goes up 1% — but also down 3% when QQQ drops 1%. High risk." },
                ].map((c,i,arr)=>(
                  <div key={c.term} style={{padding:"14px 0",borderBottom:i<arr.length-1?"1px solid var(--bg3)":"none"}}>
                    <div style={{fontFamily:"DM Sans",fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:5}}>{c.term}</div>
                    <div style={{fontFamily:"DM Sans",fontSize:14,color:"var(--muted)",lineHeight:1.8}}>{c.def}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "plan" && <>

          {/* Plan header */}
          <div style={{display:"flex",flexDirection:isMob?"column":"row",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,borderBottom:"1px solid var(--border)",paddingBottom:20,gap:16}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{background:pc.accentColor==="var(--gold)"?"linear-gradient(135deg,#c9a84c,#e8c96a)":pc.accentColor,padding:"6px 14px",display:"inline-block"}}>
                  <span style={{fontFamily:"'Press Start 2P', monospace",fontSize:10,color:"white",letterSpacing:1}}>{pc.label.toUpperCase()}</span>
                </div>
                <span style={{fontSize:28}}>{pc.icon}</span>
              </div>
              <h2 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:isMob?"clamp(24px,5vw,30px)":"clamp(28px,4vw,38px)",color:"var(--text)",margin:0,letterSpacing:"-1px"}}>Investment Plan</h2>
              <div style={{fontFamily:"DM Mono",fontSize:12,color:"var(--muted)",marginTop:6}}>
                {fmt(amount)}/month · {currentSel?.week_start ? `As of ${new Date(currentSel.week_start).toLocaleDateString('en-US',{month:'short',day:'numeric'})}` : "Estimated"} · {etfPool.length>0?"Live data":"Estimated data"}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div style={{fontFamily:"DM Mono",fontSize:11,color:"var(--muted2)"}}>12-MONTH EXPECTED</div>
                <div style={{fontFamily:"DM Mono",fontSize:9,padding:"2px 8px",borderRadius:10,background:`${pc.accentColor}15`,color:pc.accentColor}}>~{Math.round((pc.targetReturn||0.09)*100)}% / year target</div>
              </div>
              <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:isMob?36:48,color:projs[12].exp > amount*12 ? "var(--green)" : "#ff4757",lineHeight:1}}>{fmt(projs[12].exp)}</div>
              <div style={{fontFamily:"DM Mono",fontSize:11,color:"var(--green)",marginTop:4}}>optimistic → {fmt(projs[12].opt)}</div>
              <div style={{fontFamily:"DM Mono",fontSize:11,color:"var(--green)",marginTop:2}}>+{fmt(projs[12].exp - amount*12)} gain</div>
            </div>
          </div>

          {/* Risk warning */}
          {pc.warning && (
            <div style={{marginBottom:24,padding:"14px 18px",background:"rgba(255,71,87,0.04)",border:"1.5px solid rgba(255,71,87,0.2)",borderRadius:12}}>
              <div style={{fontFamily:"DM Sans",fontSize:13,color:"#cc3344",lineHeight:1.7}}>{pc.warning}</div>
            </div>
          )}

          {/* Projection cards */}
          <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"repeat(3,1fr)",gap:12,marginBottom:20}}>
            {[1,6,12].map(mo=>(
              <div key={mo} style={card}>
                <div style={lbl}>{mo===60?"5 YEARS":mo+" MONTH"+(mo===1?"":"S")}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",marginBottom:2}}>Invested</div>
                    <div style={{fontFamily:"DM Sans",fontSize:"clamp(16px,3vw,22px)",color:"var(--muted)"}}>{fmt(amount*mo)}</div>
                  </div>
                </div>
                <div style={{height:1,background:"var(--border)",marginBottom:10}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div>
                    <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",marginBottom:2}}>Expected</div>
                    <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(20px,3vw,26px)",color:"var(--text)"}}>{fmt(projs[mo].exp)}</div>
                    <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--green)"}}>+{fmt(projs[mo].exp-amount*mo)}</div>
                  </div>
                  <div>
                    <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",marginBottom:2}}>Optimistic</div>
                    <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(20px,3vw,26px)",color:"var(--green)"}}>{fmt(projs[mo].opt)}</div>
                    <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--green)"}}>+{fmt(projs[mo].opt-amount*mo)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{...card,marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"DM Sans",fontWeight:600,fontSize:18,color:"var(--text)"}}>24-Month Growth Projection</div>
              <div style={{display:"flex",gap:16}}>
                {[{l:"Invested",c:"#d4d4cc"},{l:"Expected",c:"#3b82f6"},{l:"Optimistic",c:"#00b96b"}].map(x=>(
                  <div key={x.l} style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:20,height:2,background:x.c}}/>
                    <span style={{fontFamily:"DM Mono",fontSize:9,color:"var(--muted)"}}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  {[["gO","#00b96b"],["gE","#3b82f6"],["gI","#d4d4cc"]].map(([id,c])=>(
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={c} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={c} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="month" tick={{fontFamily:"DM Mono",fontSize:9,fill:"var(--muted2)"}} axisLine={false} tickLine={false} tickFormatter={v=>`M${v}`}/>
                <YAxis tick={{fontFamily:"DM Mono",fontSize:9,fill:"var(--muted2)"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(1)}k`}/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="invested"   stroke="#d4d4cc" strokeWidth={1.5} fill="url(#gI)" name="Invested"/>
                <Area type="monotone" dataKey="expected"   stroke="#3b82f6" strokeWidth={2}   fill="url(#gE)" name="Expected"/>
                <Area type="monotone" dataKey="optimistic" stroke="#00b96b" strokeWidth={2}   fill="url(#gO)" name="Optimistic" strokeDasharray="5 3"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ETF breakdown */}
          <div style={{marginBottom:20}}>
            <div style={lbl}>THIS WEEK'S ETF SELECTION</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
              {curTickers.map(t=>{
                const row   = etfPool.find(r=>r.ticker===t);
                const meta  = ETF_META[t]||{name:t,color:"#888",leveraged:false,risk:"—",category:"—",fallbackCagr:0.13,fallbackOpt:0.18,topHoldings:[],description:""};
                const isNew = addedETFs.includes(t);
                const cagr  = row?.cagr ?? meta.fallbackCagr;
                const realC = row?.real_cagr ?? (meta.fallbackCagr - 0.03);
                return (
                  <div key={t} style={{...card,border:`1.5px solid ${isNew?"rgba(0,185,107,0.35)":meta.color+"44"}`,padding:20,position:"relative"}}>
                    {isNew && <div style={{position:"absolute",top:-10,right:12,fontFamily:"DM Mono",fontSize:9,background:"#00b96b",color:"white",padding:"3px 10px",borderRadius:10,boxShadow:"0 2px 8px rgba(0,185,107,0.3)"}}>NEW THIS WEEK</div>}

                    {/* Header */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontFamily:"DM Mono",fontSize:18,color:meta.color,fontWeight:500}}>{t}</span>
                        {meta.leveraged && <span style={{fontFamily:"DM Mono",fontSize:9,padding:"2px 7px",borderRadius:4,background:"rgba(255,71,87,0.1)",color:"#ff4757",border:"1px solid rgba(255,71,87,0.2)"}}>3X LEV</span>}
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"DM Mono",fontSize:16,color:"var(--text)",fontWeight:500}}>{fmtD(row?.price)}</div>
                        <div style={{fontFamily:"DM Mono",fontSize:10,color:row?.change_pct>=0?"var(--green)":"#ff4757"}}>{fmtPct(row?.change_pct)}</div>
                      </div>
                    </div>

                    {/* Name + description */}
                    <div style={{fontFamily:"DM Sans",fontWeight:500,fontSize:15,color:"var(--text)",marginBottom:4}}>{meta.name}</div>
                    <div style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted)",lineHeight:1.6,marginBottom:14}}>{meta.description}</div>

                    {/* Stats grid */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:14}}>
                      {[
                        {l:"CAGR",   v:fmtPct(cagr),                             c:"var(--text)"},
                        {l:"Real",   v:fmtPct(realC),                            c:"var(--green)"},
                        {l:"1M Mom", v:fmtPct(row?.mom_1m),                      c:(row?.mom_1m??0)>=0?"var(--green)":"#ff4757"},
                        {l:"YTD",    v:fmtPct(row?.ytd),                         c:(row?.ytd??0)>=0?"var(--green)":"#ff4757"},
                      ].map(x=>(
                        <div key={x.l} style={{background:"var(--bg3)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
                          <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",marginBottom:4}}>{x.l}</div>
                          <div style={{fontFamily:"DM Mono",fontSize:13,color:x.c,fontWeight:500}}>{x.v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Top holdings */}
                    {meta.topHoldings?.length > 0 && (
                      <div style={{marginBottom:14}}>
                        <div style={{fontFamily:"DM Mono",fontSize:9,color:"var(--muted2)",marginBottom:6,letterSpacing:1}}>TOP HOLDINGS</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                          {meta.topHoldings.map(h=>(
                            <span key={h} style={{fontFamily:"DM Sans",fontSize:12,padding:"4px 10px",background:"var(--bg3)",borderRadius:6,color:"var(--muted)",border:"1px solid var(--border)"}}>{h}</span>
                          ))}
                        </div>
                      </div>
                    )}



                    <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",marginTop:10,display:"flex",justifyContent:"space-between"}}>
                      <span>{meta.risk} risk</span>
                      <span>{meta.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real Portfolio Chart — what was actually bought */}
          <div style={{marginBottom:20}}>
          {(() => {
            const boughtMonths = [...monthlyHistory].filter(a => a.entry_prices && Object.values(a.entry_prices).some(v=>v!=null)).reverse();
            const hasBought = boughtMonths.length > 0;

            // Build chart: for each bought month, calculate current value
            const portfolioData = boughtMonths.map((action, i) => {
              const invested = action.amount || amount;
              let currentValue = 0;
              (action.tickers || []).forEach(t => {
                const entryPrice   = action.entry_prices?.[t];
                const currentPrice = etfPool.find(r=>r.ticker===t)?.price;
                const dollars      = action.amounts_invested?.[t] || Math.round(invested * (parseFloat(action.allocations?.[t]) || 25) / 100);
                if (entryPrice && currentPrice) {
                  currentValue += dollars * (currentPrice / entryPrice);
                } else {
                  currentValue += dollars; // no price data yet — flat
                }
              });
              return {
                label: new Date(action.month_key+"-01").toLocaleDateString("en-US",{month:"short",year:"2-digit"}),
                invested,
                value: Math.round(currentValue),
                gain: Math.round(currentValue - invested),
              };
            });

            // Running totals
            let runInvested = 0, runValue = 0;
            const cumulativeData = portfolioData.map(d => {
              runInvested += d.invested;
              runValue    += d.value;
              return { label: d.label, invested: runInvested, value: runValue, gain: runValue - runInvested };
            });

            const totalInvested = runInvested;
            const totalValue    = runValue;
            const totalGain     = totalValue - totalInvested;
            const totalGainPct  = totalInvested > 0 ? (totalGain / totalInvested * 100) : 0;

            return (
              <div style={card}>
                <div style={{display:"flex",flexDirection:isMob?"column":"row",justifyContent:"space-between",alignItems:isMob?"flex-start":"center",marginBottom:20,gap:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{height:3,width:20,background:"var(--green)",borderRadius:2}}/>
                    <div style={lbl}>MY PORTFOLIO</div>
                  </div>
                  {hasBought && (
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:12,width:isMob?"100%":"auto"}}>
                      {[
                        {label:"INVESTED",  value:fmt(totalInvested), color:"var(--text)"},
                        {label:"VALUE NOW",  value:fmt(totalValue),    color:"var(--green)"},
                        {label:"TOTAL GAIN", value:(totalGain>=0?"+":"")+fmt(totalGain), color:totalGain>=0?"var(--green)":"#ff4757"},
                      ].map(s=>(
                        <div key={s.label} style={{background:"var(--bg3)",borderRadius:8,padding:"8px 12px"}}>
                          <div style={{fontFamily:"DM Mono",fontSize:9,color:"var(--muted2)",marginBottom:3}}>{s.label}</div>
                          <div style={{fontFamily:"DM Mono",fontSize:15,color:s.color,fontWeight:600}}>{s.value}</div>
                          {s.label==="TOTAL GAIN" && <div style={{fontFamily:"DM Mono",fontSize:10,color:s.color}}>{totalGainPct>=0?"+":""}{totalGainPct.toFixed(1)}%</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!hasBought ? (
                  <div style={{textAlign:"center",padding:"40px 20px"}}>
                    <div style={{fontSize:32,marginBottom:12}}>📊</div>
                    <div style={{fontFamily:"DM Sans",fontWeight:600,fontSize:15,color:"var(--text)",marginBottom:8}}>No purchases tracked yet</div>
                    <div style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted)",lineHeight:1.7,maxWidth:320,margin:"0 auto"}}>
                      Go to your monthly history and click <strong>"✓ Mark as bought"</strong> after each purchase to start tracking your real portfolio value here.
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Area chart */}
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={cumulativeData} margin={{top:10,right:10,left:0,bottom:0}}>
                        <defs>
                          <linearGradient id="pgValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00b96b" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#00b96b" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="pgInvested" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="label" tick={{fontFamily:"DM Mono",fontSize:10,fill:"#aaa"}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fontFamily:"DM Mono",fontSize:10,fill:"#aaa"}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+v}/>
                        <Tooltip formatter={(v,n)=>["$"+v.toFixed(0), n==="value"?"Portfolio Value":"Invested"]} contentStyle={{fontFamily:"DM Sans",fontSize:12,borderRadius:8,border:"1px solid var(--border)"}}/>
                        <Area type="monotone" dataKey="invested" stroke="#94a3b8" strokeWidth={1.5} fill="url(#pgInvested)" strokeDasharray="4 2" name="invested"/>
                        <Area type="monotone" dataKey="value" stroke="#00b96b" strokeWidth={2} fill="url(#pgValue)" name="value"/>
                      </AreaChart>
                    </ResponsiveContainer>

                    {/* Month breakdown */}
                    <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:8}}>
                      {portfolioData.map((d,i) => {
                        const action = boughtMonths[i];
                        return (
                          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:"var(--bg3)",borderRadius:10,flexWrap:"wrap",gap:6}}>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <div style={{fontFamily:"DM Mono",fontSize:12,color:"var(--text)",fontWeight:500}}>{d.label}</div>
                              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                                {(action.tickers||[]).map(t=>(
                                  <span key={t} style={{fontFamily:"DM Mono",fontSize:9,padding:"2px 6px",borderRadius:4,background:(ETF_META[t]?.color||"#888")+"22",color:ETF_META[t]?.color||"#888",border:`1px solid ${ETF_META[t]?.color||"#888"}44`}}>{t}</span>
                                ))}
                              </div>
                            </div>
                            <div style={{display:"flex",gap:16,alignItems:"center"}}>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontFamily:"DM Mono",fontSize:9,color:"var(--muted2)"}}>BOUGHT</div>
                                <div style={{fontFamily:"DM Mono",fontSize:13,color:"var(--text)"}}>{fmt(d.invested)}</div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontFamily:"DM Mono",fontSize:9,color:"var(--muted2)"}}>NOW WORTH</div>
                                <div style={{fontFamily:"DM Mono",fontSize:13,color:"var(--green)"}}>{fmt(d.value)}</div>
                              </div>
                              <div style={{fontFamily:"DM Mono",fontSize:12,color:d.gain>=0?"var(--green)":"#ff4757",fontWeight:600,minWidth:60,textAlign:"right"}}>
                                {d.gain>=0?"+":""}{fmt(d.gain)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
          </div>

          {/* Month-by-month projection — mobile cards, desktop table */}
          <div style={{...card,marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{height:3,width:20,background:"var(--gold)",borderRadius:2}}/>
                <div style={lbl}>12-MONTH PROJECTION</div>
              </div>
              <span style={{fontFamily:"DM Mono",fontSize:9,color:"var(--muted2)",padding:"3px 10px",borderRadius:8,background:"var(--bg3)"}}>AT {Math.round((pc.targetReturn||0.09)*100)}% TARGET RETURN</span>
            </div>

            {isMob ? (
              /* Mobile: card grid */
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {tableData.map(row => {
                  const active = row.month === activeMonth;
                  return (
                    <div key={row.month} onClick={()=>setActiveMonth(row.month)}
                      style={{
                        background: active ? "rgba(0,185,107,0.04)" : "var(--bg3)",
                        border: `1.5px solid ${active ? "rgba(0,185,107,0.3)" : "var(--border)"}`,
                        borderRadius:10, padding:"10px 12px", cursor:"pointer",
                      }}>
                      <div style={{fontFamily:"DM Mono",fontSize:11,color:active?"var(--green)":"var(--muted2)",marginBottom:4,fontWeight:active?600:400}}>{row.label}</div>
                      <div style={{fontFamily:"DM Mono",fontSize:14,color:"var(--text)",fontWeight:600,marginBottom:2}}>{fmt(row.expected)}</div>
                      <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--green)"}}>+{fmt(row.gain)}</div>
                      <div style={{fontFamily:"DM Mono",fontSize:9,color:"var(--muted2)",marginTop:2}}>{fmt(row.invested)} in</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Desktop: table */
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr>{["Month","Invested","Expected","Optimistic","Gain"].map(h=>(
                      <th key={h} style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",textAlign:"left",paddingBottom:10,letterSpacing:1,fontWeight:400}}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {tableData.map(row=>{
                      const active=row.month===activeMonth;
                      return (
                        <tr key={row.month} onClick={()=>setActiveMonth(row.month)}
                          style={{background:active?"rgba(0,185,107,0.03)":"transparent",cursor:"pointer",borderTop:"1px solid var(--border)"}}>
                          <td style={{padding:"9px 8px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <div style={{width:4,height:4,borderRadius:"50%",background:active?"var(--green)":"var(--border)"}}/>
                              <span style={{fontFamily:"DM Mono",fontSize:13,color:active?"var(--green)":"var(--muted)"}}>{row.label}</span>
                            </div>
                          </td>
                          <td style={{padding:"9px 8px",fontFamily:"DM Mono",fontSize:12,color:"var(--muted)"}}>{fmt(row.invested)}</td>
                          <td style={{padding:"9px 8px",fontFamily:"DM Mono",fontSize:12,color:"var(--text)",fontWeight:500}}>{fmt(row.expected)}</td>
                          <td style={{padding:"9px 8px",fontFamily:"DM Mono",fontSize:12,color:"var(--green)"}}>{fmt(row.optimistic)}</td>
                          <td style={{padding:"9px 8px"}}>
                            <span style={{fontFamily:"DM Mono",fontSize:11,color:"var(--green)",background:"rgba(0,185,107,0.06)",padding:"3px 8px",borderRadius:4}}>+{fmt(row.gain)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted2)",textAlign:"center",marginTop:28,lineHeight:1.6}}>
            ⚠️ Selections updated weekly based on momentum, volatility and trend scoring across 18 ETFs.
            Past performance does not guarantee future results. Not financial advice.
          </p>
        </>}
      </div>
    </div>
  );
}
