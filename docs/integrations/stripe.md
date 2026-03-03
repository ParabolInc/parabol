# Stripe Integration Setup

Parabol uses [Stripe](https://stripe.com) to handle billing for Team and Enterprise tier subscriptions. This document covers how to configure the integration.

Stripe integration is **optional**. A Parabol instance runs normally without it — the only effect of not configuring Stripe is that payments are disabled. All other functionality remains available.

## Prerequisites

- A [Stripe account](https://dashboard.stripe.com/register)
- Access to the Stripe Dashboard to create products, prices, and configure webhooks

---

## 1. Create Products and Prices

In the [Stripe Dashboard → Products](https://dashboard.stripe.com/products), create two products with recurring prices — one for the Team tier and one for the Enterprise tier. Once created, copy each price ID and set the following variables in your `.env`:

| Variable                         | Description            |
|----------------------------------|------------------------|
| `STRIPE_TEAM_PRICE_APP_ID`       | Price ID for the Team tier ($X / seat / month) |
| `STRIPE_ENTERPRISE_PRICE_APP_ID` | Price ID for the Enterprise tier (annual) |

Both variables are required for payments to work. If either is missing, subscription creation will fail.

The Stripe API version used by the server is `2020-08-27`. See [Stripe API versioning](https://stripe.com/docs/api/versioning) for information on compatibility.

---

## 2. Create API Keys

In the [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys), create or copy the following keys and add them to your `.env` file:

```env
STRIPE_SECRET_KEY=''          # Secret key (sk_live_... or sk_test_...)
STRIPE_PUBLISHABLE_KEY=''     # Publishable key (pk_live_... or pk_test_...)
STRIPE_WEBHOOK_SECRET=''      # Webhook signing secret (whsec_...) — see Section 3
```

Use `sk_test_` / `pk_test_` keys for development and `sk_live_` / `pk_live_` for production. See [Stripe API keys docs](https://stripe.com/docs/keys) for details.

---

## 3. Configure the Webhook Endpoint

The server exposes a webhook handler at:

```
POST /stripe
```

Stripe must be configured to deliver events to this endpoint. In the [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks), add an endpoint pointing to:

```
https://<your-domain>/stripe
```

### Required events

Select the following events when creating the endpoint:

| Stripe Event                     | Handler mutation               | Effect                                                  |
|----------------------------------|--------------------------------|---------------------------------------------------------|
| `invoice.created`                | `stripeCreateInvoice`          | Records the invoice in the database                     |
| `invoice.payment_failed`         | `stripeFailPayment`            | Terminates subscriptions with failed/incomplete payment and notifies billing leaders |
| `invoice.payment_succeeded`      | `upgradeToTeamTier`            | Upgrades the organization to the Team tier              |
| `invoice.paid`                   | `stripeInvoicePaid`            | Marks the invoice as paid                               |
| `customer.source.updated`        | `stripeUpdateCreditCard`       | Syncs updated card details to the database              |
| `customer.subscription.created`  | `stripeCreateSubscription`     | Persists the subscription ID on the organization        |
| `customer.subscription.deleted`  | `stripeDeleteSubscription`     | Removes the subscription from the organization          |

After saving the endpoint, copy the **Signing Secret** (starts with `whsec_`) and set it in your `.env`:

```env
STRIPE_WEBHOOK_SECRET='whsec_...'
```

The server verifies every inbound webhook using this secret via [`stripe.webhooks.constructEvent`](https://stripe.com/docs/webhooks/signatures). Requests with an invalid or missing signature are rejected with `401`.

---

## 4. Client-Side (Publishable Key)

`STRIPE_PUBLISHABLE_KEY` is injected into the client bundle at build/deploy time by [`scripts/toolboxSrc/applyEnvVarsToClientAssets.ts`](../scripts/toolboxSrc/applyEnvVarsToClientAssets.ts). It is exposed on the global `window.__ACTION__.stripe` object and used by [Stripe.js / Stripe Elements](https://stripe.com/docs/js) to securely collect payment method details in the browser.

---

## Useful Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [API Keys](https://stripe.com/docs/keys)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Webhook signatures](https://stripe.com/docs/webhooks/signatures)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Stripe.js & Elements](https://stripe.com/docs/js)
- [Strong Customer Authentication (SCA / 3DS)](https://stripe.com/docs/strong-customer-authentication)
- [Testing with test mode](https://stripe.com/docs/testing)
- [API versioning](https://stripe.com/docs/api/versioning)
