import { BlogArticle, BlogCategory } from "@/types/database";
import { supabase } from "@/lib/supabase";
import categoriesData from "@/data/blog-categories.json";
import articlesData from "@/data/blog-articles.json";

// Charger les catégories depuis le JSON
export const blogCategories: BlogCategory[] = categoriesData as BlogCategory[];

// Charger et enrichir les articles statiques depuis le JSON
const staticArticles: BlogArticle[] = articlesData.map((article) => {
  const category = blogCategories.find((cat) => cat.id === article.categoryId);

  if (!category) {
    throw new Error(
      `Category with id ${article.categoryId} not found for article ${article.id}`,
    );
  }

  return {
    ...article,
    category,
  } as BlogArticle;
});

// Interface pour les articles Supabase (structure de la table)
interface SupabaseBlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_markdown: string;
  content_html: string | null;
  category_id: string;
  author_name: string;
  author_avatar: string | null;
  featured_image: string | null;
  published_at: string;
  reading_time: number;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  views: number;
  source: string;
  is_published: boolean;
}

function mapSupabaseArticle(row: SupabaseBlogArticle): BlogArticle {
  const category =
    blogCategories.find((cat) => cat.id === row.category_id) ||
    blogCategories[0];

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || "",
    content: row.content_markdown,
    content_html: row.content_html || undefined,
    category,
    author: {
      name: row.author_name || "Justmaid",
      avatar: row.author_avatar || undefined,
    },
    featured_image: row.featured_image || undefined,
    published_at: row.published_at,
    reading_time: row.reading_time || 5,
    tags: row.tags || [],
    meta_title: row.meta_title || undefined,
    meta_description: row.meta_description || undefined,
    views: row.views || 0,
  };
}

// Fetch articles from Supabase
async function fetchSupabaseArticles(
  categorySlug?: string,
): Promise<BlogArticle[]> {
  try {
    let query = supabase
      .from("blog_articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (categorySlug) {
      const cat = blogCategories.find((c) => c.slug === categorySlug);
      if (cat) {
        query = query.eq("category_id", cat.id);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("[BlogService] Supabase fetch error:", error);
      return [];
    }

    return (data || []).map(mapSupabaseArticle);
  } catch (err) {
    console.error("[BlogService] Supabase connection error:", err);
    return [];
  }
}

async function fetchSupabaseArticleBySlug(
  slug: string,
): Promise<BlogArticle | null> {
  try {
    const { data, error } = await supabase
      .from("blog_articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !data) return null;

    return mapSupabaseArticle(data);
  } catch {
    return null;
  }
}

// --- Public async API ---

export async function getBlogArticlesAsync(
  categorySlug?: string,
): Promise<BlogArticle[]> {
  const supabaseArticles = await fetchSupabaseArticles(categorySlug);

  let filteredStatic = staticArticles;
  if (categorySlug) {
    filteredStatic = staticArticles.filter(
      (a) => a.category.slug === categorySlug,
    );
  }

  // Merge: static articles first, then Supabase articles (avoid duplicates by slug)
  const staticSlugs = new Set(filteredStatic.map((a) => a.slug));
  const uniqueSupabase = supabaseArticles.filter(
    (a) => !staticSlugs.has(a.slug),
  );

  const allArticles = [...filteredStatic, ...uniqueSupabase];

  // Sort by published_at (newest first)
  allArticles.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );

  return allArticles;
}

export async function getBlogArticleBySlugAsync(
  slug: string,
): Promise<BlogArticle | undefined> {
  // Check static articles first
  const staticArticle = staticArticles.find((a) => a.slug === slug);
  if (staticArticle) return staticArticle;

  // Then check Supabase
  const supabaseArticle = await fetchSupabaseArticleBySlug(slug);
  return supabaseArticle || undefined;
}

export async function getSimilarArticlesAsync(
  currentArticleId: string,
  currentCategoryId: string,
  limit = 3,
): Promise<BlogArticle[]> {
  const allArticles = await getBlogArticlesAsync();

  return allArticles
    .filter(
      (a) => a.id !== currentArticleId && a.category.id === currentCategoryId,
    )
    .slice(0, limit);
}

// --- Synchronous API (static articles only, backward compatible) ---

export const getBlogArticles = (categorySlug?: string): BlogArticle[] => {
  if (categorySlug) {
    return staticArticles.filter(
      (article) => article.category.slug === categorySlug,
    );
  }
  return staticArticles;
};

export const getBlogArticleBySlug = (
  slug: string,
): BlogArticle | undefined => {
  return staticArticles.find((article) => article.slug === slug);
};

export const getBlogCategories = (): BlogCategory[] => {
  return blogCategories;
};

export const getBlogCategoryBySlug = (
  slug: string,
): BlogCategory | undefined => {
  return blogCategories.find((category) => category.slug === slug);
};

export const getSimilarArticles = (
  currentArticleId: string,
  limit = 3,
): BlogArticle[] => {
  const currentArticle = staticArticles.find(
    (article) => article.id === currentArticleId,
  );
  if (!currentArticle) return [];

  return staticArticles
    .filter(
      (article) =>
        article.id !== currentArticleId &&
        article.category.id === currentArticle.category.id,
    )
    .slice(0, limit);
};
