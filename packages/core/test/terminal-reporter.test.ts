import { describe, expect, it } from 'vitest';
import type {
  FullConfig,
  FullResult,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import TerminalReporter, { featureOf, target, title } from '../src/reporters/terminal.js';

const ROOT = '/repo';
const SPEC = `${ROOT}/.sdods/generated/run-1/demo-shop/ui/auth/login.feature.spec.js`;

function testCase(over: { title?: string; project?: string; retries?: number } = {}): TestCase {
  const project = over.project ?? 'demo-shop--ui--chromium';
  const name = over.title ?? 'Valid user signs in';
  return {
    title: name,
    retries: over.retries ?? 0,
    location: { file: SPEC, line: 12, column: 3 },
    annotations: [],
    titlePath: () => ['', project, 'auth/login.feature.spec.js', 'Login', name],
    parent: { project: () => ({ name: project }) },
  } as unknown as TestCase;
}

function result(over: Partial<TestResult> = {}): TestResult {
  return {
    status: 'passed',
    retry: 0,
    duration: 1200,
    errors: [],
    attachments: [],
    ...over,
  } as TestResult;
}

function run(steps: (r: TerminalReporter) => void, mode: 'list' | 'line' | 'dot' = 'list') {
  let text = '';
  const r = new TerminalReporter({ mode, rootDir: ROOT, write: (t) => (text += t) });
  steps(r);
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

const config = { workers: 2 } as FullConfig;
const suite = (n: number) => ({ allTests: () => Array.from({ length: n }) }) as unknown as Suite;
const end = { status: 'passed', duration: 3000 } as FullResult;

describe('terminal reporter', () => {
  it('names a scenario by feature and title, and its target by layer and browser', () => {
    const t = testCase();
    expect(title(t)).toBe('Login › Valid user signs in');
    expect(target(t)).toBe('[ui · chromium]');
    expect(target(testCase({ project: 'demo-shop--api' }))).toBe('[api]');
    expect(target(testCase({ project: 'demo-shop--api--setup' }))).toBe('[api · setup]');
    expect(featureOf(t)).toBe('demo-shop: features/auth/login.feature');
  });

  it('prints [n/total] on every scenario line, which MCP run_tests reads for progress', () => {
    const text = run((r) => {
      r.onBegin(config, suite(2));
      r.onTestEnd(testCase(), result());
      r.onTestEnd(testCase({ title: 'Locked user' }), result({ status: 'skipped' }));
      r.onEnd(end);
    });
    expect(text).toContain('Running 2 scenarios with 2 workers');
    expect(text).toMatch(/\[1\/2\] ✔ Login › Valid user signs in \[ui · chromium\] \(1\.2s\)/);
    expect(text).toMatch(/\[2\/2\] ↷ Login › Locked user/);
    expect(text).toContain('1 passed, 1 skipped');
    expect(text).not.toContain('.spec.js');
  });

  it('ends a failure with sdods commands, never the runner CLI', () => {
    const text = run((r) => {
      r.onBegin(config, suite(1));
      r.onTestEnd(
        testCase(),
        result({
          status: 'failed',
          errors: [{ message: 'expect(locator).toBeVisible() failed' }],
          attachments: [
            {
              name: 'trace',
              contentType: 'application/zip',
              path: `${ROOT}/.sdods/runs/run-1/runner-output/login/trace.zip`,
            },
            {
              name: 'screenshot',
              contentType: 'image/png',
              path: `${ROOT}/.sdods/runs/run-1/runner-output/login/test-failed-1.png`,
            },
          ],
        }),
      );
      r.onEnd({ ...end, status: 'failed' });
    });
    expect(text).toContain('Failed (1)');
    expect(text).toContain('demo-shop: features/auth/login.feature');
    expect(text).toContain('expect(locator).toBeVisible() failed');
    expect(text).toContain('sdods trace .sdods/runs/run-1/runner-output/login/trace.zip');
    expect(text).toContain('screenshot .sdods/runs/run-1/runner-output/login/test-failed-1.png');
    expect(text).not.toContain('.spec.js');
  });

  it('keeps launch logs and generated-spec code out of a failure', () => {
    const text = run((r) => {
      r.onBegin(config, suite(1));
      r.onTestEnd(
        testCase(),
        result({
          status: 'timedOut',
          errors: [
            {
              message:
                'browserContext.close: Test timeout exceeded.\nBrowser logs:\n<launching> chrome --flags',
              snippet: "> 6 |   test.beforeEach('Background', async () => {",
              location: { file: SPEC, line: 6, column: 3 },
            },
          ],
        }),
      );
      r.onEnd({ ...end, status: 'failed' });
    });
    expect(text).toContain('browserContext.close: Test timeout exceeded.');
    expect(text).toContain('(browser log: see the trace)');
    expect(text).not.toContain('--flags');
    expect(text).not.toContain('beforeEach');
    expect(text).not.toMatch(/npx|playwright show/i);
  });

  it('counts a pass on a retry as flaky, and only the final attempt toward progress', () => {
    const t = testCase({ retries: 1 });
    const text = run((r) => {
      r.onBegin(config, suite(1));
      r.onTestEnd(t, result({ status: 'failed', retry: 0 }));
      r.onTestEnd(t, result({ status: 'passed', retry: 1 }));
      r.onEnd(end);
    });
    expect(text).toContain('↻ Login › Valid user signs in [ui · chromium] · retry 1 of 1');
    expect(text).toMatch(/\[1\/1\] ± Login/);
    expect(text).toContain('Flaky: passed on a retry (1)');
    expect(text).toContain('0 passed, 1 flaky');
  });

  it('prints one character per scenario in dot mode', () => {
    const text = run((r) => {
      r.onBegin(config, suite(3));
      r.onTestEnd(testCase(), result());
      r.onTestEnd(testCase(), result({ status: 'failed' }));
      r.onTestEnd(testCase(), result({ status: 'skipped' }));
      r.onEnd(end);
    }, 'dot');
    expect(text).toContain('·F°');
  });

  it('lists scenarios by title and target for run --list', () => {
    let text = '';
    const r = new TerminalReporter({ listOnly: true, write: (t) => (text += t) });
    r.onBegin(config, {
      allTests: () => [testCase(), testCase({ title: 'Locked user' })],
    } as unknown as Suite);
    r.onEnd(end);
    // eslint-disable-next-line no-control-regex
    text = text.replace(/\x1b\[[0-9;]*m/g, '');
    expect(text).toContain('Login › Valid user signs in [ui · chromium]');
    expect(text).toContain('2 scenarios in 1 file');
    expect(text).not.toContain('Running');
  });

  it('claims the console, so the runner adds no reporter of its own', () => {
    expect(new TerminalReporter().printsToStdio()).toBe(true);
  });
});
