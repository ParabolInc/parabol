import RootDataLoader from '../dataloader/RootDataLoader'
import numToBase64 from '../utils/numToBase64'
import DataLoaderCache from './DataLoaderCache'
import getNodeId from './getNodeId'

const dataLoaderCache = new DataLoaderCache()
const NODE_ID = getNodeId()
let nextId = 0

/**
 * A user can keep reusing their dataloader for 500ms until a mutation comes in.
 * Once the user triggers a mutation, then the dataloader is no longer safe to reuse.
 */
const getDataLoader = (did?: string) => {
  // if a did was provided, attempt to reuse that, since a mutation likely filled it up before sharing it
  // if the viewer is logged in, give them their own dataloader that they can quickly reuse for subsequent requests or share with others
  // if not logged in, just make a new anonymous loader.
  const id = did || `${NODE_ID}:${numToBase64(nextId++)}`
  return dataLoaderCache.use(id) || dataLoaderCache.add(id, new RootDataLoader())
}

export default getDataLoader
