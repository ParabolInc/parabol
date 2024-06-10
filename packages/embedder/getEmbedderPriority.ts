import {sql} from 'kysely'

/*
The Job Queue has a first in first out (FIFO) strategy with a few exceptions:
  - Realtime requests from the app should come before historal data processing
  - Historical data processing should come before backfilling data for a new model
Future use cases:
  - Prioritize Enterprise/Pro users over free
  - Deprioritize jobs for heavy users

To achieve these goals we need some kind of clock, so we use a timestamp in Unix time (resolution in seconds)
Postgres uses a signed 32-bit INT, so we subtract 2**31 to make use of the full range
Otherwise, we could not schedule anything after 2**31-1, which is roughly the year 2038

This allows us to provide a `maxDelayInDays` API, which is somewhat intuitive:
e.g. Process realtime requests immediately, but start processing this historical data no later than 5 days from now.
In 5 days, that historical data will be a higher priority than new realtime requests.
*/
export const getEmbedderPriority = (maxDelayInDays: number) => {
  return sql<number>`"getEmbedderPriority"(${maxDelayInDays})`
}
