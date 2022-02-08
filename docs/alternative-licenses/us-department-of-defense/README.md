# Parabol Hardened Container for Platform One Iron Bank

[![Slack Status](https://slackin.parabol.co/badge.svg)](https://slackin.parabol.co/)
[![CircleCI](https://circleci.com/gh/ParabolInc/parabol.svg?style=svg)](https://circleci.com/gh/ParabolInc/parabol)
[![StackShare](https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/parabol-inc/parabol-multiplayer-web-app)

## Overview

[Parabol](https://www.parabol.co) is an open-source application for running
agile meetings such as team retrospectives or Sprint Poker™. You may try
a single-player demo of Parabol (no logincreation required) at: https://parabol.co/retro-demo

**⚠️ If you've found this README.MD in the root of the Parabol source listing,
this is the hardened container version of Parabol on Platform One's Repo1 Iron Bank for
the U.S. Department of Defense.**

### Usage License and DoD-specific Information

You may install and evaluate this container for non-production use free of
charge. For production deployments supporting more than two teams, you will
require a license. Parabol is sensitive to mission success and can support
uncertain/difficult procurement cycles with extended gratis trial agreements.

[Big Bang](https://github.com/DoD-Platform-One/big-bang) configurations are also
available, making a secure deployment of Parabol within the DoD easy.

For all matters, please contact: support@parabol.co

## Stack Information

| Concern                | Solution                                                       |
| ---------------------- | -------------------------------------------------------------- |
| Server                 | [Node](https://nodejs.org/)                                    |
| Server Framework       | [uWebSockts.js](https://github.com/uNetworking/uWebSockets.js) |
| Database (Legacy)      | [RethinkDB](https://www.rethinkdb.com/)                        |
| Database               | [PostgreSQL](https://www.postgresql.org/)                      |
| PubSub & Cache         | [Redis](https://redis.io)                                      |
| Data Transport         | [GraphQL](https://github.com/graphql/graphql-js)               |
| Real-time Connectivity | [trebuchet](https://github.com/mattkrick/trebuchet-client)     |
| Client Cache           | [Relay](https://facebook.github.io/relay/)                     |
| UI Framework           | [React](https://facebook.github.io/react/)                     |
| Styling                | [Emotion](https://emotion.sh/)                                 |

## Setup

### Prerequisites

- [Node](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/cli/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Watchman](https://facebook.github.io/watchman/docs/install.html) (Development only)

### Installation

```bash
$ git clone https://github.com/ParabolInc/parabol.git
$ cd parabol
$ cp .env.example .env # Add your own vars here
$ yarn
$ yarn db:start
$ yarn dev
```

By default, the app will run at: http://localhost:3000/

If `yarn db:start` failed and `localhost:5050` isn't working, a docker
container, volume or image may be corrupted and need to be pruned.

Build for production and start application:

```bash
$ yarn && yarn build && yarn start
```

### RethinkDB

- Migrations are stored in `packages/server/database/migrations`
- RethinkDB Dashboard is at [http://localhost:8080](http://localhost:8080)

### PostgreSQL

- pgadmin is at [http://localhost:5050](http://localhost:5050)
- Connect using the values of `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` from your `.env`
- Click "Add New Server" and fill out the forms with your `.env` values

  - General.name = POSTGRES_DB
  - Connection.host = 'postgres' (hardcoded from docker-compose dev.yml, not from .env!)
  - Connection.username = POSTGRES_USER
  - Connection.password = POSTGRES_PASSWORD
  - Connection.maintenanceDatabase = POSTGRES_DB
  - Connection.port = POSTGRES_PORT

- Fill out the form with values from your `.env`. Set the host to `postgres`

## Have feedback, ideas or feature requests?

Please review our [Discussions](https://github.com/ParabolInc/parabol/discussions) to see if there's already a similar suggestion, and if not please feel free to [start a new one](https://github.com/ParabolInc/parabol/discussions/new).

## Helpful VSCode extensions

We use [GraphQL](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) for IntelliSense and syntax highlighting.

## Parabol Core Team

- [jordanh](https://github.com/jordanh)
- [ackernaut](https://github.com/ackernaut)
- [mattkrick](https://github.com/mattkrick)

## License

Copyright (c) 2016-present, Parabol, Inc.

This codebase is dual-licensed under the GNU AFFERO GENERAL PUBLIC LICENSE,
Version 3.0 while holding, at Parabol's sole discretion, the right to create
new licenses. For details please read [LICENSE](LICENSE).
