import { DOCS_URL, REPO_PUBLIC, REPO_URL } from './links';
import { SPONSOR_PAGE, SPONSOR_PUBLIC } from './sponsor';

export interface NavLink {
  label: string;
  href: string;
  /** Off-site links get no client-side routing and no active state. */
  external?: boolean;
}

/**
 * One list for both navigations. The header shows it inline from `md` up and behind a
 * disclosure below that, and neither copy can drift from the other.
 */
export const NAV_LINKS: NavLink[] = [
  // No "Download" entry: the header's primary button already is that link whenever a desktop
  // release is offered (see SiteHeader), and the same word twice in one bar reads as two places.
  { label: 'Install', href: '/install/' },
  { label: 'Docs', href: DOCS_URL, external: true },
  { label: 'Roadmap', href: '/roadmap/' },
  { label: 'Questions', href: '/questions/' },
  { label: 'Feedback', href: '/feedback/' },
  ...(REPO_PUBLIC ? [{ label: 'GitHub', href: REPO_URL, external: true } as NavLink] : []),
  // Shown once sponsorship is on and every Stripe link exists -- see SPONSOR_PUBLIC in ./sponsor.
  ...(SPONSOR_PUBLIC ? [{ label: 'Sponsor', href: SPONSOR_PAGE } as NavLink] : []),
];
