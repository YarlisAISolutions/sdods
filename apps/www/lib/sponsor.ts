/**
 * Sponsorship through Stripe Payment Links. The site is a static export with no backend, so every
 * option is a plain outbound link to Stripe Checkout; nothing here is a secret.
 *
 * This is the only place in the repo that holds Stripe URLs. The README, installer, CLI, web UI
 * and desktop app all link to SPONSOR_URL instead, so a price or link can change with a site
 * deploy and no release.
 *
 * The links belong to the "SDODS Developers" Stripe account. Leave a URL empty until its link
 * exists: while any is empty the page shows only the "large sponsorship" email card and the nav
 * and footer hide the ask. Fill all of them in at once (tests/sponsor.test.ts rejects a half-filled
 * set).
 *
 * Nothing here shows at all while SPONSOR_ENABLED (in @sdods/contracts/sponsor) is false: the
 * sponsor pages are not found and every link to them is hidden. Flip it with the links.
 */
import { SPONSOR_ENABLED, SPONSOR_URL } from '@sdods/contracts/sponsor';

export { SPONSOR_ENABLED, SPONSOR_URL };
export const SPONSOR_PAGE = '/sponsor/';

export type SponsorCadence = 'once' | 'monthly';

export interface SponsorTier {
  id: string;
  cadence: SponsorCadence;
  label: string;
  /** Whole US dollars. */
  amount: number;
  blurb: string;
  /** Stripe Payment Link (https://buy.stripe.com/...). Empty until it is created. */
  url: string;
}

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: 'coffee',
    cadence: 'once',
    label: 'A coffee',
    amount: 5,
    blurb: 'A small thank-you that keeps a maintainer going through one more flaky-test hunt.',
    url: 'https://buy.stripe.com/6oU7sK1073lD1lm96v7g400',
  },
  {
    id: 'supporter',
    cadence: 'once',
    label: 'Supporter',
    amount: 25,
    blurb: 'Helps pay for the CI that runs every change across browsers and operating systems.',
    url: 'https://buy.stripe.com/9B69AScIP3lDggg3Mb7g401',
  },
  {
    id: 'champion',
    cadence: 'once',
    label: 'Champion',
    amount: 100,
    blurb: 'Helps keep sdods.com, the docs and the package channels online.',
    url: 'https://buy.stripe.com/bJecN47ov9K1fccbeD7g402',
  },
  {
    id: 'monthly-coffee',
    cadence: 'monthly',
    label: 'Coffee club',
    amount: 5,
    blurb: 'A coffee every month. Small, steady and the kind of support that adds up.',
    url: 'https://buy.stripe.com/3cI9AS8sz6xPd44eqP7g403',
  },
  {
    id: 'monthly-supporter',
    cadence: 'monthly',
    label: 'Backer',
    amount: 25,
    blurb: 'Steady help with CI, releases and code-signing certificates.',
    url: 'https://buy.stripe.com/fZu8wO38fe0haVWgyX7g404',
  },
  {
    id: 'monthly-champion',
    cadence: 'monthly',
    label: 'Patron',
    amount: 100,
    blurb: 'Funds maintainer time for features, fixes and answering questions.',
    url: 'https://buy.stripe.com/eVq00iaAH09raVW5Uj7g405',
  },
];

/** One-time payment where the sponsor types the amount, up to Stripe's per-payment maximum. */
export const CUSTOM_AMOUNT_URL = 'https://buy.stripe.com/28E28q4cjcWd1lmaaz7g406';

/**
 * The most the any-amount link accepts in one payment, in whole US dollars. Stripe sets the ceiling;
 * stripe-sponsor-setup.py records what it accepted as `custom_max_cents` in stripe-sponsor.json.
 * Anything above it goes through an invoice (see LARGE_GIFT_LEVELS and docs/sponsor-large-gifts.md).
 */
export const CUSTOM_AMOUNT_MAX = 10_000;

export interface SponsorLevel {
  id: string;
  label: string;
  /** Whole US dollars per year, the minimum for the level. */
  amount: number;
  perks: string[];
}

/**
 * Company and large sponsorship, arranged by email and paid by invoice. The perks are recognition
 * only, never services: a sponsorship stays a gift, so there is no support contract, SLA or
 * roadmap control to sell.
 */
export const LARGE_GIFT_LEVELS: SponsorLevel[] = [
  {
    id: 'bronze',
    label: 'Bronze',
    amount: 1_000,
    perks: ['Your name and link on this page', 'A thank-you in the release notes'],
  },
  {
    id: 'silver',
    label: 'Silver',
    amount: 5_000,
    perks: ['Your logo on this page', 'Your logo in the README', 'Everything in Bronze'],
  },
  {
    id: 'gold',
    label: 'Gold',
    amount: 10_000,
    perks: [
      'Your logo on the sdods.com home page',
      'A larger logo in the README',
      'Everything in Silver',
    ],
  },
];

export interface CompanySponsor {
  name: string;
  url: string;
  level: SponsorLevel['id'];
}

/** Sponsors who asked to be thanked publicly. Add one only after their payment has cleared. */
export const COMPANY_SPONSORS: CompanySponsor[] = [];

/** Stripe customer-portal login, where monthly sponsors change their card or cancel. */
export const MANAGE_SUBSCRIPTION_URL = 'https://billing.stripe.com/p/login/6oU7sK1073lD1lm96v7g400';

/** Every Stripe link the page needs. */
export const SPONSOR_LINKS: string[] = [
  ...SPONSOR_TIERS.map((t) => t.url),
  CUSTOM_AMOUNT_URL,
  MANAGE_SUBSCRIPTION_URL,
];

/** True when sponsorship is on and every Stripe link exists; the site shows the ask only then. */
export const SPONSOR_PUBLIC = SPONSOR_ENABLED && SPONSOR_LINKS.every((u) => u !== '');

export function tiersFor(cadence: SponsorCadence): SponsorTier[] {
  return SPONSOR_TIERS.filter((t) => t.cadence === cadence);
}
