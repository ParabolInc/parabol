import {DefaultHandlerProvider} from 'relay-runtime'
import {HandlerProvider} from 'relay-runtime/lib/handlers/RelayDefaultHandlerProvider'
import LocalPokerHandler from './LocalPokerHandler'
import LocalTimeHandler from './LocalTimeHandler'

const handlerProvider: HandlerProvider = (handle) => {
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
