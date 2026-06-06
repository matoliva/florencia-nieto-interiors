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

/** Public social/profile URLs used as `sameAs` (excludes mailto). */
const SAME_AS = [
  'https://www.instagram.com/florencianieto.interiors/',
  'https://www.linkedin.com/in/florencianieto/',
  'https://www.houzz.com/pro/florencianieto87',
];

const LOGO = `${SITE_URL}/icon-512x512.png`;

type Json = Record<string, unknown>;

const abs = (path: string) => (path.startsWith('http') ? path : `${SITE_URL}${path}`);

/** Florencia Nieto as a Person — used on the About page. */
export function personSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PERSON_NAME,
    jobTitle: 'Interior Designer',
    url: `${SITE_URL}/about`,
    image: LOGO,
    sameAs: SAME_AS,
    worksFor: { '@type': 'Organization', name: BUSINESS_NAME },
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
    '@id': `${SITE_URL}/#business`,
    name: BUSINESS_NAME,
    description:
      'Auckland-based interior design studio led by Florencia Nieto, creating considered, layered residential interiors across New Zealand.',
    url: SITE_URL,
    image: LOGO,
    logo: LOGO,
    email: EMAIL,
    telephone: TELEPHONE,
    priceRange: '$$',
    founder: { '@type': 'Person', name: PERSON_NAME },
    sameAs: SAME_AS,
    areaServed: [
      { '@type': 'City', name: 'Auckland' },
      { '@type': 'Country', name: 'New Zealand' },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Auckland',
      addressRegion: 'Auckland',
      addressCountry: 'NZ',
    },
    // Approximate (Mount Eden, Auckland) — enables LocalBusiness map eligibility.
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -36.877,
      longitude: 174.76,
    },
    knowsLanguage: ['en', 'es'],
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
    areaServed: [
      { '@type': 'City', name: 'Auckland' },
      { '@type': 'Country', name: 'New Zealand' },
    ],
    provider: {
      '@type': 'ProfessionalService',
      name: BUSINESS_NAME,
      '@id': `${SITE_URL}/#business`,
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
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: input.name,
    description: input.description,
    url: abs(input.url),
    image: input.images.map(abs),
    creator: { '@type': 'Person', name: PERSON_NAME },
    about: 'Interior Design',
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
