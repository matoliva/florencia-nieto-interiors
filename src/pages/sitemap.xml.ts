import type { APIRoute } from 'astro';
import { projects } from '../data/projects';

export const prerender = true;

const SITE = 'https://florencianieto.com';

// Shared base paths — each exists in both EN (no prefix) and ES (/es prefix).
const staticRoutes = [
  '/',
  '/about',
  '/projects',
  '/services/full-interior-design',
  '/services/e-design',
  '/services/consultation',
];

const projectRoutes = projects.map((p) => `/projects/${p.slug}`);
const allRoutes = [...staticRoutes, ...projectRoutes];

function localizedUrls(basePath: string) {
  const en = `${SITE}${basePath}`;
  const es = `${SITE}/es${basePath === '/' ? '' : basePath}`;
  return { en, es };
}

export const GET: APIRoute = () => {
  const entries: string[] = [];

  for (const basePath of allRoutes) {
    const { en, es } = localizedUrls(basePath);
    // Each locale variant gets its own <url> entry with the full, reciprocal
    // hreflang set (self-referencing + x-default), per Google's guidance.
    const alternates =
      `<xhtml:link rel="alternate" hreflang="en" href="${en}"/>` +
      `<xhtml:link rel="alternate" hreflang="es" href="${es}"/>` +
      `<xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>`;

    entries.push(`  <url><loc>${en}</loc>${alternates}</url>`);
    entries.push(`  <url><loc>${es}</loc>${alternates}</url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
