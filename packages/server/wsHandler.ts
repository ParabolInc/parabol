import {CookieStore} from '@whatwg-node/cookie-store'
import type {ExecutionArgs, ExecutionResult} from 'graphql'
import {type execute, GraphQLError, type subscribe} from 'graphql'
import {handleProtocols} from 'graphql-ws'
import {makeBehavior, type UpgradeData} from 'graphql-ws/use/uWebSockets'
import type http from 'http'
import {decode} from 'jsonwebtoken'
import {SubscriptionChannel} from '../client/types/constEnums'
import sleep from '../client/utils/sleep'
import {activeClients} from './activeClients'
import AuthToken from './database/types/AuthToken'
import {getNewDataLoader} from './dataloader/getNewDataLoader'
import {getIsBusy} from './getIsBusy'
import {getIsShuttingDown} from './getIsShuttingDown'
import getRateLimiter from './graphql/getRateLimiter'
import privateSchema from './graphql/private/rootSchema'
import {handleFirstConnection} from './handleFirstConnection'
import {logOperation} from './logOperation'
import getKysely from './postgres/getKysely'
import {setFreshTokenIfNeeded} from './setFreshTokenIfNeeded'
import {analytics} from './utils/analytics/analytics'
import checkBlacklistJWT from './utils/checkBlacklistJWT'
import {getTeamMemberUserIds} from './utils/getTeamMemberUserIds'
import {getUserSocketCount} from './utils/getUserSocketCount'
import getVerifiedAuthToken from './utils/getVerifiedAuthToken'
import {Logger} from './utils/Logger'
import publish from './utils/publish'
import {CLIENT_IP_POS} from './utils/uwsGetIP'
import {extractPersistedOperationId, getPersistedOperation, type ServerContext, yoga} from './yoga'

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
    // not present for subscription IDs
    dataLoaders: Record<string, ReturnType<typeof getNewDataLoader>>
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
    const cookieStore = new CookieStore(extra.persistedRequest.headers['cookie'] || '')
    const cookieToken = (await cookieStore.get('__Host-Http-authToken'))?.value
    const connectionToken = connectionParams?.token
    const token = connectionToken || cookieToken
    if (!(typeof token === 'string')) return false

    const authToken = getVerifiedAuthToken(token)
    const {sub: viewerId, iat, tms: teamIds} = authToken
    const [isBlacklistedJWT, socketCount, user] = await Promise.all([
      checkBlacklistJWT(viewerId, iat),
      // getUserSocketCount must run before the notification subscription start is received
      getUserSocketCount(viewerId),
      getKysely()
        .selectFrom('User')
        .select(['id', 'inactive', 'lastSeenAt', 'email', 'tms'])
        .where('id', '=', viewerId)
        .executeTakeFirst()
    ])
    if (isBlacklistedJWT || !user) return false
    extra.authToken = authToken
    const forwarded = extra.persistedRequest.headers['x-forwarded-for']
    const clientIP =
      typeof forwarded === 'string' ? forwarded.split(',').at(CLIENT_IP_POS)?.trim() : ''
    extra.ip = clientIP || extra.socket.ip
    extra.socketId = extra.persistedRequest.headers['sec-websocket-key']!
    extra.resubscribe = {}
    extra.dataLoaders = {}
    activeClients.set(extra.socketId, extra.socket)
    logOperation(viewerId, extra.ip, 'connectSocket', {})
    analytics.websocketConnected(user, {
      socketCount,
      socketId: extra.socketId,
      tms: teamIds
    })
    if (socketCount === 0) {
      handleFirstConnection(user, teamIds).catch(Logger.log)
    }
    const freshToken = setFreshTokenIfNeeded(extra, user.tms)
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
    const {ip, authToken, socketId, resubscribe} = extra
    const {schema, execute, subscribe, parse} = yoga.getEnveloped(ctx)
    const docId = extractPersistedOperationId(params as any)
    const query = await getPersistedOperation(docId!)
    const document = parse(query)
    const rateLimiter = getRateLimiter()
    const isSubscription = docId.startsWith('s')

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
      // subscribe functions don't need a dataloader since they just kickstart an async iterator
      if (extra.dataLoaders[id]) {
        Logger.error('Overwriting an existing dataloader on wsHandler.onSubscribe')
      }
      extra.dataLoaders[id] = getNewDataLoader('wsHandler.onSubscribe')
    }
    const args: EnvelopedExecutionArgs = {
      schema: authToken.rol === 'su' ? privateSchema : schema,
      operationName: params.operationName,
      document,
      variableValues: params.variables,
      // dataLoader will be null for subscriptions
      contextValue: {
        dataLoader: extra.dataLoaders[id] || null,
        rateLimiter,
        ip,
        authToken,
        socketId
      },
      rootValue: {
        execute,
        subscribe
      }
    }
    return args
  },
  onComplete: (ctx, id) => {
    const {extra} = ctx
    const {dataLoaders} = extra
    dataLoaders[id]?.dispose()
    delete dataLoaders[id]
  },
  onDisconnect: async (ctx) => {
    const {extra} = ctx
    const {authToken, socketId} = extra
    const {sub: viewerId, tms: teamIds} = authToken
    Object.values(extra.dataLoaders).forEach((dl) => dl.dispose())
    extra.dataLoaders = {}
    activeClients.delete(extra.socketId)
    extra.socket.closed = true

    // Wait for the notification subscription to unsubscribe
    // Don't do it in notificationSubscription because
    // subscriptions get re-run when the authToken updates.
    // A client may also reconnect quickly
    await sleep(1000)
    const socketCount = await getUserSocketCount(viewerId)
    const user = {id: viewerId, isConnected: false}
    analytics.websocketDisconnected(user, {
      socketCount: socketCount + 1,
      socketId,
      tms: teamIds
    })
    if (socketCount === 0) {
      const userIds = await getTeamMemberUserIds(teamIds)
      const data = {user}
      userIds.forEach(({userId}) => {
        publish(SubscriptionChannel.NOTIFICATION, userId, 'DisconnectSocketPayload', data)
      })
    }
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
