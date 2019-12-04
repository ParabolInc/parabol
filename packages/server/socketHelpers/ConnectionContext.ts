import DataLoaderWarehouse from 'dataloader-warehouse'
import shortid from 'shortid'
import RateLimiter from '../graphql/RateLimiter'
import WebSocketContext from '../wrtc/signalServer/WebSocketContext'
import {WebSocket} from '@clusterws/cws'
import {ExecutionResult, ExecutionResultDataDefault} from 'graphql/execution/execute'
import AuthToken from '../database/types/AuthToken'

export interface UserWebSocket extends WebSocket {
  context?: WebSocketContext
}

interface PendingSub {
  status: 'pending'
}

export interface ConnectionContextSub {
  asyncIterator: AsyncIterableIterator<ExecutionResult<ExecutionResultDataDefault>>
}

interface Subs {
  [opId: string]: PendingSub | ConnectionContextSub
}

class ConnectionContext {
  authToken: AuthToken
  availableResubs: any[] = []
  cancelKeepAlive: NodeJS.Timeout | undefined = undefined
  ip: string
  id = shortid.generate()
  isAlive = true
  rateLimiter: RateLimiter
  socket: UserWebSocket
  sharedDataLoader: DataLoaderWarehouse
  subs: Subs = {}
  isReady = false
  readyQueue = [] as (() => void)[]
  constructor(
    socket: UserWebSocket,
    authToken: AuthToken,
    sharedDataLoader: DataLoaderWarehouse,
    rateLimiter: RateLimiter,
    ip: string
  ) {
    this.authToken = authToken
    this.rateLimiter = rateLimiter
    this.socket = socket
    this.sharedDataLoader = sharedDataLoader
    this.ip = ip
  }
  ready() {
    this.isReady = true
    this.readyQueue.forEach((thunk) => thunk())
    this.readyQueue.length = 0
  }
}

export default ConnectionContext
