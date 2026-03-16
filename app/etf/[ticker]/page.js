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
  const { data } = await supabase.from("etf_pool").select("*").eq("ticker", ticker).single();
  return data;
}

const fmtPct = n => n != null ? `${n >= 0 ? "+" : ""}${(n * 100).toFixed(2)}%` : "—";
const fmtD   = n => n != null ? `$${Number(n).toFixed(2)}` : "—";

export default async function ETFDetailPage({ params }) {
  const { ticker } = await params;
  const meta = ETF_META[ticker.toUpperCase()];
  const liveData = await getETFData(ticker.toUpperCase());

  if (!meta) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"DM Mono", fontSize:14, color:"var(--muted)", marginBottom:16 }}>ETF not found: {ticker}</div>
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
