// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [react()],

  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()]
  },

  fonts: [
    {
      provider: fontProviders.local(),
      name: "Andarilho",
      cssVariable: "--font-andarilho",
      options: {
        variants: [{ src: ["./src/assets/fonts/andarilho.woff2"] }]
      }
    },
    {
      provider: fontProviders.local(),
      name: "Leelawadee UI",
      cssVariable: "--font-leelawadee",
      options: {
        variants: [{ src: ["./src/assets/fonts/leelawadee-ui.ttf"] }]
      }
    },
    {
      provider: fontProviders.local(),
      name: "Castorgate",
      cssVariable: "--font-castorgate",
      options: {
        variants: [{ src: ["./src/assets/fonts/castorgate-regular.woff2"] }]
      }
    },
    {
      provider: fontProviders.local(),
      name: "Avenir",
      cssVariable: "--font-avenir",
      options: {
        variants: [{ src: ["./src/assets/fonts/Avenir Regular.ttf"] }]
      }
    }
  ]
});