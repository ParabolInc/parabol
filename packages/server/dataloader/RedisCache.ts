import ms from 'ms'
import {RethinkTypes} from '../database/rethinkDriver'
import getRedis from '../utils/getRedis'
import RethinkDBCache, {Doc, RType, RWrite} from './RethinkDBCache'

const TTL = ms('3h')

const msetpx = (key: string, value: object) => {
  return ['set', key, JSON.stringify(value), 'PX', TTL] as string[]
}

export default class RedisCache {
  rethinkDBCache = new RethinkDBCache()
  read = async (keys: string[]) => {
    const redis = getRedis()
    const cachedDocs = await redis.mget(...keys)
    const missingKeys = [] as string[]
    const parsedDocs = [] as {id: string}[]
    for (let i = 0; i < cachedDocs.length; i++) {
      const cachedDoc = cachedDocs[i]
      if (cachedDoc === null) {
        missingKeys.push(keys[i])
      } else {
        parsedDocs.push(JSON.parse(cachedDoc))
      }
    }
    if (missingKeys.length === 0) return parsedDocs
    const docsByKey = await this.rethinkDBCache.read(missingKeys)
    const writes = [] as string[][]
    Object.keys(docsByKey).forEach((key) => {
      writes.push(msetpx(key, docsByKey[key]))
    })
    // don't wait for redis to populate the local cache
    redis.multi(writes).exec()
    return keys.map((key, idx) => {
      const cachedDoc = cachedDocs[idx]
      if (cachedDoc) return JSON.parse(cachedDoc)
      return docsByKey[key]
    })
  }

  write = async <T extends keyof RethinkTypes>(writes: RWrite<T>[]) => {
    const results = await this.rethinkDBCache.write(writes)
    const redisWrites = [] as string[][]
    results.map((result, idx) => {
      if (!result) return
      const write = writes[idx]
      const {table} = write
      const {id} = result
      const key = `${table}:${id}`
      redisWrites.push(msetpx(key, result))
    })
    const redis = getRedis()
    // awaiting redis isn't strictly required, can get speedboost by removing the wait
    await redis.multi(redisWrites).exec()
    return results
  }

  clear = async (key: string) => {
    const redis = getRedis()
    return redis.del(key)
  }
  prime = async <T extends keyof RethinkTypes>(table: T, docs: Doc[]) => {
    const redis = getRedis()
    const writes = docs.map((doc) => {
      return msetpx(`${table}:${doc.id}`, doc)
    })
    await redis.multi(writes).exec()
  }
  writeTable = async <T extends keyof RethinkTypes>(table: T, updater: Partial<RType<T>>) => {
    // inefficient to not update rethink & redis in parallel, but writeTable is uncommon
    await this.rethinkDBCache.writeTable(table, updater)
    return new Promise((resolve) => {
      const redis = getRedis()
      const stream = redis.scanStream({match: `${table}:*`, count: 100})
      stream.on('data', async (keys) => {
        stream.pause()
        const userStrs = await redis.mget(...keys)
        const writes = userStrs.map((userStr, idx) => {
          const user = JSON.parse(userStr!)
          Object.assign(user, updater)
          return msetpx(keys[idx], user)
        })
        await redis.multi(writes).exec()
        stream.resume()
      })
      stream.on('end', () => {
        resolve()
      })
    })
  }
}
