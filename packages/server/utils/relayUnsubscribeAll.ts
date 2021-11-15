import ConnectionContext from '../socketHelpers/ConnectionContext'

interface Options {
  isResub?: boolean
}
const relayUnsubscribeAll = (connectionContext: ConnectionContext, options: Options = {}) => {
  if (!connectionContext.subs) return
  const opIds = Object.keys(connectionContext.subs)
  Object.values(connectionContext.subs).forEach((sub) => {
    sub.return?.()
  })
  connectionContext.subs = {}
  // flag all of these as eligible for resubscribing
  if (options.isResub) {
    connectionContext.availableResubs = opIds
  }
}

export default relayUnsubscribeAll
