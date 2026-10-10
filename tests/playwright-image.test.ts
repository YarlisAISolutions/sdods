import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Linux visual baselines are rendered in the Playwright container (visual-baselines.yml) and
 * compared in the same container (the nightly @regression job in ci.yml). A container whose
 * Playwright differs from the installed client renders with other browser builds, and every
 * baseline drifts without any code change -- so the image tag must follow the lockfile.
 */
const repoRoot = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8');
const client = (
  JSON.parse(read('node_modules/@playwright/test/package.json')) as { version: string }
).version;

/** Every file that names the Playwright image. The monthly upgrade rewrites this same list. */
const PINNED_IMAGE_FILES = [
  '.github/workflows/ci.yml',
  '.github/workflows/visual-baselines.yml',
  'Dockerfile',
  'apps/docs/content/docs/workshop/ci-and-scheduling.mdx',
];

describe('Playwright container image', () => {
  // The server image is built FROM the Playwright image too: its browsers are the ones `sdods run`
  // finds inside the container, so a stale base fails the release smoke run with NOT_SUPPORTED.
  it.each(PINNED_IMAGE_FILES)('%s pins the image to the installed @playwright/test', (file) => {
    const tags = [...read(file).matchAll(/mcr\.microsoft\.com\/playwright:v([\w.-]+?)-noble/g)].map(
      (m) => m[1],
    );
    expect(tags.length, `${file} names no Playwright image`).toBeGreaterThan(0);
    expect(new Set(tags)).toEqual(new Set([client]));
  });

  it('the monthly upgrade moves the image with the client, in every file that names it', () => {
    const workflow = read('.github/workflows/dependencies.yml');
    expect(workflow).toMatch(/Move the Playwright container image with the client/);
    for (const file of PINNED_IMAGE_FILES) expect(workflow, file).toContain(file);
  });
});
