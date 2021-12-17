import {DefaultHandlerProvider} from 'relay-runtime'
import LocalPokerHandler from './LocalPokerHandler'
import LocalTimeHandler from './LocalTimeHandler'

const handlerProvider = (handle) => {
  switch (handle) {
    case 'localTime':
      return LocalTimeHandler
    case 'localPoker':
      return LocalPokerHandler
    default:
      return DefaultHandlerProvider(handle)
  }
}

export default handlerProvider
