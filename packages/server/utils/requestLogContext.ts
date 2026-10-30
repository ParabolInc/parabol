import {AsyncLocalStorage} from 'node:async_hooks'

export interface RequestLogContext {
  userId?: string
  ip?: string
  operationName?: string
  operationKind?: string
  variables?: unknown
  socketId?: string
  sessionId?: string
  component?: string
  traceId?: string
  spanId?: string
  traceSampled?: boolean
}

const requestLogStorage = new AsyncLocalStorage<RequestLogContext>()

export const runWithLogContext = <T>(context: RequestLogContext, fn: () => T): T =>
  requestLogStorage.run({...requestLogStorage.getStore(), ...context}, fn)

export const getLogContext = () => requestLogStorage.getStore()
