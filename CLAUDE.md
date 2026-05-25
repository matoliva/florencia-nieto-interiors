# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm dev        # Start dev server at localhost:4321
pnpm build      # Build production site to ./dist/
pnpm preview    # Preview production build locally
pnpm astro check  # Type-check .astro files
```

## Stack

- **Astro 6** — file-based routing under `src/pages/`. Each `.astro` file in `pages/` becomes a route.
- **React 19** via `@astrojs/react` — use React components (`.tsx`) for interactive islands; wrap them with `client:load`, `client:visible`, or similar directives in `.astro` files.
- **Tailwind CSS v4** — loaded as a Vite plugin (`@tailwindcss/vite`), not PostCSS. Global styles live in `src/styles/global.css`. Theme tokens are defined there via `@theme` (no `tailwind.config.js`).
- **TypeScript** — strict mode (`astro/tsconfigs/strict`). JSX is configured for React (`jsxImportSource: "react"`), so `.tsx` files use React's JSX transform.
- **pnpm** — use pnpm for all package management; no npm or yarn.

## Architecture

```
src/
  pages/       # Routes (Astro file-based routing)
    es/        # Spanish variants — mirrors src/pages/ structure
  layouts/     # Layout.astro wraps pages via <slot />
  components/  # Reusable UI components (.astro or .tsx)
  i18n/        # Translation strings and helpers
  assets/      # Static assets processed by Vite (images, SVGs)
  styles/      # global.css imported by Layout.astro
public/        # Copied verbatim to dist/ (favicons, fonts, etc.)
```

`Layout.astro` is the root HTML shell — it imports `global.css` and renders `<slot />`. All pages should use it as their outer wrapper.

## Design tokens

All tokens live in `src/styles/global.css` under `@theme`. They generate Tailwind utilities and CSS variables simultaneously.

### Colors

| Category | Tailwind class pattern | Hex range |
|---|---|---|
| Surfaces | `bg-surface-{primary,secondary,tertiary,subtle}` | warm neutrals |
| Borders | `border-border-default` | `#C8BFB1` |
| Text | `text-text-{display,primary,secondary,tertiary}` | dark warm grays |
| Accent | `text-accent-gold`, `border-accent-gold`, `-gold-soft` | `#B89456` / `#C9A86A` |

**Accent usage rule:** gold is editorial only (logo, hairline dividers, hover underlines). Never use it for button fills, backgrounds, or functional UI states.

### Fonts

Fonts are registered via the Astro Fonts API (`astro.config.mjs`) and activated with `<Font />` in `Layout.astro`. Each generates a CSS variable consumed by the Tailwind token.

| Role | Tailwind class | Font |
|---|---|---|
| Signature / hero highlights | `font-signature` | Andarilho |
| Primary headings | `font-heading` | Leelawadee UI |
| Secondary headings | `font-subheading` | Castorgate |
| Body / UI / buttons | `font-body` | Avenir (applied to `body` by default) |

## Internationalization (i18n)

The site is bilingual: **English** (default, no URL prefix) and **Spanish** (`/es/` prefix). Configured via Astro's built-in i18n with `prefixDefaultLocale: false`.

**Adding a new page:** always create a twin in `src/pages/es/`. Example:
```
src/pages/about.astro      → /about
src/pages/es/about.astro   → /es/about
```

**Translation strings** live in `src/i18n/en.ts` and `src/i18n/es.ts` as flat key-value objects. Add new keys to both files simultaneously.

**Using translations in a page:**
```astro
---
import { useTranslations } from '../i18n/utils';
const t = useTranslations(Astro.currentLocale);
---
<h1>{t('hero.title')}</h1>
```

`Layout.astro` sets `<html lang>` automatically from `Astro.currentLocale` and renders `<LanguageSwitcher />` on every page.

## Astro + React boundary

`.astro` components run server-side only (no browser JS by default). For interactivity, create `.tsx` React components and use a `client:*` directive when rendering them inside `.astro` files. Avoid adding React state or hooks inside `.astro` files.
