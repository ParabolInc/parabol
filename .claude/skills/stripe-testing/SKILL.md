---
name: stripe-testing
description: Steps to set up the Stripe CLI and forward webhook events to a local dev server for testing Stripe integrations.
---

## Testing Stripe

- `brew install stripe/stripe-cli/stripe` and then `stripe login` to get the port forwarder up and running
- Use `stripe listen --forward-to https://localhost:3000/stripe --skip-verify` to forward Stripe events to your local server.
