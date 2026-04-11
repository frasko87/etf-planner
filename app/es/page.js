"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";

// ── Same data as EN homepage, Spanish locale ───────────────────────────────────
const PASSIVE = {
  50:  { y3p:"$2.073",  y3a:"+$187/año",  y3c:"cubre tus suscripciones de streaming",
         y5p:"$3.799",  y5a:"+$342/año",  y5c:"la mitad de tu factura del móvil pagada",
         y10p:"$9.748", y10a:"+$877/año", y10c:"tu factura del móvil pagada todos los años" },
  100: { y3p:"$4.146",  y3a:"+$373/año",  y3c:"Netflix + Spotify + gimnasio",
         y5p:"$7.599",  y5a:"+$684/año",  y5c:"tu factura del móvil pagada todos los años",
         y10p:"$19.497",y10a:"+$1.755/año",y10c:"móvil + seguro del coche pagados cada año" },
  150: { y3p:"$6.219",  y3a:"+$560/año",  y3c:"todas tus suscripciones pagadas",
         y5p:"$11.398", y5a:"+$1.026/año",y5c:"móvil + todo el streaming pagado",
         y10p:"$29.245",y10a:"+$2.632/año",y10c:"219€ cada mes sin trabajar" },
};

const SAVINGS_COMPARE = [
  { label:"Cuenta de ahorro normal",     rate:"0,5%",  y5:"$6.077",  y10:"$12.308", y20:"$26.112",  color:"rgba(255,255,255,0.25)", dim:true  },
  { label:"Cuenta de ahorro alta rent.", rate:"4,5%",  y5:"$6.740",  y10:"$15.177", y20:"$38.241",  color:"rgba(255,255,255,0.4)",  dim:true  },
  { label:"Plan ETF Conservador",        rate:"~5,5%", y5:"$6.920",  y10:"$16.024", y20:"$43.916",  color:"#60a5fa",               dim:false },
  { label:"Plan ETF Equilibrado",        rate:"~9%",   y5:"$7.599",  y10:"$19.497", y20:"$67.290",  color:"#00b96b",               dim:false },
  { label:"Plan ETF Agresivo",           rate:"~16%",  y5:"$9.225",  y10:"$30.860", y20:"$149.352", color:"#ff4757",               dim:false },
];

const PLANS = [
  { icon:"🛡️", name:"Conservador", rate:"~5%/año",  desc:"Similar a un depósito de alta rentabilidad, pero algo mejor. Bonos y acciones con dividendo.", color:"#3b82f6", risk:"Muy Bajo" },
  { icon:"⚖️", name:"Equilibrado", rate:"~9%/año",  desc:"El punto óptimo. Crecimiento constante, riesgo manejable. Nuestro plan más popular.",         color:"#c9a84c", risk:"Bajo–Med" },
  { icon:"🚀", name:"Agresivo",    rate:"12%+/año", desc:"Enfocado en crecimiento. Mayor potencial pero más volatilidad mensual.",                        color:"#ff4757", risk:"Medio"   },
];

const WHY_ETFS = [
  { icon:"🏦", title:"No es especulación — es ahorro estructurado", desc:"Los ETFs contienen cientos de empresas a la vez. Si una quiebra, el resto lo cubre. Es lo contrario de apostar por una sola acción." },
  { icon:"📈", title:"Históricamente supera la inflación todos los años", desc:"El S&P 500 ha dado una media del 10–13% anual durante décadas. La inflación es del 2–3%. Los ETFs son una de las pocas formas de hacer crecer tu dinero en términos reales." },
  { icon:"🔒", title:"Comisiones bajas, totalmente regulado", desc:"Los ETFs de mercado amplio cobran tan solo el 0,03%/año. Eso son $0,30 por cada $1.000. Comparado con los fondos gestionados que se llevan el 1–2%, tú conservas casi todo lo que ganas." },
  { icon:"⏰", title:"Configúralo una vez, crece cada mes", desc:"No necesitas seguir el mercado. Compra una vez al mes, mantén. Nuestro motor selecciona los ETFs — tú solo aportas y dejas que el tiempo trabaje." },
];

const FAQ = [
  { q:"¿Necesito saber de bolsa para usar esto?", a:"No. ETF.PLAN te dice exactamente qué comprar cada mes. Solo necesitas una cuenta en un broker gratuito (Robinhood, eToro o similar) y seguir las instrucciones." },
  { q:"¿Cuánto dinero necesito para empezar?", a:"Desde $50 al mes. Puedes cambiar tu aportación en cualquier momento. No hay mínimo impuesto por nosotros — aunque algunos brokers tienen mínimos propios por acción." },
  { q:"¿Cuándo debería ver ganancias?", a:"Los ETFs son inversión a largo plazo. La mayoría de usuarios empieza a ver ganancias significativas en 3–5 años. El poder real del interés compuesto aparece en los años 7–10." },
  { q:"¿Qué pasa si el mercado cae?", a:"Los mercados siempre han recuperado y superado los máximos anteriores. Los meses de caída son en realidad una oportunidad — tu $100 compra más participaciones a precios bajos. Por eso la constancia importa más que el momento de entrada." },
  { q:"¿Están seguros mis datos?", a:"Usamos Supabase (infraestructura segura, cifrada, con sede en la UE) y nunca almacenamos datos de pago. No vendemos tu información a nadie. Lee nuestra política de privacidad." },
  { q:"¿Es esto asesoramiento financiero?", a:"No. ETF.PLAN proporciona información educativa e información sobre el mercado, no asesoramiento financiero personalizado. Las rentabilidades pasadas no garantizan resultados futuros. Siempre haz tu propia investigación." },
];

const ETFS = [
  { ticker:"QQQ",  name:"Nasdaq-100",  ret:"+18,0%", color:"#8b5cf6", risk:"Med", positive:true },
  { ticker:"VTI",  name:"Total Market",ret:"+13,5%", color:"#00b96b", risk:"Bajo",positive:true },
  { ticker:"VOO",  name:"S&P 500",     ret:"+13,2%", color:"#3b82f6", risk:"Bajo",positive:true },
  { ticker:"SCHD", name:"Dividendos",  ret:"+12,0%", color:"#c9a84c", risk:"Bajo",positive:true },
];
const tape = [...ETFS,...ETFS,...ETFS,...ETFS,...ETFS,...ETFS];

export default function HomePageES() {
  const [amount, setAmount] = useState(100);
  const [isMob, setIsMob] = useState(false);
  const [etfPool, setEtfPool] = useState({});
  const [year, setYear] = useState("10");

  useEffect(() => {
    const check = () => setIsMob(window.innerWidth < 680);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("etf_data").select("ticker,price,cagr,change_pct").then(({ data }) => {
      if (data) {
        const map = {};
        data.forEach(e => { map[e.ticker] = e; });
        setEtfPool(map);
      }
    });
  }, []);

  const d = PASSIVE[amount];
  const row = year === "3" ? { p: d.y3p, a: d.y3a, c: d.y3c }
            : year === "5" ? { p: d.y5p, a: d.y5a, c: d.y5c }
            :                { p: d.y10p, a: d.y10a, c: d.y10c };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#f8f8f5;color:#1a1a2e;font-family:'DM Sans',Arial,sans-serif;}
    .pixel{font-family:'Press Start 2P',monospace;}
    .mono{font-family:'DM Mono',monospace;}
    @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes fade-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .fade-in{animation:fade-in 0.5s ease both;}
  `;

  return (
    <>
      <style>{css}</style>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header style={{ background:"#f8f8f5", borderBottom:"1px solid #e8e8e2", padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <Link href="/es" className="pixel" style={{ fontSize:isMob?10:12, color:"#1a1a2e", textDecoration:"none" }}>
          ETF<span style={{ color:"#00b96b" }}>.</span>PLAN
        </Link>
        <nav style={{ display:"flex", gap:isMob?12:20, alignItems:"center" }}>
          {!isMob && <Link href="/es/learn" style={{ fontSize:14, color:"#7a7a8a", textDecoration:"none" }}>Aprender</Link>}
          {!isMob && <Link href="/es/blog" style={{ fontSize:14, color:"#7a7a8a", textDecoration:"none" }}>Blog</Link>}
          <Link href="/login" style={{ fontSize:14, color:"#7a7a8a", textDecoration:"none" }}>Entrar</Link>
          <Link href="/login?mode=signup" style={{ fontSize:14, fontWeight:600, color:"white", background:"#00b96b", padding:"7px 16px", borderRadius:8, textDecoration:"none" }}>Empezar gratis →</Link>
          {/* Language switch */}
          <Link href="/" style={{ fontSize:12, color:"#aaaabc", textDecoration:"none" }}>EN</Link>
        </nav>
      </header>

      {/* ── TICKER TAPE ──────────────────────────────────────── */}
      <div style={{ background:"#1a1a2e", overflow:"hidden", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", gap:32, width:"max-content", animation:"marquee 28s linear infinite" }}>
          {tape.map((e,i) => {
            const live = etfPool[e.ticker];
            const chg  = live?.change_pct;
            const pos  = chg == null ? e.positive : chg >= 0;
            return (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"center", whiteSpace:"nowrap" }}>
                <span className="mono" style={{ fontSize:11, fontWeight:700, color:e.color }}>{e.ticker}</span>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{e.name}</span>
                <span className="mono" style={{ fontSize:11, color:pos?"#00b96b":"#ff4757", fontWeight:600 }}>
                  {chg != null ? `${chg>=0?"+":""}${(chg*100).toFixed(2)}%` : e.ret}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ background:"linear-gradient(180deg,#1a1a2e 0%,#1a1a2e 70%,#f8f8f5 100%)", padding:isMob?"60px 20px 80px":"80px 24px 100px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,185,107,0.12)", border:"1px solid rgba(0,185,107,0.25)", borderRadius:100, padding:"5px 14px", marginBottom:28 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#00b96b", display:"inline-block" }} />
          <span className="mono" style={{ fontSize:10, color:"#00b96b", letterSpacing:1 }}>PLANIFICADOR GRATUITO DE INVERSIÓN EN ETFs</span>
        </div>

        <h1 style={{ fontSize:isMob?"clamp(32px,9vw,46px)":"clamp(42px,5vw,72px)", fontWeight:800, color:"white", letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:16 }}>
          $100/mes hoy.<br />
          <span style={{ color:"#00b96b" }}>+$1.755/año para siempre.</span>
        </h1>

        <p style={{ fontSize:isMob?15:18, color:"rgba(255,255,255,0.6)", maxWidth:580, margin:"0 auto 36px", lineHeight:1.7 }}>
          Invierte $100 al mes durante 10 años. Tu cartera genera <strong style={{ color:"white" }}>+$1.755/año de forma pasiva</strong> — eso cubre tu factura del móvil, el seguro del coche y todas tus suscripciones pagados. Plan gratuito, 2 minutos de configuración.
        </p>

        <div style={{ display:"flex", flexDirection:isMob?"column":"row", gap:12, justifyContent:"center", alignItems:"center" }}>
          <Link href="/login?mode=signup" onClick={() => track("cta_click", { button:"hero_es" })}
            style={{ display:"inline-block", background:"#00b96b", color:"white", fontWeight:700, fontSize:16, padding:"16px 32px", borderRadius:12, textDecoration:"none", boxShadow:"0 4px 24px rgba(0,185,107,0.35)" }}>
            Crear mi plan gratuito →
          </Link>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>Sin tarjeta de crédito · Sin compromisos</span>
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────── */}
      <section style={{ padding:isMob?"48px 16px":"64px 24px", maxWidth:800, margin:"0 auto" }}>
        <h2 style={{ fontSize:isMob?20:26, fontWeight:700, textAlign:"center", marginBottom:8, letterSpacing:"-0.5px" }}>
          Mira lo que hace $100/mes
        </h2>
        <p style={{ fontSize:15, color:"#7a7a8a", textAlign:"center", marginBottom:32 }}>Comparado con una cuenta de ahorro.</p>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #e8e8e2" }}>
                {["Dónde pones el dinero","Tasa","5 años","10 años","20 años"].map(h => (
                  <th key={h} style={{ padding:"10px 12px", textAlign:h==="Dónde pones el dinero"?"left":"right", fontSize:11, fontFamily:"DM Mono,monospace", color:"#aaaabc", letterSpacing:1, fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAVINGS_COMPARE.map((r,i) => (
                <tr key={i} style={{ borderBottom:"1px solid #f0f0ec", opacity:r.dim?0.55:1 }}>
                  <td style={{ padding:"14px 12px", fontSize:14, fontWeight:r.dim?400:600, color:"#1a1a2e" }}>{r.label}</td>
                  <td style={{ padding:"14px 12px", textAlign:"right", fontFamily:"DM Mono,monospace", fontSize:13, color:r.dim?"#aaaabc":r.color }}>{r.rate}</td>
                  <td style={{ padding:"14px 12px", textAlign:"right", fontFamily:"DM Mono,monospace", fontSize:13, color:r.dim?"#7a7a8a":r.color }}>{r.y5}</td>
                  <td style={{ padding:"14px 12px", textAlign:"right", fontFamily:"DM Mono,monospace", fontSize:14, fontWeight:700, color:r.dim?"#7a7a8a":r.color }}>{r.y10}</td>
                  <td style={{ padding:"14px 12px", textAlign:"right", fontFamily:"DM Mono,monospace", fontSize:13, color:r.dim?"#7a7a8a":r.color }}>{r.y20}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── PLANS ─────────────────────────────────────────────── */}
      <section style={{ background:"#1a1a2e", padding:isMob?"48px 16px":"64px 24px" }}>
        <h2 style={{ fontSize:isMob?20:28, fontWeight:700, textAlign:"center", color:"white", marginBottom:8, letterSpacing:"-0.5px" }}>Tres planes. Para cada nivel de riesgo.</h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", textAlign:"center", marginBottom:36 }}>Los tres superan a una cuenta de ahorro. El conservador es el más seguro.</p>
        <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"repeat(3,1fr)", gap:16, maxWidth:900, margin:"0 auto" }}>
          {PLANS.map(pl => (
            <div key={pl.name} style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${pl.color}33`, borderRadius:16, padding:24 }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{pl.icon}</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:17, fontWeight:700, color:"white" }}>{pl.name}</span>
                <span className="mono" style={{ fontSize:11, color:pl.color, background:`${pl.color}18`, padding:"2px 8px", borderRadius:100 }}>{pl.rate}</span>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.65, marginBottom:14 }}>{pl.desc}</p>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)", fontFamily:"DM Mono,monospace" }}>Riesgo: {pl.risk}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALCULATOR ────────────────────────────────────────── */}
      <section style={{ padding:isMob?"48px 16px":"64px 24px", maxWidth:700, margin:"0 auto", textAlign:"center" }}>
        <h2 style={{ fontSize:isMob?20:26, fontWeight:700, marginBottom:8, letterSpacing:"-0.5px" }}>Mira qué hace tu dinero</h2>
        <p style={{ fontSize:15, color:"#7a7a8a", marginBottom:32 }}>Elige tu aportación mensual. Descubre cuánto genera de forma pasiva.</p>

        <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:20 }}>
          {[50,100,150].map(v => (
            <button key={v} onClick={() => { setAmount(v); track("calculator_interaction", { amount:v }); }}
              style={{ padding:"10px 24px", borderRadius:10, border:`2px solid ${amount===v?"#00b96b":"#e8e8e2"}`, background:amount===v?"#00b96b":"white", color:amount===v?"white":"#1a1a2e", fontFamily:"DM Sans,Arial,sans-serif", fontSize:15, fontWeight:700, cursor:"pointer" }}>
              ${v}/mes
            </button>
          ))}
        </div>

        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:28 }}>
          {[["3","3 años"],["5","5 años"],["10","10 años"]].map(([v,l]) => (
            <button key={v} onClick={() => setYear(v)}
              style={{ padding:"6px 16px", borderRadius:8, border:`1.5px solid ${year===v?"#1a1a2e":"#e8e8e2"}`, background:year===v?"#1a1a2e":"transparent", color:year===v?"white":"#7a7a8a", fontFamily:"DM Sans,Arial,sans-serif", fontSize:13, cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ background:"#1a1a2e", borderRadius:16, padding:isMob?"24px 16px":"32px 40px" }}>
          <div className="mono" style={{ fontSize:11, color:"rgba(255,255,255,0.35)", letterSpacing:2, marginBottom:12 }}>PLAN EQUILIBRADO · $100/MES</div>
          <div style={{ fontSize:isMob?36:52, fontWeight:800, color:"white", letterSpacing:"-1.5px", lineHeight:1 }}>{row.p}</div>
          <div className="mono" style={{ fontSize:14, color:"#00b96b", marginTop:8 }}>cartera estimada</div>
          <div style={{ height:1, background:"rgba(255,255,255,0.08)", margin:"20px 0" }} />
          <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div>
              <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:1, marginBottom:4 }}>GENERA</div>
              <div style={{ fontSize:22, fontWeight:700, color:"#00b96b" }}>{row.a}</div>
            </div>
            <div style={{ textAlign:isMob?"left":"right" }}>
              <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.35)", letterSpacing:1, marginBottom:4 }}>ES DECIR</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", maxWidth:260 }}>{row.c}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY ETFs ──────────────────────────────────────────── */}
      <section style={{ background:"#f8f8f5", borderTop:"1px solid #e8e8e2", padding:isMob?"48px 16px":"64px 24px" }}>
        <h2 style={{ fontSize:isMob?20:26, fontWeight:700, textAlign:"center", marginBottom:36, letterSpacing:"-0.5px", maxWidth:600, margin:"0 auto 36px" }}>
          Por qué ETFs — no cuentas de ahorro, no acciones individuales
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"1fr 1fr", gap:20, maxWidth:840, margin:"0 auto" }}>
          {WHY_ETFS.map(w => (
            <div key={w.title} style={{ background:"white", borderRadius:14, padding:24, border:"1px solid #e8e8e2" }}>
              <div style={{ fontSize:26, marginBottom:10 }}>{w.icon}</div>
              <div style={{ fontSize:15, fontWeight:700, marginBottom:6, color:"#1a1a2e" }}>{w.title}</div>
              <p style={{ fontSize:14, color:"#7a7a8a", lineHeight:1.7 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{ background:"#1a1a2e", padding:isMob?"48px 16px":"72px 24px", textAlign:"center" }}>
        <h2 style={{ fontSize:isMob?22:32, fontWeight:800, color:"white", marginBottom:12, letterSpacing:"-0.5px" }}>
          Tu cartera no se construye sola.
        </h2>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", marginBottom:32 }}>2 minutos. Gratis para siempre. Sin tarjeta de crédito.</p>
        <Link href="/login?mode=signup" onClick={() => track("cta_click", { button:"bottom_es" })}
          style={{ display:"inline-block", background:"#00b96b", color:"white", fontWeight:700, fontSize:16, padding:"16px 36px", borderRadius:12, textDecoration:"none", boxShadow:"0 4px 24px rgba(0,185,107,0.4)" }}>
          Obtener mi plan de ETFs gratis →
        </Link>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section style={{ padding:isMob?"48px 16px":"64px 24px", maxWidth:680, margin:"0 auto" }}>
        <h2 style={{ fontSize:isMob?20:24, fontWeight:700, textAlign:"center", marginBottom:32, letterSpacing:"-0.5px" }}>Preguntas frecuentes</h2>
        {FAQ.map((f,i) => <FAQItem key={i} q={f.q} a={f.a} />)}
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ borderTop:"1px solid #e8e8e2", padding:"24px", textAlign:"center" }}>
        <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap", marginBottom:12 }}>
          <Link href="/privacy" style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>Privacidad</Link>
          <Link href="/terms"   style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>Términos</Link>
          <a href="https://www.instagram.com/etfplan/" target="_blank" rel="noreferrer" style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>@etfplan</a>
          <Link href="/es/blog" style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>Blog</Link>
          <Link href="/"        style={{ fontSize:13, color:"#aaaabc", textDecoration:"none" }}>🇬🇧 English</Link>
        </div>
        <p style={{ fontSize:12, color:"#cccccc" }}>No es asesoramiento financiero. Rentabilidades pasadas ≠ resultados futuros.</p>
      </footer>
    </>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:"1px solid #f0f0ec", padding:"16px 0" }}>
      <button onClick={() => setOpen(!open)}
        style={{ width:"100%", background:"none", border:"none", textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16 }}>
        <span style={{ fontSize:15, fontWeight:600, color:"#1a1a2e", lineHeight:1.5 }}>{q}</span>
        <span style={{ fontSize:18, color:"#00b96b", flexShrink:0, fontFamily:"DM Sans,Arial,sans-serif" }}>{open?"−":"+"}</span>
      </button>
      {open && <p style={{ fontSize:14, color:"#7a7a8a", lineHeight:1.75, marginTop:10, paddingRight:32 }}>{a}</p>}
    </div>
  );
}
