import ConnectionContext from '../socketHelpers/ConnectionContext'

interface Options {
  isResub?: boolean
}
const relayUnsubscribeAll = (connectionContext: ConnectionContext, options: Options = {}) => {
  if (!connectionContext.subs) return
  const opIds = Object.keys(connectionContext.subs)
  for (let ii = 0; ii < opIds.length; ii++) {
    const opId = opIds[ii]!
    const sub = connectionContext.subs[opId]!
    sub.return!()
  }
  connectionContext.subs = {}
  // flag all of these as eligible for resubscribing
  if (options.isResub) {
    connectionContext.availableResubs = opIds
  }
}

export default relayUnsubscribeAll
