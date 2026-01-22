import { Link } from "@tanstack/react-router";
import { BlogArticle } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Clock04Icon, CalendarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface BlogCardProps {
  article: BlogArticle;
}

export function BlogCard({ article }: BlogCardProps) {
  const formattedDate = new Date(article.published_at).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg"
    >
      {/* Image */}
      {article.featured_image && (
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={article.featured_image}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Category & Reading Time */}
        <div className="mb-3 flex items-center gap-3">
          <Badge
            style={{ backgroundColor: article.category.color || "#2FCCC0" }}
            className="border-0 text-white hover:opacity-90"
          >
            {article.category.icon && <span className="mr-1">{article.category.icon}</span>}
            {article.category.name}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Clock04Icon} className="h-3.5 w-3.5" />
            <span>{article.reading_time} min</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary line-clamp-2">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            {article.author.avatar ? (
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {article.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-foreground">{article.author.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={CalendarIcon} className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
