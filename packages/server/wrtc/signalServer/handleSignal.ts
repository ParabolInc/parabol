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
import {WebSocket} from 'uWebSockets.js'

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

interface Payload {
  type: string
  [key: string]: any
}

const handleSignal = (ws: UWebSocket, payload: Payload) => {
  const {type} = payload
  const handler = handlers[type]
  if (handler && ws.context) {
    handler(ws, payload)
  }
}

export default handleSignal
