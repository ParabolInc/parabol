import type {Plugin} from 'graphql-yoga'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'

type DataLoaderContext = {dataLoader: ReturnType<typeof getNewDataLoader>}
export const useDisposeDataloader: Plugin<DataLoaderContext, DataLoaderContext> = {
  onContextBuilding: ({context, extendContext}) => {
    // This shouldn't even happen, but as the code evolves, it's a good check to prevent memory leaks
    if (context.dataLoader) {
      throw new Error('Dataloader already exists. This is a mem leak')
    }
    const dataLoader = getNewDataLoader()
    extendContext({dataLoader})
  },
  onResultProcess: ({serverContext}) => {
    serverContext.dataLoader?.dispose()
  }
}
