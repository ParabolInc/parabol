import {ExecutionResult} from 'graphql/execution/execute'
import AuthToken from '../database/types/AuthToken'
import generateUID from '../generateUID'
import {Socket} from './transports/Socket'
import {getSocketTransport, SocketTransportType} from './transports/getSocketTransport'

export interface ConnectedSubs {
  [opId: string]: AsyncIterableIterator<ExecutionResult>
}

export type ReliableQueue = {[mid: number]: string}

const MAX_MID = 2 ** 31 - 1
class ConnectionContext {
  authToken: AuthToken
  availableResubs: any[] = []
  cancelKeepAlive: NodeJS.Timeout | undefined = undefined
  ip: string
  id: string
  isAlive = true
  isDisconnecting?: true
  socket: Socket
  subs: ConnectedSubs = {}
  isReady = false
  readyQueue = [] as (() => void)[]
  reliableQueue = {} as ReliableQueue
  mid = -1
  constructor(transport: SocketTransportType, authToken: AuthToken, ip: string) {
    const socket = getSocketTransport(transport)
    const {prefix} = socket
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

  getMid() {
    this.mid++
    if (this.mid >= MAX_MID) {
      this.mid = 0
    }
    return this.mid
  }

  clearEntryForReliableQueue(mid: number) {
    delete this.reliableQueue[mid]
  }
}

export default ConnectionContext
