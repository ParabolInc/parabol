# `Chronos`

> A cron job scheduler

## Usage

Chronos holds all the cron jobs that are called within Parabol.
It holds no state, and has no logic about how to perform the jobs.
All it knows is when to call the job.
When it is time for a job to run, it sends the job to the gql-executor via Redis.
