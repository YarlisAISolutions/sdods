# Large and company sponsorships

How a maintainer handles the "Email admin@sdods.com" path on https://sdods.com/sponsor/: gifts over
the any-amount cap (`CUSTOM_AMOUNT_MAX` in `apps/www/lib/sponsor.ts`, $10,000), company
sponsorships and anyone who would rather not pay by card.

## 1. Reply within two working days

Ask for anything the email form left blank: legal entity, billing address, amount, cadence, PO
number, tax or VAT ID, how they want to be thanked, and which forms their finance team needs.

## 2. Send a Stripe invoice

In the Stripe Dashboard (live mode, SDODS Developers):

1. **Customers ▸ Add customer**: legal entity name, billing email, address, tax ID.
2. **Invoices ▸ Create invoice** for that customer:
   - one line item: `Sponsorship of the SDODS open-source project`, the amount, USD
   - **Payment terms**: due in 30 days
   - **Payment methods**: bank transfer (customer balance), ACH Direct Debit and card. Bank
     transfer is the cheapest on large amounts; turn it on under Settings ▸ Payments ▸ Payment
     methods if it is not listed.
   - **Memo**: the PO number, and "A gift to an open-source project. No goods or services are
     provided in exchange."
   - **Metadata**: `source = sdods-sponsor`, `tier = invoice-<bronze|silver|gold>`
   - For a yearly or monthly sponsorship use **Subscriptions ▸ Create** with the same settings and
     *Email invoice* collection, so each period is invoiced the same way.
3. Send. Stripe emails the invoice and, once paid, the receipt.

Vendor and tax forms: fill them in for SDODS Developers and reply with them. Do not attach bank
details to an email; the Stripe invoice carries its own payment instructions.

## 3. After the money arrives

- Check the payment shows as **Succeeded** in Transactions before thanking anyone publicly.
- If they asked to be thanked: add them to `COMPANY_SPONSORS` in `apps/www/lib/sponsor.ts`
  (Bronze and up) and, for Silver and up, put their logo in the README sponsor block. Open a PR.
- Mention them in the next release notes.
- Stripe can hold a payout for review after an unusually large payment. Answer its request in
  the Dashboard quickly; keep the account's business and bank details current.

## Refunds and disputes

The sponsor page promises a full refund on request within 30 days: Transactions ▸ the payment ▸
Refund. Remove any public listing in the same PR as the refund. Answer any dispute in the
Dashboard with the invoice and the email thread.

## Raising the $10,000 cap

The any-amount link's maximum is set by Stripe for the account, not by us. To raise it, ask Stripe
support, create a new any-amount price and link with the higher maximum, and update
`CUSTOM_AMOUNT_URL` and `CUSTOM_AMOUNT_MAX` together.
