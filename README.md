# Parabol - We're [hiring](https://www.parabol.co/join)!

## Overview

[Parabol](https://www.parabol.co) is an open-source application for running
agile meetings such as team retrospectives or Sprint Poker™. You may try
a single-player demo of Parabol (no login creation required) at: https://parabol.co/retro-demo

We endeavor to be a
transparent organization and publish
our company's [history and SaaS metrics](https://www.parabol.co/blog/tag/friday-ship).

![Dashboard](./docs/images/d2.gif)
![Discuss](./docs/images/d1.gif)

## Stack Information

| Concern                | Solution                                                        |
| ---------------------- | --------------------------------------------------------------- |
| Server                 | [Node](https://nodejs.org/)                                     |
| Server Framework       | [μWebSockets.js](https://github.com/uNetworking/uWebSockets.js) |
| Database               | [PostgreSQL](https://www.postgresql.org/)                       |
| PubSub & Cache         | [Redis](https://redis.io)                                       |
| Data Transport         | [GraphQL](https://github.com/graphql/graphql-js)                |
| Real-time Connectivity | [graphql-ws](https://github.com/enisdenjo/graphql-ws)           |
| Client Cache           | [Relay](https://facebook.github.io/relay/)                      |
| UI Framework           | [React](https://facebook.github.io/react/)                      |
| Styling (Legacy)       | [Emotion](https://emotion.sh/)                                  |
| Styling                | [Tailwind CSS](https://tailwindcss.com/)                        |

## Setup

### Prerequisites

- [Node](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Watchman](https://facebook.github.io/watchman/docs/install.html) (Development only)

### Installation

```bash
$ git clone https://github.com/ParabolInc/parabol.git
$ cd parabol
$ cp .env.example .env # Add your own vars here
$ pnpm i
$ pnpm db:start
$ pnpm dev
```

- By default, the app will run at: http://localhost:3000/

- If `pnpm db:start` failed and `localhost:5050` isn't working, a docker
  container, volume, or image may be corrupted and need to be pruned.

### Development

- [Code Reviews](./docs/codeReview.md)
- [Create new GraphQL Mutations](./packages/server/graphql/public/README.md)
- [Docker](./docker/README.md)
- [Dev.js](./scripts/README.md)
- [File Storage (CDN, Local, S3)](./packages/server/fileStorage/README.md)
- [GraphiQL, Private Schema Admin](./packages/server/graphql/private/README.md)
- [Integrations (GitHub, Jira, Slack, etc.)](./docs/integrations.md)
- [PostgreSQL](./packages/server/postgres/README.md)
- [Shared Scripts](./packages/client/shared/README.md)
- [VS Code Tips](.vscode/tips.md
- [Tailwind CSS migration guide](./packages/client/README.md)

### Deploy

```bash
# There's a pesky bug in pnpm if you don't have an SSH key: https://github.com/pnpm/pnpm/issues/7243
$ git config --global url."https://github.com/enahum/redux-offline.git".insteadOf git@github.com:enahum/redux-offline.git
$ pnpm i && pnpm pg:build && pnpm build && pnpm predeploy && pnpm start
```

- [How to Ship](./docs/deployment.md)

## Getting Involved

Parabol offers equity for qualified contributions.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information on how to
get involved and how to get compensated.

## Have feedback, ideas or feature requests?

Please review our [Discussions](https://github.com/ParabolInc/parabol/discussions) to see if there's already a similar suggestion, and if not please feel free to [start a new one](https://github.com/ParabolInc/parabol/discussions/new).

## Releases

For details on all releases, refer to [CHANGELOG.md](./CHANGELOG.md).

## Parabol Core Team

- [Jordan Husney](https://github.com/jordanh)
- [Terry Acker](https://github.com/ackernaut)
- [Matt Krick](https://github.com/mattkrick)

## Parabol Maintainers

- [Matt Krick](https://github.com/mattkrick)
- [Georg Bremer](https://github.com/Dschoordsch)

## License

Copyright (c) 2016-present, Parabol, Inc.

This codebase is dual-licensed under the GNU AFFERO GENERAL PUBLIC LICENSE,
Version 3.0 while holding, at Parabol's sole discretion, the right to create
new licenses. For details please read [LICENSE](LICENSE).
