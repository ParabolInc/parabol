import Redis from 'ioredis'
import type {Kysely} from 'kysely'
import {getRedisOptions} from '../../utils/getRedisOptions'

export async function up(db: Kysely<any>): Promise<void> {
  if (!process.env.REDIS_URL) {
    console.log('REDIS_URL undefined. skipping 2025-10-22T22:05:28.148Z_redis-awareness')
    return
  }
  const redis = new Redis(process.env.REDIS_URL, {
    ...getRedisOptions(),
    connectionName: '2025-10-22T22:05:28.148Z_redis-awareness'
  })

  const script = `
  local key = tostring(KEYS[1]);
  local delsCount = 0;
  local cursor = 0;
  repeat
    local result = redis.call('SCAN', cursor, 'MATCH', key)
    for _, key in ipairs(result[2]) do
      redis.call('DEL', key);
      delsCount = delsCount + 1;
    end
    cursor = tonumber(result[1]);
  until cursor == 0;
  return delsCount;`

  await Promise.all([redis.eval(script, 1, 'presence:*'), redis.eval(script, 1, 'team:*')])
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // down migration code goes here...
  // note: down migrations are optional. you can safely delete this function.
  // For more info, see: https://kysely.dev/docs/migrations
}
