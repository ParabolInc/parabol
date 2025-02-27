import ConnectionContext from './ConnectionContext'

const sendAndPushToReliableQueue = (context: ConnectionContext, mid: number, message: string) => {
  const {socket, reliableQueue} = context
  socket.sendEncodedMessage(message)
  context.clearEntryForReliableQueue(mid)
  reliableQueue[mid] = message
}

const sendEncodedMessage = (context: ConnectionContext, object: any, syn = false) => {
  const {socket} = context
  if (socket.done()) return
  if (syn) {
    const mid = context.getMid()
    const message = JSON.stringify([object, mid])
    sendAndPushToReliableQueue(context, mid, message)
  } else {
    const message = JSON.stringify(object)
    socket.sendEncodedMessage(message, context.id)
  }
}

export {sendAndPushToReliableQueue, sendEncodedMessage}
