import numToBase64 from '../utils/numToBase64'
import RethinkDataLoader from '../dataloader/RethinkDataLoader'
import DataLoaderCache from './DataLoaderCache'
import getNodeId from './getNodeId'

const dataLoaderCache = new DataLoaderCache()
const NODE_ID = getNodeId()
let nextId = 0

const getDataLoader = (did?: string) => {
  // for queries & mutations, make a new dataLoader
  if (!did)
    return dataLoaderCache.add(`${NODE_ID}:${numToBase64(nextId++)}`, new RethinkDataLoader())
  // if this will be used for a subscription payload, try reusing the dataLoader that made it
  const dataLoader = dataLoaderCache.use(did)
  if (dataLoader) return dataLoader
  // if the dataloader doesn't exist on this service (already cleaned up or created on another executor) make it again
  // so others can possibly reuse it, too
  return dataLoaderCache.add(did, new RethinkDataLoader())
}

export default getDataLoader
