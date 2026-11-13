import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://integriai.cl',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  // lastmod = fecha de cada publicación, para que Google sepa que hay cambios que revisar.
  integrations: [sitemap({ filter: page => !page.includes('/404'), lastmod: new Date() })],
});
