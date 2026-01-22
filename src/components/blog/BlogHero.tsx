interface BlogHeroProps {
  title?: string;
  description?: string;
}

export function BlogHero({
  title = "Blog",
  description = "Découvrez nos conseils, astuces et actualités pour un intérieur toujours impeccable",
}: BlogHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-16 sm:py-24">
      {/* Decorative circles */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
