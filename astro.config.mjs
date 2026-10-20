// @ts-check

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://allanv17.github.io',
  // GitHub Pages serves this project below /tiki-hostel, so generated URLs need the base path.
  base: '/tiki-hostel',
  integrations: [sitemap()],
});
