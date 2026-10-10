import { relative } from 'node:path';
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult,
} from '@playwright/test/reporter';
import pc from 'picocolors';
import { parseRunnerProjectName } from '@sdods/contracts';

export type TerminalMode = 'list' | 'line' | 'dot';

export interface TerminalOptions {
  /** `list` (default, a line per scenario), `line` (the same, for logs and the server), `dot`. */
  mode?: TerminalMode;
  /** Where paths are shown relative to. Defaults to the working directory. */
  rootDir?: string;
  /** Output sink; tests inject one. Defaults to process.stdout. */
  write?: (text: string) => void;
  /** List the scenarios instead of reporting a run (`sdods run --list`; SDODS_LIST_ONLY=1). */
  listOnly?: boolean;
}

interface Failure {
  test: TestCase;
  result: TestResult;
}

/**
 * The console output of `sdods run`, in SDODS terms.
 *
 * Replaces the runner's list/line/dot reporters, which print generated spec paths
 * (`.sdods/generated/<run>/…/x.feature.spec.js`) as test names and end failures with
 * `npx playwright show-trace`. Here a scenario is named by its feature and scenario title, the
 * layer and browser come from the SDODS run-target name, and every follow-up is an `sdods` command.
 *
 * `[n/total]` stays on every scenario line: MCP `run_tests` reads progress from it.
 */
export default class TerminalReporter implements Reporter {
  private readonly mode: TerminalMode;
  private readonly rootDir: string;
  private readonly write: (text: string) => void;
  private total = 0;
  private done = 0;
  private dots = 0;
  private readonly failures: Failure[] = [];
  private readonly flaky: TestCase[] = [];
  private readonly counts = { passed: 0, failed: 0, skipped: 0, flaky: 0 };
  private readonly errors: TestError[] = [];

  constructor(options: TerminalOptions = {}) {
    this.mode = options.mode ?? 'list';
    this.rootDir = options.rootDir ?? process.cwd();
    this.write = options.write ?? ((text) => process.stdout.write(text));
    this.listOnly = options.listOnly ?? process.env.SDODS_LIST_ONLY === '1';
  }

  private readonly listOnly: boolean;

  /** This reporter owns the console, so the runner adds no reporter of its own. */
  printsToStdio() {
    return true;
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.total = suite.allTests().length;
    if (this.listOnly) {
      const features = new Set<string>();
      for (const t of suite.allTests()) {
        features.add(featureOf(t) ?? t.location.file);
        this.write(`  ${title(t)} ${pc.dim(target(t))}\n`);
      }
      this.write(
        `\n${this.total} scenario${this.total === 1 ? '' : 's'} in ${features.size} file${features.size === 1 ? '' : 's'}\n`,
      );
      return;
    }
    const workers = config.workers;
    this.write(
      pc.dim(
        `Running ${this.total} scenario${this.total === 1 ? '' : 's'} with ${workers} worker${workers === 1 ? '' : 's'}\n`,
      ),
    );
    if (this.mode !== 'dot') this.write('\n');
  }

  onStdOut(chunk: string | Buffer, test?: TestCase) {
    if (this.mode === 'dot') return;
    this.write(test ? pc.dim(String(chunk)) : String(chunk));
  }

  onStdErr(chunk: string | Buffer, test?: TestCase) {
    if (this.mode === 'dot') return;
    process.stderr.write(test ? pc.dim(String(chunk)) : String(chunk));
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (this.listOnly) return;
    const final =
      result.status === 'passed' ||
      result.status === 'skipped' ||
      result.status === 'interrupted' ||
      result.retry >= test.retries;
    if (!final) {
      if (this.mode !== 'dot')
        this.write(
          `       ${pc.yellow('↻')} ${title(test)} ${pc.dim(`${target(test)} · retry ${result.retry + 1} of ${test.retries}`)}\n`,
        );
      return;
    }
    this.done++;
    const flaky = result.status === 'passed' && result.retry > 0;
    let mark: string;
    let dot: string;
    if (flaky) {
      this.counts.flaky++;
      this.flaky.push(test);
      mark = pc.yellow('±');
      dot = pc.yellow('±');
    } else if (result.status === 'passed') {
      this.counts.passed++;
      mark = pc.green('✔');
      dot = pc.green('·');
    } else if (result.status === 'skipped') {
      this.counts.skipped++;
      mark = pc.dim('↷');
      dot = pc.dim('°');
    } else {
      this.counts.failed++;
      this.failures.push({ test, result });
      mark = pc.red('✖');
      dot = pc.red('F');
    }
    if (this.mode === 'dot') {
      this.write(dot);
      if (++this.dots % 80 === 0) this.write('\n');
      return;
    }
    const progress = pc.dim(`[${this.done}/${this.total}]`);
    const time = pc.dim(`(${seconds(result.duration)})`);
    const status =
      result.status === 'timedOut'
        ? pc.red(' timed out')
        : result.status === 'interrupted'
          ? pc.yellow(' interrupted')
          : '';
    this.write(`${progress} ${mark} ${title(test)} ${pc.dim(target(test))}${status} ${time}\n`);
  }

  onError(error: TestError) {
    this.errors.push(error);
    this.write(
      `\n${pc.red('✖ Error outside a scenario')}\n${indent(formatError(error, this.rootDir), 2)}\n`,
    );
  }

  onEnd(result: FullResult) {
    if (this.listOnly) return;
    if (this.mode === 'dot' && this.dots % 80 !== 0) this.write('\n');
    if (this.failures.length) {
      this.write(`\n${pc.bold(pc.red(`Failed (${this.failures.length})`))}\n`);
      this.failures.forEach((f, i) => this.write(this.describeFailure(f, i + 1)));
    }
    if (this.flaky.length) {
      this.write(`\n${pc.bold(pc.yellow(`Flaky: passed on a retry (${this.flaky.length})`))}\n`);
      for (const t of this.flaky) this.write(`  ${title(t)} ${pc.dim(target(t))}\n`);
    }
    const parts = [
      pc.green(`${this.counts.passed} passed`),
      this.counts.failed ? pc.red(`${this.counts.failed} failed`) : '',
      this.counts.flaky ? pc.yellow(`${this.counts.flaky} flaky`) : '',
      this.counts.skipped ? pc.dim(`${this.counts.skipped} skipped`) : '',
      // Never started: a setup scenario they depend on failed, --max-failures stopped the run, or
      // it was interrupted. They have no result, so they would otherwise vanish from the count.
      this.total > this.done ? pc.yellow(`${this.total - this.done} did not run`) : '',
    ].filter(Boolean);
    this.write(`\n  ${parts.join(', ')} ${pc.dim(`(${seconds(result.duration)})`)}\n`);
  }

  private describeFailure({ test, result }: Failure, n: number): string {
    const lines: string[] = [];
    const where = test.location ? relative(this.rootDir, test.location.file) : '';
    lines.push(`\n  ${pc.red(`${n})`)} ${pc.bold(title(test))} ${pc.dim(target(test))}`);
    const feature = featureOf(test);
    if (feature || where) lines.push(pc.dim(`     ${feature ?? `${where}:${test.location.line}`}`));
    const errors = result.errors.length ? result.errors : result.error ? [result.error] : [];
    // A generated spec is SDODS's translation of the feature, not code anyone wrote: its snippet
    // and line point at the wrong file, and the feature path above is the one to open.
    const generated = feature !== undefined;
    for (const e of errors) lines.push('', indent(formatError(e, this.rootDir, generated), 5));
    const files = result.attachments.filter((a) => a.path);
    const shots = files.filter((a) => a.contentType.startsWith('image/'));
    // The before/after shots are in the dashboard; the console names the one at the failure.
    const shot = shots.find((a) => /failure|failed/i.test(a.path!)) ?? shots[shots.length - 1];
    const video = files.find((a) => a.name === 'video');
    const trace = files.find((a) => a.name === 'trace');
    if (shot || video || trace) lines.push('');
    if (shot) lines.push(`     ${pc.dim('screenshot')} ${relative(this.rootDir, shot.path!)}`);
    if (video) lines.push(`     ${pc.dim('video     ')} ${relative(this.rootDir, video.path!)}`);
    if (trace)
      lines.push(
        `     ${pc.dim('trace     ')} ${pc.cyan(`sdods trace ${quote(relative(this.rootDir, trace.path!))}`)}`,
      );
    return lines.join('\n') + '\n';
  }
}

/** Feature › Scenario, without the runner's project and generated-file segments. */
export function title(test: TestCase): string {
  // titlePath(): ['', <run target>, <spec file>, ...describe blocks, <test title>]
  const path = test.titlePath().slice(3).filter(Boolean);
  return (path.length ? path : [test.title]).join(' › ');
}

/** `[api]`, `[ui · chromium]` — from the SDODS run-target name, not the raw project name. */
export function target(test: TestCase): string {
  const name = test.parent?.project()?.name ?? '';
  if (!name) return '';
  const parts = parseRunnerProjectName(name);
  if (!parts) return `[${name}]`;
  const bits = [
    parts.layer,
    parts.layer === 'api' ? undefined : parts.browser,
    parts.phase, // `setup`: the gate tier other scenarios depend on
  ].filter(Boolean);
  return `[${bits.join(' · ')}]`;
}

/**
 * `<project>: features/<dir>/x.feature` for a scenario generated from Gherkin, read back from the
 * generated spec path `.sdods/generated/<run>/<project>/<layer>/<dir>/x.feature.spec.js`.
 */
export function featureOf(test: TestCase): string | undefined {
  const file = (test.location?.file ?? '').replace(/\\/g, '/');
  const m = /\.sdods\/generated\/[^/]+\/([^/]+)\/[^/]+\/(.+\.feature)\.spec\.[cm]?js$/.exec(file);
  return m ? `${m[1]}: features/${m[2]}` : undefined;
}

function formatError(error: TestError, rootDir: string, generated = false): string {
  const out: string[] = [];
  let message = (error.message ?? error.value ?? 'Unknown error').trimEnd();
  // The launch log (every browser flag, display warnings) follows "Browser logs:" and is in the
  // trace; in the console it buries the one line that says what went wrong.
  const logs = message.indexOf('\nBrowser logs:');
  if (logs >= 0)
    message = message.slice(0, logs).trimEnd() + pc.dim('\n(browser log: see the trace)');
  out.push(message);
  if (error.snippet && !generated) out.push('', error.snippet);
  if (error.location && !generated)
    out.push(pc.dim(`at ${relative(rootDir, error.location.file)}:${error.location.line}`));
  return out.join('\n');
}

function indent(text: string, n: number): string {
  const pad = ' '.repeat(n);
  return text
    .split('\n')
    .map((l) => (l ? pad + l : l))
    .join('\n');
}

function seconds(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function quote(p: string): string {
  return /[\s'"$`\\]/.test(p) ? `'${p.replace(/'/g, `'\\''`)}'` : p;
}
