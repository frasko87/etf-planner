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
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const load = async () => {
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
      const [{ data:savedPlan }, { data:history }] = await Promise.all([
        supabase.from("user_plans").select("*").eq("user_id", user.id).single(),
        supabase.from("user_monthly_actions").select("*").eq("user_id", user.id).order("month_key", { ascending:false }).limit(6),
      ]);

      if (savedPlan) {
        setUserPlan(savedPlan);
        setAmount(savedPlan.amount);
        setRisk(savedPlan.profile);
        setMonthlyHistory(history || []);
      } else {
        // First time user — show onboarding
        setShowOnboarding(true);
      }

      setLoading(false);
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

  const handleOnboardingComplete = ({ profile, amount: amt }) => {
    setRisk(profile);
    setAmount(amt);
    setUserPlan({ profile, amount: amt });
    setShowOnboarding(false);
  };

  const handlePlanChange = async (newProfile, newAmount) => {
    setRisk(newProfile);
    setAmount(newAmount);
    await supabase.from("user_plans").upsert({
      user_id: user.id, profile: newProfile, amount: newAmount,
      updated_at: new Date().toISOString(),
    });
    setUserPlan({ profile: newProfile, amount: newAmount });
  };
  const width  = useWindowWidth();
  const isMob  = width < 640;
  const isTab  = width < 1024;

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

  // Normalize allocations — handle JSONB from Supabase (may have string values or missing keys)
  const rawAllocs = currentSel?.allocations || {};
  const allocSum  = Object.values(rawAllocs).reduce((a,b) => a + (parseFloat(b)||0), 0);
  const allocs    = (() => {
    // If DB has valid allocations with correct tickers, use them
    if (allocSum > 50 && curTickers.every(t => rawAllocs[t] != null)) {
      const normalized = {};
      curTickers.forEach(t => { normalized[t] = parseFloat(rawAllocs[t]) || 0; });
      return normalized;
    }
    // Otherwise distribute equally among selected tickers
    const equal = {};
    const base  = Math.floor(100 / curTickers.length / 5) * 5;
    let rem     = 100;
    curTickers.forEach((t,i) => {
      equal[t] = i === curTickers.length-1 ? rem : base;
      rem -= base;
    });
    return equal;
  })();
  const prevAllocs = currentSel?.prev_allocations || {};

  // Added / removed this week
  const addedETFs   = curTickers.filter(t => !prevTickers.includes(t));
  const removedETFs = prevTickers.filter(t => !curTickers.includes(t));
  const unchangedETFs = curTickers.filter(t => prevTickers.includes(t));

  // Chart + table
  const chartData = Array.from({length:25},(_,m)=>({
    month:m, invested:amount*m,
    expected:   m===0?0:project(amount,allocs,etfPool,m,false,pc.targetReturn),
    optimistic: m===0?0:project(amount,allocs,etfPool,m,true,pc.targetReturn),
  }));
  const tableData = Array.from({length:12},(_,i)=>{
    const m=i+1, invested=amount*m;
    const exp=project(amount,allocs,etfPool,m,false,pc.targetReturn);
    return { month:m, label:new Date(new Date().getFullYear(),i).toLocaleString("default",{month:"short"}), invested, expected:exp, optimistic:project(amount,allocs,etfPool,m,true,pc.targetReturn), gain:exp-invested };
  });
  const projs = { 1:{exp:project(amount,allocs,etfPool,1,false,pc.targetReturn),opt:project(amount,allocs,etfPool,1,true,pc.targetReturn)}, 6:{exp:project(amount,allocs,etfPool,6,false,pc.targetReturn),opt:project(amount,allocs,etfPool,6,true,pc.targetReturn)}, 12:{exp:project(amount,allocs,etfPool,12,false,pc.targetReturn),opt:project(amount,allocs,etfPool,12,true,pc.targetReturn)}, 60:{exp:project(amount,allocs,etfPool,60,false,pc.targetReturn),opt:project(amount,allocs,etfPool,60,true,pc.targetReturn)} };
  const pieData = curTickers.map(t=>({name:t,value:allocs[t]||0,color:ETF_META[t]?.color||"#888"}));
  const sc = STATUS_STYLE[ms.status] || STATUS_STYLE.CLOSED;

  const card  = {background:"white",border:"1px solid var(--border)",borderRadius:16,padding:22,boxShadow:"var(--shadow2)"};
  const lbl   = {fontFamily:"DM Mono",fontSize:11,letterSpacing:2,color:"var(--muted2)",marginBottom:18,textTransform:"uppercase"};

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)"}}>

      {/* Nav */}
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:`0 ${isMob?"16px":"32px"}`,height:60,background:"rgba(248,248,245,0.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid var(--border)",position:"sticky",top:0,zIndex:100}}>
        <span className="pixel" style={{fontSize:10,color:"var(--text)"}}>ETF<span style={{color:"var(--green)"}}>.</span>PLAN</span>
        <div style={{display:"flex",alignItems:"center",gap:isMob?8:12}}>
          {!isMob && <span style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted)",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",opacity:0.7}}>{user?.email}</span>}
          {view==="plan" && <button onClick={()=>setView("dashboard")} style={{fontFamily:"DM Sans",fontSize:isMob?12:14,color:"var(--muted)",background:"none",border:"1px solid var(--border)",borderRadius:8,padding:isMob?"6px 10px":"7px 16px",cursor:"pointer"}}>← {isMob?"Back":"Dashboard"}</button>}
          <button onClick={handleLogout} style={{fontFamily:"DM Sans",fontSize:isMob?12:14,color:"var(--muted)",background:"none",border:"1px solid var(--border)",borderRadius:8,padding:isMob?"6px 10px":"7px 16px",cursor:"pointer"}}>Log out</button>
        </div>
      </nav>

      <div style={{maxWidth:1160,margin:"0 auto",padding:isMob?"16px 14px 60px":"36px 24px 96px"}}>

        {view === "dashboard" && <>

          {/* Dashboard greeting header */}
          <div style={{background:"var(--text)",borderRadius:16,padding:"clamp(20px,3vw,28px) clamp(20px,4vw,32px)",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div>
              <div className="mono" style={{fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:8}}>YOUR DASHBOARD</div>
              <h1 style={{fontFamily:"DM Sans",fontWeight:700,fontSize:"clamp(24px,4vw,34px)",color:"white",margin:0,letterSpacing:"-1px",lineHeight:1.1}}>
                {user?.email?.split("@")[0] ? `Hi, ${user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1)} 👋` : "Your ETF Plan"}
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
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
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
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div className="mono" style={{fontSize:14,color:"var(--text)",fontWeight:500}}>{monthLabel}</div>
                          {isCurrentMonth && <span style={{fontFamily:"DM Mono",fontSize:9,padding:"3px 10px",borderRadius:10,background:"rgba(0,185,107,0.1)",color:"var(--green)",border:"1px solid rgba(0,185,107,0.2)"}}>THIS MONTH</span>}
                        </div>
                        <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:18,color:"var(--text)"}}>${action.amount} <span style={{fontSize:13,fontWeight:400,color:"var(--muted)"}}>invested</span></div>
                      </div>

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
                        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
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
            </div>
          )}


        </>}

        {view === "plan" && <>

          {/* Plan header */}
          <div style={{display:"flex",flexDirection:isMob?"column":"row",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,borderBottom:"1px solid var(--border)",paddingBottom:20,gap:16}}>
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
          <div style={{display:"grid",gridTemplateColumns:isMob?"repeat(2,1fr)":"repeat(4,1fr)",gap:isMob?10:14,marginBottom:24}}>
            {[1,6,12].map(mo=>(
              <div key={mo} style={card}>
                <div style={lbl}>{mo===60?"5 YEARS":mo+" MONTH"+(mo===1?"":"S")}</div>
                <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)"}}>Invested</div>
                <div style={{fontFamily:"DM Sans",fontSize:22,color:"var(--muted)",marginBottom:10}}>{fmt(amount*mo)}</div>
                <div style={{height:1,background:"var(--border)",marginBottom:10}}/>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontFamily:"DM Mono",fontSize:11,color:"var(--muted2)"}}>Expected</div>
                    <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:28,color:"var(--text)"}}>{fmt(projs[mo].exp)}</div>
                    <div style={{fontFamily:"DM Mono",fontSize:11,color:"var(--green)"}}>+{fmt(projs[mo].exp-amount*mo)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"DM Mono",fontSize:11,color:"var(--muted2)"}}>Optimistic</div>
                    <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:28,color:"var(--green)"}}>{fmt(projs[mo].opt)}</div>
                    <div style={{fontFamily:"DM Mono",fontSize:9,color:"var(--green)"}}>+{fmt(projs[mo].opt-amount*mo)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{...card,marginBottom:24}}>
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
          <div style={{marginBottom:24}}>
            <div style={lbl}>THIS WEEK'S ETF SELECTION</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
              {curTickers.map(t=>{
                const row   = etfPool.find(r=>r.ticker===t);
                const meta  = ETF_META[t]||{name:t,color:"#888",leveraged:false,risk:"—",category:"—",fallbackCagr:0.13,fallbackOpt:0.18,topHoldings:[],description:""};
                const isNew = addedETFs.includes(t);
                const pct   = typeof allocs[t] === "number" ? allocs[t] : parseInt(allocs[t]) || 0;
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

                    {/* Allocation bar */}
                    <div style={{background:"var(--bg3)",borderRadius:10,padding:"10px 12px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <span style={{fontFamily:"DM Sans",fontSize:13,color:"var(--muted)",fontWeight:500}}>Your allocation</span>
                        <div style={{textAlign:"right"}}>
                          <span style={{fontFamily:"DM Mono",fontSize:16,color:meta.color,fontWeight:600}}>{pct}%</span>
                          <span style={{fontFamily:"DM Mono",fontSize:13,color:"var(--muted)",marginLeft:8}}>{fmt((amount*pct)/100)}/mo</span>
                        </div>
                      </div>
                      <div style={{height:4,borderRadius:2,background:"var(--border)"}}>
                        <div style={{height:"100%",width:`${pct}%`,background:meta.color,borderRadius:2,transition:"width 0.4s ease"}}/>
                      </div>
                    </div>

                    <div style={{fontFamily:"DM Mono",fontSize:10,color:"var(--muted2)",marginTop:10,display:"flex",justifyContent:"space-between"}}>
                      <span>{meta.risk} risk</span>
                      <span>{meta.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pie + Table */}
          <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":isTab?"1fr":"240px 1fr",gap:14}}>
            <div style={card}>
              <div style={lbl}>ALLOCATION</div>
              <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
                <PieChart width={130} height={130}>
                  <Pie data={pieData} dataKey="value" cx={65} cy={65} innerRadius={38} outerRadius={60} paddingAngle={3}>
                    {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                </PieChart>
              </div>
              {curTickers.map(t=>{
                const pct = typeof allocs[t]==="number" ? allocs[t] : parseInt(allocs[t])||0;
                return (
                  <div key={t} style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:ETF_META[t]?.color||"#888"}}/>
                      <span style={{fontFamily:"DM Mono",fontSize:13,color:ETF_META[t]?.color||"#888"}}>{t}</span>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <span style={{fontFamily:"DM Mono",fontSize:15,color:"var(--text)",fontWeight:500}}>{pct}%</span>
                      <span style={{fontFamily:"DM Mono",fontSize:12,color:"var(--muted2)",marginLeft:8}}>{fmt((amount*pct)/100)}/mo</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{...card,overflowX:"auto"}}>
              <div style={lbl}>MONTH-BY-MONTH PLAN</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr>{["Month","Invested","Expected","Optimistic","Gain"].map(h=>(
                    <th key={h} style={{fontFamily:"DM Mono",fontSize:11,color:"var(--muted2)",textAlign:"left",paddingBottom:12,letterSpacing:1,fontWeight:400}}>{h.toUpperCase()}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {tableData.map(row=>{
                    const active=row.month===activeMonth;
                    return (
                      <tr key={row.month} onClick={()=>setActiveMonth(row.month)} style={{background:active?"rgba(0,185,107,0.03)":"transparent",cursor:"pointer",borderTop:"1px solid var(--border)"}}>
                        <td style={{padding:"9px 8px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:4,height:4,borderRadius:"50%",background:active?"var(--green)":"transparent"}}/>
                            <span style={{fontFamily:"DM Mono",fontSize:14,color:active?"var(--green)":"var(--muted)"}}>{row.label}</span>
                          </div>
                        </td>
                        <td style={{padding:"9px 8px",fontFamily:"DM Mono",fontSize:11,color:"var(--muted)"}}>{fmt(row.invested)}</td>
                        <td style={{padding:"9px 8px",fontFamily:"DM Mono",fontSize:11,color:"var(--text)"}}>{fmt(row.expected)}</td>
                        <td style={{padding:"9px 8px",fontFamily:"DM Mono",fontSize:11,color:"var(--green)"}}>{fmt(row.optimistic)}</td>
                        <td style={{padding:"9px 8px"}}>
                          <span style={{fontFamily:"DM Mono",fontSize:12,color:"var(--green)",background:"rgba(0,185,107,0.06)",padding:"4px 9px",borderRadius:4}}>+{fmt(row.gain)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
