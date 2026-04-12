import Link from "next/link";

export const metadata = {
  title: "¿Qué son los ETFs? La guía definitiva para principiantes | ETF.PLAN",
  description: "Los ETFs explicados de forma sencilla. Qué son, cómo funcionan, por qué superan a los fondos tradicionales y cómo empezar a invertir desde $50/mes. Sin jerga.",
  keywords: "qué es un ETF, ETF para principiantes, cómo invertir en ETFs, fondos cotizados, S&P 500 ETF, inversión pasiva, ETF España",
  openGraph: {
    title: "¿Qué son los ETFs? Guía para principiantes",
    description: "Todo lo que necesitas saber sobre ETFs — qué son, por qué funcionan y cómo empezar desde $50/mes.",
    type: "article",
  },
  alternates: {
    canonical: "https://etfplan.app/es/learn",
    languages: { "en": "https://etfplan.app/learn" },
  },
};

const PLATFORMS = [
  {
    name: "eToro",
    logo: "🟤",
    color: "#2196a0",
    bg: "rgba(33,150,160,0.06)",
    border: "rgba(33,150,160,0.2)",
    min: "$10",
    fees: "Sin comisiones en acciones y ETFs",
    best: "El mejor para inversores globales",
    pros: ["Disponible en 100+ países", "ETFs fraccionados", "Interfaz muy sencilla", "Copy trading"],
    cons: ["Comisión de retirada ($5)", "Spread en algunos activos"],
    url: "https://www.etoro.com",
  },
  {
    name: "Interactive Brokers",
    logo: "🔵",
    color: "#0066cc",
    bg: "rgba(0,102,204,0.06)",
    border: "rgba(0,102,204,0.2)",
    min: "$0",
    fees: "Desde $0",
    best: "El mejor para inversores serios",
    pros: ["Acceso a mercados globales", "Herramientas avanzadas", "IBKR Lite gratuito", "Tasas de margen muy bajas"],
    cons: ["Interfaz compleja para principiantes"],
    url: "https://www.interactivebrokers.com",
  },
  {
    name: "Degiro",
    logo: "🟠",
    color: "#ff6600",
    bg: "rgba(255,102,0,0.06)",
    border: "rgba(255,102,0,0.2)",
    min: "$0",
    fees: "Comisiones muy bajas",
    best: "El mejor para Europa",
    pros: ["Popular en España y Europa", "Comisiones entre las más bajas", "Amplia selección de ETFs", "Regulado en UE"],
    cons: ["Sin acciones fraccionadas", "Interfaz menos intuitiva"],
    url: "https://www.degiro.es",
  },
  {
    name: "Vanguard",
    logo: "🔴",
    color: "#8b0000",
    bg: "rgba(139,0,0,0.06)",
    border: "rgba(139,0,0,0.2)",
    min: "$1",
    fees: "Sin comisión en ETFs Vanguard",
    best: "El mejor para largo plazo",
    pros: ["Ratios de gastos más bajos del sector", "Propiedad de sus inversores", "VTI, VOO, SCHD directamente", "50+ años de confianza"],
    cons: ["Interfaz más anticuada", "Solo disponible en EE.UU."],
    url: "https://investor.vanguard.com",
  },
];

const TOP_ETFS = [
  { ticker:"VTI",  name:"Vanguard Total Stock Market", color:"#00b96b", desc:"Todo el mercado de EE.UU. en un fondo. Más de 3.700 empresas.",           cagr:"13,5%", expense:"0,03%", risk:"Bajo"  },
  { ticker:"VOO",  name:"Vanguard S&P 500",            color:"#3b82f6", desc:"Las 500 mayores empresas de EE.UU. El estándar de oro.",                  cagr:"13,2%", expense:"0,03%", risk:"Bajo"  },
  { ticker:"QQQ",  name:"Invesco Nasdaq-100",          color:"#8b5cf6", desc:"Las 100 principales empresas tecnológicas y de crecimiento.",              cagr:"18,0%", expense:"0,20%", risk:"Medio" },
  { ticker:"SCHD", name:"Schwab US Dividend Equity",   color:"#c9a84c", desc:"Empresas que pagan dividendos constantes y crecientes.",                  cagr:"12,0%", expense:"0,06%", risk:"Bajo"  },
  { ticker:"BND",  name:"Vanguard Total Bond Market",  color:"#6b7280", desc:"Más de 10.000 bonos. El ancla de estabilidad de una cartera conservadora.",cagr:"3,8%",  expense:"0,03%", risk:"Muy bajo"},
];

const HOW_STEPS = [
  { n:"01", title:"Abre una cuenta en un broker", desc:"eToro, Degiro e Interactive Brokers son las opciones más populares en España y Latinoamérica. Gratis, en 5 minutos." },
  { n:"02", title:"Decide cuánto puedes invertir al mes", desc:"Empieza con lo que puedas: $50, $100 o $150. La consistencia importa más que la cantidad. Puedes cambiarlo en cualquier momento." },
  { n:"03", title:"Elige tu nivel de riesgo", desc:"Conservador (bonos + dividendos), Equilibrado (mezcla) o Agresivo (tecnología + crecimiento). ETF.PLAN te asigna los ETFs correctos para cada perfil." },
  { n:"04", title:"Compra tus ETFs el día 1 de cada mes", desc:"ETF.PLAN te envía un email el 1 de cada mes con exactamente qué comprar y cuánto. Abres tu broker, ejecutas. 5 minutos." },
  { n:"05", title:"No vendas. Espera.", desc:"El tiempo es tu mejor activo. Cada mes que inviertes, el interés compuesto hace su trabajo. La mayor amenaza es vender en pánico." },
];

const G = "#00b96b", D = "#1a1a2e", MU = "#7a7a8a", BOR = "#e8e8e2", BG = "#f8f8f5";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:${BG};color:${D};font-family:'DM Sans',Arial,sans-serif;}
  .mono{font-family:'DM Mono',monospace;}
  .pixel{font-family:'DM Mono',monospace;letter-spacing:1px;}
`;

export default function LearnES() {
  return (
    <>
      <style>{css}</style>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <header style={{ background:BG, borderBottom:`1px solid ${BOR}`, padding:"0 clamp(16px,4vw,40px)", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <Link href="/es" className="pixel" style={{ fontSize:"clamp(9px,2vw,11px)", color:D, textDecoration:"none" }}>
          ETF<span style={{ color:G }}>.</span>PLAN
        </Link>
        <div style={{ display:"flex", gap:"clamp(10px,2vw,20px)", alignItems:"center" }}>
          <Link href="/es/blog"  style={{ fontSize:14, color:MU, textDecoration:"none" }}>Blog</Link>
          <Link href="/login"    style={{ fontSize:14, color:MU, textDecoration:"none" }}>Entrar</Link>
          <Link href="/"         style={{ fontSize:12, color:MU, padding:"5px 10px", border:`1px solid ${BOR}`, borderRadius:6, textDecoration:"none" }}>🇬🇧 EN</Link>
          <Link href="/login?mode=signup" style={{ fontSize:13, fontWeight:700, color:"white", background:G, padding:"8px clamp(12px,2vw,20px)", borderRadius:8, textDecoration:"none", whiteSpace:"nowrap" }}>
            Empezar gratis →
          </Link>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ background:D, padding:"clamp(48px,8vw,80px) clamp(16px,4vw,40px)", textAlign:"center" }}>
        <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:2, marginBottom:16 }}>ETF.PLAN · GUÍA DE APRENDIZAJE</div>
        <h1 style={{ fontSize:"clamp(28px,6vw,52px)", fontWeight:800, color:"white", letterSpacing:"-1px", lineHeight:1.1, marginBottom:16, maxWidth:680, margin:"0 auto 16px" }}>
          ¿Qué son los ETFs?<br /><span style={{ color:G }}>Todo lo que necesitas saber.</span>
        </h1>
        <p style={{ fontSize:"clamp(14px,2.5vw,17px)", color:"rgba(255,255,255,0.55)", maxWidth:540, margin:"0 auto 32px", lineHeight:1.75 }}>
          Sin jerga, sin complicaciones. Cómo funciona la inversión en ETFs, por qué supera a las cuentas de ahorro y cómo empezar hoy.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/login?mode=signup" style={{ display:"inline-block", background:G, color:"white", fontWeight:700, fontSize:15, padding:"13px 28px", borderRadius:10, textDecoration:"none", boxShadow:"0 4px 20px rgba(0,185,107,0.3)" }}>
            Crear mi plan gratis →
          </Link>
          <Link href="/es/blog" style={{ display:"inline-block", background:"rgba(255,255,255,0.08)", color:"white", fontWeight:600, fontSize:15, padding:"13px 28px", borderRadius:10, textDecoration:"none", border:"1px solid rgba(255,255,255,0.15)" }}>
            Leer el blog →
          </Link>
        </div>
      </section>

      {/* ── WHAT IS AN ETF ───────────────────────────────────────────────── */}
      <section style={{ maxWidth:840, margin:"0 auto", padding:"clamp(40px,6vw,72px) clamp(16px,4vw,24px)" }}>
        <div className="mono" style={{ fontSize:10, color:G, letterSpacing:2, marginBottom:12 }}>LO BÁSICO</div>
        <h2 style={{ fontSize:"clamp(22px,4vw,34px)", fontWeight:800, letterSpacing:"-0.8px", marginBottom:16, lineHeight:1.2 }}>
          Un ETF es una cesta de<br />cientos de empresas a la vez
        </h2>
        <p style={{ fontSize:"clamp(14px,2vw,16px)", color:MU, lineHeight:1.85, marginBottom:16 }}>
          Cuando compras una participación de <strong style={{ color:D }}>VOO</strong> (Vanguard S&P 500), inmediatamente posees una fracción de las 500 empresas más grandes de EE.UU.: Apple, Microsoft, Amazon, Google, Nvidia y 495 más. Si una empresa quiebra, apenas te afecta.
        </p>
        <p style={{ fontSize:"clamp(14px,2vw,16px)", color:MU, lineHeight:1.85, marginBottom:28 }}>
          Eso es el poder de la diversificación instantánea, incluida por defecto, sin coste adicional.
        </p>

        {/* E-T-F breakdown */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginBottom:32 }}>
          {[
            { letter:"E", word:"Exchange", sub:"Cotizado", desc:"Se compra y vende en la bolsa de valores en tiempo real, como cualquier acción." },
            { letter:"T", word:"Traded",   sub:"en Bolsa", desc:"El precio cambia a lo largo del día de mercado, no solo al cierre." },
            { letter:"F", word:"Fund",     sub:"Fondo",    desc:"Agrupa el dinero de miles de inversores para comprar activos diversificados." },
          ].map(item => (
            <div key={item.letter} style={{ background:"white", border:`1px solid ${BOR}`, borderRadius:14, padding:24, textAlign:"center" }}>
              <div style={{ fontFamily:"DM Mono,monospace", fontSize:40, fontWeight:700, color:G, lineHeight:1, marginBottom:4 }}>{item.letter}</div>
              <div style={{ fontSize:16, fontWeight:700, color:D, marginBottom:2 }}>{item.word}</div>
              <div style={{ fontSize:13, color:MU, marginBottom:10 }}>{item.sub}</div>
              <p style={{ fontSize:13, color:MU, lineHeight:1.65, margin:0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOP ETFs ─────────────────────────────────────────────────────── */}
      <section style={{ background:D, padding:"clamp(40px,6vw,64px) clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:2, marginBottom:12 }}>LOS ETFs MÁS POPULARES</div>
          <h2 style={{ fontSize:"clamp(20px,3.5vw,30px)", fontWeight:700, color:"white", marginBottom:24, letterSpacing:"-0.5px" }}>
            Los ETFs que rastreamos en ETF.PLAN
          </h2>
          <div style={{ display:"grid", gap:12 }}>
            {TOP_ETFS.map(etf => (
              <div key={etf.ticker} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"16px 20px", display:"grid", gridTemplateColumns:"auto 1fr auto auto auto", gap:16, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ fontFamily:"DM Mono,monospace", fontSize:16, fontWeight:700, color:etf.color, minWidth:52 }}>{etf.ticker}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:2 }}>{etf.name}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{etf.desc}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:2 }}>CAGR</div>
                  <div style={{ fontFamily:"DM Mono,monospace", fontSize:14, fontWeight:700, color:G }}>{etf.cagr}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:2 }}>GASTOS</div>
                  <div style={{ fontFamily:"DM Mono,monospace", fontSize:13, color:"rgba(255,255,255,0.6)" }}>{etf.expense}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"DM Mono,monospace", fontSize:10, color:"rgba(255,255,255,0.3)", marginBottom:2 }}>RIESGO</div>
                  <div style={{ fontFamily:"DM Mono,monospace", fontSize:12, color:etf.risk==="Muy bajo"||etf.risk==="Bajo"?G:etf.risk==="Medio"?"#c9a84c":"#ff4757" }}>{etf.risk}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO START ──────────────────────────────────────────────────── */}
      <section style={{ maxWidth:740, margin:"0 auto", padding:"clamp(40px,6vw,72px) clamp(16px,4vw,24px)" }}>
        <div className="mono" style={{ fontSize:10, color:G, letterSpacing:2, marginBottom:12 }}>CÓMO EMPEZAR</div>
        <h2 style={{ fontSize:"clamp(20px,3.5vw,30px)", fontWeight:800, letterSpacing:"-0.5px", marginBottom:28, lineHeight:1.2 }}>
          5 pasos para tu primera inversión en ETFs
        </h2>
        <div style={{ display:"grid", gap:20 }}>
          {HOW_STEPS.map(s => (
            <div key={s.n} style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
              <div style={{ width:40, height:40, borderRadius:10, background:D, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"DM Mono,monospace", fontSize:12, fontWeight:700, color:G, flexShrink:0 }}>{s.n}</div>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:D, marginBottom:4 }}>{s.title}</div>
                <p style={{ fontSize:14, color:MU, lineHeight:1.7, margin:0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORMS ─────────────────────────────────────────────────────── */}
      <section style={{ background:BG, borderTop:`1px solid ${BOR}`, padding:"clamp(40px,6vw,64px) clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div className="mono" style={{ fontSize:10, color:G, letterSpacing:2, marginBottom:12, textAlign:"center" }}>DÓNDE COMPRAR</div>
          <h2 style={{ fontSize:"clamp(20px,3.5vw,28px)", fontWeight:700, textAlign:"center", marginBottom:28, letterSpacing:"-0.5px" }}>
            Los brokers más populares para ETFs
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
            {PLATFORMS.map(p => (
              <div key={p.name} style={{ background:"white", border:`1px solid ${p.border}`, borderRadius:14, padding:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <span style={{ fontSize:22 }}>{p.logo}</span>
                  <div>
                    <div style={{ fontSize:16, fontWeight:700, color:D }}>{p.name}</div>
                    <div style={{ fontSize:11, color:p.color, fontFamily:"DM Mono,monospace" }}>{p.best}</div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                  {[["Mínimo",p.min],["Comisiones",p.fees]].map(([k,v]) => (
                    <div key={k} style={{ background:BG, borderRadius:8, padding:"8px 10px" }}>
                      <div style={{ fontSize:10, color:"#aaaabc", fontFamily:"DM Mono,monospace", marginBottom:3 }}>{k.toUpperCase()}</div>
                      <div style={{ fontSize:13, fontWeight:600, color:D }}>{v}</div>
                    </div>
                  ))}
                </div>
                <ul style={{ listStyle:"none", marginBottom:14 }}>
                  {p.pros.map(pr => <li key={pr} style={{ fontSize:13, color:MU, padding:"2px 0", paddingLeft:16, position:"relative" }}><span style={{ position:"absolute", left:0, color:G }}>✓</span>{pr}</li>)}
                </ul>
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  style={{ display:"block", textAlign:"center", padding:"9px 0", background:p.bg, border:`1px solid ${p.border}`, borderRadius:8, color:p.color, fontWeight:700, fontSize:13, textDecoration:"none" }}>
                  Abrir cuenta en {p.name} →
                </a>
              </div>
            ))}
          </div>
          <p style={{ fontSize:12, color:"#aaaabc", textAlign:"center", marginTop:16 }}>
            Esta página puede contener enlaces de afiliado. Podemos ganar una comisión si te registras a través de nuestros enlaces, sin coste adicional para ti.
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ background:D, padding:"clamp(48px,7vw,72px) clamp(16px,4vw,40px)", textAlign:"center" }}>
        <div className="mono" style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:2, marginBottom:14 }}>SIGUIENTE PASO</div>
        <h2 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:800, color:"white", marginBottom:10, letterSpacing:"-0.8px" }}>
          Deja que ETF.PLAN elija los ETFs por ti
        </h2>
        <p style={{ fontSize:"clamp(14px,2vw,16px)", color:"rgba(255,255,255,0.5)", maxWidth:480, margin:"0 auto 28px", lineHeight:1.75 }}>
          Responde 2 preguntas. Nosotros calculamos qué ETFs comprar, cuánto asignar a cada uno y te avisamos cada mes. Gratis para siempre.
        </p>
        <Link href="/login?mode=signup" style={{ display:"inline-block", background:G, color:"white", fontWeight:700, fontSize:16, padding:"14px 32px", borderRadius:12, textDecoration:"none", boxShadow:"0 4px 24px rgba(0,185,107,0.35)" }}>
          Crear mi plan de ETFs gratis →
        </Link>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.25)", marginTop:12 }}>Sin tarjeta de crédito · Sin compromiso · 2 minutos</p>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop:`1px solid ${BOR}`, padding:"24px clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <span className="pixel" style={{ fontSize:10, color:D }}>ETF<span style={{ color:G }}>.</span>PLAN</span>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <Link href="/es"       style={{ fontSize:13, color:MU, textDecoration:"none" }}>Inicio</Link>
            <Link href="/es/blog"  style={{ fontSize:13, color:MU, textDecoration:"none" }}>Blog</Link>
            <Link href="/privacy"  style={{ fontSize:13, color:MU, textDecoration:"none" }}>Privacidad</Link>
            <Link href="/terms"    style={{ fontSize:13, color:MU, textDecoration:"none" }}>Términos</Link>
            <Link href="/learn"    style={{ fontSize:13, color:MU, textDecoration:"none" }}>🇬🇧 English</Link>
          </div>
          <p style={{ fontSize:12, color:"#cccccc", margin:0 }}>No es asesoramiento financiero.</p>
        </div>
      </footer>
    </>
  );
}
