import closeWRTC from './closeWRTC'
import handleAccept from './handleAccept'
import handleAnswer from './handleAnswer'
import handleCandidate from './handleCandidate'
import handleInit from './handleInit'
import handleLeave from './handleLeave'
import handleOffer from './handleOffer'
import handlePubInit from './handlePubInit'
import handlePubKickOut from './handlePubKickOut'
import handlePublishToClient from './handlePublishToClient'
import WebSocketContext from './WebSocketContext'

export interface UWebSocket extends WebSocket {
  context: WebSocketContext
}

type Handler = (ws: UWebSocket, payload: any) => void

const handlers = {
  init: handleInit,
  pubInit: handlePubInit,
  pubKickOut: handlePubKickOut,
  offer: handleOffer,
  pubToClient: handlePublishToClient,
  accept: handleAccept,
  answer: handleAnswer,
  candidate: handleCandidate,
  leaveSwarm: handleLeave,
  close: closeWRTC
} as {[key: string]: Handler}

const handleSignal = (ws: UWebSocket, payload: {type: string; [key: string]: any}): boolean => {
  const {type} = payload
  const handler = handlers[type]
  if (!handler) return false
  handler(ws, payload)
  return true
}

export default handleSignal
