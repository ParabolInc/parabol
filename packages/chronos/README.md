# `Chronos`

> A cron job scheduler

## Usage

Chronos holds all the cron jobs that are called within Parabol.
It holds no state, and has no logic about how to perform the jobs.
All it knows is what job to call & when to call it.
When it is time for a job to run, it sends a request to the gql-executor via Redis streams.

## Production

Chronos can be started with `node dist/chronos.js`.

## Development

To test new CronJobs:

1. create a new `CronJob` with `runOnInit: true`
2. run `yarn build`. For faster builds, comment out all entry points except chronos in `prod.server.config.js`
3. run `node dist/gqlExecutor.js` to get the executor server running first
4. run `node dist/chronos.js`. It will immediately execute any jobs with `runOnInit: true`
