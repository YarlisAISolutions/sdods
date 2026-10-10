/**
 * Render public/img/og.png, the 1200×630 link preview for sdods.com.
 *
 * A PNG because LinkedIn, X, Slack and iMessage show no preview at all for an SVG og:image, which
 * is what the site used to point at. Rendered from HTML with the brand mark inlined, so a tagline
 * change is a one-line edit here and a re-run, not a design-tool round trip.
 *
 *   bun run --cwd apps/www og-image
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve(import.meta.dirname, '..');
const mark = readFileSync(join(root, 'public/img/sdods-mark.svg'), 'utf8')
  .replace(/<\?xml[^>]*>/, '')
  .replace('#0B1020', '#e2e8f0');

const html = `<!doctype html><html><head><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #0b1220; color: #e2e8f0;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
    display: flex; flex-direction: column; justify-content: center; padding: 0 96px; }
  .brand { display: flex; align-items: center; gap: 20px; font-size: 44px; font-weight: 700; }
  .brand svg { width: 84px; height: 84px; }
  .brand b { color: #818cf8; }
  h1 { margin-top: 48px; font-size: 76px; line-height: 1.05; font-weight: 800; letter-spacing: -0.02em; }
  h1 span { background: linear-gradient(120deg, #5eead4, #a5b4fc); -webkit-background-clip: text;
    background-clip: text; color: transparent; }
  p { margin-top: 32px; font-size: 30px; color: #94a3b8; max-width: 960px; line-height: 1.35; }
  .url { position: absolute; right: 96px; bottom: 56px; font-size: 26px; color: #94a3b8; }
</style></head><body>
  <div class="brand">${mark}<div>SD<b>ODS</b></div></div>
  <h1>Release evidence,<br><span>not just green checks</span></h1>
  <p>Open-source BDD tests for UI and API that leave screenshots, requests and history behind every run.</p>
  <div class="url">sdods.com</div>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: join(root, 'public/img/og.png') });
  console.log('wrote public/img/og.png');
} finally {
  await browser.close();
}
