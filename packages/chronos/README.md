# `Chronos`

> A cron job scheduler

## Usage

Chronos holds all the cron jobs that are called within Parabol.
It holds no state, and has no logic about how to perform the jobs.
All it knows is what job to call & when to call it.
When it is time for a job to run, it sends a request to the gql-executor via Redis streams.

## Production

Chronos can be started with `node dist/chronos.js`.

## ENV Vars

Any env vars with the `CHRONOS_` prefix is used exclusively by chronos.
Chronos additionally uses the `SERVER_ID` env var to name itself, jobs, and redis channels

## Development

To test new CronJobs:

1. create a new `CronJob` with `runOnInit: true`
2. run `yarn build`. For faster builds, comment out all entry points except chronos in `prod.server.config.js`
3. run `node dist/web.js` to get the server running first
4. run `node dist/chronos.js`. It will immediately execute any jobs with `runOnInit: true`
