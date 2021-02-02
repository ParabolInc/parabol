import {ExecutionResult} from 'graphql/execution/execute'
import {HttpResponse, WebSocket} from 'uWebSockets.js'
import AuthToken from '../database/types/AuthToken'
import generateUID from '../generateUID'
import WebSocketContext from '../wrtc/signalServer/WebSocketContext'
import isHttpResponse from './isHttpResponse'

export interface UserWebSocket extends WebSocket {
  context?: WebSocketContext
}

export interface ConnectedSubs {
  [opId: string]: AsyncIterableIterator<ExecutionResult>
}

export type ReliableQueue = {[synId: number]: NodeJS.Timer}

const MAX_SYN_ID = 64 // because we use 8 bit array and the last 2 bits are reserved for attempt counts
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
  reliableQueue = {} as ReliableQueue
  synId = -1
  constructor(socket: T, authToken: AuthToken, ip: string) {
    const prefix = isHttpResponse(socket) ? 'sse' : 'ws'
    this.authToken = authToken
    this.socket = socket
    this.ip = ip
    this.id = `${prefix}_${generateUID()}`
  }
  ready() {
    this.isReady = true
    this.readyQueue.forEach((thunk) => thunk())
    this.readyQueue.length = 0
  }

  getSynId() {
    this.synId++
    if (this.synId >= MAX_SYN_ID) {
      this.synId = 0
    }
    return this.synId
  }
}

export default ConnectionContext
