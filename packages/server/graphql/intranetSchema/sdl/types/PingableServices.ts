import sleep from 'parabol-client/utils/sleep'
import getRethink from '../../../../database/rethinkDriver'
import getPg from '../../../../postgres/getPg'
import getRedis from '../../../../utils/getRedis'
import {PingableServicesResolvers} from '../resolverTypes'

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

export interface Source {}
const PingableServices: PingableServicesResolvers = {
  postgres: async () => {
    const pg = getPg()
    const thunk = () => pg.query(`SELECT 1`)
    return pingService(thunk)
  },
  redis: async () => {
    const redis = getRedis()
    return pingService(redis.ping)
  },
  rethinkdb: async () => {
    const r = await getRethink()
    const res = await pingService(r(1).run)
    return res
  }
}

export default PingableServices
