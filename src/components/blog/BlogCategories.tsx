import { Link } from "@tanstack/react-router";
import { BlogCategory } from "@/types/database";
import { cn } from "@/lib/utils";

interface BlogCategoriesProps {
  categories: BlogCategory[];
  activeCategory?: string;
}

export function BlogCategories({ categories, activeCategory }: BlogCategoriesProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      <Link
        to="/blog"
        className={cn(
          "rounded-full border-2 px-6 py-2.5 text-sm font-medium transition-all",
          !activeCategory
            ? "border-primary bg-primary text-primary-foreground shadow-sm"
            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
        )}
      >
        Tous les articles
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          to="/blog"
          search={{ category: category.slug }}
          className={cn(
            "rounded-full border-2 px-6 py-2.5 text-sm font-medium transition-all",
            activeCategory === category.slug
              ? "text-primary-foreground shadow-sm"
              : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
          )}
          style={
            activeCategory === category.slug
              ? { backgroundColor: category.color || "#2FCCC0", borderColor: category.color || "#2FCCC0" }
              : {}
          }
        >
          {category.icon && <span className="mr-2">{category.icon}</span>}
          {category.name}
        </Link>
      ))}
    </div>
  );
}
