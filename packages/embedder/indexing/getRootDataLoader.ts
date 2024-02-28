import getDataLoader from 'parabol-server/graphql/getDataLoader'
import {DataLoaderWorker} from 'parabol-server/graphql/graphql'

let rootDataLoader: DataLoaderWorker
export const getRootDataLoader = () => {
  if (!rootDataLoader) {
    rootDataLoader = getDataLoader() as DataLoaderWorker
  }
  return rootDataLoader
}
