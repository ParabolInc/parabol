import {AsyncLocalStorage} from 'node:async_hooks'

export interface HttpLogContext {
  method: string
  route: string
  path: string
  query?: string
  contentType?: string
  body?: Buffer
  getStatus?: () => number | undefined
}

export interface RequestLogContext {
  userId?: string
  ip?: string
  // the tenant a request acts for when there is no user, e.g. SCIM and SAML
  orgId?: string
  operationName?: string
  operationKind?: string
  variables?: unknown
  socketId?: string
  sessionId?: string
  component?: string
  traceId?: string
  spanId?: string
  traceSampled?: boolean
  service?: string
  version?: string
  http?: HttpLogContext
}

const requestLogStorage = new AsyncLocalStorage<RequestLogContext>()

export const runWithLogContext = <T>(context: RequestLogContext, fn: () => T): T =>
  requestLogStorage.run({...requestLogStorage.getStore(), ...context}, fn)

// a context entered more than once, like an operation's, keeps what annotateLogContext adds between entries
export const createLogContext = (context: RequestLogContext): RequestLogContext => ({
  ...requestLogStorage.getStore(),
  ...context
})

export const enterLogContext = <T>(context: RequestLogContext, fn: () => T): T =>
  requestLogStorage.run(context, fn)

export const annotateLogContext = (fields: Pick<RequestLogContext, 'orgId'>) => {
  const context = requestLogStorage.getStore()
  if (context) Object.assign(context, fields)
}

export const runWithoutLogContext = <T>(fn: () => T): T => requestLogStorage.exit(fn)

export const getLogContext = () => requestLogStorage.getStore()
