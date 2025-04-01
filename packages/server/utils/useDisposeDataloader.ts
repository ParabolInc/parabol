import type {Plugin} from 'graphql-yoga'
import {getNewDataLoader} from '../graphql/getDataLoader'

type DataLoaderContext = {dataLoader: ReturnType<typeof getNewDataLoader>}
export const useDisposeDataloader: Plugin<DataLoaderContext, DataLoaderContext> = {
  onContextBuilding: ({context, extendContext}) => {
    const dataLoader = getNewDataLoader()
    if (context.dataLoader) {
      throw new Error('Dataloader already exists. This is a mem leak')
    }
    extendContext({dataLoader})
  },
  onResultProcess: ({serverContext}) => {
    const {dataLoader} = serverContext
    if (!dataLoader) return
    // if the dataloader has been shared, give it 500ms for a subscriber to claim it
    dataLoader.dispose()
  }
}
