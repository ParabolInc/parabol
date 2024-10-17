import {MasterPool, r} from 'rethinkdb-ts'
import getRethinkConfig from './getRethinkConfig'
import {R} from './stricterR'

export type RethinkSchema = {}

export type DBType = {
  [P in keyof RethinkSchema]: any
}

export type ParabolR = R<RethinkSchema>
const config = getRethinkConfig()
let isLoading = false
let isLoaded = false
let promise: Promise<MasterPool> | undefined
const getRethink = async () => {
  if (!isLoaded) {
    if (!isLoading) {
      isLoading = true
      promise = r.connectPool(config)
    }
    await promise
    isLoaded = true
  }
  // this is important because pm2 will restart the process & for whatever reason r isn't always healthy
  await r.waitForHealthy()
  return r as unknown as ParabolR
}

export const closeRethink = async () => {
  if (promise) {
    await (await promise).drain()
    isLoaded = false
    isLoading = false
    promise = undefined
  }
}

export default getRethink
