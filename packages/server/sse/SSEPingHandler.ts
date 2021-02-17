import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import AuthToken from '../database/types/AuthToken'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import handleDisconnect from '../socketHandlers/handleDisconnect'
import {sendAndPushToReliableQueue} from '../socketHelpers/sendEncodedMessage'
import sseClients from '../sseClients'
import getReqAuth from '../utils/getReqAuth'

const ACK = 0
const REQ = 1
const MASK = 1
const isAck = (robustId: number) => (robustId & MASK) === ACK
const isReq = (robustId: number) => (robustId & MASK) === REQ

const SSEPingHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const connectionId = req.getHeader('x-correlation-id')
  const connectionContext = sseClients.get(connectionId)
  if (connectionContext) {
    const authToken = getReqAuth(req)
    if ((authToken as AuthToken).sub === connectionContext.authToken.sub) {
      connectionContext.isAlive = true
    }
  }

  const body = await parseBody({res})
  console.log(`In SSEPingHandler, body = ${body}`)

  const parser = (buffer: Buffer) => buffer
  const messageBuffer = await parseBody({res, parser}) as Buffer

  if (messageBuffer.length == 4) {
    // reliable message ACK or REQ
    const robustId = messageBuffer.readUInt32LE()
    const mid = robustId >> 1
    if (isAck(robustId)) {
      console.log(`I've received ACK for mid: ${mid}`)
      connectionContext.clearEntryForReliableQueue(mid)
    }
    if (isReq(robustId)) {
      console.log(`I've received REQ for mid: ${mid}`)
      const message = connectionContext.reliableQueue[mid]
      if (message) {
        sendAndPushToReliableQueue(connectionContext, mid, message)
      } else {
        handleDisconnect(connectionContext)
      }
    }
  }

  res.end()
})

export default SSEPingHandler
