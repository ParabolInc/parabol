import getPubSub from '../utils/getPubSub'
import {DataLoaderWorker} from './graphql'

const defaultFilterFn = () => true

interface Options {
  dataLoader: DataLoaderWorker
  filterFn: (value: any) => boolean
  resolve: (value: any) => any
}

const makeSubscribeIter = (channelName: string | string[], options: Options) => {
  const {dataLoader, filterFn = defaultFilterFn, resolve} = options
  const asyncIterator = getPubSub().asyncIterator<{operationId?: number}>(channelName)
  const getNextPromise = async () => {
    const nextRes = await asyncIterator.next()
    const {value, done} = nextRes
    if (done) {
      return asyncIterator.return!()
    }
    if (filterFn(value)) {
      if (value.operationId) {
        dataLoader.useShared(value.operationId)
      }
      if (resolve) {
        return {
          done: false,
          value: await resolve(value)
        }
      }
      return nextRes
    }
    // if the value doesn't get filtered, send it to the client. else, restart the listener
    return getNextPromise()
  }

  return {
    next() {
      return getNextPromise()
    },
    return() {
      dataLoader.dispose({force: true})
      return asyncIterator.return!()
    },
    throw(error) {
      return asyncIterator.throw!(error)
    },
    [Symbol.asyncIterator]() {
      return this
    }
  }
}

export default makeSubscribeIter
