import type {Plugin} from 'graphql-yoga'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'

type DataLoaderContext = {dataLoader: ReturnType<typeof getNewDataLoader>}
export const useDisposeDataloader: Plugin<DataLoaderContext, DataLoaderContext> = {
  onContextBuilding: ({context, extendContext}) => {
    // onContextBuilding additionally gets called in wsHandler when calling `contextFactory`
    // At that point, context.dataLoader will already be created, so just ignore creating it again
    // We can't access that from here since we don't have the `id` to get it from `extra`
    if (context.dataLoader) {
      return
    }
    const dataLoader = getNewDataLoader('useDisposeDataloader')
    extendContext({dataLoader})
  },
  onResultProcess: ({serverContext}) => {
    serverContext.dataLoader?.dispose()
  }
}
