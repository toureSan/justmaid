import { createFileRoute } from "@tanstack/react-router";
import { getBlogArticleBySlug, getSimilarArticles } from "@/services/blogService";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/blog";
import { Clock04Icon, CalendarIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
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

  // Convert Markdown to HTML
  const contentHtml = React.useMemo(() => {
    let html = article.content;

    // Images ![alt](url)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="w-full max-w-4xl mx-auto my-8 rounded-xl shadow-lg" />');

    // Headers (from most specific to least)
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-xl font-bold mt-8 mb-4">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-10 mb-4">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-12 mb-6">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-8 mb-6">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary bg-muted/30 py-3 pl-6 my-6 italic">$1</blockquote>');

    // Lists - unordered
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim().match(/^- /)) {
        if (!inList) {
          processedLines.push('<ul class="list-disc list-inside space-y-2 my-6 ml-6">');
          inList = true;
        }
        processedLines.push(`<li>${line.trim().substring(2)}</li>`);
      } else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(line);
      }
    }
    
    if (inList) {
      processedLines.push('</ul>');
    }
    
    html = processedLines.join('\n');

    // Tables
    const tableLines = html.split('\n');
    const finalLines: string[] = [];
    let inTable = false;
    let isFirstRow = true;

    for (let i = 0; i < tableLines.length; i++) {
      const line = tableLines[i];
      
      if (line.includes('|') && !inTable) {
        inTable = true;
        isFirstRow = true;
        finalLines.push('<table class="min-w-full my-8 border-collapse border border-border rounded-lg overflow-hidden">');
        
        const cells = line.split('|').filter(c => c.trim());
        finalLines.push('<thead class="bg-muted">');
        finalLines.push('<tr>');
        cells.forEach(cell => {
          finalLines.push(`<th class="px-4 py-3 text-left font-semibold border-b border-border">${cell.trim()}</th>`);
        });
        finalLines.push('</tr>');
        finalLines.push('</thead>');
        finalLines.push('<tbody>');
        
        // Skip separator line
        i++;
        continue;
      }
      
      if (line.includes('|') && inTable && !isFirstRow) {
        const cells = line.split('|').filter(c => c.trim());
        finalLines.push('<tr class="hover:bg-muted/30">');
        cells.forEach(cell => {
          finalLines.push(`<td class="px-4 py-3 border-b border-border">${cell.trim()}</td>`);
        });
        finalLines.push('</tr>');
        continue;
      }
      
      if (!line.includes('|') && inTable) {
        finalLines.push('</tbody>');
        finalLines.push('</table>');
        inTable = false;
      }
      
      if (!inTable) {
        finalLines.push(line);
      }
      
      isFirstRow = false;
    }
    
    if (inTable) {
      finalLines.push('</tbody>');
      finalLines.push('</table>');
    }
    
    html = finalLines.join('\n');

    // Paragraphs - split by double newline
    html = html.split('\n\n').map(block => {
      block = block.trim();
      if (!block) return '';
      // Don't wrap HTML tags
      if (block.match(/^<(h[1-6]|ul|ol|table|blockquote|img|hr|div)/i)) {
        return block;
      }
      // Single line breaks within paragraphs
      const lines = block.split('\n').filter(l => l.trim() && !l.match(/^<(h[1-6]|ul|ol|table|blockquote|img|li|tr|th|td)/i));
      if (lines.length > 0) {
        return `<p>${lines.join('<br>')}</p>`;
      }
      return block;
    }).join('\n\n');

    // HR
    html = html.replace(/^---$/gim, '<hr class="my-8 border-border">');

    return html;
  }, [article.content]);

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
              <span>👁️</span>
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
          className="article-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
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
    </>
  );
}
