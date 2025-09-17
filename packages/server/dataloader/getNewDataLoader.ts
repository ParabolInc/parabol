import {INSTANCE_ID} from '../utils/instanceId'
import numToBase64 from '../utils/numToBase64'
import {dataLoaderCache} from './RootDataLoader'

let nextId = 0
export const getNewDataLoader = (source: string) => {
  const id = `${INSTANCE_ID}:${numToBase64(nextId++)}`
  return dataLoaderCache.add(id, source)
}
