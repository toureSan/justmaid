import { createFileRoute } from "@tanstack/react-router";
import { BlogHero, BlogCategories, BlogCard } from "@/components/blog";
import { getBlogArticles, getBlogCategories } from "@/services/blogService";
import { useState, useEffect } from "react";

// Types pour la recherche
type BlogSearchParams = {
  category?: string;
};

export const Route = createFileRoute("/blog/")({
  component: BlogPage,
  validateSearch: (search: Record<string, unknown>): BlogSearchParams => {
    return {
      category: search.category as string | undefined,
    };
  },
});

function BlogPage() {
  const { category } = Route.useSearch();
  const categories = getBlogCategories();
  const [articles, setArticles] = useState(() => getBlogArticles(category));

  // Mettre à jour les articles quand la catégorie change
  useEffect(() => {
    setArticles(getBlogArticles(category));
  }, [category]);

  // SEO Meta tags
  useEffect(() => {
    const categoryName = category
      ? categories.find((cat) => cat.slug === category)?.name
      : null;
    const title = categoryName
      ? `${categoryName} - Blog`
      : "Just Blog - Conseils et Astuces Ménage";
    const description = categoryName
      ? `Tous nos articles sur ${categoryName.toLowerCase()}`
      : "Découvrez nos conseils, astuces et actualités pour un intérieur toujours impeccable. Services de ménage professionnels en Suisse romande.";

    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }
  }, [category, categories]);

  return (
    <>
      {/* Hero Section */}
      <BlogHero />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Categories */}
        <BlogCategories categories={categories} activeCategory={category} />

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="mb-4 text-6xl">📝</div>
            <h3 className="mb-2 text-2xl font-bold text-foreground">
              Aucun article dans cette catégorie
            </h3>
            <p className="text-muted-foreground">
              Revenez bientôt, nous publions régulièrement de nouveaux contenus !
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 p-8 text-center sm:p-12">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Besoin d'aide pour votre ménage ?
          </h2>
          <p className="mb-6 text-lg text-muted-foreground">
            Réservez un intervenant professionnel Justmaid en quelques clics
          </p>
          <a
            href="/booking/cleaning"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            Réserver maintenant
          </a>
        </div>
      </div>
    </>
  );
}
