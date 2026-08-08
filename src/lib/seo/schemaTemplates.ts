/**
 * Bilingual JSON-LD builder used by the admin Content-SEO editor and
 * (optionally) by public pages. Map required fields per schema.org type.
 */

export type SchemaType =
  | 'Service'
  | 'Product'
  | 'Article'
  | 'BlogPosting'
  | 'CreativeWork'
  | 'Organization'
  | 'WebPage'
  | 'FAQPage'
  | 'HowTo'
  | 'BreadcrumbList';

export const SCHEMA_TYPES: { value: SchemaType; label: string; description: string }[] = [
  { value: 'Service', label: 'Service', description: 'Professional service offerings' },
  { value: 'Product', label: 'Product', description: 'Sellable product / SKU' },
  { value: 'Article', label: 'Article', description: 'Editorial / learning article' },
  { value: 'BlogPosting', label: 'BlogPosting', description: 'Blog post' },
  { value: 'CreativeWork', label: 'CreativeWork (Project)', description: 'Case study / portfolio project' },
  { value: 'Organization', label: 'Organization', description: 'Company / brand entity' },
  { value: 'WebPage', label: 'WebPage', description: 'Generic webpage' },
  { value: 'FAQPage', label: 'FAQPage', description: 'FAQ block' },
  { value: 'HowTo', label: 'HowTo', description: 'Step-by-step guide' },
  { value: 'BreadcrumbList', label: 'BreadcrumbList', description: 'Breadcrumb trail' },
];

export interface SchemaBuildInput {
  type: SchemaType;
  locale: 'en' | 'ar';
  name: string;
  description: string;
  url: string;
  image?: string | null;
  keywords?: string | null;
  author?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  provider?: string;
}

/**
 * Return the required field names for a given schema type — used to render
 * validation hints in the admin UI so authors know what to fill in.
 */
export function requiredFields(type: SchemaType): string[] {
  switch (type) {
    case 'Service':
      return ['name', 'description', 'provider', 'areaServed'];
    case 'Product':
      return ['name', 'description', 'image', 'brand', 'offers'];
    case 'Article':
    case 'BlogPosting':
      return ['headline', 'description', 'image', 'author', 'datePublished'];
    case 'CreativeWork':
      return ['name', 'description', 'image', 'creator'];
    case 'Organization':
      return ['name', 'url', 'logo'];
    case 'WebPage':
      return ['name', 'description', 'url'];
    case 'FAQPage':
      return ['mainEntity[]'];
    case 'HowTo':
      return ['name', 'step[]'];
    case 'BreadcrumbList':
      return ['itemListElement[]'];
  }
}

const ORG_REF = {
  '@type': 'Organization',
  name: 'OdooTeams',
  url: 'https://odooteams.com',
  logo: 'https://odooteams.com/uploads/e8433aef-9332-4de5-a325-42043909dbab.png',
};

export function buildJsonLd(input: SchemaBuildInput): Record<string, any> {
  const { type, locale, name, description, url, image, keywords, author, datePublished, dateModified } = input;
  const inLanguage = locale === 'ar' ? 'ar' : 'en';
  const base: Record<string, any> = { '@context': 'https://schema.org', '@type': type, inLanguage };

  switch (type) {
    case 'Service':
      return {
        ...base,
        name,
        description,
        url,
        image: image || undefined,
        serviceType: keywords?.split(',')[0]?.trim(),
        provider: ORG_REF,
        areaServed: [{ '@type': 'Country', name: 'United Arab Emirates' }, { '@type': 'Country', name: 'Saudi Arabia' }],
      };
    case 'Product':
      return {
        ...base,
        name,
        description,
        image: image || undefined,
        brand: ORG_REF,
        offers: { '@type': 'Offer', url, priceCurrency: 'AED', availability: 'https://schema.org/InStock' },
      };
    case 'Article':
    case 'BlogPosting':
      return {
        ...base,
        headline: name,
        description,
        image: image || undefined,
        author: { '@type': 'Person', name: author || 'OdooTeams' },
        publisher: ORG_REF,
        datePublished: datePublished || new Date().toISOString(),
        dateModified: dateModified || datePublished || new Date().toISOString(),
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      };
    case 'CreativeWork':
      return {
        ...base,
        name,
        description,
        image: image || undefined,
        url,
        creator: ORG_REF,
        keywords: keywords || undefined,
        dateCreated: datePublished || undefined,
      };
    case 'Organization':
      return { ...ORG_REF, '@context': 'https://schema.org', description, sameAs: ['https://linkedin.com/company/odooteams', 'https://twitter.com/odooteams'] };
    case 'WebPage':
      return { ...base, name, description, url, isPartOf: { '@type': 'WebSite', name: 'OdooTeams', url: 'https://odooteams.com' } };
    case 'FAQPage':
      return { ...base, mainEntity: [{ '@type': 'Question', name: name, acceptedAnswer: { '@type': 'Answer', text: description } }] };
    case 'HowTo':
      return { ...base, name, description, step: [{ '@type': 'HowToStep', name: 'Step 1', text: description }] };
    case 'BreadcrumbList':
      return { ...base, itemListElement: [{ '@type': 'ListItem', position: 1, name, item: url }] };
  }
}

/**
 * Real-world SERP pixel-width limits differ by locale. Arabic glyphs render
 * ~1.6× wider than Latin. These char counts approximate Google's truncation.
 */
export const SERP_LIMITS = {
  en: { titleMin: 30, titleMax: 60, descMin: 110, descMax: 158 },
  ar: { titleMin: 20, titleMax: 38, descMin: 80, descMax: 130 },
} as const;

export function lengthStatus(
  value: string,
  locale: 'en' | 'ar',
  kind: 'title' | 'desc',
): 'ok' | 'short' | 'long' | 'empty' {
  const v = (value || '').trim();
  if (!v) return 'empty';
  const l = SERP_LIMITS[locale];
  const min = kind === 'title' ? l.titleMin : l.descMin;
  const max = kind === 'title' ? l.titleMax : l.descMax;
  if (v.length < min) return 'short';
  if (v.length > max) return 'long';
  return 'ok';
}
