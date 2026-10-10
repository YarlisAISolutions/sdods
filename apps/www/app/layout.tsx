import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Maxi } from '@/components/maxi';
import { Analytics } from '@/components/analytics';
import { SITE_URL } from '@/lib/links';
import '@sdods/site-kit/styles.css';
import './global.css';

const OG_DESCRIPTION =
  'Open-source BDD tests for UI and API that leave screenshots, requests and history behind every run.';
const OG_ALT = 'SDODS: release evidence, not just green checks';

/** schema.org description of the product, for search engines' rich results. */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SDODS',
  url: SITE_URL,
  description: OG_DESCRIPTION,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'macOS, Windows, Linux',
  license: 'https://www.apache.org/licenses/LICENSE-2.0',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | SDODS',
    default: 'SDODS — BDD test automation with release evidence',
  },
  description:
    'Open-source BDD tests for UI and API that leave before/after screenshots, requests and run history behind, so anyone can say yes to a release.',
  icons: { icon: '/img/favicon.svg' },
  openGraph: {
    title: 'SDODS — release evidence, not just green checks',
    description: OG_DESCRIPTION,
    url: SITE_URL,
    siteName: 'SDODS',
    type: 'website',
    // A PNG: LinkedIn, X, Slack and iMessage show no preview at all for an SVG og:image.
    // Regenerate with `bun run --cwd apps/www og-image`.
    images: [{ url: '/img/og.png', width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SDODS — release evidence, not just green checks',
    description: OG_DESCRIPTION,
    images: [{ url: '/img/og.png', alt: OG_ALT }],
  },
  // './' resolves against metadataBase *and the current route*, so every page declares itself
  // canonical. A literal SITE_URL here told Google that /install, /download and every other page
  // were duplicates of the home page, which is an instruction to drop them from the index.
  alternates: { canonical: './' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          // A static object of our own, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <Maxi />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
