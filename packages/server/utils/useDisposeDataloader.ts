import type {Plugin} from 'graphql-yoga'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'

type DataLoaderContext = {dataLoader: ReturnType<typeof getNewDataLoader>}
export const useDisposeDataloader: Plugin<DataLoaderContext, DataLoaderContext> = {
  onContextBuilding: ({context, extendContext}) => {
    // onContextBuilding also runs in wsHandler via `contextFactory`. The WS path manages
    // its own per-operation dataloaders (`extra.dataLoaders`, disposed in onComplete/
    // onDisconnect) and never runs onResultProcess, so a loader created here would never
    // be disposed and would leak forever in dataLoaderCache.workers. The WS contextValue's
    // dataLoader isn't assigned until after contextFactory() returns, so we can't rely on
    // `context.dataLoader` being set yet — detect the WS context by its graphql-ws `extra`.
    if (context.dataLoader || 'extra' in context) {
      return
    }
    const dataLoader = getNewDataLoader('useDisposeDataloader')
    extendContext({dataLoader})
  },
  onResultProcess: ({serverContext}) => {
    serverContext.dataLoader?.dispose()
  }
}
