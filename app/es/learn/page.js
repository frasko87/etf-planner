import Link from "next/link";

export const metadata = {
  title: "¿Qué son los ETFs? Todo lo que necesitas saber para empezar | ETF.PLAN",
  description: "Los ETFs explicados sin rollos. Qué son, por qué funcionan mejor que los fondos tradicionales y cómo empezar a invertir desde $50 al mes. Sin jerga, sin trampa.",
  keywords: "qué es un ETF, ETF para principiantes, cómo invertir en ETFs, fondos cotizados, S&P 500 ETF, inversión pasiva España",
  openGraph: {
    title: "¿Qué son los ETFs? Guía sin rollos para empezar",
    description: "Todo lo que necesitas saber sobre ETFs — sin tecnicismos y con ejemplos reales.",
    type: "article",
  },
  alternates: {
    canonical: "https://etfplan.app/es/learn",
    languages: { "en": "https://etfplan.app/learn" },
  },
};

const TOP_ETFS = [
  { ticker:"VTI",  name:"Vanguard Total Stock Market", color:"#00b96b", desc:"Todo el mercado americano en un solo fondo. Más de 3.700 empresas.",           cagr:"13,5%", expense:"0,03%", risk:"Bajo"     },
  { ticker:"VOO",  name:"Vanguard S&P 500",            color:"#3b82f6", desc:"Las 500 empresas más grandes de EE.UU. El fondo más popular del mundo.",        cagr:"13,2%", expense:"0,03%", risk:"Bajo"     },
  { ticker:"QQQ",  name:"Invesco Nasdaq-100",          color:"#8b5cf6", desc:"Las 100 mayores empresas tecnológicas. Apple, Nvidia, Microsoft, Google.",      cagr:"18,0%", expense:"0,20%", risk:"Medio"    },
  { ticker:"SCHD", name:"Schwab US Dividend Equity",   color:"#c9a84c", desc:"Empresas que llevan años pagando dividendos crecientes. Ideal para ingresos.",   cagr:"12,0%", expense:"0,06%", risk:"Bajo"     },
  { ticker:"BND",  name:"Vanguard Total Bond Market",  color:"#6b7280", desc:"Más de 10.000 bonos. El estabilizador de una cartera conservadora.",            cagr:"3,8%",  expense:"0,03%", risk:"Muy bajo" },
];

const PLATFORMS = [
  { name:"eToro",               flag:"🌍", best:"Para todo el mundo",    min:"$10",  fees:"Sin comisiones en ETFs", pros:["Disponible en 100+ países","Participaciones fraccionadas","App muy fácil de usar","Regulado en Europa"], url:"https://www.etoro.com" },
  { name:"Degiro",              flag:"🇪🇺", best:"Para Europa",          min:"$0",   fees:"Comisiones muy bajas",   pros:["Popular en España","Más de 50 ETFs gratuitos","Regulado en la UE","Interfaz limpia"],                    url:"https://www.degiro.es" },
  { name:"Interactive Brokers", flag:"🌐", best:"Para inversores serios", min:"$0",   fees:"Desde $0",              pros:["Acceso a mercados globales","Herramientas avanzadas","Plan gratuito (IBKR Lite)","Tasas de margen bajas"], url:"https://www.interactivebrokers.com" },
  { name:"Robinhood",           flag:"🇺🇸", best:"Para EE.UU.",          min:"$1",   fees:"Sin comisiones",         pros:["Sin mínimo de cuenta","Participaciones fraccionadas","App muy limpia e intuitiva"],                       url:"https://robinhood.com" },
];

const HOW = [
  { n:"01", t:"Abre una cuenta en un broker", d:"eToro o Degiro son las mejores opciones si estás en España o Latinoamérica. Gratis, en 10 minutos, sin papeleos raros." },
  { n:"02", t:"Decide cuánto puedes invertir al mes", d:"Empieza con lo que puedas — $50, $100 o $150. Lo importante es la constancia, no el importe. Puedes ajustarlo cuando quieras." },
  { n:"03", t:"Elige tu nivel de riesgo", d:"Conservador si prefieres estabilidad, Equilibrado si quieres crecimiento moderado, Agresivo si tienes 10+ años y aguantas la volatilidad. ETF.PLAN te asigna los ETFs automáticamente." },
  { n:"04", t:"Compra el día 1 de cada mes", d:"ETF.PLAN te manda un email cada 1 de mes con exactamente qué comprar y cuánto poner en cada ETF. Abres el broker, ejecutas. 5 minutos." },
  { n:"05", t:"No toques nada. El tiempo hace el trabajo", d:"No vendas en los bajones. No intentes adivinar el mercado. Cuanto más tiempo lo dejes compuesto, más crece. El truco es no hacer nada." },
];

const G="#00b96b", D="#1a1a2e", MU="#7a7a8a", BOR="#e8e8e2", BG="#f8f8f5";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:${BG};color:${D};font-family:'DM Sans',Arial,sans-serif;}
  table{width:100%;border-collapse:collapse;}
  .etf-row:hover{background:rgba(255,255,255,0.08);}
  a.plat-btn:hover{opacity:0.85;}
`;

export default function LearnES() {
  return (
    <>
      <style>{css}</style>

      {/* ── NAV ────────────────────────────────────────────────────────── */}
      <header style={{background:BG,borderBottom:`1px solid ${BOR}`,padding:"0 clamp(16px,4vw,40px)",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <Link href="/es" style={{fontFamily:"DM Mono,monospace",fontSize:"clamp(9px,2vw,11px)",letterSpacing:1,color:D,textDecoration:"none"}}>
          ETF<span style={{color:G}}>.</span>PLAN
        </Link>
        <div style={{display:"flex",gap:"clamp(10px,2vw,20px)",alignItems:"center"}}>
          <Link href="/es/blog"  style={{fontSize:14,color:MU,textDecoration:"none"}}>Blog</Link>
          <Link href="/login"    style={{fontSize:14,color:MU,textDecoration:"none"}}>Entrar</Link>
          <Link href="/"         style={{fontSize:12,color:MU,padding:"5px 10px",border:`1px solid ${BOR}`,borderRadius:6,textDecoration:"none"}}>🇬🇧 EN</Link>
          <Link href="/login?mode=signup" style={{fontSize:13,fontWeight:700,color:"white",background:G,padding:"8px clamp(12px,2vw,20px)",borderRadius:8,textDecoration:"none",whiteSpace:"nowrap"}}>
            Empezar gratis →
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{background:D,padding:"clamp(48px,8vw,80px) clamp(16px,4vw,40px)",textAlign:"center"}}>
        <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:16}}>ETF.PLAN · APRENDE A INVERTIR</div>
        <h1 style={{fontSize:"clamp(26px,5.5vw,52px)",fontWeight:800,color:"white",letterSpacing:"-1px",lineHeight:1.1,marginBottom:16,maxWidth:660,margin:"0 auto 16px"}}>
          ¿Qué es un ETF?<br /><span style={{color:G}}>La guía que ojalá hubiera existido.</span>
        </h1>
        <p style={{fontSize:"clamp(14px,2.5vw,17px)",color:"rgba(255,255,255,0.55)",maxWidth:520,margin:"0 auto 32px",lineHeight:1.8}}>
          Sin tecnicismos, sin rollos. Cómo funcionan los ETFs, por qué son mejores que los fondos tradicionales y cómo empezar hoy mismo.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Link href="/login?mode=signup" style={{display:"inline-block",background:G,color:"white",fontWeight:700,fontSize:15,padding:"13px 28px",borderRadius:10,textDecoration:"none",boxShadow:"0 4px 20px rgba(0,185,107,0.3)"}}>
            Quiero mi plan gratis →
          </Link>
          <Link href="/es/blog" style={{display:"inline-block",background:"rgba(255,255,255,0.08)",color:"white",fontWeight:600,fontSize:15,padding:"13px 28px",borderRadius:10,textDecoration:"none",border:"1px solid rgba(255,255,255,0.15)"}}>
            Ver el blog →
          </Link>
        </div>
      </section>

      {/* ── ETF EXPLAINED ──────────────────────────────────────────────── */}
      <section style={{maxWidth:820,margin:"0 auto",padding:"clamp(40px,6vw,72px) clamp(16px,4vw,24px)"}}>
        <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:G,letterSpacing:2,marginBottom:12}}>LO BÁSICO</div>
        <h2 style={{fontSize:"clamp(20px,4vw,32px)",fontWeight:800,letterSpacing:"-0.8px",marginBottom:16,lineHeight:1.2}}>
          Un ETF es una cesta con cientos de empresas dentro
        </h2>
        <p style={{fontSize:"clamp(14px,2vw,16px)",color:MU,lineHeight:1.9,marginBottom:14}}>
          Cuando compras una participación de <strong style={{color:D}}>VOO</strong>, tienes una pequeña parte de Apple, Microsoft, Amazon, Google y otras 496 empresas a la vez. Si una quiebra, las demás lo cubren. No estás apostando por una empresa — estás apostando a que la economía global sigue creciendo. Y lo ha hecho, sin excepción, durante más de 100 años.
        </p>
        <p style={{fontSize:"clamp(14px,2vw,16px)",color:MU,lineHeight:1.9,marginBottom:32}}>
          La diferencia con un fondo de inversión normal es que el ETF cotiza en bolsa (puedes comprarlo en cualquier momento del día), las comisiones son ridículamente bajas y no hay un gestor humano tomando decisiones — simplemente replica el índice.
        </p>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:32}}>
          {[
            {letter:"E",word:"Exchange",sub:"Cotizado en bolsa",desc:"Se compra y vende en tiempo real, como una acción."},
            {letter:"T",word:"Traded",sub:"Negociado",desc:"El precio cambia a lo largo del día de mercado."},
            {letter:"F",word:"Fund",sub:"Fondo",desc:"Agrupa el dinero de miles de inversores para comprar activos diversificados."},
          ].map(item=>(
            <div key={item.letter} style={{background:"white",border:`1px solid ${BOR}`,borderRadius:14,padding:22,textAlign:"center"}}>
              <div style={{fontFamily:"DM Mono,monospace",fontSize:40,fontWeight:700,color:G,lineHeight:1,marginBottom:4}}>{item.letter}</div>
              <div style={{fontSize:15,fontWeight:700,color:D,marginBottom:2}}>{item.word}</div>
              <div style={{fontSize:12,color:MU,marginBottom:10}}>{item.sub}</div>
              <p style={{fontSize:13,color:MU,lineHeight:1.65,margin:0}}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{background:"#e8f5ee",borderLeft:`3px solid ${G}`,borderRadius:"0 10px 10px 0",padding:"16px 20px"}}>
          <p style={{fontSize:15,color:"#1a5c3a",lineHeight:1.75,margin:0}}>
            💡 <strong>El número que importa:</strong> El S&P 500 ha dado una media del <strong>+10,7% anual</strong> durante los últimos 30 años. Con guerras, crisis del 2008, pandemia y todo. Siempre ha recuperado. Siempre ha marcado nuevos máximos.
          </p>
        </div>
      </section>

      {/* ── TOP ETFs ───────────────────────────────────────────────────── */}
      <section style={{background:D,padding:"clamp(40px,6vw,64px) clamp(16px,4vw,40px)"}}>
        <div style={{maxWidth:860,margin:"0 auto"}}>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:12}}>LOS ETFs QUE RASTREAMOS</div>
          <h2 style={{fontSize:"clamp(18px,3.5vw,28px)",fontWeight:700,color:"white",marginBottom:24,letterSpacing:"-0.5px"}}>
            Los ETFs más usados en ETF.PLAN
          </h2>
          <div style={{display:"grid",gap:10}}>
            {TOP_ETFS.map(etf=>(
              <div key={etf.ticker} className="etf-row" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"clamp(14px,2vw,18px) clamp(14px,2vw,20px)",display:"flex",flexWrap:"wrap",alignItems:"center",gap:12}}>
                <div style={{fontFamily:"DM Mono,monospace",fontSize:16,fontWeight:700,color:etf.color,minWidth:50}}>{etf.ticker}</div>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{fontSize:14,fontWeight:600,color:"white",marginBottom:2}}>{etf.name}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{etf.desc}</div>
                </div>
                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                  {[["CAGR",etf.cagr,G],["GASTOS",etf.expense,"rgba(255,255,255,0.5)"],["RIESGO",etf.risk,etf.risk.includes("bajo")||etf.risk==="Bajo"?G:etf.risk==="Medio"?"#c9a84c":"#ff4757"]].map(([k,v,c])=>(
                    <div key={k} style={{textAlign:"right"}}>
                      <div style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:2,letterSpacing:1}}>{k}</div>
                      <div style={{fontFamily:"DM Mono,monospace",fontSize:13,fontWeight:700,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO START ───────────────────────────────────────────────── */}
      <section style={{maxWidth:720,margin:"0 auto",padding:"clamp(40px,6vw,72px) clamp(16px,4vw,24px)"}}>
        <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:G,letterSpacing:2,marginBottom:12}}>CÓMO EMPEZAR</div>
        <h2 style={{fontSize:"clamp(20px,3.5vw,30px)",fontWeight:800,letterSpacing:"-0.5px",marginBottom:28,lineHeight:1.2}}>
          5 pasos para tu primera inversión
        </h2>
        <div style={{display:"grid",gap:18}}>
          {HOW.map(s=>(
            <div key={s.n} style={{display:"flex",gap:18,alignItems:"flex-start"}}>
              <div style={{width:38,height:38,borderRadius:10,background:D,border:`1px solid ${G}33`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"DM Mono,monospace",fontSize:11,fontWeight:700,color:G,flexShrink:0}}>{s.n}</div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:D,marginBottom:4}}>{s.t}</div>
                <p style={{fontSize:14,color:MU,lineHeight:1.75,margin:0}}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORMS ──────────────────────────────────────────────────── */}
      <section style={{background:BG,borderTop:`1px solid ${BOR}`,padding:"clamp(40px,6vw,64px) clamp(16px,4vw,40px)"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:G,letterSpacing:2,marginBottom:12,textAlign:"center"}}>DÓNDE COMPRAR TUS ETFs</div>
          <h2 style={{fontSize:"clamp(18px,3.5vw,26px)",fontWeight:700,textAlign:"center",marginBottom:8,letterSpacing:"-0.5px"}}>
            Los brokers que recomendamos
          </h2>
          <p style={{fontSize:14,color:MU,textAlign:"center",marginBottom:28}}>Todos gratuitos para abrir. Elige el que más te encaje.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
            {PLATFORMS.map(p=>(
              <div key={p.name} style={{background:"white",border:`1px solid ${BOR}`,borderRadius:14,padding:22}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <span style={{fontSize:22}}>{p.flag}</span>
                  <div>
                    <div style={{fontSize:16,fontWeight:700,color:D}}>{p.name}</div>
                    <div style={{fontSize:11,color:G,fontFamily:"DM Mono,monospace"}}>{p.best}</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                  {[["Mínimo",p.min],["Comisiones",p.fees]].map(([k,v])=>(
                    <div key={k} style={{background:BG,borderRadius:8,padding:"8px 10px"}}>
                      <div style={{fontSize:10,color:"#aaaabc",fontFamily:"DM Mono,monospace",marginBottom:2}}>{k.toUpperCase()}</div>
                      <div style={{fontSize:13,fontWeight:600,color:D}}>{v}</div>
                    </div>
                  ))}
                </div>
                <ul style={{listStyle:"none",marginBottom:14}}>
                  {p.pros.map(pr=><li key={pr} style={{fontSize:13,color:MU,padding:"2px 0 2px 18px",position:"relative"}}><span style={{position:"absolute",left:0,color:G}}>✓</span>{pr}</li>)}
                </ul>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="plat-btn"
                  style={{display:"block",textAlign:"center",padding:"9px",background:D,borderRadius:8,color:"white",fontWeight:700,fontSize:13,textDecoration:"none"}}>
                  Abrir en {p.name} →
                </a>
              </div>
            ))}
          </div>
          <p style={{fontSize:12,color:"#aaaabc",textAlign:"center",marginTop:16}}>
            Esta página puede contener enlaces de afiliado. Si te registras a través de nuestros enlaces podemos recibir una comisión, sin coste extra para ti.
          </p>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section style={{background:D,padding:"clamp(48px,7vw,72px) clamp(16px,4vw,40px)",textAlign:"center"}}>
        <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:14}}>LO QUE VIENE AHORA</div>
        <h2 style={{fontSize:"clamp(20px,4vw,34px)",fontWeight:800,color:"white",marginBottom:10,letterSpacing:"-0.8px"}}>
          ETF.PLAN elige los ETFs por ti
        </h2>
        <p style={{fontSize:"clamp(14px,2vw,16px)",color:"rgba(255,255,255,0.5)",maxWidth:460,margin:"0 auto 28px",lineHeight:1.8}}>
          Respondes 2 preguntas. Nosotros calculamos qué ETFs comprar, cuánto va en cada uno y te avisamos el 1 de cada mes. Gratis.
        </p>
        <Link href="/login?mode=signup" style={{display:"inline-block",background:G,color:"white",fontWeight:700,fontSize:16,padding:"14px 32px",borderRadius:12,textDecoration:"none",boxShadow:"0 4px 24px rgba(0,185,107,0.35)"}}>
          Crear mi plan de ETFs gratis →
        </Link>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.25)",marginTop:12}}>Sin tarjeta · Sin compromiso · 2 minutos</p>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{borderTop:`1px solid ${BOR}`,padding:"24px clamp(16px,4vw,40px)"}}>
        <div style={{maxWidth:900,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <span style={{fontFamily:"DM Mono,monospace",fontSize:10,color:D,letterSpacing:1}}>ETF<span style={{color:G}}>.</span>PLAN</span>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            <Link href="/es"       style={{fontSize:13,color:MU,textDecoration:"none"}}>Inicio</Link>
            <Link href="/es/blog"  style={{fontSize:13,color:MU,textDecoration:"none"}}>Blog</Link>
            <Link href="/privacy"  style={{fontSize:13,color:MU,textDecoration:"none"}}>Privacidad</Link>
            <Link href="/terms"    style={{fontSize:13,color:MU,textDecoration:"none"}}>Términos</Link>
            <Link href="/learn"    style={{fontSize:13,color:MU,textDecoration:"none"}}>🇬🇧 English</Link>
          </div>
          <p style={{fontSize:12,color:"#cccccc",margin:0}}>No es asesoramiento financiero.</p>
        </div>
      </footer>
    </>
  );
}
