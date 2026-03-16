import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";

export async function generateMetadata({ params }) {
  const { ticker } = await params;
  return {
    title: `${ticker} ETF — Full Breakdown, Holdings & Performance | ETF.PLAN`,
    description: `Detailed analysis of ${ticker}: 5-year CAGR, top holdings, risk profile, inflation-adjusted returns and how it fits in your monthly saving plan.`,
  };
}

const ETF_META = {
  VTI:  { name:"Vanguard Total Market ETF",    color:"#00b96b", risk:"Low",       leveraged:false, category:"Total Market",
    description:"VTI tracks the CRSP US Total Market Index, giving you exposure to the entire US equity market — over 3,700 companies from small-cap to mega-cap. It's the simplest way to own 'the whole market' in a single fund.",
    why:"Perfect for investors who want maximum diversification without complexity. As the US economy grows, so does VTI.",
    expense:"0.03%", inception:"2001", aum:"$450B+",
    topHoldings:[{n:"Apple",pct:"6.2%"},{n:"Microsoft",pct:"5.8%"},{n:"Nvidia",pct:"4.1%"},{n:"Amazon",pct:"3.2%"},{n:"Alphabet",pct:"2.6%"},{n:"Meta",pct:"2.3%"},{n:"Berkshire Hathaway",pct:"1.7%"}],
    pros:["Broadest US diversification possible","Extremely low 0.03% expense ratio","Tax-efficient structure","No sector concentration risk"],
    cons:["Returns mirror the whole market — no outperformance","Heavy tech weighting still (~30%)","International exposure requires separate fund"],
  },
  VOO:  { name:"Vanguard S&P 500 ETF",          color:"#3b82f6", risk:"Low",       leveraged:false, category:"Large Cap",
    description:"VOO tracks the S&P 500 — the 500 largest publicly traded US companies. It's the most widely benchmarked index in the world and the foundation of most long-term investment strategies.",
    why:"The S&P 500 has returned an average of ~10% annually for 50+ years. VOO gives you that return at 0.03% cost.",
    expense:"0.03%", inception:"2010", aum:"$550B+",
    topHoldings:[{n:"Apple",pct:"7.1%"},{n:"Microsoft",pct:"6.5%"},{n:"Nvidia",pct:"4.7%"},{n:"Amazon",pct:"3.7%"},{n:"Alphabet",pct:"3.0%"},{n:"Meta",pct:"2.6%"},{n:"Berkshire Hathaway",pct:"2.0%"}],
    pros:["Gold standard benchmark","50+ year track record of ~10% annual returns","Most liquid ETF in the world","Vanguard ownership structure keeps costs minimal"],
    cons:["Concentrated in top 10 stocks (~35%)","No exposure to small/mid cap","US-only"],
  },
  QQQ:  { name:"Invesco Nasdaq-100 ETF",         color:"#8b5cf6", risk:"Medium",    leveraged:false, category:"Tech Growth",
    description:"QQQ tracks the 100 largest non-financial companies listed on the Nasdaq exchange. It's heavily weighted toward technology and has been one of the best-performing major ETFs of the last decade.",
    why:"If you believe tech drives the economy, QQQ gives you concentrated exposure to Apple, Microsoft, Nvidia, Amazon and Meta in one fund.",
    expense:"0.20%", inception:"1999", aum:"$280B+",
    topHoldings:[{n:"Apple",pct:"9.0%"},{n:"Microsoft",pct:"8.5%"},{n:"Nvidia",pct:"7.2%"},{n:"Amazon",pct:"5.0%"},{n:"Meta",pct:"4.8%"},{n:"Broadcom",pct:"3.9%"},{n:"Tesla",pct:"2.8%"}],
    pros:["Strongest 10-year performance of major ETFs","Tech-heavy — benefits most from AI/software growth","Highly liquid","Widely held by institutional investors"],
    cons:["Higher expense ratio (0.20%)","Volatile — dropped 33% in 2022","Top 10 stocks = 55% of fund","No financial sector exposure"],
  },
  SCHD: { name:"Schwab US Dividend Equity ETF",  color:"#c9a84c", risk:"Low",       leveraged:false, category:"Dividend",
    description:"SCHD tracks the Dow Jones US Dividend 100 Index — 100 high-quality US companies with strong dividend track records. It screens for financial health, dividend growth history, and yield.",
    why:"SCHD gives you both income (dividends paid quarterly) and growth. It's the best of both worlds for investors who want steady returns without high volatility.",
    expense:"0.06%", inception:"2011", aum:"$60B+",
    topHoldings:[{n:"Altria Group",pct:"4.5%"},{n:"Cisco Systems",pct:"4.4%"},{n:"Verizon",pct:"4.2%"},{n:"Coca-Cola",pct:"4.1%"},{n:"AbbVie",pct:"4.0%"},{n:"Home Depot",pct:"3.9%"},{n:"Texas Instruments",pct:"3.7%"}],
    pros:["Pays quarterly dividends","Lower volatility than growth ETFs","Screens for financially healthy companies","Excellent for conservative portfolios"],
    cons:["Lower growth ceiling than VOO/QQQ","Underperforms in bull markets","Heavy consumer staples weighting"],
  },
  BND:  { name:"Vanguard Total Bond Market ETF", color:"#64748b", risk:"Very Low",  leveraged:false, category:"Bonds",
    description:"BND holds over 10,000 US investment-grade bonds including Treasuries, corporate bonds, and mortgage-backed securities. It's the anchor of conservative portfolios — steady income, very low volatility.",
    why:"When stocks fall, bonds typically hold or rise. BND is your portfolio's shock absorber — it reduces overall volatility significantly when paired with equity ETFs.",
    expense:"0.03%", inception:"2007", aum:"$115B+",
    topHoldings:[{n:"US Treasury 2.875%",pct:"2.1%"},{n:"US Treasury 3.5%",pct:"1.8%"},{n:"FNMA 3%",pct:"1.4%"},{n:"US Treasury 1.5%",pct:"1.3%"},{n:"US Treasury 2%",pct:"1.2%"},{n:"FHLMC 3%",pct:"1.1%"},{n:"US Treasury 2.25%",pct:"1.0%"}],
    pros:["Extremely stable — rarely loses more than 5% in a year","Monthly income payments","10,000+ bond diversification","Ballast for equity-heavy portfolios"],
    cons:["Low return ceiling (~4-5%)","Rate sensitive — rises in rates hurt bond prices","Not an inflation beater on its own"],
  },
  ITOT: { name:"iShares Core S&P Total Market ETF", color:"#22c55e", risk:"Low", leveraged:false, category:"Total Market",
    description:"ITOT tracks the S&P Total Market Index — over 3,500 US companies from large-cap to micro-cap. It's BlackRock's answer to VTI, nearly identical in composition but from a different fund family.",
    why:"Nearly identical to VTI but from iShares/BlackRock. If your broker gives you better access to iShares funds, ITOT is a perfect alternative to VTI.",
    expense:"0.03%", inception:"2004", aum:"$60B+",
    topHoldings:[{n:"Apple",pct:"6.1%"},{n:"Microsoft",pct:"5.7%"},{n:"Nvidia",pct:"4.0%"},{n:"Amazon",pct:"3.1%"},{n:"Alphabet",pct:"2.5%"},{n:"Meta",pct:"2.2%"},{n:"Berkshire Hathaway",pct:"1.6%"}],
    pros:["Same diversification as VTI at identical cost","BlackRock institutional backing","Available commission-free on more platforms","Highly liquid"],
    cons:["Slightly different index methodology than VTI","Less brand recognition than Vanguard funds"],
  },
  SPY:  { name:"SPDR S&P 500 ETF Trust", color:"#60a5fa", risk:"Low", leveraged:false, category:"Large Cap",
    description:"SPY was the very first ETF ever created, launched in 1993. It tracks the S&P 500 and remains the most heavily traded ETF in the world by volume. Nearly identical to VOO but with a slightly higher expense ratio.",
    why:"SPY is the original and most liquid ETF. Used heavily by institutional traders. For long-term investors VOO is cheaper, but SPY's liquidity makes it the standard for short-term traders.",
    expense:"0.0945%", inception:"1993", aum:"$570B+",
    topHoldings:[{n:"Apple",pct:"7.0%"},{n:"Microsoft",pct:"6.4%"},{n:"Nvidia",pct:"4.6%"},{n:"Amazon",pct:"3.6%"},{n:"Alphabet",pct:"2.9%"},{n:"Meta",pct:"2.5%"},{n:"Berkshire Hathaway",pct:"1.9%"}],
    pros:["The original ETF — 30+ year track record","Most liquid ETF in the world","Trades like a stock — tight spreads","Available everywhere"],
    cons:["Higher expense ratio than VOO (0.0945% vs 0.03%)","For long-term holding, VOO is better value","No advantage over VOO for buy-and-hold investors"],
  },
  VGT:  { name:"Vanguard Information Technology ETF", color:"#a78bfa", risk:"Medium", leveraged:false, category:"Tech",
    description:"VGT tracks the MSCI US Investable Market Information Technology Index — pure technology sector exposure. Includes software, hardware, semiconductors and IT services. Heavily concentrated in Apple, Microsoft and Nvidia.",
    why:"If you believe technology will continue to outperform the broader market, VGT gives you concentrated exposure to the best tech companies at an extremely low cost.",
    expense:"0.10%", inception:"2004", aum:"$75B+",
    topHoldings:[{n:"Apple",pct:"16.5%"},{n:"Microsoft",pct:"15.0%"},{n:"Nvidia",pct:"12.2%"},{n:"Broadcom",pct:"5.1%"},{n:"Salesforce",pct:"2.8%"},{n:"AMD",pct:"2.4%"},{n:"Qualcomm",pct:"2.2%"}],
    pros:["Pure tech exposure — no dilution from other sectors","Extremely low 0.10% expense ratio for a sector ETF","Has outperformed S&P 500 significantly over 10 years","Top Vanguard quality"],
    cons:["Highly concentrated — top 3 stocks = 44% of fund","No exposure outside tech sector","Can drop 30-40% in tech selloffs (2022: -33%)","Less diversified than VTI/VOO"],
  },
  XLK:  { name:"Technology Select Sector SPDR Fund", color:"#7c3aed", risk:"Medium", leveraged:false, category:"Tech",
    description:"XLK tracks the Technology Select Sector Index — the tech companies within the S&P 500. Very similar to VGT but includes slightly different weightings and excludes some smaller tech companies.",
    why:"XLK vs VGT is a close call. XLK is from State Street (SPDR) and has slightly different index rules. Both give you tech sector exposure — pick whichever your broker offers commission-free.",
    expense:"0.09%", inception:"1998", aum:"$68B+",
    topHoldings:[{n:"Nvidia",pct:"22.5%"},{n:"Apple",pct:"18.0%"},{n:"Microsoft",pct:"14.0%"},{n:"Broadcom",pct:"5.2%"},{n:"Salesforce",pct:"2.9%"},{n:"AMD",pct:"2.5%"},{n:"Qualcomm",pct:"2.3%"}],
    pros:["One of the oldest sector ETFs — since 1998","Highly liquid","Slightly higher Nvidia weighting than VGT","Very low expense ratio"],
    cons:["Very similar to VGT — no strong reason to hold both","Heavy concentration in top 3 stocks","Tech sector volatility"],
  },
  VYM:  { name:"Vanguard High Dividend Yield ETF", color:"#d97706", risk:"Low", leveraged:false, category:"Dividend",
    description:"VYM tracks the FTSE High Dividend Yield Index — US companies with above-average dividend yields, excluding REITs. Focuses on large, established companies that pay consistent dividends.",
    why:"VYM is for investors who want income alongside growth. It pays quarterly dividends and focuses on financially strong companies. Less volatile than growth ETFs.",
    expense:"0.06%", inception:"2006", aum:"$55B+",
    topHoldings:[{n:"JPMorgan Chase",pct:"4.2%"},{n:"ExxonMobil",pct:"3.8%"},{n:"Johnson & Johnson",pct:"3.5%"},{n:"Procter & Gamble",pct:"3.2%"},{n:"Home Depot",pct:"3.0%"},{n:"Abbvie",pct:"2.8%"},{n:"Chevron",pct:"2.6%"}],
    pros:["Strong dividend income — ~3% yield","Lower volatility than growth ETFs","Financially healthy companies","Great for conservative/income investors"],
    cons:["Lower growth ceiling than VOO/VTI","Underperforms in tech bull markets","Less tech exposure"],
  },
  DGRO: { name:"iShares Core Dividend Growth ETF", color:"#f59e0b", risk:"Low", leveraged:false, category:"Dividend",
    description:"DGRO tracks the Morningstar US Dividend Growth Index — companies with a 5+ year history of growing their dividends. Focuses on dividend growth, not just current yield.",
    why:"DGRO is for investors who want companies that consistently increase their dividends. A growing dividend signals financial health and discipline. Better long-term than high-yield-only funds.",
    expense:"0.08%", inception:"2014", aum:"$28B+",
    topHoldings:[{n:"Apple",pct:"3.5%"},{n:"Microsoft",pct:"3.4%"},{n:"JPMorgan Chase",pct:"3.1%"},{n:"Johnson & Johnson",pct:"2.9%"},{n:"ExxonMobil",pct:"2.7%"},{n:"Procter & Gamble",pct:"2.6%"},{n:"Visa",pct:"2.4%"}],
    pros:["Dividend growth focus — better quality filter than yield","Includes tech companies that grow dividends","Lower yield but higher quality","Consistent outperformance vs pure yield funds"],
    cons:["Lower current yield than SCHD or VYM","Less pure income play","Still underperforms growth in bull markets"],
  },
  TQQQ: { name:"ProShares UltraPro QQQ",          color:"#ff6b35", risk:"Very High", leveraged:true,  category:"Leveraged",
    description:"TQQQ delivers 3x the daily return of the Nasdaq-100. If QQQ goes up 1% today, TQQQ goes up ~3%. If QQQ drops 1%, TQQQ drops ~3%. Due to daily rebalancing, long-term returns can differ significantly from 3x QQQ.",
    why:"Only for aggressive investors who understand leveraged ETF mechanics. TQQQ has produced extraordinary returns in bull markets but suffered 90%+ drawdowns in bear markets.",
    expense:"0.86%", inception:"2010", aum:"$22B+",
    topHoldings:[{n:"Nasdaq-100 Swap (3x)",pct:"~100%"},{n:"QQQ derivatives","pct":""},{n:"Daily reset mechanism","pct":""}],
    pros:["3x upside in bull markets","Liquid and widely traded","Short-term tactical tool for experienced investors"],
    cons:["Can lose 80-90% in downturns","Volatility decay erodes value over time","High expense ratio 0.86%","NOT suitable for buy-and-hold"],
    warning:"⚠️ TQQQ is a leveraged ETF. It is designed for short-term tactical use only. Long-term holding significantly underperforms due to daily rebalancing and volatility decay.",
  },
};

async function getETFData(ticker) {
  const supabase = await createClient();
  const [{ data: liveData }, { data: dbMeta }] = await Promise.all([
    supabase.from("etf_pool").select("*").eq("ticker", ticker).single(),
    supabase.from("etf_metadata").select("*").eq("ticker", ticker.toUpperCase()).single(),
  ]);
  return { liveData, dbMeta };
}

const fmtPct = n => n != null ? `${n >= 0 ? "+" : ""}${(n * 100).toFixed(2)}%` : "—";
const fmtD   = n => n != null ? `$${Number(n).toFixed(2)}` : "—";

export default async function ETFDetailPage({ params }) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  const { liveData, dbMeta } = await getETFData(upperTicker);
  
  // Merge: DB metadata takes priority over hardcoded, hardcoded is fallback
  const hardcoded = ETF_META[upperTicker];
  
  // Build meta from DB if available, otherwise use hardcoded
  const meta = dbMeta ? {
    name:        dbMeta.name         || hardcoded?.name        || upperTicker,
    color:       dbMeta.color        || hardcoded?.color       || "#00b96b",
    risk:        dbMeta.risk         || hardcoded?.risk        || "—",
    category:    dbMeta.category     || hardcoded?.category    || "—",
    leveraged:   dbMeta.leveraged    ?? hardcoded?.leveraged   ?? false,
    description: dbMeta.description  || hardcoded?.description || "",
    why:         dbMeta.why          || hardcoded?.why         || "",
    expense:     dbMeta.expense      || hardcoded?.expense     || "—",
    inception:   dbMeta.inception    || hardcoded?.inception   || "—",
    aum:         dbMeta.aum          || hardcoded?.aum         || "—",
    topHoldings: dbMeta.top_holdings || hardcoded?.topHoldings || [],
    pros:        dbMeta.pros         || hardcoded?.pros        || [],
    cons:        dbMeta.cons         || hardcoded?.cons        || [],
    warning:     dbMeta.warning      || hardcoded?.warning     || null,
  } : hardcoded;

  if (!meta) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"DM Mono", fontSize:14, color:"var(--muted)", marginBottom:16 }}>
            {ticker.toUpperCase()} — page generating, check back shortly
          </div>
          <Link href="/dashboard" style={{ fontFamily:"DM Sans", color:"var(--green)" }}>← Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      {/* Nav */}
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 clamp(16px,4vw,40px)", height:60, background:"rgba(248,248,245,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:100 }}>
        <Link href="/" className="pixel" style={{ fontSize:11, color:"var(--text)" }}>ETF<span style={{ color:"var(--green)" }}>.</span>PLAN</Link>
        <Link href="/dashboard" style={{ fontFamily:"DM Sans", fontSize:14, color:"var(--muted)" }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"clamp(24px,5vw,48px) clamp(16px,4vw,24px) 80px" }}>

        {/* Hero */}
        <div style={{ background:"var(--text)", borderRadius:20, padding:"clamp(28px,5vw,44px)", marginBottom:24 }}>
          {meta.warning && (
            <div style={{ background:"rgba(255,71,87,0.15)", border:"1px solid rgba(255,71,87,0.3)", borderRadius:10, padding:"10px 16px", marginBottom:20 }}>
              <p style={{ fontFamily:"DM Sans", fontSize:13, color:"#ff8080", margin:0 }}>{meta.warning}</p>
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:`${meta.color}20`, border:`2px solid ${meta.color}44`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"DM Mono", fontSize:14, color:meta.color, fontWeight:700 }}>{ticker.toUpperCase()}</span>
                </div>
                {meta.leveraged && <span style={{ fontFamily:"DM Mono", fontSize:10, padding:"3px 10px", borderRadius:6, background:"rgba(255,71,87,0.15)", color:"#ff6b6b" }}>3X LEVERAGED</span>}
                <span style={{ fontFamily:"DM Mono", fontSize:10, padding:"3px 10px", borderRadius:6, background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.5)" }}>{meta.category}</span>
              </div>
              <h1 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(20px,4vw,32px)", color:"white", margin:"0 0 6px", letterSpacing:"-0.5px" }}>{meta.name}</h1>
              <div style={{ fontFamily:"DM Mono", fontSize:12, color:meta.color }}>{meta.risk} risk</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(28px,5vw,40px)", color:"white", lineHeight:1 }}>{fmtD(liveData?.price)}</div>
              <div style={{ fontFamily:"DM Mono", fontSize:12, color: (liveData?.change_pct || 0) >= 0 ? "#00ff88" : "#ff6b6b", marginTop:4 }}>{fmtPct(liveData?.change_pct)} today</div>
            </div>
          </div>

          {/* Live stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:10, marginTop:24 }}>
            {[
              { l:"CAGR",        v:fmtPct(liveData?.cagr),          c:meta.color     },
              { l:"Real CAGR",   v:fmtPct(liveData?.real_cagr),     c:"#00ff88"      },
              { l:"1M Momentum", v:fmtPct(liveData?.mom_1m),        c:(liveData?.mom_1m||0)>=0?"#00ff88":"#ff6b6b" },
              { l:"3M Momentum", v:fmtPct(liveData?.mom_3m),        c:(liveData?.mom_3m||0)>=0?"#00ff88":"#ff6b6b" },
              { l:"YTD",         v:fmtPct(liveData?.ytd),           c:(liveData?.ytd||0)>=0?"#00ff88":"#ff6b6b"   },
              { l:"Expense",     v:meta.expense,                     c:"rgba(255,255,255,0.6)" },
            ].map(s => (
              <div key={s.l} style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"10px 12px" }}>
                <div style={{ fontFamily:"DM Mono", fontSize:9, color:"rgba(255,255,255,0.3)", marginBottom:4 }}>{s.l}</div>
                <div style={{ fontFamily:"DM Mono", fontSize:14, fontWeight:600, color:s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* What is it */}
        <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(20px,3vw,28px)", marginBottom:16, boxShadow:"var(--shadow)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3vw,24px)", color:"var(--text)", marginBottom:12, letterSpacing:"-0.3px" }}>What is {ticker.toUpperCase()}?</h2>
          <p style={{ fontFamily:"DM Sans", fontSize:15, color:"var(--muted)", lineHeight:1.85, marginBottom:12 }}>{meta.description}</p>
          <div style={{ background:"var(--green2)", border:"1px solid rgba(0,185,107,0.2)", borderRadius:10, padding:"12px 16px" }}>
            <p style={{ fontFamily:"DM Sans", fontSize:14, color:"var(--green)", margin:0, lineHeight:1.7 }}>💡 <strong>Why it's in our plans:</strong> {meta.why}</p>
          </div>
        </div>

        {/* Top holdings */}
        <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(20px,3vw,28px)", marginBottom:16, boxShadow:"var(--shadow)" }}>
          <h2 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3vw,24px)", color:"var(--text)", marginBottom:16, letterSpacing:"-0.3px" }}>Top Holdings</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {meta.topHoldings.map((h, i) => (
              <div key={h.n} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom: i < meta.topHoldings.length-1 ? "1px solid var(--bg3)" : "none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:`${meta.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"DM Mono", fontSize:10, color:meta.color, fontWeight:600 }}>{i+1}</div>
                  <span style={{ fontFamily:"DM Sans", fontSize:14, color:"var(--text)", fontWeight:500 }}>{h.n}</span>
                </div>
                {h.pct && <span style={{ fontFamily:"DM Mono", fontSize:13, color:"var(--muted)", fontWeight:500 }}>{h.pct}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Pros & Cons */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,300px),1fr))", gap:14, marginBottom:16 }}>
          <div style={{ background:"white", border:"1px solid rgba(0,185,107,0.2)", borderRadius:16, padding:"clamp(18px,3vw,24px)", boxShadow:"var(--shadow)" }}>
            <h3 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:16, color:"var(--text)", marginBottom:14 }}>✅ Why investors choose it</h3>
            {meta.pros.map(p => (
              <div key={p} style={{ display:"flex", gap:10, marginBottom:10 }}>
                <span style={{ color:"var(--green)", flexShrink:0, fontSize:13 }}>✓</span>
                <span style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.65 }}>{p}</span>
              </div>
            ))}
          </div>
          <div style={{ background:"white", border:"1px solid rgba(255,71,87,0.15)", borderRadius:16, padding:"clamp(18px,3vw,24px)", boxShadow:"var(--shadow)" }}>
            <h3 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:16, color:"var(--text)", marginBottom:14 }}>⚠️ What to watch out for</h3>
            {meta.cons.map(c => (
              <div key={c} style={{ display:"flex", gap:10, marginBottom:10 }}>
                <span style={{ color:"var(--muted2)", flexShrink:0, fontSize:13 }}>–</span>
                <span style={{ fontFamily:"DM Sans", fontSize:13, color:"var(--muted)", lineHeight:1.65 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fund facts */}
        <div style={{ background:"white", border:"1px solid var(--border)", borderRadius:16, padding:"clamp(18px,3vw,24px)", marginBottom:24, boxShadow:"var(--shadow)" }}>
          <h3 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:16, color:"var(--text)", marginBottom:14 }}>Fund Facts</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:12 }}>
            {[
              { l:"Ticker",        v:ticker.toUpperCase() },
              { l:"Expense Ratio", v:meta.expense         },
              { l:"Inception",     v:meta.inception        },
              { l:"AUM",           v:meta.aum              },
              { l:"52W High",      v:fmtD(liveData?.high_52w) },
              { l:"52W Low",       v:fmtD(liveData?.low_52w)  },
            ].map(f => (
              <div key={f.l} style={{ background:"var(--bg3)", borderRadius:10, padding:"10px 12px" }}>
                <div style={{ fontFamily:"DM Mono", fontSize:9, color:"var(--muted2)", marginBottom:4 }}>{f.l}</div>
                <div style={{ fontFamily:"DM Sans", fontWeight:600, fontSize:15, color:"var(--text)" }}>{f.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background:"var(--text)", borderRadius:16, padding:"clamp(24px,4vw,36px)", textAlign:"center" }}>
          <h3 style={{ fontFamily:"DM Sans", fontWeight:700, fontSize:"clamp(18px,3vw,26px)", color:"white", marginBottom:10 }}>
            Want {ticker.toUpperCase()} in your plan?
          </h3>
          <p style={{ fontFamily:"DM Sans", fontSize:14, color:"rgba(255,255,255,0.5)", marginBottom:24, lineHeight:1.7 }}>
            Our scoring engine picks the best ETFs for your risk level each week based on real momentum data.
          </p>
          <Link href="/dashboard" style={{ display:"inline-block", fontFamily:"DM Sans", fontWeight:600, fontSize:15, color:"white", background:"var(--green)", padding:"13px 28px", borderRadius:10, boxShadow:"0 4px 16px rgba(0,185,107,0.3)" }}>
            View my plan →
          </Link>
        </div>

      </div>
    </div>
  );
}
