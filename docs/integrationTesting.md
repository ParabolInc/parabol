## Integration testing

> Caveats: The integration tests will run against your server, so it will create/delete some temporary data in your Parabol databases.

### How to run locally

- make sure the server is running with such env variable values:
  - [`CI=true`](https://github.com/ParabolInc/parabol/blob/master/.env.example#L13)
  - [MAIL_PROVIDER='debug'](https://github.com/ParabolInc/parabol/blob/master/.env.example#L33)
  - [STRIPE\_\*](https://github.com/ParabolInc/parabol/blob/master/.env.example#L69) with test API keys https://stripe.com/docs/keys
- run test with `yarn test:server`
