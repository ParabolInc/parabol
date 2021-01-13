import {ExecutionResult} from 'graphql/execution/execute'
import shortid from 'shortid'
import {HttpResponse, WebSocket} from 'uWebSockets.js'
import AuthToken from '../database/types/AuthToken'
import WebSocketContext from '../wrtc/signalServer/WebSocketContext'
import isHttpResponse from './isHttpResponse'

export interface UserWebSocket extends WebSocket {
  context?: WebSocketContext
}

export interface ConnectedSubs {
  [opId: string]: AsyncIterableIterator<ExecutionResult>
}

class ConnectionContext<T = WebSocket | HttpResponse> {
  authToken: AuthToken
  availableResubs: any[] = []
  cancelKeepAlive: NodeJS.Timeout | undefined = undefined
  ip: string
  id: string
  isAlive = true
  isDisconnecting?: true
  socket: T
  subs: ConnectedSubs = {}
  isReady = false
  readyQueue = [] as (() => void)[]
  constructor(socket: T, authToken: AuthToken, ip: string) {
    const prefix = isHttpResponse(socket) ? 'sse' : 'ws'
    this.authToken = authToken
    this.socket = socket
    this.ip = ip
    this.id = `${prefix}_${shortid.generate()}`
  }
  ready() {
    this.isReady = true
    this.readyQueue.forEach((thunk) => thunk())
    this.readyQueue.length = 0
  }
}

export default ConnectionContext
