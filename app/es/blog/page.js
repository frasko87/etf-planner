// app/blog/page.js — English blog list
// For Spanish version: app/es/blog/page.js (just change locale prop)

import BlogList from "@/components/BlogList";

export const metadata = {
  title: "ETF Investing Blog — Guides, Strategies & Market Insights | ETF.PLAN",
  description: "Free ETF investing guides, strategies, and market insights for long-term investors. Learn how to build passive income through monthly ETF contributions.",
  alternates: {
    canonical: "https://etfplan.app/blog",
    languages: { "es": "https://etfplan.app/es/blog" },
  },
};

export default function BlogPage() {
  return <BlogList locale="es" />;
}
