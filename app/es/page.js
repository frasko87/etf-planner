"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";

const PASSIVE = {
  50:  { y3p:"$2.073",  y3a:"+$187 al año",  y3c:"pagas el streaming sin trabajar",
         y5p:"$3.799",  y5a:"+$342 al año",  y5c:"la mitad de la factura del móvil, sola",
         y10p:"$9.748", y10a:"+$877 al año",  y10c:"el móvil pagado solo, todos los años" },
  100: { y3p:"$4.146",  y3a:"+$373 al año",  y3c:"Netflix + Spotify + gimnasio pagados",
         y5p:"$7.599",  y5a:"+$684 al año",  y5c:"tu factura del móvil, pagada sola",
         y10p:"$19.497",y10a:"+$1.755 al año",y10c:"el móvil y el seguro del coche pagados, para siempre" },
  150: { y3p:"$6.219",  y3a:"+$560 al año",  y3c:"todas tus suscripciones pagadas",
         y5p:"$11.398", y5a:"+$1.026 al año", y5c:"el móvil y el streaming, sin tocar el sueldo",
         y10p:"$29.245",y10a:"+$2.632 al año",y10c:"más de 200€ al mes sin hacer nada" },
};

const COMPARE = [
  { label:"Cuenta corriente normal",   rate:"0,5%",  y5:"$6.077",  y10:"$12.308", color:"rgba(255,255,255,0.2)",  dim:true  },
  { label:"Depósito de alta rentab.",  rate:"4,5%",  y5:"$6.740",  y10:"$15.177", color:"rgba(255,255,255,0.35)", dim:true  },
  { label:"Plan ETF Conservador",      rate:"~5,5%", y5:"$6.920",  y10:"$16.024", color:"#60a5fa",               dim:false },
  { label:"Plan ETF Equilibrado",      rate:"~9%",   y5:"$7.599",  y10:"$19.497", color:"#00b96b",               dim:false },
  { label:"Plan ETF Agresivo",         rate:"~16%",  y5:"$9.225",  y10:"$30.860", color:"#ff4757",               dim:false },
];

const PLANS = [
  { icon:"🛡️", name:"Conservador", rate:"~5%/año",  desc:"La opción más tranquila. Bonos y empresas que pagan dividendos cada trimestre. Ideal si prefieres dormir bien por las noches.", color:"#3b82f6", risk:"Muy bajo" },
  { icon:"⚖️", name:"Equilibrado", rate:"~9%/año",  desc:"El más popular. Un poco de todo: crecimiento, estabilidad y algo de tecnología. Para quien quiere crecer sin demasiada montaña rusa.", color:"#c9a84c", risk:"Bajo-Medio" },
  { icon:"🚀", name:"Agresivo",    rate:"12%+/año", desc:"Para quien tiene 10+ años por delante y no le importa ver subidas y bajadas fuertes. Mayor riesgo, mayor potencial.", color:"#ff4757", risk:"Medio" },
];

const WHY = [
  { icon:"🏦", title:"No es especulación — es ahorro estructurado", desc:"Un ETF tiene cientos de empresas dentro. Si una quiebra, las demás lo compensan. No estás apostando por nada — estás apostando a que la economía mundial sigue existiendo en 10 años. Lo cual es bastante probable." },
  { icon:"📈", title:"El S&P 500 lleva 100 años subiendo", desc:"Ha sobrevivido guerras, crisis, pandemias y recesiones. Siempre ha recuperado. Si hubieras metido $100 al mes hace 10 años, hoy tendrías casi $20.000." },
  { icon:"🔒", title:"Comisiones ridículamente bajas", desc:"VOO cobra el 0,03% al año — $3 por cada $10.000 invertidos. Un fondo gestionado típico cobra el 1-2%, o sea entre $100 y $200. En 20 años, esa diferencia se come decenas de miles de euros de tus ganancias." },
  { icon:"⏰", title:"Lo configuras una vez. Luego te olvidas.", desc:"No tienes que mirar los mercados cada día ni entender análisis técnico. Inviertes el día 1 del mes, marcas la compra en tu dashboard, y te olvidas hasta el mes siguiente." },
];

const FAQ = [
  { q:"¿Qué es un ETF y por qué debería invertir en uno?", a:"Un ETF (Fondo Cotizado en Bolsa) es una cesta de cientos de acciones o bonos que compras como una sola inversión. Cuando compras VOO, por ejemplo, tienes al instante una pequeña parte de Apple, Microsoft, Amazon, Google y otras 496 empresas. Una sola compra, diversificación total, comisiones mínimas." },
  { q:"¿Cuánto dinero necesito para empezar a invertir en ETFs?", a:"Con tan solo 50 € o dólares al mes. Brokers como eToro permiten comprar participaciones fraccionadas, así que no necesitas comprar una participación entera. ETF.PLAN está diseñado específicamente para personas que ahorran 50, 100 o 150 €/$ al mes." },
  { q:"¿Mi dinero está seguro?", a:"Tu dinero nunca toca ETF.PLAN — no custodiamos fondos. Inviertes directamente a través de tu propio bróker (eToro, Interactive Brokers, Degiro...), que está regulado y asegurado. Nosotros solo te damos la estrategia y registramos lo que nos dices que has comprado." },
  { q:"¿Puedo perder dinero invirtiendo en ETFs?", a:"Sí — cualquier inversión puede bajar a corto plazo. Sin embargo, el S&P 500 nunca ha tenido una rentabilidad negativa en ningún período de 10 años de su historia. Cuanto más tiempo mantengas, más disminuye el riesgo. El ~9% del plan Equilibrado es una media histórica, no una garantía." },
  { q:"¿Qué bróker me recomendáis para comprar ETFs?", a:"ETF.PLAN funciona con cualquier bróker. Para principiantes recomendamos eToro (disponible en España, México, Colombia y más de 100 países), Degiro (muy popular en España y Europa) o Interactive Brokers para inversores más avanzados. Todos son gratuitos para abrir." },
  { q:"¿Con qué frecuencia cambian los ETFs recomendados?", a:"Nuestro motor de puntuación analiza 55 ETFs dos veces al día (apertura y cierre del mercado). Los picks se actualizan cuando los datos cambian de forma significativa — normalmente son estables durante semanas y rotan cuando las condiciones de mercado cambian." },
];

const ETFS = [
  { ticker:"QQQ",  name:"Nasdaq-100",   ret:"+18,0%", color:"#8b5cf6", positive:true },
  { ticker:"VTI",  name:"Total Market", ret:"+13,5%", color:"#00b96b", positive:true },
  { ticker:"VOO",  name:"S&P 500",      ret:"+13,2%", color:"#3b82f6", positive:true },
  { ticker:"SCHD", name:"Dividendos",   ret:"+12,0%", color:"#c9a84c", positive:true },
];
const TAPE = [...ETFS,...ETFS,...ETFS,...ETFS,...ETFS,...ETFS];

const G="#00b96b", D="#1a1a2e", MU="#7a7a8a", BG="#f8f8f5", BOR="#e8e8e2";

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
    createClient().from("etf_data").select("ticker,change_pct").then(({ data }) => {
      if (data) { const m = {}; data.forEach(e => { m[e.ticker] = e; }); setPool(m); }
    });
  }, []);

  const d   = PASSIVE[amount];
  const row = year==="3" ? {p:d.y3p,a:d.y3a,c:d.y3c} : year==="5" ? {p:d.y5p,a:d.y5a,c:d.y5c} : {p:d.y10p,a:d.y10a,c:d.y10c};

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:${BG};color:${D};font-family:'DM Sans',Arial,sans-serif;}
    @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    button{font-family:'DM Sans',Arial,sans-serif;}
    table{width:100%;border-collapse:collapse;}
  `;

  return (
    <>
      <style>{css}</style>

      {/* ── NAV ────────────────────────────────────────────────────────── */}
      <header style={{background:BG,borderBottom:`1px solid ${BOR}`,padding:"0 clamp(16px,4vw,32px)",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <Link href="/es" style={{fontFamily:"DM Mono,monospace",fontSize:"clamp(9px,2vw,11px)",letterSpacing:1,color:D,textDecoration:"none"}}>
          ETF<span style={{color:G}}>.</span>PLAN
        </Link>
        <div style={{display:"flex",gap:"clamp(8px,2vw,16px)",alignItems:"center"}}>
          {!isMob && <Link href="/es/learn" style={{fontSize:14,color:MU,textDecoration:"none"}}>Aprender</Link>}
          {!isMob && <Link href="/es/blog"  style={{fontSize:14,color:MU,textDecoration:"none"}}>Blog</Link>}
          <Link href="/login" style={{fontSize:14,color:MU,textDecoration:"none"}}>Entrar</Link>
          <Link href="/" style={{fontSize:12,color:MU,padding:"5px 10px",border:`1px solid ${BOR}`,borderRadius:6,textDecoration:"none"}}>🇬🇧 EN</Link>
          <Link href="/login?mode=signup" style={{fontSize:13,fontWeight:700,color:"white",background:G,padding:"8px clamp(12px,2vw,18px)",borderRadius:8,textDecoration:"none",whiteSpace:"nowrap"}}>
            {isMob?"Empezar →":"Crear mi plan gratis →"}
          </Link>
        </div>
      </header>

      {/* ── TICKER ─────────────────────────────────────────────────────── */}
      <div style={{background:D,overflow:"hidden",padding:"8px 0"}}>
        <div style={{display:"flex",gap:32,width:"max-content",animation:"marquee 28s linear infinite"}}>
          {TAPE.map((e,i) => {
            const live=pool[e.ticker], chg=live?.change_pct, pos=chg==null?e.positive:chg>=0;
            return (
              <div key={i} style={{display:"flex",gap:8,alignItems:"center",whiteSpace:"nowrap"}}>
                <span style={{fontFamily:"DM Mono,monospace",fontSize:11,fontWeight:700,color:e.color}}>{e.ticker}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{e.name}</span>
                <span style={{fontFamily:"DM Mono,monospace",fontSize:11,color:pos?G:"#ff4757",fontWeight:600}}>
                  {chg!=null?`${chg>=0?"+":""}${(chg*100).toFixed(2)}%`:e.ret}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{background:`linear-gradient(180deg,${D} 0%,${D} 65%,${BG} 100%)`,padding:"clamp(56px,8vw,88px) clamp(16px,4vw,32px)",textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(0,185,107,0.12)",border:"1px solid rgba(0,185,107,0.25)",borderRadius:100,padding:"5px 16px",marginBottom:24}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:G,display:"inline-block"}} />
          <span style={{fontFamily:"DM Mono,monospace",fontSize:10,color:G,letterSpacing:1}}>PLAN DE AHORRO EN ETFs · DESDE 50 €/MES · SIEMPRE GRATIS</span>
        </div>
        <h1 style={{fontSize:"clamp(30px,8vw,70px)",fontWeight:800,color:"white",letterSpacing:"-1.5px",lineHeight:1.05,marginBottom:18}}>
          Tu dinero creciendo<br />
          <span style={{color:G}}>mientras duermes.</span>
        </h1>
        <p style={{fontSize:"clamp(14px,2.5vw,17px)",color:"rgba(255,255,255,0.6)",maxWidth:560,margin:"0 auto 32px",lineHeight:1.8}}>
          Inviertes $100 al mes. A los 10 años tu cartera genera <strong style={{color:"white"}}>+$1.755 al año sola</strong> — el móvil, el seguro del coche y todas tus suscripciones, pagados. Sin vender nada, sin mirar mercados. Gratis, 2 minutos.
        </p>
        <div style={{display:"flex",flexDirection:isMob?"column":"row",gap:12,justifyContent:"center",alignItems:"center"}}>
          <Link href="/login?mode=signup" onClick={()=>track("cta_click",{button:"hero_es"})}
            style={{display:"inline-block",background:G,color:"white",fontWeight:700,fontSize:16,padding:"15px 32px",borderRadius:12,textDecoration:"none",boxShadow:"0 4px 24px rgba(0,185,107,0.35)"}}>
            Crear mi plan gratis →
          </Link>
          <span style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>Sin tarjeta · Sin compromiso</span>
        </div>
      </section>

      {/* ── COMPARE TABLE ──────────────────────────────────────────────── */}
      <section style={{padding:"clamp(40px,6vw,64px) clamp(16px,4vw,32px)",maxWidth:820,margin:"0 auto"}}>
        <h2 style={{fontSize:"clamp(18px,3.5vw,26px)",fontWeight:700,textAlign:"center",marginBottom:6,letterSpacing:"-0.5px"}}>
          ¿Qué diferencia hay entre meter $100 en un banco o en ETFs?
        </h2>
        <p style={{fontSize:14,color:MU,textAlign:"center",marginBottom:24}}>Estos son los números reales a 10 años.</p>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{minWidth:460}}>
            <thead>
              <tr style={{borderBottom:`2px solid ${BOR}`}}>
                {["Dónde metes el dinero","Rentab.","A 5 años","A 10 años"].map(h=>(
                  <th key={h} style={{padding:"10px 12px",textAlign:h==="Dónde metes el dinero"?"left":"right",fontSize:11,fontFamily:"DM Mono,monospace",color:"#aaaabc",letterSpacing:1,fontWeight:500}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r,i)=>(
                <tr key={i} style={{borderBottom:`1px solid #f0f0ec`,opacity:r.dim?0.5:1}}>
                  <td style={{padding:"13px 12px",fontSize:14,fontWeight:r.dim?400:600}}>{r.label}</td>
                  <td style={{padding:"13px 12px",textAlign:"right",fontFamily:"DM Mono,monospace",fontSize:13,color:r.dim?"#aaaabc":r.color}}>{r.rate}</td>
                  <td style={{padding:"13px 12px",textAlign:"right",fontFamily:"DM Mono,monospace",fontSize:13,color:r.dim?"#7a7a8a":r.color}}>{r.y5}</td>
                  <td style={{padding:"13px 12px",textAlign:"right",fontFamily:"DM Mono,monospace",fontSize:14,fontWeight:700,color:r.dim?"#7a7a8a":r.color}}>{r.y10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── PLANS ──────────────────────────────────────────────────────── */}
      <section style={{background:D,padding:"clamp(40px,6vw,64px) clamp(16px,4vw,32px)"}}>
        <h2 style={{fontSize:"clamp(18px,3.5vw,26px)",fontWeight:700,textAlign:"center",color:"white",marginBottom:6,letterSpacing:"-0.5px"}}>Tres planes, para tres tipos de persona.</h2>
        <p style={{fontSize:14,color:"rgba(255,255,255,0.4)",textAlign:"center",marginBottom:28}}>Todos superan a un depósito. El conservador es el más calmado.</p>
        <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"repeat(3,1fr)",gap:14,maxWidth:880,margin:"0 auto"}}>
          {PLANS.map(pl=>(
            <div key={pl.name} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${pl.color}33`,borderRadius:14,padding:22}}>
              <div style={{fontSize:26,marginBottom:10}}>{pl.icon}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                <span style={{fontSize:16,fontWeight:700,color:"white"}}>{pl.name}</span>
                <span style={{fontFamily:"DM Mono,monospace",fontSize:11,color:pl.color,background:`${pl.color}18`,padding:"2px 8px",borderRadius:100}}>{pl.rate}</span>
              </div>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",lineHeight:1.7,marginBottom:12}}>{pl.desc}</p>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.25)",fontFamily:"DM Mono,monospace"}}>Riesgo: {pl.risk}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALCULATOR ─────────────────────────────────────────────────── */}
      <section style={{padding:"clamp(40px,6vw,64px) clamp(16px,4vw,32px)",maxWidth:680,margin:"0 auto",textAlign:"center"}}>
        <h2 style={{fontSize:"clamp(18px,3.5vw,24px)",fontWeight:700,marginBottom:6,letterSpacing:"-0.5px"}}>Calcula qué pasa con tu dinero</h2>
        <p style={{fontSize:14,color:MU,marginBottom:24}}>Elige cuánto inviertes al mes y ve qué genera solo.</p>

        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
          {[50,100,150].map(v=>(
            <button key={v} onClick={()=>{setAmount(v);track("calculator_interaction",{amount:v});}}
              style={{padding:"10px 24px",borderRadius:10,cursor:"pointer",border:`2px solid ${amount===v?G:BOR}`,background:amount===v?G:"white",color:amount===v?"white":D,fontSize:15,fontWeight:700}}>
              ${v}/mes
            </button>
          ))}
        </div>

        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24}}>
          {[["3","3 años"],["5","5 años"],["10","10 años"]].map(([v,l])=>(
            <button key={v} onClick={()=>setYear(v)}
              style={{padding:"6px 16px",borderRadius:8,cursor:"pointer",fontSize:13,border:`1.5px solid ${year===v?D:BOR}`,background:year===v?D:"transparent",color:year===v?"white":MU}}>
              {l}
            </button>
          ))}
        </div>

        <div style={{background:D,borderRadius:16,padding:isMob?"24px 16px":"32px 36px"}}>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:10}}>PLAN EQUILIBRADO · ${amount}/MES</div>
          <div style={{fontSize:isMob?38:54,fontWeight:800,color:"white",letterSpacing:"-1.5px",lineHeight:1}}>{row.p}</div>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:12,color:G,marginTop:6,marginBottom:16}}>cartera estimada</div>
          <div style={{height:1,background:"rgba(255,255,255,0.08)",marginBottom:16}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
            <div style={{textAlign:"left"}}>
              <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:1,marginBottom:4}}>GENERA</div>
              <div style={{fontSize:22,fontWeight:700,color:G}}>{row.a}</div>
            </div>
            <div style={{textAlign:"right",maxWidth:220}}>
              <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:1,marginBottom:4}}>O SEA QUE</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.55}}>{row.c}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY ────────────────────────────────────────────────────────── */}
      <section style={{background:BG,borderTop:`1px solid ${BOR}`,padding:"clamp(40px,6vw,64px) clamp(16px,4vw,32px)"}}>
        <h2 style={{fontSize:"clamp(18px,3.5vw,24px)",fontWeight:700,textAlign:"center",marginBottom:28,letterSpacing:"-0.5px",maxWidth:520,margin:"0 auto 28px"}}>
          Por qué los ETFs y no un fondo de inversión o acciones sueltas
        </h2>
        <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:16,maxWidth:820,margin:"0 auto"}}>
          {WHY.map(w=>(
            <div key={w.title} style={{background:"white",borderRadius:14,padding:22,border:`1px solid ${BOR}`}}>
              <div style={{fontSize:24,marginBottom:10}}>{w.icon}</div>
              <div style={{fontSize:15,fontWeight:700,marginBottom:6,color:D}}>{w.title}</div>
              <p style={{fontSize:14,color:MU,lineHeight:1.75,margin:0}}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOG CTA ───────────────────────────────────────────────────── */}
      <section style={{padding:"clamp(24px,4vw,40px) clamp(16px,4vw,32px)",maxWidth:820,margin:"0 auto"}}>
        <div style={{background:"white",border:`1px solid ${BOR}`,borderRadius:16,padding:isMob?"20px":"24px 32px",display:"flex",flexDirection:isMob?"column":"row",alignItems:isMob?"flex-start":"center",justifyContent:"space-between",gap:16}}>
          <div>
            <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:G,letterSpacing:1,marginBottom:6}}>BLOG EN ESPAÑOL</div>
            <div style={{fontSize:isMob?15:17,fontWeight:700,color:D,marginBottom:4}}>Guías prácticas sobre inversión en ETFs</div>
            <p style={{fontSize:13,color:MU,margin:0}}>Sin tecnicismos. Todo lo que necesitas saber para empezar.</p>
          </div>
          <Link href="/es/blog" style={{display:"inline-block",background:D,color:"white",fontWeight:700,fontSize:14,padding:"11px 22px",borderRadius:10,textDecoration:"none",whiteSpace:"nowrap",flexShrink:0}}>
            Ver el blog →
          </Link>
        </div>
        <div style={{background:"rgba(0,185,107,0.05)",border:"1px solid rgba(0,185,107,0.18)",borderRadius:16,padding:isMob?"20px":"20px 28px",display:"flex",flexDirection:isMob?"column":"row",alignItems:isMob?"flex-start":"center",justifyContent:"space-between",gap:14,marginTop:14}}>
          <div>
            <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:G,letterSpacing:1,marginBottom:6}}>BRÓKER RECOMENDADO · AFILIADO</div>
            <div style={{fontSize:15,fontWeight:700,color:D,marginBottom:3}}>¿No tienes bróker? eToro es gratuito y disponible en España y Latam.</div>
            <p style={{fontSize:13,color:MU,margin:0}}>Sin comisiones en ETFs · Acciones fraccionadas · Disponible en 100+ países</p>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",flexShrink:0}}>
            <a href="https://med.etoro.com/B22256_A129032_TClick_Snew%20etf.aspx" target="_blank" rel="noopener noreferrer sponsored" onClick={()=>track("affiliate_click",{broker:"etoro",button:"etf_es"})}
              style={{display:"inline-block",background:G,color:"white",fontWeight:700,fontSize:13,padding:"10px 18px",borderRadius:9,textDecoration:"none",whiteSpace:"nowrap"}}>
              Descubrir ETFs en eToro →
            </a>
            <a href="https://med.etoro.com/B20443_A129032_TClick.aspx?" target="_blank" rel="noopener noreferrer sponsored" onClick={()=>track("affiliate_click",{broker:"etoro",button:"tutorial_es"})}
              style={{display:"inline-block",background:"white",color:D,fontWeight:600,fontSize:13,padding:"10px 18px",borderRadius:9,textDecoration:"none",border:`1px solid ${BOR}`,whiteSpace:"nowrap"}}>
              Ver tutorial →
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section style={{background:D,padding:"clamp(48px,7vw,72px) clamp(16px,4vw,32px)",textAlign:"center"}}>
        <h2 style={{fontSize:"clamp(20px,4vw,32px)",fontWeight:800,color:"white",marginBottom:10,letterSpacing:"-0.5px"}}>
          Tu dinero no trabaja solo... todavía.
        </h2>
        <p style={{fontSize:"clamp(14px,2vw,16px)",color:"rgba(255,255,255,0.45)",marginBottom:28}}>2 minutos. Para siempre gratis. Sin tarjeta.</p>
        <Link href="/login?mode=signup" onClick={()=>track("cta_click",{button:"bottom_es"})}
          style={{display:"inline-block",background:G,color:"white",fontWeight:700,fontSize:16,padding:"15px 36px",borderRadius:12,textDecoration:"none",boxShadow:"0 4px 24px rgba(0,185,107,0.35)"}}>
          Crear mi plan de ahorro gratis →
        </Link>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section style={{padding:"clamp(40px,6vw,64px) clamp(16px,4vw,32px)",maxWidth:660,margin:"0 auto"}}>
        <h2 style={{fontSize:"clamp(18px,3vw,22px)",fontWeight:700,textAlign:"center",marginBottom:28,letterSpacing:"-0.5px"}}>Preguntas que nos hacen mucho</h2>
        {FAQ.map((f,i)=><FAQItem key={i} q={f.q} a={f.a} G={G}/>)}
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer style={{borderTop:`1px solid ${BOR}`,padding:"24px clamp(16px,4vw,32px)"}}>
        <div style={{maxWidth:820,margin:"0 auto",display:"flex",flexDirection:isMob?"column":"row",justifyContent:"space-between",alignItems:isMob?"flex-start":"center",gap:12}}>
          <span style={{fontFamily:"DM Mono,monospace",fontSize:10,color:D,letterSpacing:1}}>ETF<span style={{color:G}}>.</span>PLAN</span>
          <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
            <Link href="/es/learn" style={{fontSize:13,color:MU,textDecoration:"none"}}>Aprender</Link>
            <Link href="/es/blog"  style={{fontSize:13,color:MU,textDecoration:"none"}}>Blog</Link>
            <Link href="/privacy"  style={{fontSize:13,color:MU,textDecoration:"none"}}>Privacidad</Link>
            <Link href="/terms"    style={{fontSize:13,color:MU,textDecoration:"none"}}>Términos</Link>
            <a href="https://www.instagram.com/etfplan/" target="_blank" rel="noreferrer" style={{fontSize:13,color:MU,textDecoration:"none"}}>@etfplan</a>
            <a href="https://med.etoro.com/B22256_A129032_TClick_Snew%20etf.aspx" target="_blank" rel="noopener noreferrer sponsored" style={{fontSize:13,color:G,textDecoration:"none"}}>Abrir eToro</a>
            <Link href="/"         style={{fontSize:13,color:MU,textDecoration:"none"}}>🇬🇧 English</Link>
          </div>
<p style={{fontSize:12,color:"#cccccc",margin:0}}>No es asesoramiento financiero · Esta página contiene enlaces de afiliado</p>
        </div>
      </footer>
    </>
  );
}

function FAQItem({q,a,G}) {
  const [open,setOpen] = useState(false);
  return (
    <div style={{borderBottom:"1px solid #f0f0ec",padding:"16px 0"}}>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",background:"none",border:"none",textAlign:"left",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
        <span style={{fontSize:15,fontWeight:600,color:"#1a1a2e",lineHeight:1.5}}>{q}</span>
        <span style={{fontSize:20,color:G,flexShrink:0,lineHeight:1}}>{open?"−":"+"}</span>
      </button>
      {open && <p style={{fontSize:14,color:"#7a7a8a",lineHeight:1.8,marginTop:10,paddingRight:24}}>{a}</p>}
    </div>
  );
}
