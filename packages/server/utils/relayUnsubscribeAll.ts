import ConnectionContext, {ConnectionContextSub} from '../socketHelpers/ConnectionContext'

interface Options {
  isResub?: boolean
}
const relayUnsubscribeAll = (connectionContext: ConnectionContext, options: Options = {}) => {
  if (connectionContext.subs) {
    const opIds = Object.keys(connectionContext.subs)
    for (let ii = 0; ii < opIds.length; ii++) {
      const opId = opIds[ii]
      const sub = connectionContext.subs[opId] as ConnectionContextSub
      if (sub.asyncIterator) {
        sub.asyncIterator.return!()
      }
    }
    connectionContext.subs = {}
    // flag all of these as eligible for resubscribing
    if (options.isResub) {
      connectionContext.availableResubs = opIds
    }
  }
}

export default relayUnsubscribeAll
