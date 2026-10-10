/**
 * Audit a page of sdods.com the way search engines and link previews see it, and exit non-zero on
 * anything that would make it look broken when shared or searched.
 *
 *   bun run --cwd apps/www audit                      # https://sdods.com/
 *   bun run --cwd apps/www audit https://<preview>/   # a PR preview channel
 *   bun run --cwd apps/www audit -- --lighthouse      # also run Lighthouse (needs Chrome)
 *
 * Lighthouse scoring 100 says nothing about the og:image, so these checks are the ones it skips:
 * an SVG preview image (LinkedIn, X and Slack render nothing), a missing or oversized title, a
 * description a search engine truncates, no structured data, images without dimensions.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const url = args.find((a) => a.startsWith('http')) ?? 'https://sdods.com/';
const withLighthouse = args.includes('--lighthouse');

const problems: string[] = [];
const notes: string[] = [];
const check = (ok: boolean, problem: string) => {
  if (!ok) problems.push(problem);
};

const res = await fetch(url);
check(res.ok, `${url} returned ${res.status}`);
const html = await res.text();

const meta = (attr: 'name' | 'property', key: string) =>
  html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1];

const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
check(title.length > 0, 'no <title>');
check(title.length <= 70, `title is ${title.length} characters; Google cuts around 60-70`);
notes.push(`title (${title.length}): ${title}`);

const description = meta('name', 'description') ?? '';
check(description.length >= 70, `meta description is ${description.length} characters`);
check(
  description.length <= 170,
  `meta description is ${description.length} characters; Google cuts around 160`,
);
notes.push(`description (${description.length})`);

const ogImage = meta('property', 'og:image');
check(!!ogImage, 'no og:image');
if (ogImage) {
  check(
    !/\.svg(\?|$)/i.test(ogImage),
    `og:image is an SVG (${ogImage}); share previews will be blank`,
  );
  const img = await fetch(ogImage);
  check(img.ok, `og:image ${ogImage} returned ${img.status}`);
  const type = img.headers.get('content-type') ?? '';
  check(/image\/(png|jpeg|webp)/.test(type), `og:image is served as ${type || 'nothing'}`);
  const bytes = new Uint8Array(await img.arrayBuffer());
  // PNG: width and height are big-endian at bytes 16-23 of the IHDR chunk.
  if (type === 'image/png' && bytes.length > 24) {
    const view = new DataView(bytes.buffer);
    const [w, h] = [view.getUint32(16), view.getUint32(20)];
    check(w >= 1200 && Math.abs(w / h - 1.91) < 0.05, `og:image is ${w}×${h}; use 1200×630`);
    notes.push(`og:image ${w}×${h}, ${Math.round(bytes.length / 1024)} KB`);
  }
  check(bytes.length < 5 * 1024 * 1024, 'og:image is over 5 MB; LinkedIn drops it');
}
check(!!meta('property', 'og:title'), 'no og:title');
check(!!meta('name', 'twitter:card'), 'no twitter:card');
check(html.includes('application/ld+json'), 'no JSON-LD structured data');
check(/<link rel="canonical"/.test(html), 'no canonical link');

const imgs = html.match(/<img\b[^>]*>/g) ?? [];
const unsized = imgs.filter((tag) => !/\bwidth=/.test(tag) || !/\bheight=/.test(tag));
check(unsized.length === 0, `${unsized.length} of ${imgs.length} <img> without width and height`);
const words = html
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .split(/\s+/)
  .filter(Boolean).length;
notes.push(`${imgs.length} images, ~${words} words, ${Math.round(html.length / 1024)} KB HTML`);

if (withLighthouse) {
  const dir = mkdtempSync(join(tmpdir(), 'sdods-audit-'));
  for (const preset of ['mobile', 'desktop'] as const) {
    const out = join(dir, `${preset}.json`);
    execFileSync(
      'npx',
      [
        '-y',
        'lighthouse@12',
        url,
        '--quiet',
        '--chrome-flags=--headless=new',
        '--output=json',
        `--output-path=${out}`,
        ...(preset === 'desktop' ? ['--preset=desktop'] : []),
      ],
      { stdio: 'ignore' },
    );
    const report = JSON.parse(readFileSync(out, 'utf8')) as {
      categories: Record<string, { score: number }>;
      audits: Record<string, { displayValue?: string }>;
    };
    const scores = Object.entries(report.categories).map(
      ([k, v]) => [k, Math.round(v.score * 100)] as const,
    );
    for (const [k, s] of scores) check(s >= 95, `Lighthouse ${preset} ${k} is ${s}`);
    notes.push(
      `lighthouse ${preset}: ${scores.map(([k, s]) => `${k} ${s}`).join(', ')}; LCP ${report.audits['largest-contentful-paint']?.displayValue}`,
    );
  }
}

console.log(`audit ${url}`);
for (const n of notes) console.log(`  · ${n}`);
if (problems.length) {
  for (const p of problems) console.log(`  ✗ ${p}`);
  process.exit(1);
}
console.log('  ✓ no problems');
