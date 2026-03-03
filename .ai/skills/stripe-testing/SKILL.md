## Testing Stripe

- `brew install stripe/stripe-cli/stripe` and then `stripe login` to get the port forwarder up and running
- Use `stripe listen --forward-to https://localhost:3000/stripe --skip-verify` to forward Stripe events to your local server.
