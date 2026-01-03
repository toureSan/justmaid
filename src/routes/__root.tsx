import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Layout } from '@/components/layout'
import { LoadingProvider } from '@/components/ui/loading-screen'

import appCss from '../styles.css?url'

// Site configuration for SEO
const SITE_URL = 'https://justmaid.ch';
const SITE_NAME = 'justmaid';
const DEFAULT_TITLE = 'justmaid - Ménage à domicile à Genève & Nyon | Réservation en ligne';
const DEFAULT_DESCRIPTION = 'Réservez une femme de ménage ou un homme de ménage qualifié à Genève et Nyon. Service disponible dès demain. Professionnels vérifiés, assurés et notés 4.9/5. Tarifs transparents dès 40 CHF/h.';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: DEFAULT_TITLE,
      },
      {
        name: 'description',
        content: DEFAULT_DESCRIPTION,
      },
      // SEO Keywords
      {
        name: 'keywords',
        content: 'femme de ménage genève, aide ménagère nyon, ménage à domicile suisse, nettoyage appartement genève, service ménage lausanne, pressing domicile, repassage à domicile, entreprise nettoyage genève',
      },
      // Robots
      {
        name: 'robots',
        content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
      // Author & Publisher
      {
        name: 'author',
        content: 'justmaid',
      },
      // Geo tags for local SEO
      {
        name: 'geo.region',
        content: 'CH-GE',
      },
      {
        name: 'geo.placename',
        content: 'Genève',
      },
      {
        name: 'geo.position',
        content: '46.2044;6.1432',
      },
      {
        name: 'ICBM',
        content: '46.2044, 6.1432',
      },
      // Open Graph (Facebook, LinkedIn)
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:site_name',
        content: SITE_NAME,
      },
      {
        property: 'og:title',
        content: DEFAULT_TITLE,
      },
      {
        property: 'og:description',
        content: DEFAULT_DESCRIPTION,
      },
      {
        property: 'og:url',
        content: SITE_URL,
      },
      {
        property: 'og:image',
        content: `${SITE_URL}/menage-equipe6.png`,
      },
      {
        property: 'og:image:width',
        content: '1200',
      },
      {
        property: 'og:image:height',
        content: '630',
      },
      {
        property: 'og:locale',
        content: 'fr_CH',
      },
      // Twitter Card
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: DEFAULT_TITLE,
      },
      {
        name: 'twitter:description',
        content: DEFAULT_DESCRIPTION,
      },
      {
        name: 'twitter:image',
        content: `${SITE_URL}/menage-equipe6.png`,
      },
      // Theme color
      {
        name: 'theme-color',
        content: '#2FCCC0',
      },
      // Apple mobile
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: SITE_NAME,
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/logo192.png',
      },
      {
        rel: 'canonical',
        href: SITE_URL,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
    scripts: [
      // JSON-LD Structured Data for Local Business
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": SITE_URL,
          "name": "justmaid",
          "alternateName": "justmaid Suisse",
          "description": DEFAULT_DESCRIPTION,
          "url": SITE_URL,
          "logo": `${SITE_URL}/logo512.png`,
          "image": `${SITE_URL}/menage-equipe6.png`,
          "telephone": "+41 XX XXX XX XX",
          "email": "contact@justmaid.ch",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rte de Mon-Idée",
            "addressLocality": "Thônex",
            "postalCode": "1226",
            "addressCountry": "CH"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 46.2044,
            "longitude": 6.1432
          },
          "areaServed": [
            {
              "@type": "City",
              "name": "Genève"
            },
            {
              "@type": "City", 
              "name": "Nyon"
            }
          ],
          "priceRange": "CHF 40-80",
          "currenciesAccepted": "CHF",
          "paymentAccepted": "Visa, MasterCard, Apple Pay, Google Pay",
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "07:00",
            "closes": "20:00"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "200",
            "bestRating": "5",
            "worstRating": "1"
          },
          "sameAs": [
            "https://www.facebook.com/justmaid",
            "https://www.instagram.com/justmaid",
            "https://www.linkedin.com/company/justmaid"
          ]
        }),
      },
      // JSON-LD for Service
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Ménage à domicile",
          "provider": {
            "@type": "LocalBusiness",
            "name": "justmaid"
          },
          "areaServed": {
            "@type": "GeoCircle",
            "geoMidpoint": {
              "@type": "GeoCoordinates",
              "latitude": 46.2044,
              "longitude": 6.1432
            },
            "geoRadius": "50000"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Services de ménage",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Ménage à domicile",
                  "description": "Nettoyage complet de votre intérieur par des professionnels"
                },
                "price": "40",
                "priceCurrency": "CHF",
                "priceSpecification": {
                  "@type": "UnitPriceSpecification",
                  "price": "40",
                  "priceCurrency": "CHF",
                  "unitCode": "HUR"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Ménage d'entreprise",
                  "description": "Nettoyage de vos locaux professionnels"
                }
              }
            ]
          }
        }),
      },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return (
    <LoadingProvider>
      <Layout>
        <Outlet />
      </Layout>
    </LoadingProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
