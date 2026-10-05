import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FEEDBACK_EMAIL } from '@/lib/links';
import {
  COMPANY_SPONSORS,
  CUSTOM_AMOUNT_MAX,
  CUSTOM_AMOUNT_URL,
  LARGE_GIFT_LEVELS,
  MANAGE_SUBSCRIPTION_URL,
  SPONSOR_ENABLED,
  SPONSOR_PUBLIC,
  tiersFor,
  type SponsorTier,
} from '@/lib/sponsor';

// While sponsorship is off the page is a 404, and its title and description would still leak into
// the tab and the HTML head, so it borrows the not-found page's plain metadata instead.
export const metadata: Metadata = SPONSOR_ENABLED
  ? {
      title: 'Sponsor SDODS',
      description:
        'SDODS is free and open source. Buy the maintainers a coffee, back the project monthly or sponsor it as a company.',
    }
  : { robots: { index: false, follow: true } };

const LARGE_SPONSOR_MAILTO = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
  'Sponsoring SDODS',
)}&body=${encodeURIComponent(
  [
    'Name or legal entity to invoice:',
    'Billing address:',
    'Tax or VAT ID (if your finance team needs it on the invoice):',
    'Purchase order number (if any):',
    'Amount and cadence (one-time, yearly, monthly):',
    'Pay by (bank transfer / ACH / card on the invoice):',
    'Thank publicly? (no / name only / name and logo):',
    'Forms your finance team needs from us:',
    '',
  ].join('\n'),
)}`;

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

function TierCard({ tier }: { tier: SponsorTier }) {
  return (
    <article className="card flex flex-col p-5">
      <h3 className="font-semibold">{tier.label}</h3>
      <p className="mt-2 text-2xl font-extrabold tracking-tight">
        ${tier.amount}
        {tier.cadence === 'monthly' && <span className="muted text-sm font-normal"> / month</span>}
      </p>
      <p className="muted mt-2 flex-1 text-sm">{tier.blurb}</p>
      <a href={tier.url} className="btn btn-secondary mt-4 text-sm" rel="noreferrer">
        {tier.cadence === 'monthly' ? `Give $${tier.amount} monthly` : `Give $${tier.amount}`}
      </a>
    </article>
  );
}

export default function SponsorPage() {
  if (!SPONSOR_ENABLED) notFound();
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
        Buy SDODS a coffee <span aria-hidden="true">☕</span>
      </h1>
      <p className="muted mt-3 max-w-2xl">
        SDODS is free and open source, API tokens included, and it stays that way. Sponsorship pays
        for what keeps it moving: CI across browsers and operating systems, hosting for the site and
        docs, code-signing certificates for the desktop app and maintainer time for features and
        fixes.
      </p>

      {SPONSOR_PUBLIC && (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-[2fr_1fr]">
            <article className="card flex flex-col p-6">
              <h2 className="text-xl font-bold">Give any amount</h2>
              <p className="muted mt-2 flex-1 text-sm">
                Pick your own number, from $1 up to {usd(CUSTOM_AMOUNT_MAX)} in one payment. Stripe
                Checkout offers the payment methods available where you are. Giving more than that?{' '}
                <a href="#company" className="underline">
                  We will send an invoice
                </a>
                .
              </p>
              <a href={CUSTOM_AMOUNT_URL} className="btn btn-primary mt-4" rel="noreferrer">
                Choose an amount
              </a>
            </article>
            <nav aria-label="Sponsorship options" className="card flex flex-col gap-2 p-6 text-sm">
              <span className="font-semibold">Jump to</span>
              <a href="#once" className="hover:underline">
                One-time
              </a>
              <a href="#monthly" className="hover:underline">
                Monthly
              </a>
              <a href="#company" className="hover:underline">
                Company sponsorship
              </a>
            </nav>
          </div>

          <h2 id="once" className="mt-12 scroll-mt-20 text-xl font-bold">
            One-time
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tiersFor('once').map((t) => (
              <TierCard key={t.id} tier={t} />
            ))}
          </div>

          <h2 id="monthly" className="mt-12 scroll-mt-20 text-xl font-bold">
            Monthly
          </h2>
          <p className="muted mt-1 text-sm">
            Cancel any time with the link at the bottom of this page.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tiersFor('monthly').map((t) => (
              <TierCard key={t.id} tier={t} />
            ))}
          </div>
        </>
      )}

      <h2 id="company" className="mt-12 scroll-mt-20 text-xl font-bold">
        {SPONSOR_PUBLIC ? 'Company or large sponsorship' : 'Sponsor the project'}
      </h2>
      <p className="muted mt-1 max-w-2xl text-sm">
        For a company, or for any gift over {usd(CUSTOM_AMOUNT_MAX)} or one you would rather not put
        on a card, we invoice you. A bank transfer costs both sides far less in fees than a card
        does on a large amount.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {LARGE_GIFT_LEVELS.map((l) => (
          <article key={l.id} className="card flex flex-col p-5">
            <h3 className="font-semibold">{l.label}</h3>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">
              {usd(l.amount)}+<span className="muted text-sm font-normal"> / year</span>
            </p>
            <ul className="muted mt-2 list-disc space-y-1 pl-5 text-sm">
              {l.perks.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <article className="card mt-4 p-6">
        <h3 className="font-semibold">How it works</h3>
        <ol className="muted mt-2 list-decimal space-y-1 pl-5 text-sm">
          <li>Email us the amount, who to invoice and how you want to be thanked.</li>
          <li>
            We send a Stripe invoice from SDODS Developers, with your purchase order number on it if
            you have one. You pay by bank transfer, ACH or card, on 30-day terms.
          </li>
          <li>Stripe emails you a receipt as soon as the payment arrives.</li>
          <li>If you asked to be thanked publicly, your name or logo goes up after that.</li>
        </ol>
        <p className="muted mt-3 text-sm">
          Need a vendor form, tax form or a short sponsorship letter for your finance team? Ask in
          the same email. You can also give monthly or yearly, and the amount is up to you; the
          levels above only decide the thank-you.
        </p>
        <a href={LARGE_SPONSOR_MAILTO} className="btn btn-primary mt-4 text-sm">
          Email {FEEDBACK_EMAIL}
        </a>
      </article>

      {COMPANY_SPONSORS.length > 0 && (
        <>
          <h2 id="sponsors" className="mt-12 scroll-mt-20 text-xl font-bold">
            Thank you to our sponsors
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {COMPANY_SPONSORS.map((c) => (
              <li key={c.name}>
                <a
                  href={c.url}
                  className="card block px-4 py-2 text-sm font-semibold"
                  rel="sponsored noopener"
                >
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="mt-12 text-xl font-bold">Other ways to help</h2>
      <ul className="muted mt-3 list-disc space-y-2 pl-5 text-sm">
        <li>
          Answer a question on the{' '}
          <Link href="/questions/" className="underline">
            questions page
          </Link>
          .
        </li>
        <li>
          Tell us what is missing or broken through{' '}
          <Link href="/feedback/" className="underline">
            feedback
          </Link>
          .
        </li>
        <li>Tell a colleague who still writes tests by hand.</li>
      </ul>

      <section
        id="terms"
        aria-labelledby="terms-heading"
        className="muted mt-12 scroll-mt-20 border-t border-[var(--line)] pt-6 text-xs leading-6"
      >
        <h2 id="terms-heading" className="text-sm font-semibold text-[var(--fg)]">
          Sponsorship terms
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Payments are processed by Stripe for SDODS Developers. SDODS never sees your card or
            bank details.
          </li>
          <li>
            A sponsorship is a gift to an open-source project. It buys no goods, services, support
            or say over the roadmap. SDODS Developers is not a registered charity, so it is not a
            tax-deductible donation.
          </li>
          <li>Made a mistake? Email {FEEDBACK_EMAIL} within 30 days and we refund it in full.</li>
          <li>
            We thank sponsors publicly only when they ask us to, and we may decline a public listing
            that does not fit the project. Leave the &ldquo;name to thank publicly&rdquo; field at
            checkout empty to stay anonymous. See the{' '}
            <Link href="/privacy/" className="underline">
              privacy policy
            </Link>
            .
          </li>
          <li>
            Stripe may ask a sponsor to verify a large payment before it goes through. That is
            Stripe&rsquo;s fraud protection, not a problem with your gift.
          </li>
          {SPONSOR_PUBLIC && (
            <li>
              Monthly sponsor?{' '}
              <a href={MANAGE_SUBSCRIPTION_URL} className="underline" rel="noreferrer">
                Change your card or cancel
              </a>
              .
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
