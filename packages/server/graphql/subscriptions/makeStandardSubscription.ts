import getPubSub from '../../utils/getPubSub'
import {SubOptions} from '../../utils/publish'
import {DataLoaderWorker} from '../graphql'

interface Value extends SubOptions {
  data: {[key: string]: any}
}

const makeStandardSubscription = (
  name: string,
  channels: string[],
  socketId: string,
  dataLoader: DataLoaderWorker
) => {
  const pubSub = getPubSub()
  const transform = (value: Value) => {
    if (value.mutatorId === socketId) return undefined
    if (value.operationId) {
      dataLoader.useShared(value.operationId)
    }
    return {[name]: value.data}
  }

  const onCompleted = () => {
    dataLoader.dispose({force: true})
  }

  return pubSub.subscribe(channels, transform, {onCompleted})
}

export default makeStandardSubscription
