import Link from 'next/link';
import { AgentInstall, SupportProject } from '@sdods/site-kit';
import { InstallTabs } from '@/components/install-tabs';
import {
  AI_TOOLS_GUIDE_URL,
  SDODS_AGENT_PROJECT,
  SUPPORT_LINKS,
  SUPPORT_PROJECT,
} from '@/lib/ai-tools';
import { DOCS_URL, REPO_PUBLIC, REPO_URL } from '@/lib/links';

/**
 * One grid. There used to be a "Why" grid above this one, and between them they said
 * "before/after screenshots", "BDD for UI and API" and "data" twice each.
 */
const FEATURES: Array<[string, string]> = [
  [
    'UI, API and hybrid in one language',
    'Gherkin with one merged fixture set, so a scenario can seed through the API and assert in the browser.',
  ],
  [
    'Before/after narratives',
    'A screenshot before and after every UI step, API request/response snapshots and visual baselines, chosen per suite tag.',
  ],
  [
    'Self-healing locators',
    'Scored candidate probes, persisted heal history, proposals to fix page objects.',
  ],
  [
    'Many apps, many environments',
    'One YAML per project plus one per environment, explainable precedence, secrets only through ${VAR}.',
  ],
  [
    'Data and user pools',
    'CSV, JSON, YAML, database tables and faker factories per environment; accounts leased per worker with login-state reuse.',
  ],
  [
    'Every browser you ship to',
    'Chromium, Edge, Firefox, WebKit and mobile emulation; --project-matrix runs them all, and lint validates @skip:<browser>.',
  ],
  [
    'Run history that remembers',
    'Results in SQLite or Postgres: flakiness, locator fragility, environment stability and suite health over time.',
  ],
  [
    'MCP server and agents',
    '86 tools for Claude Code, Codex, Cursor, VS Code, Gemini CLI and any MCP client; a Claude Code plugin; planner, generator, healer, upgrader.',
  ],
  [
    'CI, GitHub and Jira',
    'Check runs, PR comments, deduplicated issues and @jira:KEY links; cron schedules from the server, crontab, systemd or Actions; a web UI with roles.',
  ],
];

function Flow() {
  const nodes = [
    'sdods CLI',
    'Config + registry',
    'Browser runs',
    'NDJSON + screenshots',
    'SQLite / Postgres',
    'Web UI · MCP · agents',
  ];
  return (
    <ol
      className="flex flex-wrap items-center justify-center gap-2 text-sm"
      aria-label="How SDODS works"
    >
      {nodes.map((n, i) => (
        <li key={n} className="flex items-center gap-2">
          <span className="flow-node">{n}</span>
          {i < nodes.length - 1 && (
            <span className="flow-arrow" aria-hidden="true">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 text-center md:pt-24">
        <p className="mb-4 inline-block rounded-full border border-[var(--line)] px-3 py-1 text-xs muted">
          {REPO_PUBLIC ? 'Open source' : 'Free'} · Apache-2.0 · BDD for UI and API
        </p>
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl">
          Release evidence, <span className="brand-gradient">not just green checks</span>
        </h1>
        <p className="muted mx-auto mt-6 max-w-2xl text-lg">
          <strong className="text-[var(--fg)]">SDODS</strong> runs BDD tests for UI and API flows
          and leaves the proof behind: before/after screenshots of every step, the requests that
          produced them, and a history of every run. Anyone on the team can say yes to a release.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#install"
            className="btn btn-primary"
            data-track="cta_click"
            data-track-where="hero"
          >
            Install SDODS
          </a>
          <a
            href={DOCS_URL}
            className="btn btn-secondary"
            data-track="cta_click"
            data-track-where="hero-docs"
          >
            Read the docs
          </a>
        </div>
        {REPO_PUBLIC && (
          <p className="muted mt-4 text-sm">
            or{' '}
            <a
              href={REPO_URL}
              className="underline"
              rel="noreferrer"
              data-track="cta_click"
              data-track-where="hero-github"
            >
              read the source on GitHub
            </a>
          </p>
        )}

        <div id="install" className="card mx-auto mt-10 max-w-3xl scroll-mt-24 p-5 text-left">
          <p className="muted mb-3 text-sm">
            Install in one line on macOS, Linux or Windows. Only Node 22 is required.
          </p>
          <InstallTabs compact />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="see">
        <h2 id="see" className="text-2xl font-bold">
          What a run leaves behind
        </h2>
        <p className="muted mt-2 max-w-3xl">
          Confidence to ship is usually scattered across a green pipeline, a manual check and a
          screenshot in a ticket. SDODS turns it into evidence anyone can point at: every scenario
          tied to a business capability, every run reproducible from one command, every regression
          explained by the screenshots and requests that produced it. These are real captures from
          the demo project.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <figure className="card overflow-hidden">
            <img
              src="/screenshots/step-02-before.webp"
              width={960}
              height={540}
              alt="SauceDemo login form filled in, before the login button is clicked"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="muted p-3 text-sm">
              Before: login form, credentials filled
            </figcaption>
          </figure>
          <figure className="card overflow-hidden">
            <img
              src="/screenshots/step-02-after.webp"
              width={960}
              height={540}
              alt="SauceDemo inventory page after the login step"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="muted p-3 text-sm">After: inventory page, logged in</figcaption>
          </figure>
        </div>
        <figure className="card mt-4 overflow-hidden">
          <img
            src="/screenshots/ui/scenario-steps.webp"
            width={1440}
            height={900}
            alt="SDODS run viewer showing the step timeline with a before/after comparison"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="muted p-3 text-sm">
            Run viewer: step timeline with a slider, overlay and pixel diff, beside the API panels
          </figcaption>
        </figure>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="features">
        <h2 id="features" className="text-2xl font-bold">
          What ships in the box
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([title, body]) => (
            <article key={title} className="card p-5">
              <h3 className="font-semibold">{title}</h3>
              <p className="muted mt-2 text-sm">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="how">
        <h2 id="how" className="text-2xl font-bold">
          How it works
        </h2>
        <p className="muted mt-2 max-w-3xl">
          Everything is CLI-first. The web UI, the MCP server and the scheduler spawn the same
          commands and stream their output, so CI needs nothing but Node and the repository.
        </p>
        <div className="card mt-8 p-6">
          <Flow />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="quickstart">
        <h2 id="quickstart" className="text-2xl font-bold">
          Your first run
        </h2>
        <p className="muted mt-2 max-w-3xl">
          <code>sdods init</code> scaffolds a workspace with a demo project, so the first run needs
          nothing of yours.
        </p>
        <pre tabIndex={0} role="region" aria-label="Quickstart commands" className="mt-6">
          <code>{`sdods init ~/my-tests && cd ~/my-tests
sdods run -p demo-shop -e staging -l api
sdods run -p demo-shop -e staging -l ui -b chromium -t @smoke`}</code>
        </pre>
        <p className="muted mt-3 text-sm">
          Options, upgrade and uninstall are on the{' '}
          <Link href="/install/" className="underline">
            install page
          </Link>{' '}
          and in the{' '}
          <a href={`${DOCS_URL}/docs/getting-started/installation/`} className="underline">
            installation guide
          </a>
          .
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="clients">
        <div className="grid items-start gap-8 md:grid-cols-2">
          <div>
            <h2 id="clients" className="text-2xl font-bold">
              Works with your AI coding tools
            </h2>
            <p className="muted mt-2">
              Claude Code, Codex, Cursor, VS Code, Gemini CLI, Windsurf and any MCP client. Install
              the plugin or the skills, then ask your assistant to plan, write, run, heal or review
              tests. Agents reuse your logged-in CLI session, so no API key is required.
            </p>
            <p className="muted mt-3 text-sm">
              A team can also share one SDODS server and connect every assistant to its{' '}
              <code>/mcp</code> endpoint with a scoped token. The{' '}
              <a href={AI_TOOLS_GUIDE_URL} className="underline">
                AI coding tools guide
              </a>{' '}
              covers each client.
            </p>
          </div>
          <AgentInstall
            project={SDODS_AGENT_PROJECT}
            learnMoreHref={AI_TOOLS_GUIDE_URL}
            learnMoreLabel="Every tool, the MCP endpoint and skills"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4" aria-label="Support SDODS">
        <SupportProject project={SUPPORT_PROJECT} links={SUPPORT_LINKS} variant="banner" />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8" aria-labelledby="feedback">
        <div className="card p-6 text-center">
          <h2 id="feedback" className="text-xl font-bold">
            Want a feature? Tell us.
          </h2>
          <p className="muted mt-1 text-sm">
            {REPO_PUBLIC
              ? 'Feature requests and feedback go straight to the maintainers as GitHub issues and discussions. No account with us needed.'
              : 'Feature requests and feedback go straight to the maintainers by email. No account with us needed.'}
          </p>
          <Link href="/feedback/" className="btn btn-primary mt-4">
            Send feedback
          </Link>
        </div>
      </section>
    </>
  );
}
