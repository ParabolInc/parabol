import {dataLoaderCache} from './RootDataLoader'

export const getInMemoryDataLoader = (id: string) => {
  return dataLoaderCache.use(id)
}
