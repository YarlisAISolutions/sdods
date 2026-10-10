/**
 * Cookieless, anonymous counts for sdods.com, sent straight to PostHog's capture endpoint.
 *
 * No SDK, no cookies, no local or session storage, no person profiles, no session replay. The id
 * on an event lives in memory for one tab and is gone on reload, so a visit can be followed from
 * the home page to /install/ but a visitor can never be recognised again. That is enough to answer
 * the questions the home page is changed for (does anyone reach the install command, which button
 * got them there) and not enough to know who anyone is.
 *
 * Off unless NEXT_PUBLIC_POSTHOG_KEY is set at build time, like NEXT_PUBLIC_MAXI_URL.
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '';
const HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com').replace(
  /\/$/,
  '',
);

export const ANALYTICS_ENABLED = KEY.length > 0;

/** Global Privacy Control or Do Not Track: the browser asked, so nothing is sent. */
export function optedOut(): boolean {
  if (typeof navigator === 'undefined') return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === '1';
}

let tabId: string | undefined;
function visitId(): string {
  tabId ??= crypto.randomUUID();
  return tabId;
}

export function capture(event: string, properties: Record<string, string> = {}): void {
  if (!ANALYTICS_ENABLED || optedOut()) return;
  const body = JSON.stringify({
    api_key: KEY,
    event,
    distinct_id: visitId(),
    timestamp: new Date().toISOString(),
    properties: {
      ...properties,
      $process_person_profile: false,
      $current_url: location.origin + location.pathname,
      $host: location.host,
      $pathname: location.pathname,
      // The referring site only, never its path or query.
      $referring_domain: document.referrer ? new URL(document.referrer).host : '$direct',
      $screen_width: String(window.innerWidth),
      utm_source: new URLSearchParams(location.search).get('utm_source') ?? undefined,
    },
  });
  const url = `${HOST}/i/v0/e/`;
  // sendBeacon survives the navigation a tracked link click starts; fetch is the fallback.
  if (!navigator.sendBeacon?.(url, new Blob([body], { type: 'text/plain' }))) {
    void fetch(url, { method: 'POST', body, keepalive: true }).catch(() => {});
  }
}
