// @ts-ignore
import {r} from 'rethinkdb-ts'
import getRethinkConfig from './getRethinkConfig'

const config = getRethinkConfig()
let isLoading = false
let isLoaded = false
let promise
const getRethink = async () => {
  if (isLoaded) {
    return r
  }
  // it's not loaded
  if (!isLoading) {
    isLoading = true
    promise = r.connectPool(config)
  }
  await promise
  isLoaded = true
  return r
}

export default getRethink
