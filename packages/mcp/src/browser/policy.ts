import { isAbsolute, relative, resolve } from 'node:path';

/**
 * What the wrapper refuses, and what it never lets back out.
 *
 * Applied in the driver rather than in each tool, so a tool cannot forget to call it.
 */

/** Header lines whose value must never reach a transcript. */
const SECRET_HEADER =
  /^(\s*[-*]?\s*)(authorization|proxy-authorization|cookie|set-cookie|x-api-key|x-auth-token|x-csrf-token)(\s*:\s*)(.+)$/gim;

/**
 * Network results come back as TEXT, so the keyed-object redactor used elsewhere in SDODS does not
 * apply — headers arrive as `authorization: Bearer ey...` inside a formatted block.
 *
 * Bodies are deliberately not regex-scrubbed: Playwright's own `--secrets` masks known values at
 * capture time, which a post-hoc guess cannot do without also mangling legitimate content.
 */
export function redactHeaders(text: string): string {
  return text.replace(SECRET_HEADER, (_m, lead, name, sep) => `${lead}${name}${sep}***`);
}

/**
 * Arbitrary-code tools are off unless explicitly enabled.
 *
 * A scope alone is not enough: the stdio principal is LOCAL_ADMIN and holds every scope, so on a
 * developer machine `browser_run_code_unsafe` would otherwise always be available. This is the
 * switch an operator can set for a deployment; the scope is what governs HTTP principals.
 */
export function unsafeToolsEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env.SDODS_BROWSER_ALLOW_UNSAFE;
  return raw === '1' || raw === 'true';
}

export const UNSAFE_DISABLED_HINT =
  'Set SDODS_BROWSER_ALLOW_UNSAFE=1 to enable it. It runs caller-supplied code, which upstream documents as RCE-equivalent.';

/**
 * Tools whose `filename` is a file the child WRITES. `browser_run_code_unsafe` is not one: its
 * `filename` is code it reads, and the tool is behind SDODS_BROWSER_ALLOW_UNSAFE.
 */
export const OUTPUT_FILE_TOOLS: ReadonlySet<string> = new Set([
  'browser_snapshot',
  'browser_find',
  'browser_console_messages',
  'browser_network_requests',
  'browser_network_request',
  'browser_take_screenshot',
  'browser_pdf_save',
  'browser_evaluate',
  'browser_start_video',
]);

/**
 * Keep a tool's output file inside the session's output directory.
 *
 * Upstream resolves a relative `filename` against its workspace root, and the child runs in the
 * repository root so that browser_file_upload can read repo files. Without this, a snapshot or a
 * screenshot named `src/app.ts` would overwrite source in the user's working tree. A relative name
 * resolves inside `outputDir`; an absolute one must already be inside it.
 */
export function confineOutputFile(
  tool: string,
  args: Record<string, unknown>,
  outputDir: string,
): Record<string, unknown> {
  const name = args.filename;
  if (!OUTPUT_FILE_TOOLS.has(tool) || typeof name !== 'string' || name === '') return args;
  const target = resolve(outputDir, name);
  const rel = relative(outputDir, target);
  if (rel === '' || rel.startsWith('..') || isAbsolute(rel))
    throw Object.assign(new Error(`${tool}: "${name}" is outside the session output directory.`), {
      error: {
        code: 'BROWSER_PATH_OUTSIDE',
        hint: `Use a file name relative to the session output directory (${outputDir}).`,
      },
    });
  return { ...args, filename: target };
}
