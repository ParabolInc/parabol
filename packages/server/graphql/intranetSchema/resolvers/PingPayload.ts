import sleep from '../../../../client/utils/sleep'
import getRedis from '../../../utils/getRedis'
import getPg from '../../../postgres/getPg'
import {PingSuccessResolvers} from './types'
import getRethink from '../../../database/rethinkDriver'

const pingService = async <TSuccess>(thunk: () => Promise<TSuccess>) => {
    const start = Date.now()
    const res = await Promise.race([
      thunk(),
      sleep(5000)
    ])
    const end = Date.now()
    const duration = end - start
    return res ? duration : -1
}

const resolverMap: PingSuccessResolvers = {
  postgres: async () => {
    const pg = getPg()
    const thunk = () => pg.query(`SELECT id FROM "User" LIMIT 1`)
    return pingService(thunk)
  },
  redis: async () => {
    const redis = getRedis()
    return pingService(redis.ping)
  },
  rethinkdb: async () => {
    const r = await getRethink()
    return pingService(r(0).run
  }
}

export default resolverMap
