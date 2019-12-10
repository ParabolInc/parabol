import {WebSocket} from '@clusterws/cws'
import {ExecutionResult} from 'graphql/execution/execute'
import shortid from 'shortid'
import AuthToken from '../database/types/AuthToken'
import WebSocketContext from '../wrtc/signalServer/WebSocketContext'

export interface UserWebSocket extends WebSocket {
  context?: WebSocketContext
}

export interface ConnectedSubs {
  [opId: string]: AsyncIterableIterator<ExecutionResult>
}

class ConnectionContext {
  authToken: AuthToken
  availableResubs: any[] = []
  cancelKeepAlive: NodeJS.Timeout | undefined = undefined
  ip: string
  id = shortid.generate()
  isAlive = true
  socket: UserWebSocket
  subs: ConnectedSubs = {}
  isReady = false
  readyQueue = [] as (() => void)[]
  constructor(socket: UserWebSocket, authToken: AuthToken, ip: string) {
    this.authToken = authToken
    this.socket = socket
    this.ip = ip
  }
  ready() {
    this.isReady = true
    this.readyQueue.forEach((thunk) => thunk())
    this.readyQueue.length = 0
  }
}

export default ConnectionContext
