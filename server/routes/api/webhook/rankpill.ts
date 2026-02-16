import {
  defineEventHandler,
  readBody,
  setHeader,
  setResponseStatus,
  getHeader,
  getMethod,
} from "h3";
import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// RankPill webhook payload structure
interface RankPillPayload {
  title: string;
  content_html: string;
  content_markdown: string;
  slug: string;
  meta_description: string;
  status: string;
  featured_image: string | null;
  published_url: string | null;
  scheduled_date: string | null;
  published_at: string;
  is_republish: boolean;
  test?: boolean;
}

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function generateExcerpt(markdown: string, maxLength = 200): string {
  const cleaned = markdown
    .replace(/^#{1,6}\s+.+$/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\|.*\|$/gm, "")
    .replace(/^>+\s?/gm, "")
    .replace(/^---$/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

function calculateReadingTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function verifySignature(
  body: string,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return signature === expected;
}

function verifyBearerToken(
  authHeader: string | undefined,
  secret: string,
): boolean {
  if (!authHeader) return false;
  return authHeader === `Bearer ${secret}`;
}

export default defineEventHandler(async (event) => {
  setHeader(event, "Content-Type", "application/json");

  if (getMethod(event) !== "POST") {
    setResponseStatus(event, 405);
    return { error: "Method Not Allowed" };
  }

  const secret = process.env.RANKPILL_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[RankPill Webhook] RANKPILL_WEBHOOK_SECRET is not set");
    setResponseStatus(event, 500);
    return { error: "Webhook secret not configured" };
  }

  // Read raw body for signature verification
  const rawBody = await readBody(event);
  const bodyString =
    typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);

  // Verify authentication (support both signature and bearer token)
  const signature = getHeader(event, "x-rankpill-signature");
  const authHeader = getHeader(event, "authorization");

  const isSignatureValid = verifySignature(bodyString, signature, secret);
  const isBearerValid = verifyBearerToken(authHeader, secret);

  if (!isSignatureValid && !isBearerValid) {
    console.error("[RankPill Webhook] Authentication failed");
    setResponseStatus(event, 401);
    return { error: "Invalid authentication" };
  }

  const article: RankPillPayload =
    typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;

  // Handle test payloads
  if (article.test) {
    console.log("[RankPill Webhook] Test payload received - webhook works!");
    return { message: "Test webhook received successfully", test: true };
  }

  try {
    const supabase = getSupabaseAdmin();

    const excerpt = generateExcerpt(article.content_markdown);
    const readingTime = calculateReadingTime(article.content_markdown);

    const articleData = {
      title: article.title,
      slug: article.slug,
      excerpt,
      content_markdown: article.content_markdown,
      content_html: article.content_html,
      category_id: "1",
      author_name: "Justmaid",
      author_avatar: null,
      featured_image: article.featured_image,
      published_at: article.published_at || new Date().toISOString(),
      reading_time: readingTime,
      tags: [],
      meta_title: article.title,
      meta_description: article.meta_description || excerpt,
      source: "rankpill",
      is_published: true,
      updated_at: new Date().toISOString(),
    };

    // Upsert: insert or update based on slug
    const { data, error } = await supabase
      .from("blog_articles")
      .upsert(articleData, { onConflict: "slug" })
      .select()
      .single();

    if (error) {
      console.error("[RankPill Webhook] Supabase error:", error);
      setResponseStatus(event, 500);
      return { error: "Failed to save article", details: error.message };
    }

    const action = article.is_republish ? "updated" : "created";
    console.log(
      `[RankPill Webhook] Article ${action}: "${article.title}" (${article.slug})`,
    );

    return {
      message: `Article ${action} successfully`,
      slug: article.slug,
      id: data?.id,
    };
  } catch (err: any) {
    console.error("[RankPill Webhook] Error:", err);
    setResponseStatus(event, 500);
    return { error: "Internal server error", details: err.message };
  }
});
