# Action

[![Slack Status](http://slackin.parabol.co/badge.svg)](http://slackin.parabol.co/)
[![Circle CI](https://img.shields.io/circleci/project/parabol/action/master.svg)](https://circleci.com/gh/ParabolInc/action)

## Overview

An open-source tool for meaningful meetings to build smarter, more
agile teams.

![Action Screencap Image](./docs/images/20160207_Action_Snapshot.gif)

From [Parabol, Inc](http://parabol.co).

Live demo: http://action-staging.parabol.co/

### Quick Links

* [Stack Information](#stack-information)
* [Setup](#setup)
  * [Installation](#installation)
    * [Prerequisites](#prerequisites)
    * [Source Code](#source-code)
  * [Running in Development](#running-in-development)
  * [Production](#running-in-development)
* [Getting Involved](#getting-involved)
* [Releases](#releases)
* [About](#about)
  * [Parabol Core Team](#parabol-core-team)
* [License](#license)

## Stack Information

Action is a Node.js application based upon the meatier stack:

| Concern            | Solution                                     |
|--------------------|----------------------------------------------|
| Server             | [Node 5](https://nodejs.org/)                |
| Server Framework   | [Express](http://expressjs.com/)             |
| Database           | [RethinkDB](https://www.rethinkdb.com/)      |
| Data Transport     | [GraphQL](https://github.com/graphql/graphql-js) |
| Sockets            | [socketcluster](http://socketcluster.io/)    |
| Client State       | [Redux](http://redux.js.org/)                |
| Front-end          | [React](https://facebook.github.io/react/)   |


## Setup

### Installation

#### Prerequisites

Action requires Node.js and >4.1.1 (we're using 5.10.0 in development).
[Go here](https://nodejs.org/) to install a version for your system.
If you already have node, we recommend [n](https://github.com/tj/n) to manage your node versions.

Action also depends on [RethinkDB](https://rethinkdb.com/). Make sure you have it installed.
If you have OSX, we recommend homebrew so upgrades are as easy as `brew update && brew upgrade rethinkdb`

#### Source code

```bash
$ git clone https://github.com/ParabolInc/action.git
$ cd action
$ npm install
$ npm run quickstart
$ rethinkdb
_Remember: if RethinkDB is running locally, you can reach its dashboard at
[http://localhost:8080](http://localhost:8080) by default._
```

### Client-side development

In this mode, webpack will hot swap your updated client modules without restarting the server.
```bash
$ npm run dev
```
[http://localhost:3000/](http://localhost:3000/)

### Server-side development

In this mode, the server will use your pre-built client bundle & only restart the server with fresh code. 
```bash
$ npm run prod
```
[http://localhost:3000/](http://localhost:3000/)

### Database development
- All tables are managed in `./src/server/setupDB.js`. Just add your tables & indices to that file and rerun
- http://localhost:3000/graphql for testing out new queries/mutations

## Getting Involved

Action is software built with the community for the community. We can't do
it without your help!

Our [Action waffle.io Board](https://waffle.io/ParabolInc/action) organizes
available design and development missions. Check it out, grab a mission
(or contribute your own) and we'll gladly (and thankfully!) merge your pull
request.

You're contribution won't go unrewarded: Parabol offers equity in our
young company for qualified contributions to Action.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information on how to
get involved and how to get compensated.

## Releases

| Version            | Summary                                      |
|--------------------|----------------------------------------------|
| 0.1.0              | Things got a whole lot meatier               |
| 0.0.1              | Developer preview and architecture demo      |

## About

Authored and maintained by [Parabol](http://parabol.co).

### Parabol Core Team

* [jordanh](https://github.com/jordanh)
* [jrwells](https://github.com/jrwells)
* [ackernaut](https://github.com/ackernaut)

### License

Copyright 2016 Parabol, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
