# Action

## Overview

An open-source tool for meaningful meetings

### Quick links

* [Contributions](#contributions)
  * [Pull Requests](#pull-requests)
  * [Issues](#issues)
* [Set-up](#set-up)
  * [Installation](#installation)
  * [Local Environment](#local-environment)
* [Development](#development)
  * [Stack Information](#stack-information)
  * [Code Standards](#code-standards)
    * [Tests](#tests)
    * [Lints](#lints)
* [Design](#design)
  * [Assets](#assets)
  * [Patterns](#patterns)
* [Releases](#releases)
  * [Semantic Versioning](#semantic-versioning)
  * [Change Log](#change-log)
* [About](#about)
  * [Parabol Core Team](#parabol-core-team)
  * [License](#license)

## Contributions

### Pull Requests

### Issues

* Features
* Bugs
* House cleaning

## Set-up

1) Install prerequisites:

```bash
$ sudo npm -g install sails
$ npm install
```

2) Run server

```bash
$ sails lift
```

3) Visit http://localhost:1337/

### Installation

### Local environment

## Development

### Stack Information

Action is built on [Sails.js](http://sailsjs.org), which provides an MVC
framework similar to Ruby on Rails but written in Javascript and built on
top of Express and Node.js.

Backend services (e.g. the router, CRUD API, controllers, and policies) are
standard Sails.

The front-end is written using [React.js](https://facebook.github.io/react/).
It is styled using (SASS)[http://sass-lang.com/] and
[PostCSS](https://github.com/postcss/postcss). Front-end assets are assembled
using [webpack](https://webpack.github.io/) and are done so automatically
when the application is started with the `sails lift` command or via
running `app.js`. Note that Sails by default, as it is configured here, will
assemble all static assets into `.tmp/public`.

Action intentionally prioritizes *iteration* over *optimization*. The codebase
has not yet been configured for production. This includes items such as
configuring webpack for production (extracting CSS, disabling source maps,
chunking, using hashes for CDN deployment).


### Code Standards

#### Tests

_Use [Jest](https://facebook.github.io/jest/)?_

#### Lints

_npm or gulp, jshint, scss_lint, postcss, etc._

## Design

### Assets

_Include a guide for making design contributions with version-controlled binaries (Sketch, etc.), or link to some community based SaaS such as [Pixelapse](https://www.pixelapse.com/)_

### Patterns

_Include a pattern library with Action docs, or link to a shared Parabol pattern library_

## Releases

### Semantic Versioning

[Semantic Versioning 2.0.0](http://semver.org/)

### Change Log

[Keep a CHANGELOG](http://keepachangelog.com/)

## About

### Parabol Core Team

* [jordanh](https://github.com/jordanh)
* [jrwells](https://github.com/jrwells)
* [ackernaut](https://github.com/ackernaut)

### License

_Choose a license such as MIT, etc._
