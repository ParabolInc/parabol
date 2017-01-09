# Action

[![Slack Status](http://slackin.parabol.co/badge.svg)](http://slackin.parabol.co/)
[![CircleCI](https://circleci.com/gh/ParabolInc/action.svg?style=svg)](https://circleci.com/gh/ParabolInc/action)

## New Beta!

[Sign up for Action Beta](http://www.parabol.co/beta) & be first in line to try it out!

## Overview

An open-source SaaS application for operating Agile business teams.

![Action Screencap Image](./docs/images/20161121_Action_Snapshot.gif)
by [Parabol, Inc](http://parabol.co)

Curious what this is all about? Each week we publish a distillation of our
progress, philosophy, and more in
[Parabol Focus](https://medium.com/parabol-focus).

Live demo: http://action-staging.parabol.co/

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
| Server             | [Node 6](https://nodejs.org/)                             |
| Server Framework   | [Express](http://expressjs.com/)                          |
| Database           | [RethinkDB](https://www.rethinkdb.com/)                   |
| Data Transport     | [GraphQL](https://github.com/graphql/graphql-js)          |
| Sockets            | [socketcluster](http://socketcluster.io/)                 |
| Client State       | [Redux](http://redux.js.org/)                             |
| Client Data Cache  | [Cashay](https://github.com/mattkrick/cashay)             |
| Front-end Views    | [React](https://facebook.github.io/react/)                |
| Styling            | [aphrodite](https://github.com/khan/aphrodite) |

Action is programmed in ECMAscript ES6/7 (including async/await).
Transpilation is provided by [babel](https://github.com/babel/babel).

## Setup

### Installation

#### Prerequisites

Action requires Node.js >=5.10.1 (we're using 6.2.0 in development).
We recommend using [n](https://github.com/tj/n) to install and manage your
node versions.

Action also depends on [RethinkDB](https://rethinkdb.com/). Make sure
you have it installed. If you have OSX, we recommend homebrew so
upgrades are as easy as `brew update && brew upgrade rethinkdb`

#### Source code

```bash
$ git clone https://github.com/ParabolInc/action.git
$ cd action
$ rethinkdb # in a separate window
$ npm install
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
[rethink-migrate](https://github.com/JohanObrink/rethink-migrate). Migrations
scripts are stored in `./src/server/database/migrations`.

If you make changes to the Action schema, make certain to create a new
migration.

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

| Release | Summary                                    |
|---------|--------------------------------------------|
| v0.14.0 | Secure user avatar upload to S3 bucket     |
| v0.13.6 | Adds admin user impersonation, fixes       |
| v0.13.5 | Fixes: #556, #557, and #559                |
| v0.13.4 | Fix email validation                       |
| v0.13.3 | Validations, S3 enhancements, fixes        |
| v0.13.2 | Add 'player joined' message. Fixed #543    |
| v0.13.1 | Filter by member on team dashboard, fixes  |
| v0.13.0 | Drag-and-drop added everywhere, bug fixes  |
| v0.12.1 | Fix for #518; redirect removed user        |
| v0.12.0 | Added team settings, modal components      |
| v0.11.0 | Added S3 deployment, minor UI improvements |
| v0.10.0 | Can add new teams, many fixes              |
| v0.9.6  | Auto-elect new facilitator, fixes          |
| v0.9.5  | Fixes #433, #440, #445                     |
| v0.9.4  | Fixes #428, #429, #430, and #431           |
| v0.9.3  | Emails meeting summary, add Segment events |
| v0.8.1  | Added sentry.io. Many bug fixes            |
| v0.8.0  | Added end of meeting summary               |
| v0.7.5  | Added temporary end meeting logic, fixes   |
| v0.7.4  | Auth0 production options, numerous fixes   |
| v0.7.1  | Fixes #322, #323, #334, #335, #336         |
| v0.7.0  | Switch to aphrodite, me dashboard updates  |
| v0.6.3  | Agenda processing order fix for issue #294 |
| v0.6.2  | Processing of meeting agenda to projects   |
| v0.6.1  | Agenda items, @live directive, bug fixes   |
| v0.5.3  | Add Project Updates, rallies, segment.io   |
| v0.4.1  | Added Me Dash., multiplayer editing states |
| v0.4.0  | Add Lobby, Check-in, start of Team Dash.   |
| v0.3.0  | Add Welcome journey, redux-storage         |
| v0.2.0  | Add first pass at team creation/invitation |
| v0.1.0  | Things got a whole lot meatier             |
| v0.0.1  | Developer preview and architecture demo    |

See [CHANGELOG.md](./CHANGELOG.md) for greater detail on changes between
releases.

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
