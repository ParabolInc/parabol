# Scripts

To begin development, simply run `node scripts/dev.js`.
If the toolbox does not exist yet, it will built it for you.
If you'd like to rebuild the toolbox, you can run with the `-i` (init) flag
If you'd like a faster startup & the client/server are the only pieces that have changed, you can run with `-d` (dangerous)

To run in production,

- build the assets with `node scripts/prod.js`
- If you'd like to uglify & upload assets to the CDN, use `--deploy`
- Run `node dist/preDeploy.js` to prime the DBs and CDN

## Background

Building the app requires the following:

- generating a GraphQL Schema
- generating fragment ASTs based off the GrpahQL Schema
- generating persisted query hashes from those ASTs
- bundling the server code
- bundling the client code
- managing stateful services
  - migrating the DB
  - putting the persisted queries in the DB
  - resetting user presence

This occurs in both development & production settings.
In development, we additionally watch for file changes for fast recompiles.

Scripts that are used for both development and production are generated in what we call the toolbox.
These include things like migrating the DB, creating a new migration, updating the GraphQL Schema, etc.

## Why

We build both client & server assets using webpack.
We do this for a couple reasons:

- Webpack lets us use multiple loaders and customize the flow while maintaing source maps
- We can use custom file resolution, which works well for our monorepo
- We get hot module reloading for free
- It is fast. Webpack + sucrase is the fastest solution I've found
- It's a single file (...and node_modules)
- No monkeypatching `require`, all heavy lifting happens during buildtime

## Predeploy

Some scripts must run before the server can start. For example, DB migrations.
Other scripts are included in the `predeploy` script.
These scripts include the following:

- Storing persisted GraphQL queries in the DB
- Priming the database with integration keys pulled from ENV vars
- pushing assets to a CDN listed in the ENV

## Why not use X instead?

### Typescript Composite

- Typescript's composite feature allows for incremental builds.
- This doesn't work for us because our packages are interdependent. For example, changing a utility in the client will require a rebuild for both the client & the server.
- It requires the assets and ALL declarations be built
- sucrase can build our entire project faster than typescript can build a piece of it

### Only Babel

- Babel is slow, too slow to be useful in development
- It won't ever support const enum (we don't currently in prod, but would like to return to them soon)

### Only Typescript

- Things like `.graphql` text files and graphql fragments require babel plugins

### Babel + tsc

- build assets are too slow & we'd have to have a src & dist folder
