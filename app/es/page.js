"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";

const PASSIVE = {
  50:  { y3p:"$2.073",  y3a:"+$187/año",  y3c:"cubre tus suscripciones de streaming",
         y5p:"$3.799",  y5a:"+$342/año",  y5c:"media de tu factura del móvil pagada",
         y10p:"$9.748", y10a:"+$877/año", y10c:"tu factura del móvil pagada cada año" },
  100: { y3p:"$4.146",  y3a:"+$373/año",  y3c:"Netflix + Spotify + gimnasio",
         y5p:"$7.599",  y5a:"+$684/año",  y5c:"tu factura del móvil pagada cada año",
         y10p:"$19.497",y10a:"+$1.755/año",y10c:"móvil + seguro del coche pagados" },
  150: { y3p:"$6.219",  y3a:"+$560/año",  y3c:"todas tus suscripciones pagadas",
         y5p:"$11.398", y5a:"+$1.026/año",y5c:"móvil + todo el streaming pagado",
         y10p:"$29.245",y10a:"+$2.632/año",y10c:"219€/mes sin trabajar" },
};

const COMPARE = [
  { label:"Cuenta de ahorro normal",    rate:"0,5%",  y5:"$6.077",  y10:"$12.308", color:"rgba(255,255,255,0.2)",  dim:true  },
  { label:"Cuenta alta rentabilidad",   rate:"4,5%",  y5:"$6.740",  y10:"$15.177", color:"rgba(255,255,255,0.35)", dim:true  },
  { label:"Plan ETF Conservador",       rate:"~5,5%", y5:"$6.920",  y10:"$16.024", color:"#60a5fa",                dim:false },
  { label:"Plan ETF Equilibrado",       rate:"~9%",   y5:"$7.599",  y10:"$19.497", color:"#00b96b",                dim:false },
  { label:"Plan ETF Agresivo",          rate:"~16%",  y5:"$9.225",  y10:"$30.860", color:"#ff4757",                dim:false },
];

const PLANS = [
  { icon:"🛡️", name:"Conservador", rate:"~5%/año",  desc:"Bonos y dividendos. Similar a un depósito de alta rentabilidad, pero algo mejor.", color:"#3b82f6", risk:"Muy bajo" },
  { icon:"⚖️", name:"Equilibrado", rate:"~9%/año",  desc:"El punto óptimo. Crecimiento constante, riesgo manejable. El más popular.", color:"#c9a84c", risk:"Bajo-Medio" },
  { icon:"🚀", name:"Agresivo",    rate:"12%+/año", desc:"Enfocado en crecimiento. Mayor potencial pero más volatilidad mensual.", color:"#ff4757", risk:"Medio" },
];

const WHY = [
  { icon:"🏦", title:"No es especulación, es ahorro estructurado", desc:"Los ETFs contienen cientos de empresas. Si una quiebra, el resto lo cubre. Lo opuesto a apostar por una sola acción." },
  { icon:"📈", title:"Supera la inflación históricamente", desc:"El S&P 500 ha dado una media del 10-13% anual durante décadas. La inflación ronda el 2-3%. Los ETFs son de las pocas formas de crecer en términos reales." },
  { icon:"🔒", title:"Comisiones bajas, totalmente regulado", desc:"ETFs de mercado amplio cobran el 0,03%/año. Eso es $0,30 por cada $1.000. Vs fondos gestionados que se llevan el 1-2%." },
  { icon:"⏰", title:"Configúralo una vez, crece cada mes", desc:"No necesitas seguir el mercado. Compra una vez al mes. Nuestro motor selecciona los ETFs — tú solo aportas." },
];

const FAQ = [
  { q:"¿Necesito saber de bolsa para usarlo?", a:"No. ETF.PLAN te dice exactamente qué comprar cada mes. Solo necesitas una cuenta en un broker gratuito (Robinhood, eToro) y seguir las instrucciones." },
  { q:"¿Cuánto dinero necesito para empezar?", a:"Desde $50 al mes. No hay mínimo de nuestra parte. Puedes cambiar tu aportación en cualquier momento." },
  { q:"¿Cuándo veré ganancias?", a:"Los ETFs son inversión a largo plazo. La mayoría empieza a ver ganancias significativas en 3-5 años. El poder real del interés compuesto aparece en los años 7-10." },
  { q:"¿Qué pasa si el mercado cae?", a:"Los mercados siempre han recuperado. Los meses de caída son una oportunidad: tu $100 compra más participaciones a precios bajos. Por eso la constancia importa más que el momento de entrada." },
  { q:"¿Es esto asesoramiento financiero?", a:"No. ETF.PLAN proporciona información educativa. Las rentabilidades pasadas no garantizan resultados futuros. Haz siempre tu propia investigación." },
];

const ETFS = [
  { ticker:"QQQ",  name:"Nasdaq-100",   ret:"+18,0%", color:"#8b5cf6", positive:true },
  { ticker:"VTI",  name:"Total Market", ret:"+13,5%", color:"#00b96b", positive:true },
  { ticker:"VOO",  name:"S&P 500",      ret:"+13,2%", color:"#3b82f6", positive:true },
  { ticker:"SCHD", name:"Dividendos",   ret:"+12,0%", color:"#c9a84c", positive:true },
];
const TAPE = [...ETFS,...ETFS,...ETFS,...ETFS,...ETFS,...ETFS];

export default function HomeES() {
  const [amount, setAmount] = useState(100);
  const [year,   setYear]   = useState("10");
  const [isMob,  setIsMob]  = useState(false);
  const [pool,   setPool]   = useState({});

  useEffect(() => {
    const fn = () => setIsMob(window.innerWidth < 700);
    fn(); window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    const sb = createClient();
    sb.from("etf_data").select("ticker,price,change_pct").then(({ data }) => {
      if (data) { const m = {}; data.forEach(e => { m[e.ticker] = e; }); setPool(m); }
    });
  }, []);

  const d   = PASSIVE[amount];
  const row = year === "3" ? { p:d.y3p, a:d.y3a, c:d.y3c }
            : year === "5" ? { p:d.y5p, a:d.y5a, c:d.y5c }
            :                { p:d.y10p, a:d.y10a, c:d.y10c };

  // ── Shared style tokens ───────────────────────────────────────────────────
  const G = "#00b96b", D = "#1a1a2e", MU = "#7a7a8a", BG = "#f8f8f5", BOR = "#e8e8e2";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background:${BG}; color:${D}; font-family:'DM Sans',Arial,sans-serif; }
    @keyframes marquee { 0% { transform:translateX(0) } 100% { transform:translateX(-50%) } }
    .pixel { font-family:'DM Mono',monospace; }
    table { width:100%; border-collapse:collapse; }
    button { font-family:'DM Sans',Arial,sans-serif; }
  `;

  const btn = (active) => ({
    padding:"10px 24px", borderRadius:10, cursor:"pointer",
    border:`2px solid ${active ? G : BOR}`,
    background: active ? G : "white",
    color: active ? "white" : D,
    fontSize:15, fontWeight:700,
  });

  const yearBtn = (v) => ({
    padding:"6px 16px", borderRadius:8, cursor:"pointer", fontSize:13,
    border:`1.5px solid ${year===v ? D : BOR}`,
    background: year===v ? D : "transparent",
    color: year===v ? "white" : MU,
  });

  return (
    <>
      <style>{css}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header style={{ background:BG, borderBottom:`1px solid ${BOR}`, padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <Link href="/es" className="pixel" style={{ fontSize:isMob?9:11, color:D, textDecoration:"none", letterSpacing:1 }}>
          ETF<span style={{ color:G }}>.</span>PLAN
        </Link>
        <div style={{ display:"flex", gap:isMob?8:14, alignItems:"center" }}>
          {!isMob && <Link href="/es/blog"  style={{ fontSize:14, color:MU, textDecoration:"none" }}>Blog</Link>}
          {!isMob && <Link href="/es/learn" style={{ fontSize:14, color:MU, textDecoration:"none" }}>Aprender</Link>}
          <Link href="/login" style={{ fontSize:14, color:MU, textDecoration:"none" }}>{isMob?"Entrar":"Entrar"}</Link>
          <Link href="/" style={{ fontSize:12, color:MU, padding:"5px 10px", border:`1px solid ${BOR}`, borderRadius:6, textDecoration:"none" }}>🇬🇧 EN</Link>
          <Link href="/login?mode=signup" style={{ fontSize:13, fontWeight:700, color:"white", background:G, padding:"8px 16px", borderRadius:8, textDecoration:"none", whiteSpace:"nowrap" }}>
            {isMob?"Empezar →":"Empezar gratis →"}
          </Link>
        </div>
      </header>

      {/* ── TICKER TAPE ────────────────────────────────────────────────── */}
      <div style={{ background:D, overflow:"hidden", padding:"8px 0" }}>
        <div style={{ display:"flex", gap:32, width:"max-content", animation:"marquee 28s linear infinite" }}>
          {TAPE.map((e,i) => {
            const live = pool[e.ticker];
            const chg  = live?.change_pct;
            const pos  = chg == null ? e.positive : chg >= 0;
            return (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"center", whiteSpace:"nowrap" }}>
                <span style={{ fontFamily:"DM Mono,monospace", fontSize:11, fontWeight:700, color:e.color }}>{e.ticker}</span>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{e.name}</span>
                <span style={{ fontFamily:"DM Mono,monospace", fontSize:11, color:pos?G:"#ff4757", fontWeight:600 }}>
                  {chg != null ? `${chg>=0?"+":""}${(chg*100).toFixed(2)}%` : e.ret}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ background:`linear-gradient(180deg,${D} 0%,${D} 65%,${BG} 100%)`, padding:isMob?"56px 20px 72px":"80px 24px 96px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,185,107,0.12)", border:"1px solid rgba(0,185,107,0.25)", borderRadius:100, padding:"5px 16px", marginBottom:24 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:G, display:"inline-block" }} />
          <span style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:G, letterSpacing:1 }}>PLANIFICADOR GRATUITO DE ETFs</span>
        </div>

        <h1 style={{ fontSize:isMob?"clamp(30px,10vw,46px)":"clamp(44px,5.5vw,72px)", fontWeight:800, color:"white", letterSpacing:"-1.5px", lineHeight:1.05, marginBottom:18 }}>
          $100/mes hoy.<br />
          <span style={{ color:G }}>+$1.755/año para siempre.</span>
        </h1>

        <p style={{ fontSize:isMob?14:17, color:"rgba(255,255,255,0.6)", maxWidth:560, margin:"0 auto 32px", lineHeight:1.75 }}>
          Invierte $100 al mes durante 10 años. Tu cartera genera <strong style={{ color:"white" }}>+$1.755 al año de forma pasiva</strong> — móvil, seguro del coche y todas tus suscripciones pagadas. Plan gratuito, 2 minutos.
        </p>

        <div style={{ display:"flex", flexDirection:isMob?"column":"row", gap:12, justifyContent:"center", alignItems:"center" }}>
          <Link href="/login?mode=signup"
            onClick={() => track("cta_click", { button:"hero_es" })}
            style={{ display:"inline-block", background:G, color:"white", fontWeight:700, fontSize:16, padding:"15px 32px", borderRadius:12, textDecoration:"none", boxShadow:"0 4px 24px rgba(0,185,107,0.35)" }}>
            Crear mi plan gratis →
          </Link>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>Sin tarjeta · Sin compromiso</span>
        </div>
      </section>

      {/* ── COMPARE TABLE ───────────────────────────────────────────────── */}
      <section style={{ padding:isMob?"40px 16px":"56px 24px", maxWidth:820, margin:"0 auto" }}>
        <h2 style={{ fontSize:isMob?18:24, fontWeight:700, textAlign:"center", marginBottom:6, letterSpacing:"-0.5px" }}>
          Qué hace $100/mes según dónde lo pones
        </h2>
        <p style={{ fontSize:14, color:MU, textAlign:"center", marginBottom:24 }}>Comparado con una cuenta de ahorro.</p>
        <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
          <table style={{ minWidth:480 }}>
            <thead>
              <tr style={{ borderBottom:`2px solid ${BOR}` }}>
                {["Dónde","Tasa","5 años","10 años"].map(h => (
                  <th key={h} style={{ padding:"10px 12px", textAlign:h==="Dónde"?"left":"right", fontSize:11, fontFamily:"DM Mono,monospace", color:"#aaaabc", letterSpacing:1, fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r,i) => (
                <tr key={i} style={{ borderBottom:`1px solid #f0f0ec`, opacity:r.dim?0.5:1 }}>
                  <td style={{ padding:"13px 12px", fontSize:14, fontWeight:r.dim?400:600 }}>{r.label}</td>
                  <td style={{ padding:"13px 12px", textAlign:"right", fontFamily:"DM Mono,monospace", fontSize:13, color:r.dim?"#aaaabc":r.color }}>{r.rate}</td>
                  <td style={{ padding:"13px 12px", textAlign:"right", fontFamily:"DM Mono,monospace", fontSize:13, color:r.dim?"#7a7a8a":r.color }}>{r.y5}</td>
                  <td style={{ padding:"13px 12px", textAlign:"right", fontFamily:"DM Mono,monospace", fontSize:14, fontWeight:700, color:r.dim?"#7a7a8a":r.color }}>{r.y10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── PLANS ───────────────────────────────────────────────────────── */}
      <section style={{ background:D, padding:isMob?"40px 16px":"56px 24px" }}>
        <h2 style={{ fontSize:isMob?18:26, fontWeight:700, textAlign:"center", color:"white", marginBottom:6, letterSpacing:"-0.5px" }}>Tres planes. Para cada nivel de riesgo.</h2>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", textAlign:"center", marginBottom:28 }}>Los tres superan a una cuenta de ahorro.</p>
        <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"repeat(3,1fr)", gap:14, maxWidth:880, margin:"0 auto" }}>
          {PLANS.map(pl => (
            <div key={pl.name} style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${pl.color}33`, borderRadius:14, padding:22 }}>
              <div style={{ fontSize:26, marginBottom:10 }}>{pl.icon}</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                <span style={{ fontSize:16, fontWeight:700, color:"white" }}>{pl.name}</span>
                <span style={{ fontFamily:"DM Mono,monospace", fontSize:11, color:pl.color, background:`${pl.color}18`, padding:"2px 8px", borderRadius:100 }}>{pl.rate}</span>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.65, marginBottom:12 }}>{pl.desc}</p>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.25)", fontFamily:"DM Mono,monospace" }}>Riesgo: {pl.risk}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALCULATOR ──────────────────────────────────────────────────── */}
      <section style={{ padding:isMob?"40px 16px":"56px 24px", maxWidth:680, margin:"0 auto", textAlign:"center" }}>
        <h2 style={{ fontSize:isMob?18:24, fontWeight:700, marginBottom:6, letterSpacing:"-0.5px" }}>Mira qué hace tu dinero</h2>
        <p style={{ fontSize:14, color:MU, marginBottom:24 }}>Elige tu aportación mensual. Descubre cuánto genera pasivamente.</p>

        {/* Amount picker */}
        <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:16, flexWrap:"wrap" }}>
          {[50,100,150].map(v => (
            <button key={v} onClick={() => { setAmount(v); track("calculator_interaction",{amount:v}); }} style={btn(amount===v)}>
              ${v}/mes
            </button>
          ))}
        </div>

        {/* Year picker */}
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:24 }}>
          {[["3","3 años"],["5","5 años"],["10","10 años"]].map(([v,l]) => (
            <button key={v} onClick={() => setYear(v)} style={yearBtn(v)}>{l}</button>
          ))}
        </div>

        {/* Result card */}
        <div style={{ background:D, borderRadius:16, padding:isMob?"24px 16px":"32px 36px" }}>
          <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:2, marginBottom:10 }}>PLAN EQUILIBRADO · ${amount}/MES</div>
          <div style={{ fontSize:isMob?38:54, fontWeight:800, color:"white", letterSpacing:"-1.5px", lineHeight:1 }}>{row.p}</div>
          <div style={{ fontFamily:"DM Mono,monospace", fontSize:13, color:G, marginTop:6, marginBottom:16 }}>cartera estimada</div>
          <div style={{ height:1, background:"rgba(255,255,255,0.08)", marginBottom:16 }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:4 }}>GENERA</div>
              <div style={{ fontSize:22, fontWeight:700, color:G }}>{row.a}</div>
            </div>
            <div style={{ textAlign:"right", maxWidth:240 }}>
              <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:4 }}>ES DECIR</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", lineHeight:1.5 }}>{row.c}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY ETFs ────────────────────────────────────────────────────── */}
      <section style={{ background:BG, borderTop:`1px solid ${BOR}`, padding:isMob?"40px 16px":"56px 24px" }}>
        <h2 style={{ fontSize:isMob?18:24, fontWeight:700, textAlign:"center", marginBottom:28, letterSpacing:"-0.5px", maxWidth:560, margin:"0 auto 28px" }}>
          Por qué ETFs — no cuentas de ahorro, no acciones individuales
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:isMob?"1fr":"1fr 1fr", gap:16, maxWidth:820, margin:"0 auto" }}>
          {WHY.map(w => (
            <div key={w.title} style={{ background:"white", borderRadius:14, padding:22, border:`1px solid ${BOR}` }}>
              <div style={{ fontSize:24, marginBottom:10 }}>{w.icon}</div>
              <div style={{ fontSize:15, fontWeight:700, marginBottom:6, color:D }}>{w.title}</div>
              <p style={{ fontSize:14, color:MU, lineHeight:1.7, margin:0 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOG CTA ────────────────────────────────────────────────────── */}
      <section style={{ padding:isMob?"32px 16px":"40px 24px", maxWidth:820, margin:"0 auto" }}>
        <div style={{ background:"white", border:`1px solid ${BOR}`, borderRadius:16, padding:isMob?"20px 16px":"24px 32px", display:"flex", flexDirection:isMob?"column":"row", alignItems:isMob?"flex-start":"center", justifyContent:"space-between", gap:16 }}>
          <div>
            <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:G, letterSpacing:1, marginBottom:6 }}>BLOG DE INVERSIÓN</div>
            <div style={{ fontSize:isMob?15:17, fontWeight:700, color:D, marginBottom:4 }}>Guías, estrategias e insights de mercado</div>
            <p style={{ fontSize:13, color:MU, margin:0 }}>Aprende a invertir paso a paso con artículos en español.</p>
          </div>
          <Link href="/es/blog" style={{ display:"inline-block", background:D, color:"white", fontWeight:700, fontSize:14, padding:"11px 22px", borderRadius:10, textDecoration:"none", whiteSpace:"nowrap", flexShrink:0 }}>
            Ver el blog →
          </Link>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section style={{ background:D, padding:isMob?"48px 16px":"64px 24px", textAlign:"center" }}>
        <h2 style={{ fontSize:isMob?20:30, fontWeight:800, color:"white", marginBottom:10, letterSpacing:"-0.5px" }}>
          Tu cartera no se construye sola.
        </h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", marginBottom:28 }}>2 minutos. Gratis para siempre. Sin tarjeta de crédito.</p>
        <Link href="/login?mode=signup"
          onClick={() => track("cta_click",{button:"bottom_es"})}
          style={{ display:"inline-block", background:G, color:"white", fontWeight:700, fontSize:16, padding:"15px 36px", borderRadius:12, textDecoration:"none", boxShadow:"0 4px 24px rgba(0,185,107,0.35)" }}>
          Obtener mi plan de ETFs gratis →
        </Link>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section style={{ padding:isMob?"40px 16px":"56px 24px", maxWidth:660, margin:"0 auto" }}>
        <h2 style={{ fontSize:isMob?18:22, fontWeight:700, textAlign:"center", marginBottom:28, letterSpacing:"-0.5px" }}>Preguntas frecuentes</h2>
        {FAQ.map((f,i) => <FAQItem key={i} q={f.q} a={f.a} G={G} />)}
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop:`1px solid ${BOR}`, padding:"24px 20px" }}>
        <div style={{ maxWidth:820, margin:"0 auto", display:"flex", flexDirection:isMob?"column":"row", justifyContent:"space-between", alignItems:isMob?"flex-start":"center", gap:12 }}>
          <span className="pixel" style={{ fontSize:10, color:D, letterSpacing:1 }}>ETF<span style={{ color:G }}>.</span>PLAN</span>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"center" }}>
            <Link href="/es/blog"  style={{ fontSize:13, color:MU, textDecoration:"none" }}>Blog</Link>
            <Link href="/privacy"  style={{ fontSize:13, color:MU, textDecoration:"none" }}>Privacidad</Link>
            <Link href="/terms"    style={{ fontSize:13, color:MU, textDecoration:"none" }}>Términos</Link>
            <a href="https://www.instagram.com/etfplan/" target="_blank" rel="noreferrer" style={{ fontSize:13, color:MU, textDecoration:"none" }}>@etfplan</a>
            <Link href="/"         style={{ fontSize:13, color:MU, textDecoration:"none" }}>🇬🇧 English</Link>
          </div>
          <p style={{ fontSize:12, color:"#cccccc", margin:0 }}>No es asesoramiento financiero.</p>
        </div>
      </footer>
    </>
  );
}

function FAQItem({ q, a, G }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:"1px solid #f0f0ec", padding:"16px 0" }}>
      <button onClick={() => setOpen(!open)} style={{
        width:"100%", background:"none", border:"none", textAlign:"left",
        cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16,
      }}>
        <span style={{ fontSize:15, fontWeight:600, color:"#1a1a2e", lineHeight:1.5 }}>{q}</span>
        <span style={{ fontSize:20, color:G, flexShrink:0, lineHeight:1 }}>{open?"−":"+"}</span>
      </button>
      {open && <p style={{ fontSize:14, color:"#7a7a8a", lineHeight:1.75, marginTop:10, paddingRight:28 }}>{a}</p>}
    </div>
  );
}
