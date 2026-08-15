/**
 * JSON-LD structured data builders.
 *
 * Each function returns a plain object that pages pass to <Layout jsonLd={...}>.
 * Schema helps Google understand the local business (Auckland / NZ) and gives
 * AI search engines (ChatGPT, Perplexity) clear, citable facts about the studio.
 */

export const SITE_URL = 'https://florencianieto.com';
export const BUSINESS_NAME = 'Florencia Nieto Interior Design';
export const PERSON_NAME = 'Florencia Nieto';
export const EMAIL = 'hello@florencianieto.com';
export const TELEPHONE = '+64 274 294 273';

const BUSINESS_ID = `${SITE_URL}/#business`;
const PERSON_ID = `${SITE_URL}/#florencia-nieto`;

/** Public social/profile URLs used as `sameAs` (excludes mailto). */
const SAME_AS = [
  'https://www.instagram.com/florencianieto.interiors/',
  'https://www.linkedin.com/in/florencianieto/',
  'https://www.houzz.com/pro/florencianieto87',
];

const LOGO = `${SITE_URL}/icon-512x512.png`;

const AREA_SERVED = [
  { '@type': 'City', name: 'Auckland' },
  { '@type': 'Country', name: 'New Zealand' },
];

type Json = Record<string, unknown>;

const abs = (path: string) => (path.startsWith('http') ? path : `${SITE_URL}${path}`);

/** Florencia Nieto as a Person — used on the About page. */
export function personSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PERSON_NAME,
    jobTitle: 'Interior Designer',
    url: `${SITE_URL}/about`,
    image: LOGO,
    sameAs: SAME_AS,
    worksFor: { '@id': BUSINESS_ID, name: BUSINESS_NAME },
    knowsAbout: [
      'Interior Design',
      'Residential Interior Design',
      'Space Planning',
      'Interior Styling',
      'E-Design',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Auckland',
      addressRegion: 'Auckland',
      addressCountry: 'NZ',
    },
  };
}

/**
 * The studio as a local business — used on the home page.
 * ProfessionalService is a LocalBusiness subtype, so it carries both signals.
 */
export function businessSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': BUSINESS_ID,
    name: BUSINESS_NAME,
    description:
      'Auckland-based interior design studio led by Florencia Nieto, creating considered, layered residential interiors across New Zealand.',
    url: SITE_URL,
    image: LOGO,
    logo: LOGO,
    email: EMAIL,
    telephone: TELEPHONE,
    priceRange: '$$',
    founder: { '@type': 'Person', '@id': PERSON_ID, name: PERSON_NAME },
    sameAs: SAME_AS,
    areaServed: AREA_SERVED,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Auckland',
      addressRegion: 'Auckland',
      addressCountry: 'NZ',
    },
    knowsLanguage: ['en', 'es'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: EMAIL,
      telephone: TELEPHONE,
      availableLanguage: ['English', 'Spanish'],
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Interior design services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Full Interior Design Service',
            url: `${SITE_URL}/services/full-interior-design`,
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'E-Design Service',
            url: `${SITE_URL}/services/e-design`,
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Interior Design Consultation',
            url: `${SITE_URL}/services/consultation`,
          },
        },
      ],
    },
  };
}

/** The public website, linked to the studio entity on the home page. */
export function websiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Florencia Nieto',
    url: SITE_URL,
    inLanguage: ['en-NZ', 'es'],
    publisher: { '@id': BUSINESS_ID },
  };
}

interface ServiceInput {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  /** Lowest price in NZD, if advertised. */
  price?: number;
}

/** A single service offering — used on each service detail page. */
export function serviceSchema({ name, description, url, serviceType, price }: ServiceInput): Json {
  const schema: Json = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType,
    url: abs(url),
    areaServed: AREA_SERVED,
    provider: {
      '@id': BUSINESS_ID,
      '@type': 'ProfessionalService',
      name: BUSINESS_NAME,
    },
  };

  if (price !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      price,
      priceCurrency: 'NZD',
      url: abs(url),
    };
  }

  return schema;
}

/** A portfolio project — used on each project detail page. */
export function projectSchema(input: {
  name: string;
  description: string;
  url: string;
  images: string[];
  inLanguage: 'en' | 'es';
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: input.name,
    description: input.description,
    url: abs(input.url),
    image: input.images.map(abs),
    creator: { '@type': 'Person', '@id': PERSON_ID, name: PERSON_NAME },
    about: 'Interior Design',
    inLanguage: input.inLanguage,
  };
}

/** Breadcrumb trail. `items` are ordered [{ name, url }, ...]. */
export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.url),
    })),
  };
}
