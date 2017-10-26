# Action

[![Slack Status](http://slackin.parabol.co/badge.svg)](http://slackin.parabol.co/)
[![CircleCI](https://circleci.com/gh/ParabolInc/action.svg?style=svg)](https://circleci.com/gh/ParabolInc/action)
[![codecov](https://codecov.io/gh/ParabolInc/action/branch/master/graph/badge.svg)](https://codecov.io/gh/ParabolInc/action)

## New Beta!

[Sign up for Parabol Beta](http://www.parabol.co/beta) & be first in line to try it out!

## Overview

An open-source SaaS application for operating Agile business teams.

![Action Screencap Image](./docs/images/20161121_Action_Snapshot.gif)
by [Parabol, Inc](http://parabol.co)

Curious what this is all about? Each week we publish a distillation of our
progress, philosophy, and more in
[Parabol Focus](https://focus.parabol.co/).

Live beta product: http://action.parabol.co/

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

| Concern            | Solution                                                  |
|--------------------|-----------------------------------------------------------|
| Server             | [Node 8.5](https://nodejs.org/)                           |
| Server Framework   | [Express](http://expressjs.com/)                          |
| Database           | [RethinkDB](https://www.rethinkdb.com/)                   |
| Data Transport     | [GraphQL](https://github.com/graphql/graphql-js)          |
| Sockets            | [socketcluster](http://socketcluster.io/)                 |
| Client State       | [Redux](http://redux.js.org/)                             |
| Client Data Cache  | [Cashay](https://github.com/mattkrick/cashay)             |
| Front-end Views    | [React](https://facebook.github.io/react/)                |
| Styling            | [aphrodite](https://github.com/khan/aphrodite)            |
| Unit Testing       | [jest](https://facebook.github.io/jest)                   |

Action is programmed in ECMAscript ES6/7 (including async/await).
Transpilation is provided by [babel](https://github.com/babel/babel).

## Setup

### Installation

#### Prerequisites

Action requires Node.js >=8.5.0 (we're using 8.5.0 in development).
We recommend using [n](https://github.com/tj/n) to install and manage your
node versions.

Action also depends on [RethinkDB](https://rethinkdb.com/). Make sure
you have it installed. If you have OSX, we recommend homebrew so
upgrades are as easy as `brew update && brew upgrade rethinkdb`

Action also uses [yarn](https://yarnpkg.com/) which can be installed by running `npm install -g yarn`

Additional dependencies include [redis](https://redis.io/), and
[watchman](https://facebook.github.io/watchman/docs/install.html) (optional for relay).

#### Source code

```bash
$ git clone https://github.com/ParabolInc/action.git
$ cd action
$ cp .env.example .env # be sure to verify the API keys have useful values
$ rethinkdb # in a separate window
$ yarn
$ npm run quickstart
```
_Remember: if RethinkDB is running locally, you can reach its dashboard at
[http://localhost:8080](http://localhost:8080) by default._

The majority of Action's Javascript files are written using the emerging
ECMAScript ES6 and ES7 standards. If you open a source file and see
syntax errors, you may have to configure your editor differently.
Our team's editors ([Atom](https://atom.io/) and
[Webstorm](https://www.jetbrains.com/webstorm/)) have plugins which parse
our project's Javascript transpilation options directly from
[.babelrc](./.babelrc). If your editor has this option, it's the best way
to go.

### Client-side development

In this mode, webpack will hot swap your updated client modules without
needing to restarting the development server.

```bash
$ npm run build
$ npm run dev
```
[http://localhost:3000/](http://localhost:3000/)

### Server-side development

In this mode, the server will build client bundle and start a production
server with the fresh code.

```bash
$ npm run bs
```
[http://localhost:3000/](http://localhost:3000/)

### Database development

The database schema version is managed by
[migrate-rethinkdb](https://github.com/ParabolInc/migrate-rethinkdb).
Migration scripts are stored in `./src/server/database/migrations`.

If you make changes to the Action schema, make certain to create a new
migration.

### Test development

```bash
$ npm run db:migrate-testing # Only needs to be run once
$ npm run test # Runs all tests
```

### Getting Started on Windows
Currently, many of the config files are written for a Unix based shell like bash. If you plan on contributing (awesome!),
but are working on a Windows machine, you can follow these steps to get started. Note this is just __one__ way of setting
up the environment for Windows, but it is the least likely to give you trouble down the road.

1. Follow the instructions to install [bash for windows](https://msdn.microsoft.com/en-us/commandline/wsl/about)
2. Open cmd and type `bash`
3. Install node >= 8.5.0 __inside__ of your bash instance
4. Install the dependencies for [watchman](https://facebook.github.io/watchman/docs/install.html)
5. Install watchman from source
6. Start an instance of rethinkDB
7. Start an instance of redis
8. Navigate to the directory of your choice
9. ```bash
   $ git clone https://github.com/ParabolInc/action.git
   $ cd action
   $ yarn
   $ npm run quickstart
   ```

If you run into problems, run each of these commands separately and watch for errors.
 ```
 npm run db:migrate
 npm run build:dll
 npm run build:relay
 npm run dev
 ```

## Bringing your database up to date

```bash
$ npm run db:migrate
```

## Migrating backward and forward

The following commands are available to migrate your database instance
forward and backward in time:

   * `npm run db:migrate-up` - migrate up one schema version
   * `npm run db:migrate-up-all` - migrate upward to latest schema
   * `npm run db:migrate-down` - migrate down one schema version
   * `npm run db:migrate-down-all` - migrate downward completely (will erase everything)

## Exploring the data API:

While running the app in development mode, navigate to
http://localhost:3000/graphql for testing out new queries/mutations

## Exploring component design:

We've begun assembling a pattern library of all of the components we've created
for the app. Too see them, navigate to http://localhost:3000/patterns

## Getting Involved

Action is software built with the community for the community. We can't do
it without your help!

You're contribution won't go unrewarded: Parabol offers equity in our
young company for qualified contributions to Action.

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

Copyright 2016 Parabol, Inc.

Action is dual-licensed under the GNU AFFERO GENERAL PUBLIC LICENSE,
Version 3.0 while holding, at its sole discretion, the right to create
new licenses. For details please read [LICENSE](LICENSE).

See [CHANGELOG.md](./CHANGELOG.md)
