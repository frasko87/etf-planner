// app/api/news/route.js
// Fetches market news from Yahoo Finance RSS feeds
// Called client-side to avoid CORS issues

export const runtime = "edge";
export const revalidate = 1800; // cache 30 minutes

const FEEDS = [
  { url:"https://feeds.finance.yahoo.com/rss/2.0/headline?s=SPY,QQQ,VTI,VOO,BND&region=US&lang=en-US", label:"ETF" },
  { url:"https://feeds.finance.yahoo.com/rss/2.0/headline?s=%5EGSPC,%5EIXIC,TLT,GLD&region=US&lang=en-US", label:"Market" },
];

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title   = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)     || block.match(/<title>(.*?)<\/title>/))?.[1]     || "";
    const link    = (block.match(/<link>(.*?)<\/link>/))?.[1]                 || "";
    const pubDate = (block.match(/<pubDate>(.*?)<\/pubDate>/))?.[1]           || "";
    const source  = (block.match(/<source[^>]*>(.*?)<\/source>/))?.[1]        || "Yahoo Finance";
    const desc    = (block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || block.match(/<description>(.*?)<\/description>/))?.[1] || "";

    if (title && link) {
      items.push({
        title:   title.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').trim(),
        link:    link.trim(),
        pubDate: pubDate.trim(),
        source:  source.trim() || "Yahoo Finance",
        desc:    desc.replace(/<[^>]*>/g,"").replace(/&amp;/g,"&").slice(0,120).trim(),
        ts:      pubDate ? new Date(pubDate).getTime() : 0,
      });
    }
  }
  return items;
}

export async function GET() {
  try {
    // Fetch both feeds in parallel
    const results = await Promise.allSettled(
      FEEDS.map(f => fetch(f.url, { headers:{ "User-Agent":"Mozilla/5.0" }, next:{ revalidate:1800 } }))
    );

    let allItems = [];
    for (const result of results) {
      if (result.status === "fulfilled" && result.value.ok) {
        const xml = await result.value.text();
        allItems = allItems.concat(parseRSS(xml));
      }
    }

    // Deduplicate by title, sort newest first, take top 8
    const seen = new Set();
    const deduped = allItems
      .filter(item => {
        if (seen.has(item.title)) return false;
        seen.add(item.title);
        return true;
      })
      .sort((a,b) => b.ts - a.ts)
      .slice(0, 8);

    if (!deduped.length) {
      // Return fallback static news if feeds fail
      return Response.json({ items: FALLBACK_NEWS, fallback: true });
    }

    return Response.json({ items: deduped, fallback: false });
  } catch (e) {
    return Response.json({ items: FALLBACK_NEWS, fallback: true });
  }
}

const FALLBACK_NEWS = [
  { title:"S&P 500 closes near record highs as tech leads gains", link:"https://finance.yahoo.com", source:"Yahoo Finance", pubDate:"", desc:"Major indices advanced led by technology sector outperformance.", ts:0 },
  { title:"Fed holds rates steady, signals patient approach to cuts", link:"https://finance.yahoo.com", source:"Yahoo Finance", pubDate:"", desc:"The Federal Reserve maintained its benchmark rate, citing mixed inflation signals.", ts:0 },
  { title:"Vanguard ETFs see record inflows as passive investing grows", link:"https://finance.yahoo.com", source:"Yahoo Finance", pubDate:"", desc:"VTI and VOO attracted billions in new assets as investors favour low-cost index funds.", ts:0 },
  { title:"Gold ETFs surge as investors seek safe-haven assets", link:"https://finance.yahoo.com", source:"Yahoo Finance", pubDate:"", desc:"GLD and IAU recorded strong inflows amid market uncertainty.", ts:0 },
];
