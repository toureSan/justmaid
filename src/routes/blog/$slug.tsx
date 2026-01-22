import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/layout";
import { getBlogArticleBySlug, getSimilarArticles } from "@/services/blogService";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/blog";
import { Clock04Icon, CalendarIcon, Eye01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogArticlePage,
});

function BlogArticlePage() {
  const { slug } = Route.useParams();
  const article = getBlogArticleBySlug(slug);

  // Rediriger si l'article n'existe pas
  useEffect(() => {
    if (!article) {
      window.location.href = "/blog";
    }
  }, [article]);

  if (!article) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold">Article non trouvé</h1>
            <p className="mb-6 text-muted-foreground">
              Désolé, cet article n'existe pas ou a été supprimé.
            </p>
            <a
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
              Retour au blog
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  const similarArticles = getSimilarArticles(article.id);
  const formattedDate = new Date(article.published_at).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // SEO Meta tags
  useEffect(() => {
    document.title = article.meta_title || `${article.title} - Blog Justmaid`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        article.meta_description || article.excerpt
      );
    }
  }, [article]);

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Accueil
            </Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-foreground">
              Blog
            </Link>
            <span>/</span>
            <Link
              to="/blog"
              search={{ category: article.category.slug }}
              className="hover:text-foreground"
            >
              {article.category.name}
            </Link>
            <span>/</span>
            <span className="text-foreground">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Category Badge */}
        <div className="mb-6">
          <Badge
            style={{ backgroundColor: article.category.color || "#2FCCC0" }}
            className="border-0 text-base text-white hover:opacity-90"
          >
            {article.category.icon && (
              <span className="mr-1.5">{article.category.icon}</span>
            )}
            {article.category.name}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
          {article.title}
        </h1>

        {/* Excerpt */}
        <p className="mb-8 text-xl text-muted-foreground">{article.excerpt}</p>

        {/* Meta Information */}
        <div className="mb-8 flex flex-wrap items-center gap-6 border-b border-t border-border py-4">
          {/* Author */}
          <div className="flex items-center gap-3">
            {article.author.avatar ? (
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {article.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground">{article.author.name}</p>
              <p className="text-xs text-muted-foreground">Auteur</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon icon={CalendarIcon} className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>

          {/* Reading Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon icon={Clock04Icon} className="h-4 w-4" />
            <span>{article.reading_time} min de lecture</span>
          </div>

          {/* Views */}
          {article.views && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Eye01Icon} className="h-4 w-4" />
              <span>{article.views} vues</span>
            </div>
          )}
        </div>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="mb-12 overflow-hidden rounded-2xl">
            <img
              src={article.featured_image}
              alt={article.title}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:pl-6 prose-blockquote:not-italic prose-blockquote:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(article.content) }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-border pt-8">
            <span className="text-sm font-semibold text-foreground">Tags :</span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 p-8 text-center">
          <h3 className="mb-3 text-2xl font-bold text-foreground">
            Besoin d'un professionnel ?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Réservez un intervenant Justmaid pour votre ménage
          </p>
          <a
            href="/booking/cleaning"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
          >
            Réserver maintenant
          </a>
        </div>
      </article>

      {/* Similar Articles */}
      {similarArticles.length > 0 && (
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-3xl font-bold text-foreground">
              Articles similaires
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {similarArticles.map((similarArticle) => (
                <BlogCard key={similarArticle.id} article={similarArticle} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

// Helper pour formater le markdown en HTML basique
function formatMarkdown(content: string): string {
  let html = content;

  // Titres
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Gras et italique
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Liens
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Listes à puces
  html = html.replace(/^\- (.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>");

  // Paragraphes
  html = html.replace(/\n\n/g, "</p><p>");
  html = "<p>" + html + "</p>";

  // Nettoyer les paragraphes vides dans les listes et titres
  html = html.replace(/<p><ul>/g, "<ul>");
  html = html.replace(/<\/ul><\/p>/g, "</ul>");
  html = html.replace(/<p><h/g, "<h");
  html = html.replace(/<\/h([1-6])><\/p>/g, "</h$1>");
  html = html.replace(/<p><blockquote>/g, "<blockquote>");
  html = html.replace(/<\/blockquote><\/p>/g, "</blockquote>");

  // Nettoyer les paragraphes vides
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
}
