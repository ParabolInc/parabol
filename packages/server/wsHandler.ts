import type {ExecutionArgs, ExecutionResult} from 'graphql'
import {execute, GraphQLError, subscribe} from 'graphql'
import {handleProtocols} from 'graphql-ws'
import {makeBehavior, UpgradeData} from 'graphql-ws/use/uWebSockets'
import type http from 'http'
import {decode} from 'jsonwebtoken'
import {isEqualWhenSerialized} from '../client/shared/isEqualWhenSerialized'
import {Threshold} from '../client/types/constEnums'
import sleep from '../client/utils/sleep'
import {activeClients} from './activeClients'
import AuthToken from './database/types/AuthToken'
import {getNewDataLoader} from './dataloader/getNewDataLoader'
import {getIsBusy} from './getIsBusy'
import {getIsShuttingDown} from './getIsShuttingDown'
import getRateLimiter from './graphql/getRateLimiter'
import privateSchema from './graphql/private/rootSchema'
import checkBlacklistJWT from './utils/checkBlacklistJWT'
import encodeAuthToken from './utils/encodeAuthToken'
import {fromEpochSeconds} from './utils/epochTime'
import getVerifiedAuthToken from './utils/getVerifiedAuthToken'
import {INSTANCE_ID} from './utils/instanceId'
import {extractPersistedOperationId, getPersistedOperation, yoga, type ServerContext} from './yoga'

declare module 'graphql-ws/use/uWebSockets' {
  interface UpgradeData {
    ip: string
    closed?: true
  }
  interface Extra {
    ip: string
    authToken: AuthToken
    socketId: string
    resubscribe: Record<string, () => void>
    dispose: Record<string, () => void>
  }
}

// yoga's envelop may augment the `execute` and `subscribe` operations
// so we need to make sure we always use the freshest instance
type EnvelopedExecutionArgs = ExecutionArgs & {
  rootValue: {
    execute: typeof execute | typeof subscribe
    subscribe: typeof subscribe
  }
}

const connectQuery = `
mutation ConnectSocket($socketInstanceId: ID!) {
  connectSocket(socketInstanceId: $socketInstanceId) {
    tms
  }
}`

export const disconnectQuery = `
mutation DisconnectSocket($userId: ID!, $socketId: ID!) {
  disconnectSocket(userId: $userId, socketId: $socketId) {
    user {
      id
    }
  }
}`

const setFreshTokenIfNeeded = (extra: {authToken: AuthToken}, tmsDB: string[]) => {
  const {authToken} = extra
  const {exp, tms} = authToken
  const tokenExpiration = fromEpochSeconds(exp)
  const timeLeftOnToken = tokenExpiration.getTime() - Date.now()
  const tmsIsValid = isEqualWhenSerialized(tmsDB, tms)
  if (timeLeftOnToken < Threshold.REFRESH_JWT_AFTER || !tmsIsValid) {
    const nextAuthToken = new AuthToken({...authToken, tms: tmsDB})
    extra.authToken = nextAuthToken
    return encodeAuthToken(nextAuthToken)
  }
  return null
}

const dehydrateResult = (result: ExecutionResult) => {
  const {data, ...rest} = result
  if (!data) return result
  const subscriptionName = Object.keys(data)[0]!
  const subscriptionPayload = data[subscriptionName] as {
    fieldName: string
    __typename?: string
    [fieldName: string]: any
  }
  const {fieldName, __typename} = subscriptionPayload
  const fields = {
    fieldName,
    [fieldName]: subscriptionPayload[fieldName],
    ...(__typename && {__typename})
  }
  const dehydratedData = {[subscriptionName]: fields}
  return {...rest, data: dehydratedData}
}
export const wsHandler = makeBehavior<{token?: string}>({
  onConnect: async (ctx) => {
    const {connectionParams, extra} = ctx
    const token = connectionParams?.token
    if (!(typeof token === 'string')) return false
    const authToken = getVerifiedAuthToken(token)
    const {sub: userId, iat} = authToken
    const isBlacklistedJWT = await checkBlacklistJWT(userId, iat)
    if (isBlacklistedJWT) return false
    extra.authToken = authToken
    const forwarded = extra.persistedRequest.headers['x-forwarded-for']
    extra.ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded) || extra.socket.ip
    extra.socketId = extra.persistedRequest.headers['sec-websocket-key']!
    extra.resubscribe = {}
    extra.dispose = {}
    const {execute, parse} = yoga.getEnveloped(ctx)
    const dataLoader = getNewDataLoader()
    const {data} = await execute({
      document: parse(connectQuery),
      variableValues: {socketInstanceId: INSTANCE_ID},
      schema: privateSchema,
      contextValue: {dataLoader, ip: extra.ip, authToken, socketId: extra.socketId}
    })
    dataLoader.dispose()
    const tms = data?.connectSocket?.tms
    const freshToken = setFreshTokenIfNeeded(extra, tms)
    activeClients.set(extra.socketId, extra)
    return {version: __APP_VERSION__, authToken: freshToken}
  },
  async onNext(context, id, _payload, {contextValue}, result) {
    const isSubscription = !!context.subscriptions[id]
    if (!isSubscription) return result
    const subResult = dehydrateResult(result)
    const notificationSub = subResult.data?.notificationSubscription as
      | {
          AuthTokenPayload?: {id: string}
          InvalidateSessionsPayload?: any
        }
      | undefined
    const jwt = notificationSub?.AuthTokenPayload?.id
    if (jwt) {
      const {extra} = context
      const {resubscribe} = extra
      const nextAuthToken = new AuthToken(decode(jwt) as any)
      extra.authToken = (contextValue as ServerContext).authToken = nextAuthToken
      // wait for other payloads to get flushed to the client before resubscribing
      setTimeout(() => {
        Object.keys(resubscribe).forEach((key) => {
          resubscribe[key]!()
        })
      }, 1000)
    } else if (notificationSub?.InvalidateSessionsPayload) {
      throw new GraphQLError('Session invalidated', {
        extensions: {
          code: 'SESSION_INVALIDATED'
        }
      })
    }
    return subResult
  },
  execute: (args) => {
    return (args as EnvelopedExecutionArgs).rootValue.execute(args)
  },
  subscribe: (args) => (args as EnvelopedExecutionArgs).rootValue.subscribe(args),
  onSubscribe: async (ctx, id, params) => {
    const {extra} = ctx
    const {ip, authToken, socketId, resubscribe, dispose} = extra
    const {schema, execute, subscribe, parse} = yoga.getEnveloped(ctx)
    const docId = extractPersistedOperationId(params as any)
    const query = await getPersistedOperation(docId!)
    const document = parse(query)
    const rateLimiter = getRateLimiter()
    const isSubscription = docId.startsWith('s')
    // subscribe functions don't need a dataloader since they just kickstart an async iterator
    const dataLoader = isSubscription ? null : getNewDataLoader()

    if (isSubscription) {
      resubscribe[id] = async () => {
        const oldSub = ctx.subscriptions[id]
        delete ctx.subscriptions[id]
        if (!oldSub || !('return' in oldSub)) return
        await oldSub.return(undefined)
        const encoder = new TextEncoder()
        const arrayBuffer = encoder.encode(JSON.stringify({type: 'subscribe', id, payload: params}))
          .buffer as ArrayBuffer
        // wait a tick for the old subscriptions to get removed before starting them again
        await sleep(1)
        if (!ctx.extra.socket.closed) {
          wsHandler?.message?.(ctx.extra.socket, arrayBuffer, false)
        }
      }
    } else {
      dispose[id] = () => {
        delete dispose[id]
        dataLoader!.dispose()
      }
    }
    const args: EnvelopedExecutionArgs = {
      schema: authToken.rol === 'su' ? privateSchema : schema,
      operationName: params.operationName,
      document,
      variableValues: params.variables,
      contextValue: {dataLoader, rateLimiter, ip, authToken, socketId},
      rootValue: {
        execute,
        subscribe
      }
    }
    return args
  },
  onComplete: (ctx, id) => {
    ctx.extra.dispose[id]?.()
  },
  onError: (ctx, id) => {
    ctx.extra.dispose[id]?.()
  },
  onDisconnect: async (ctx) => {
    const {extra} = ctx
    const {authToken, socketId} = extra
    const {sub: userId} = authToken
    activeClients.delete(extra.socketId)
    const {execute, parse} = yoga.getEnveloped(ctx)
    const dataLoader = getNewDataLoader()
    extra.socket.closed = true
    await execute({
      document: parse(disconnectQuery),
      variableValues: {userId, socketId},
      schema: privateSchema,
      contextValue: {dataLoader, ip: extra.ip, authToken, socketId}
    })
    dataLoader.dispose()
  }
})

// Hack because graphql-ws doesn't support a way to extract the IP address, so we override the upgrade method
wsHandler.upgrade = (res, req, context) => {
  // check isShuttingDown here instead of the onConnect handler because onConnect can only send a 4403 FORBIDDEN
  // which is what we send when we want to invalidate a session (ie log them out)
  // Here, we want them to keep trying, and hopefully they get proxied to a different server that is not shutting down
  const isUnavailable = getIsShuttingDown() || getIsBusy()
  if (isUnavailable) {
    res.end()
    return
  }
  const headers: http.IncomingHttpHeaders = {}
  req.forEach((key, value) => {
    headers[key] = value
  })
  const ip =
    Buffer.from(res.getProxiedRemoteAddressAsText()).toString() ||
    Buffer.from(res.getRemoteAddressAsText()).toString()

  res.upgrade<UpgradeData & {ip: string}>(
    {
      ip,
      persistedRequest: {
        method: req.getMethod(),
        url: req.getUrl(),
        query: req.getQuery(),
        headers
      }
    },
    req.getHeader('sec-websocket-key'),
    handleProtocols(req.getHeader('sec-websocket-protocol')) || new Uint8Array(),
    req.getHeader('sec-websocket-extensions'),
    context
  )
}
