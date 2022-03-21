import sleep from 'parabol-client/utils/sleep'
import getRethink from '../../../../database/rethinkDriver'
import getPg from '../../../../postgres/getPg'
import getRedis from '../../../../utils/getRedis'
import {PingableServicesResolvers} from '../resolverTypes'

const pingService = async <TSuccess>(thunk: () => Promise<TSuccess>) => {
  const start = Date.now()
  const res = await Promise.race([thunk(), sleep(5000)])
  const end = Date.now()
  const duration = end - start
  return res ? duration : -1
}

export type PingableServicesSource = Record<string, never>

const PingableServices: PingableServicesResolvers = {
  postgres: async () => {
    try {
      const pg = getPg()
      const thunk = () => pg.query(`SELECT 1`)
      const duration = await pingService(thunk)
      return duration
    } catch {
      return -1
    }
  },
  redis: async () => {
    try {
      const redis = getRedis()
      const duration = await pingService(() => redis.ping('1'))
      return duration
    } catch {
      return -1
    }
  },
  rethinkdb: async () => {
    try {
      const r = await getRethink()
      const duration = await pingService(r(1).run)
      return duration
    } catch {
      return -1
    }
  }
}

export default PingableServices
