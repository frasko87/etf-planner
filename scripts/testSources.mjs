import { readFileSync } from "fs";
try {
  const env = readFileSync(".env.local", "utf8");
  env.split("\n").forEach(line => {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  });
} catch(e) { console.error("No .env.local found"); process.exit(1); }

const KEYS = {
  av:   process.env.ALPHA_VANTAGE_KEY,
  fh:   process.env.FINNHUB_KEY,
  poly: process.env.POLYGON_KEY,
  fred: process.env.FRED_KEY,
};

console.log("\n🧪 ETF DATA SOURCE TEST — ticker: VOO\n");

// Alpha Vantage
console.log("━━ ALPHA VANTAGE ━━");
if (!KEYS.av) { console.log("❌ No key\n"); } else {
  try {
    const r = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=VOO&apikey=${KEYS.av}`);
    const j = await r.json();
    if (j["Note"] || j["Information"]) { console.log("❌ Rate limited — wait and retry\n"); }
    else {
      const entries = Object.entries(j["Monthly Adjusted Time Series"] || {});
      const prices  = entries.map(([d,v])=>({d,c:parseFloat(v["5. adjusted close"])})).sort((a,b)=>new Date(a.d)-new Date(b.d));
      const slice   = prices.slice(-61);
      const yrs     = (new Date(slice.at(-1).d)-new Date(slice[0].d))/(1000*60*60*24*365.25);
      const cagr    = (Math.pow(slice.at(-1).c/slice[0].c,1/yrs)-1)*100;
      console.log(`✅ Price:     $${prices.at(-1).c.toFixed(2)}`);
      console.log(`✅ 5Y CAGR:   ${cagr.toFixed(2)}%`);
      console.log(`✅ Months:    ${entries.length}\n`);
    }
  } catch(e) { console.log(`❌ ${e.message}\n`); }
}

// Finnhub
console.log("━━ FINNHUB ━━");
if (!KEYS.fh) { console.log("❌ No key\n"); } else {
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=VOO&token=${KEYS.fh}`);
    const j = await r.json();
    if (!j.c) { console.log("❌ No data — check key\n"); }
    else {
      console.log(`✅ Price:     $${j.c}`);
      console.log(`✅ Change:    ${j.pc?((j.c-j.pc)/j.pc*100).toFixed(2):"-"}%\n`);
    }
  } catch(e) { console.log(`❌ ${e.message}\n`); }
}

// Polygon
console.log("━━ POLYGON ━━");
if (!KEYS.poly) { console.log("❌ No key\n"); } else {
  try {
    const r = await fetch(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/VOO?apiKey=${KEYS.poly}`);
    const j = await r.json();
    if (!j.ticker) { console.log(`❌ ${j.error||"No data"}\n`); }
    else {
      const price = j.ticker.day?.c || j.ticker.prevDay?.c;
      console.log(`✅ Price:     $${price?.toFixed(2)}`);
      console.log(`✅ Source:    Polygon snapshot\n`);
    }
  } catch(e) { console.log(`❌ ${e.message}\n`); }
}

// FRED
console.log("━━ FRED ━━");
if (!KEYS.fred) { console.log("❌ No key\n"); } else {
  try {
    const base = "https://api.stlouisfed.org/fred/series/observations";
    const [cr,fr] = await Promise.all([
      fetch(`${base}?series_id=CPIAUCSL&api_key=${KEYS.fred}&file_type=json&sort_order=desc&limit=13`),
      fetch(`${base}?series_id=FEDFUNDS&api_key=${KEYS.fred}&file_type=json&sort_order=desc&limit=1`),
    ]);
    const cpi = await cr.json();
    const ff  = await fr.json();
    const obs = cpi.observations||[];
    if (!obs.length) { console.log("❌ No data — check key\n"); }
    else {
      const inf = ((parseFloat(obs[0].value)-parseFloat(obs[12].value))/parseFloat(obs[12].value)*100).toFixed(2);
      const fed = parseFloat(ff.observations?.[0]?.value).toFixed(2);
      console.log(`✅ Inflation: ${inf}% YoY`);
      console.log(`✅ Fed Rate:  ${fed}%\n`);
    }
  } catch(e) { console.log(`❌ ${e.message}\n`); }
}

console.log("━━ DONE ━━\n");
