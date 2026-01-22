import { BlogArticle, BlogCategory } from "@/types/database";
import categoriesData from "@/data/blog-categories.json";
import articlesData from "@/data/blog-articles.json";

// Charger les catégories depuis le JSON
export const blogCategories: BlogCategory[] = categoriesData as BlogCategory[];

// Charger et enrichir les articles depuis le JSON
export const blogArticles: BlogArticle[] = articlesData.map((article) => {
  // Trouver la catégorie correspondante
  const category = blogCategories.find((cat) => cat.id === article.categoryId);
  
  if (!category) {
    throw new Error(`Category with id ${article.categoryId} not found for article ${article.id}`);
  }

  return {
    ...article,
    category,
  } as BlogArticle;
});

// Service pour récupérer les articles
export const getBlogArticles = (categorySlug?: string): BlogArticle[] => {
  if (categorySlug) {
    return blogArticles.filter((article) => article.category.slug === categorySlug);
  }
  return blogArticles;
};

// Service pour récupérer un article par slug
export const getBlogArticleBySlug = (slug: string): BlogArticle | undefined => {
  return blogArticles.find((article) => article.slug === slug);
};

// Service pour récupérer les catégories
export const getBlogCategories = (): BlogCategory[] => {
  return blogCategories;
};

// Service pour récupérer une catégorie par slug
export const getBlogCategoryBySlug = (slug: string): BlogCategory | undefined => {
  return blogCategories.find((category) => category.slug === slug);
};

// Service pour récupérer les articles similaires
export const getSimilarArticles = (currentArticleId: string, limit = 3): BlogArticle[] => {
  const currentArticle = blogArticles.find((article) => article.id === currentArticleId);
  if (!currentArticle) return [];

  return blogArticles
    .filter((article) => article.id !== currentArticleId && article.category.id === currentArticle.category.id)
    .slice(0, limit);
};
