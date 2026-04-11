// app/sitemap.js — Updated with blog + Spanish pages

import { createClient } from "@/lib/supabase/server";

export default async function sitemap() {
  const baseUrl = "https://etfplan.app";
  const now = new Date().toISOString();

  // ETF detail pages
  const ETF_TICKERS = [
    "VOO","VTI","QQQ","SCHD","BND","VGT","TQQQ","ARKK",
    "SPY","IVV","ITOT","SCHB","VGT","XLK","FTEC",
    "VYM","DGRO","HDV","NOBL","VTV","IWM","VB",
    "VEA","VWO","VXUS","EFA","AGG","TLT","HYG","LQD",
    "XLV","XLF","XLE","XLI","XLY","XLP","XLRE",
    "SOXX","SMH","VNQ","GLD","ICLN","SOXL","UPRO",
  ];

  const etfPages = ETF_TICKERS.map(ticker => ({
    url: `${baseUrl}/etf/${ticker}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  // Blog posts from Supabase
  let blogPages = [];
  try {
    const supabase = await createClient();
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug,slug_es,updated_at")
      .eq("published", true);

    if (posts) {
      posts.forEach(post => {
        // English blog post
        blogPages.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: post.updated_at || now,
          changeFrequency: "monthly",
          priority: 0.7,
        });
        // Spanish blog post
        if (post.slug_es) {
          blogPages.push({
            url: `${baseUrl}/es/blog/${post.slug_es}`,
            lastModified: post.updated_at || now,
            changeFrequency: "monthly",
            priority: 0.7,
          });
        }
      });
    }
  } catch (e) {
    console.error("Sitemap blog fetch error:", e.message);
  }

  return [
    // ── English pages ────────────────────────────────────────────────────────
    { url: baseUrl,                                      lastModified:now, changeFrequency:"weekly",  priority:1.0 },
    { url: `${baseUrl}/blog`,                            lastModified:now, changeFrequency:"daily",   priority:0.9 },
    { url: `${baseUrl}/learn`,                           lastModified:now, changeFrequency:"monthly", priority:0.8 },
    { url: `${baseUrl}/guide/what-are-etfs`,             lastModified:now, changeFrequency:"monthly", priority:0.7 },
    { url: `${baseUrl}/guide/risk-levels`,               lastModified:now, changeFrequency:"monthly", priority:0.7 },
    { url: `${baseUrl}/guide/platforms`,                 lastModified:now, changeFrequency:"monthly", priority:0.7 },
    { url: `${baseUrl}/guide/dollar-cost-averaging`,     lastModified:now, changeFrequency:"monthly", priority:0.7 },
    { url: `${baseUrl}/login`,                           lastModified:now, changeFrequency:"monthly", priority:0.5 },
    { url: `${baseUrl}/privacy`,                         lastModified:now, changeFrequency:"yearly",  priority:0.3 },
    { url: `${baseUrl}/terms`,                           lastModified:now, changeFrequency:"yearly",  priority:0.3 },

    // ── Spanish pages ────────────────────────────────────────────────────────
    { url: `${baseUrl}/es`,                              lastModified:now, changeFrequency:"weekly",  priority:0.9 },
    { url: `${baseUrl}/es/blog`,                         lastModified:now, changeFrequency:"daily",   priority:0.85 },
    { url: `${baseUrl}/es/learn`,                        lastModified:now, changeFrequency:"monthly", priority:0.75 },
    { url: `${baseUrl}/es/guide/que-son-los-etfs`,       lastModified:now, changeFrequency:"monthly", priority:0.65 },
    { url: `${baseUrl}/es/guide/niveles-de-riesgo`,      lastModified:now, changeFrequency:"monthly", priority:0.65 },
    { url: `${baseUrl}/es/guide/plataformas`,            lastModified:now, changeFrequency:"monthly", priority:0.65 },
    { url: `${baseUrl}/es/guide/promedio-coste`,         lastModified:now, changeFrequency:"monthly", priority:0.65 },

    // ── Blog posts (both languages) ──────────────────────────────────────────
    ...blogPages,

    // ── ETF detail pages ─────────────────────────────────────────────────────
    ...etfPages,
  ];
}
