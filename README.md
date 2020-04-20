# Parabol - We're [hiring](https://www.parabol.co/join)!

[![Slack Status](http://slackin.parabol.co/badge.svg)](http://slackin.parabol.co/)
[![CircleCI](https://circleci.com/gh/ParabolInc/parabol.svg?style=svg)](https://circleci.com/gh/ParabolInc/parabol)
[![StackShare](https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/parabol-inc/parabol-multiplayer-web-app)

## Overview


[Parabol](https://www.parabol.co) is an open-source SaaS application for running team retrospectives and operating a
distributed organization. We publish our company's [history and business metrics](https://focus.parabol.co/), too.


![Dashboard](./docs/images/d2.gif)
![Discuss](./docs/images/d1.gif)

## Stack Information

| Concern                | Solution                                                       |
| ---------------------- | -------------------------------------------------------------- |
| Server                 | [Node](https://nodejs.org/)                                    |
| Server Framework       | [uWebSockts.js](https://github.com/uNetworking/uWebSockets.js) |
| Database               | [RethinkDB](https://www.rethinkdb.com/)                        |
| PubSub                 | [Redis](https://redis.io)                                      |
| Data Transport         | [GraphQL](https://github.com/graphql/graphql-js)               |
| Real-time Connectivity | [trebuchet](https://github.com/mattkrick/trebuchet-client)     |
| Client Cache           | [Relay](https://facebook.github.io/relay/)                     |
| UI Framework           | [React](https://facebook.github.io/react/)                     |
| Styling                | [Emotion](https://emotion.sh/)                                 |
| Unit Testing           | [jest](https://facebook.github.io/jest)                        |
| Integration Testing    | [Cypress](https://cypress.io)                                  |

## Setup

### Prerequisites

 - Node
 - Redis
 - RethinkDB
 - Watchman (for Relay)
 - Yarn

### Installation

```bash
$ git clone https://github.com/ParabolInc/parabol.git
$ cd parabol
$ cp packages/server/.env.example packages/server/.env # Add your own vars here
$ rethinkdb & redis-server & # Or if you prefer docker: $ docker-compose up -d db
$ yarn && yarn db:migrate && yarn build:relay && yarn dev
```


### Run in docker
```bash
$ docker-compose up -d #bring up db and redis and parabol(this may need x minutes because build,..)
$ docker logs -f parabol # follow the deployment
```
Parbol website: http://localhost:3000

### Developing inside a Containers with VSCode Remote Development
- On linux in ./devcontainer/docker-compose.yml replace UID by yours at nodeUID: xxxx, eventualy GID too (nodeGID)
- when starting VSCode run:
![VSCodeRemote](./docs/images/vscodeRemoteDev0.png)
or (Reopen in Container)
![VSCodeRemote](./docs/images/vscodeRemoteDev.png)
Every modifications localy will be sync in your dev containers (two way)

- more details [VSCode Remote Development](https://code.visualstudio.com/docs/remote/containers)
                   

### Database

- Migrations are stored in `packages/server/database/migrations`
- RethinkDB Dashboard is at [http://localhost:8080](http://localhost:8080)

## Getting Involved

Parabol offers equity for qualified contributions.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information on how to
get involved and how to get compensated.

## Releases

For details on all releases, refer to [CHANGELOG.md](./CHANGELOG.md).

## Parabol Core Team

* [jordanh](https://github.com/jordanh)
* [ackernaut](https://github.com/ackernaut)
* [mattkrick](https://github.com/mattkrick)

## License

Copyright (c) 2016-present, Parabol, Inc.

This codebase is dual-licensed under the GNU AFFERO GENERAL PUBLIC LICENSE,
Version 3.0 while holding, at Parabol's sole discretion, the right to create
new licenses. For details please read [LICENSE](LICENSE).
