import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { basePath, siteUrl, withBase } from '@/lib/base-path';
import { Maxi } from '@/components/maxi';
import '@sdods/site-kit/styles.css';
import './global.css';

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}${basePath}/`),
  title: { template: '%s | SDODS', default: 'SDODS' },
  description:
    'SDODS docs: open-source BDD test automation for UI and API that leaves screenshots, requests and run history behind every run. Self-healing, multi-project, with an MCP server and AI agents.',
  icons: { icon: withBase('/img/favicon.svg') },
  openGraph: {
    title: 'SDODS',
    description: 'Release evidence, not just green checks.',
    url: `${siteUrl}${basePath}/`,
    siteName: 'SDODS',
    // A PNG, and sdods.com's: LinkedIn, X and Slack show no preview for an SVG og:image.
    images: [{ url: 'https://sdods.com/img/og.png', width: 1200, height: 630 }],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ options: { type: 'static', api: withBase('/api/search') } }}>
          {children}
          <Maxi />
        </RootProvider>
      </body>
    </html>
  );
}
