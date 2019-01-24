import {ClientMessageTypes, ServerMessageTypes} from '@mattkrick/graphql-trebuchet-client'
import {Events} from '@mattkrick/trebuchet-client'
import isQueryProvided from 'server/graphql/isQueryProvided'
import isSubscriptionPayload from 'server/graphql/isSubscriptionPayload'
import handleDisconnect from 'server/socketHandlers/handleDisconnect'
import wsGraphQLHandler from 'server/socketHandlers/wsGraphQLHandler'
import wsRelaySubscribeHandler from 'server/socketHandlers/wsRelaySubscribeHandler'
import sendMessage from 'server/socketHelpers/sendMessage'
import relayUnsubscribe from 'server/utils/relayUnsubscribe'
import ConnectionContext from '../socketHelpers/ConnectionContext'

const {GQL_START, GQL_STOP} = ServerMessageTypes
const {GQL_DATA, GQL_ERROR} = ClientMessageTypes

// stole from GQLTrebuchetClient, can link when we support const enums
enum TransferType {
  FILE_UPLOAD
}

const handleMessage = (connectionContext: ConnectionContext) => async (
  message: string | ArrayBuffer
) => {
  const {socket, subs} = connectionContext
  // catch raw, non-graphql protocol messages here
  if (message === Events.KEEP_ALIVE) {
    connectionContext.isAlive = true
    return
  }

  let parsedMessage
  if (typeof message === 'string') {
    try {
      parsedMessage = JSON.parse(message)
    } catch (e) {
      /*
       * Invalid frame payload data
       * The endpoint is terminating the connection because a message was received that contained inconsistent data
       * (e.g., non-UTF-8 data within a text message).
       */
      console.log('ERR', e)
      handleDisconnect(connectionContext, {exitCode: 1007})()
      return
    }
  } else if (message instanceof ArrayBuffer) {
    const dv = new DataView(message)
    const headerSize = dv.getUint32(0)
    const headerBuffer = message.slice(4, 4 + headerSize)
    const headerStr = Buffer.from(headerBuffer).toString('utf-8')
    let header
    try {
      header = JSON.parse(headerStr)
    } catch (e) {
      console.log('Err', e)
      return
    }
    const {type, eof, name} = header
    if (type !== TransferType.FILE_UPLOAD) return
    const buffer = Buffer.from(message.slice(4 + headerSize))
    connectionContext.uploadManager.pushBuffer(name, buffer, eof)
    return
  }

  const {id: opId, type, payload} = parsedMessage
  // this GQL_START logic will be simplified when we move to persisted queries
  if (type === GQL_START) {
    if (!isQueryProvided(payload)) {
      sendMessage(socket, GQL_ERROR, {errors: [{message: 'No payload provided'}]}, opId)
      return
    }
    if (isSubscriptionPayload(payload)) {
      wsRelaySubscribeHandler(connectionContext, parsedMessage)
    } else {
      const result = await wsGraphQLHandler(connectionContext, parsedMessage.payload)
      const messageType = result.data ? GQL_DATA : GQL_ERROR
      sendMessage(socket, messageType, result, opId)
    }
  } else if (type === GQL_STOP) {
    relayUnsubscribe(subs, opId)
  }
}

export default handleMessage
