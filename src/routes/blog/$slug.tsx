import { createFileRoute } from "@tanstack/react-router";
import {
  getBlogArticleBySlug,
  getBlogArticleBySlugAsync,
  getSimilarArticles,
  getSimilarArticlesAsync,
} from "@/services/blogService";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/blog";
import {
  Clock04Icon,
  CalendarIcon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { BlogArticle } from "@/types/database";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogArticlePage,
});

function BlogArticlePage() {
  const { slug } = Route.useParams();

  // Try static first for instant display
  const [article, setArticle] = useState<BlogArticle | undefined>(() =>
    getBlogArticleBySlug(slug),
  );
  const [similarArticles, setSimilarArticles] = useState<BlogArticle[]>(() =>
    article ? getSimilarArticles(article.id) : [],
  );
  const [isLoading, setIsLoading] = useState(!article);

  // Load from Supabase if not found in static
  useEffect(() => {
    let cancelled = false;

    if (!article) {
      setIsLoading(true);
      getBlogArticleBySlugAsync(slug).then((found) => {
        if (cancelled) return;
        if (found) {
          setArticle(found);
          getSimilarArticlesAsync(found.id, found.category.id).then(
            (similar) => {
              if (!cancelled) {
                setSimilarArticles(similar);
                setIsLoading(false);
              }
            },
          );
        } else {
          setIsLoading(false);
          window.location.href = "/blog";
        }
      });
    } else {
      // For static articles, also try to load more similar articles from Supabase
      getSimilarArticlesAsync(article.id, article.category.id).then(
        (similar) => {
          if (!cancelled) setSimilarArticles(similar);
        },
      );
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <>
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
      </>
    );
  }

  const formattedDate = new Date(article.published_at).toLocaleDateString(
    "fr-FR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  // SEO Meta tags
  useEffect(() => {
    document.title = article.meta_title || `${article.title} - Blog`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        article.meta_description || article.excerpt,
      );
    }
  }, [article]);

  // Convert Markdown to HTML (only if no pre-rendered HTML available)
  const contentHtml = useMemo(() => {
    // Use pre-rendered HTML from RankPill if available
    if (article.content_html) {
      return article.content_html;
    }

    // Otherwise, parse markdown manually (for static articles)
    let html = article.content;

    // Normalize line endings
    html = html.replace(/\r\n/g, "\n");

    // Images ![alt](url)
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" />',
    );

    // HR first (before headers)
    html = html.replace(/^---$/gim, "<hr>");

    // Headers (from most specific to least)
    html = html.replace(/^#### (.+)$/gim, "<h4>$1</h4>");
    html = html.replace(/^### (.+)$/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gim, "<h1>$1</h1>");

    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gim, "<blockquote>$1</blockquote>");

    // Process line by line for lists, tables and paragraphs
    const lines = html.split("\n");
    const result: string[] = [];
    let inList = false;
    let inTable = false;
    const paragraphBuffer: string[] = [];

    const flushParagraph = () => {
      if (paragraphBuffer.length > 0) {
        const text = paragraphBuffer.join(" ").trim();
        if (text) {
          result.push(`<p>${text}</p>`);
        }
        paragraphBuffer.length = 0;
      }
    };

    const isTableRow = (line: string) => {
      return line.includes("|") && line.trim().startsWith("|");
    };

    const isTableSeparator = (line: string) => {
      return !!line.match(/^\|[\s\-:|]+\|$/);
    };

    const parseTableRow = (line: string, isHeader: boolean) => {
      const cells = line.split("|").filter((c) => c.trim());
      const tag = isHeader ? "th" : "td";
      const cellsHtml = cells
        .map((cell) => `<${tag}>${cell.trim()}</${tag}>`)
        .join("");
      return `<tr>${cellsHtml}</tr>`;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Empty line - flush everything
      if (!line) {
        flushParagraph();
        if (inList) {
          result.push("</ul>");
          inList = false;
        }
        if (inTable) {
          result.push("</tbody></table>");
          inTable = false;
        }
        continue;
      }

      // Table handling
      if (isTableRow(line)) {
        flushParagraph();
        if (inList) {
          result.push("</ul>");
          inList = false;
        }

        // Skip separator line
        if (isTableSeparator(line)) {
          continue;
        }

        if (!inTable) {
          // Start table with header
          result.push("<table>");
          result.push("<thead>");
          result.push(parseTableRow(line, true));
          result.push("</thead>");
          result.push("<tbody>");
          inTable = true;
        } else {
          // Body row
          result.push(parseTableRow(line, false));
        }
        continue;
      }

      // Close table if we hit non-table content
      if (inTable && !isTableRow(line)) {
        result.push("</tbody></table>");
        inTable = false;
      }

      // HTML tags - pass through
      if (line.match(/^<(h[1-6]|img|hr|blockquote)/i)) {
        flushParagraph();
        if (inList) {
          result.push("</ul>");
          inList = false;
        }
        result.push(line);
        continue;
      }

      // List items
      if (line.match(/^- /)) {
        flushParagraph();
        if (!inList) {
          result.push("<ul>");
          inList = true;
        }
        result.push(`<li>${line.substring(2)}</li>`);
        continue;
      }

      // Close list if we hit non-list content
      if (inList && !line.match(/^- /)) {
        result.push("</ul>");
        inList = false;
      }

      // Regular text - add to paragraph buffer
      paragraphBuffer.push(line);
    }

    // Flush any remaining content
    flushParagraph();
    if (inList) {
      result.push("</ul>");
    }
    if (inTable) {
      result.push("</tbody></table>");
    }

    return result.join("\n");
  }, [article.content, article.content_html]);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
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
      <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
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
              <p className="text-sm font-medium text-foreground">
                {article.author.name}
              </p>
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
          className="article-content prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-4 prose-strong:text-foreground prose-a:text-primary prose-ul:my-4 prose-li:text-muted-foreground prose-h2:mt-12 prose-h2:mb-6 prose-h3:mt-8 prose-h3:mb-4"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-border pt-8">
            <span className="text-sm font-semibold text-foreground">
              Tags :
            </span>
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
    </>
  );
}
