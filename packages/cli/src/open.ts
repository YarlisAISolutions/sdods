import { execa } from 'execa';

/** Open a file or URL in the default browser or viewer. Never throws: opening is a courtesy. */
export async function openInBrowser(target: string): Promise<void> {
  const [cmd, args]: [string, string[]] =
    process.platform === 'darwin'
      ? ['open', [target]]
      : process.platform === 'win32'
        ? // `start` takes its first quoted argument as a window title, so give it an empty one.
          ['cmd', ['/c', 'start', '""', target]]
        : ['xdg-open', [target]];
  await execa(cmd, args, { stdio: 'ignore', windowsVerbatimArguments: true }).catch(
    () => undefined,
  );
}

export type OpenWhen = 'always' | 'on-failure' | 'never';

/**
 * When `sdods run` opens its results. `--open` wins, then SDODS_OPEN; otherwise on failure, and only
 * for a person at a terminal: never in CI, under a coding agent (the same check the runner makes),
 * for --json, or when output is piped to the server, the desktop app or a log.
 */
export function resolveOpenWhen(flag: string | undefined, json: boolean): OpenWhen {
  const explicit = flag ?? process.env.SDODS_OPEN;
  if (explicit === 'always' || explicit === 'on-failure' || explicit === 'never') return explicit;
  const agent = Boolean(process.env.CLAUDECODE || process.env.COPILOT_CLI);
  if (json || process.env.CI || agent || !process.stdout.isTTY) return 'never';
  return 'on-failure';
}
