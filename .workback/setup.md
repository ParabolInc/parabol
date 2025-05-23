### Prerequisites

Install dependencies:

- [Node](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Watchman](https://facebook.github.io/watchman/docs/install.html) (Development
  only)

```
brew install watchman
```

### Start

```
nvm use 22.14
cp .env.example .env
pnpm i
# Start docker manually - docker daemon should be running
pnpm db:start
pnpm relay:build
pnpm dev
```

Visit: http://localhost:3000

### Stop

```
pnpm db:stop
# Delete node_modules just in case to force a fresh install
rm -rf node_modules/
```

### Auth

Register for an account to bypass "sign in".

We gave ourselves super user permissions to play around
in `http://localhost:3000/admin/graphql` with this script:

```shell
pnpm node ./scripts/toolbox/assignSURole.js --add you@example.com
```

You can run GraphQL mutations in `localhost:3000/admin/graphql`:

```graphql
mutation upgradetoEnterprise {
  draftEnterpriseInvoice(
    orgId: "XXXXX",
    quantity: <number>,
    email: "exampeuser@email.com",
    apEmail: "invoice@email.com",
    plan: "stripe_api_price_id") {
    organization {
      tier
    }
    error {
      message
    }
  }
}
```
