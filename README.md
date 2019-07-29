# Action

[![Slack Status](http://slackin.parabol.co/badge.svg)](http://slackin.parabol.co/)
[![CircleCI](https://circleci.com/gh/ParabolInc/action.svg?style=svg)](https://circleci.com/gh/ParabolInc/action)
[![codecov](https://codecov.io/gh/ParabolInc/action/branch/master/graph/badge.svg)](https://codecov.io/gh/ParabolInc/action)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![StackShare](https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/parabol-inc/action)

## Overview

[Parabol](https://www.parabol.co) is a free open-source SaaS application for
running team retrospectives and operating a distributed organization.

**We're [hiring](https://www.parabol.co/join)!**

![Action Screencap Image](./docs/images/20180718_Action_Snapshot.gif)

Curious to learn where this all came from? Each week we publish a distillation
of our progress, philosophy, and more in
[Parabol Focus](https://focus.parabol.co/).

### Quick Links

* [Stack Information](#stack-information)
* [Setup](#setup)
* [Getting Involved](#getting-involved)
* [Releases](#releases)
* [About](#about)
* [License](#license)

## Stack Information

Action is a Node.js application based upon the
[Meatier](https://github.com/mattkrick/meatier) stack:

| Concern            | Solution                                                |
|--------------------|---------------------------------------------------------|
| Server             | [Node](https://nodejs.org/)                         |
| Server Framework   | [Express](http://expressjs.com/)                        |
| Database           | [RethinkDB](https://www.rethinkdb.com/)                 |
| PubSub | [Redis](https://redis.io) |
| Data Transport     | [GraphQL](https://github.com/graphql/graphql-js)        |
| BidirectionalTransport (WebSocket, SSE, WebRTC, ec) | [trebuchet](https://github.com/mattkrick/trebuchet-client)               |
| Client Cache  | [Relay](https://facebook.github.io/relay/)              |
| UI Framework    | [React](https://facebook.github.io/react/)              |
| Styling            | [Emotion](https://emotion.sh/)          |
| Unit Testing       | [jest](https://facebook.github.io/jest)                 |
| Integration Testing | [Cypress](https://cypress.io) |

## Setup

### Installation

#### Prerequisites

 - Node v11+
 - RethinkDB
 - Redis
 - yarn
 - watchman (for Relay)
 
#### Source code

```bash
$ git clone https://github.com/ParabolInc/action.git
$ cd action
$ cp packages/server/.env.example packages/server/.env # Add your own vars here
$ rethinkdb &
$ yarn
$ yarn quickstart
```
_Remember: if RethinkDB is running locally, you can reach its dashboard at
[http://localhost:8080](http://localhost:8080) by default._

### Development 
```bash
$ yarn dev
```

### Database Migration

```bash
$ npm run db:migrate
```

The database schema version is managed by
[migrate-rethinkdb](https://github.com/ParabolInc/migrate-rethinkdb).
Migration scripts are stored in `./packages/server/database/migrations`.

## Getting Involved

Parabol offers equity for qualified contributions.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information on how to
get involved and how to get compensated.

## Releases

For details on all releases, refer to [CHANGELOG.md](./CHANGELOG.md).

## About

Authored and maintained by [Parabol](http://parabol.co).

### Parabol Core Team

* [jordanh](https://github.com/jordanh)
* [ackernaut](https://github.com/ackernaut)
* [mattkrick](https://github.com/mattkrick)

### License

Copyright (c) 2016-present, Facebook, Inc.
 
This codebase is dual-licensed under the GNU AFFERO GENERAL PUBLIC LICENSE,
Version 3.0 while holding, at Parabol's sole discretion, the right to create
new licenses. For details please read [LICENSE](LICENSE).

