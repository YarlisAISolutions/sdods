'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ANALYTICS_ENABLED, capture, optedOut } from '@/lib/analytics';

/**
 * Counts page views and clicks on elements marked `data-track="<event>"`, and nothing else.
 *
 * Renders nothing and sends nothing unless NEXT_PUBLIC_POSTHOG_KEY was set at build time, and
 * sends nothing to a browser that asked not to be tracked (Global Privacy Control or Do Not
 * Track). See lib/analytics.ts for what an event carries.
 */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!ANALYTICS_ENABLED || optedOut()) return;
    capture('$pageview', { $pathname: pathname });
  }, [pathname]);

  useEffect(() => {
    if (!ANALYTICS_ENABLED || optedOut()) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]');
      if (!el) return;
      // Every data-track-* attribute becomes a property: data-track-where="hero" → where: "hero".
      const props: Record<string, string> = {};
      for (const [key, value] of Object.entries(el.dataset)) {
        if (key.startsWith('track') && key !== 'track' && value) {
          props[key[5]!.toLowerCase() + key.slice(6)] = value;
        }
      }
      capture(el.dataset.track!, props);
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
