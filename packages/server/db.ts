/*
 * This is a 3-stage cache
 * Stage 1 is a query batcher and local cache (Node process), which stores parsed JSON.
 * Stage 2 is a remote cache (Redis), which stores the document in serialized JSON
 * Stage 3 is the DB itself (RethinkDB)
 * Stage 1 runs a garbage collector every hour to remove docs that haven't been used in 1 hour
 * Stage 2 uses Redis's built-in TTL to expire documents after 3 hours
 * Stage 2 listens for invalidations coming from other nodes and invalidates Stage 1 when necessary (WIP, stuck on Redis v6)
 *
 * READS:
 *    Stage 1 caches the record inside a Promise. if not found, it queries Stage 2, caches the result, and returns
 *    Stage 2 gets the missing items & looks them up in redis. If not found, it queries Stage 3, caches the result, and returns
 *    Stage 3 sends a single batched query to RethinkDB containing all items not present in Stage 2
 *
 * WRITES:
 *    Stage 1 passes the write request to Stage 2updates the cached value if found, calls Stage 2, then returns when Stage 2 finishes
 *    Stage 2 queries the current value from redis. If found, updates the value in redis and calls Stage 3
 *    Stage 3 batches all updates and sends a single query to RethinkDB
 *
 * PROXIED CACHE:
 *    The LocalCache is essentially a DataLoader that doesn't expire after the request completes
 *    ProxiedCache maps the LocalCache to the DataLoader API so the dataloader worker can use it
 */

import ms from 'ms'
import LocalCache from './dataloader/LocalCache'

const db = new LocalCache(ms('1h'))
export default db
