# Blog Justmaid - Documentation

## 📝 Structure du Blog

Le blog Justmaid est conçu pour améliorer le SEO et fournir du contenu de valeur aux utilisateurs.

### Routes disponibles

- `/blog` - Liste de tous les articles avec filtres par catégorie
- `/blog/:slug` - Page détaillée d'un article

### Catégories

1. **Conseils ménage** (✨) - #2FCCC0
2. **Astuces rangement** (📦) - #8B5CF6
3. **Produits écologiques** (🌿) - #10B981
4. **Organisation** (📋) - #F59E0B

### Structure d'un article

Chaque article contient :
- Titre optimisé SEO
- Slug URL-friendly
- Excerpt (résumé)
- Contenu complet en Markdown
- Catégorie
- Auteur (nom + avatar)
- Image featured
- Date de publication
- Temps de lecture
- Tags
- Meta title & description pour SEO
- Compteur de vues

### Ajouter un nouvel article

Éditez `src/services/blogService.ts` et ajoutez votre article dans le tableau `blogArticles` :

```typescript
{
  id: "2",
  title: "Votre titre ici",
  slug: "votre-slug-url",
  excerpt: "Résumé court de l'article",
  content: `
# Votre contenu en Markdown

## Section 1
Votre contenu...

## Section 2
Plus de contenu...
  `,
  category: blogCategories[0], // Choisissez la catégorie
  author: {
    name: "Nom Auteur",
    avatar: "/chemin/image.png",
  },
  featured_image: "/chemin/image.png",
  published_at: "2026-01-22T10:00:00Z",
  reading_time: 5,
  tags: ["tag1", "tag2"],
  meta_title: "Titre SEO optimisé",
  meta_description: "Description SEO optimisée",
}
```

### Optimisation SEO

Chaque article doit inclure :
- **Meta Title** : 50-60 caractères, incluant mot-clé principal
- **Meta Description** : 150-160 caractères, appel à l'action
- **URL Slug** : Court, descriptif, avec mots-clés
- **Tags** : 3-5 tags pertinents
- **Contenu** : Minimum 800 mots, structure H1-H2-H3
- **Images** : Alt text descriptif
- **Liens internes** : Vers services et autres articles

### Mots-clés à inclure

- Ménage [ville] (Genève, Lausanne, Nyon, etc.)
- Service de ménage Suisse
- Femme de ménage [région]
- Nettoyage professionnel
- Ménage à domicile
- Ménage fin de bail

### Mise à jour du sitemap

Après ajout d'un article, mettez à jour `public/sitemap.xml` :

```xml
<url>
  <loc>https://justmaid.ch/blog/votre-slug</loc>
  <lastmod>2026-01-22</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.7</priority>
</url>
```

## 🎨 Composants disponibles

- `BlogCard` : Carte d'aperçu d'article
- `BlogCategories` : Filtres de catégories
- `BlogHero` : En-tête de la page blog

## 📊 Prochaines améliorations

- [ ] Système de recherche d'articles
- [ ] Pagination
- [ ] Articles similaires améliorés
- [ ] Partage sur réseaux sociaux
- [ ] Commentaires
- [ ] Newsletter
- [ ] Base de données Supabase pour les articles
