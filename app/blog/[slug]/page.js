// app/blog/[slug]/page.js
// Individual blog post — English version
// Spanish: app/es/blog/[slug]/page.js (change locale="es")

import BlogPost from "@/components/BlogPost";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title,meta_title,meta_desc,excerpt,og_image,slug,slug_es")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!data) return {};

  return {
    title: data.meta_title || `${data.title} | ETF.PLAN Blog`,
    description: data.meta_desc || data.excerpt,
    alternates: {
      canonical: `https://etfplan.app/blog/${data.slug}`,
      languages: data.slug_es ? { "es": `https://etfplan.app/es/blog/${data.slug_es}` } : {},
    },
    openGraph: {
      title: data.meta_title || data.title,
      description: data.meta_desc || data.excerpt,
      images: data.og_image ? [data.og_image] : ["/og-image.png"],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const supabase = await createServerClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!post) notFound();

  // Get related posts
  const { data: related } = await supabase
    .from("blog_posts")
    .select("id,slug,slug_es,title,title_es,excerpt,excerpt_es,category,reading_time")
    .eq("published", true)
    .eq("category", post.category)
    .neq("id", post.id)
    .limit(2);

  return <BlogPost post={post} related={related || []} locale="en" />;
}
