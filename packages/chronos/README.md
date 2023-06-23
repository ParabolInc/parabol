# `Chronos`

> A cron job scheduler

## Usage

Chronos holds all the cron jobs that are called within Parabol.
It holds no state, and has no logic about how to perform the jobs.
All it knows is when to call the job.
When it is time for a job to run, it sends the job to the gql-executor via Redis.

## Production

Chronos can started with `node dist/chronos.js`.

## Development

To test new CronJobs:

1. create a new `CronJob` with `runOnInit: true`
2. run `yarn build`. For faster builds, comment out all outputs except chronos in `prod.server.config.js`
3. run `node dist/gqlExecutor.js` to get the executor server running first
4. run `node dist/chronos.js`. It will immediately execute jobs with `chrorunOnInit: true`
