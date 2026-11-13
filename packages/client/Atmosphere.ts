import graphql from 'babel-plugin-relay/macro'
import EventEmitter from 'eventemitter3'
import type {Client} from 'graphql-ws'
import jwtDecode from 'jwt-decode'
import {commitMutation, type Disposable} from 'react-relay'
import {
  type CacheConfig,
  type ConcreteRequest,
  Environment,
  type FetchFunction,
  type FetchQueryFetchPolicy,
  fetchQuery,
  type GraphQLResponse,
  type GraphQLTaggedNode,
  Network,
  type NormalizationLinkedField,
  Observable,
  type OperationType,
  type PayloadError,
  RecordSource,
  RelayFeatureFlags,
  type RequestParameters,
  Store,
  type UploadableMap,
  type Variables
} from 'relay-runtime'
import type StrictEventEmitter from 'strict-event-emitter-types'
import type {AtmosphereSignOutMutation} from './__generated__/AtmosphereSignOutMutation.graphql'
import type {Snack, SnackbarRemoveFn} from './components/Snackbar'
import {AuthToken} from './types/AuthToken'
import type {NavigateFn} from './types/relayMutations'
import {getAuthCookie, onAuthCookieChange} from './utils/authCookie'
import {addBreadcrumb} from './utils/clientBreadcrumbs'
import {createWSClient} from './utils/createWSClient'
import deletePageDatabases from './utils/deletePageDatabases'
import getTabSessionId from './utils/getTabSessionId'
import makeTraceparent from './utils/makeTraceparent'
import {logRelayEvent} from './utils/navigationTimings'
import GraphQLServerError from './utils/relay/GraphQLServerError'
import handlerProvider from './utils/relay/handlerProvider'
import {reportClientWarning, reportUnexpectedGraphQLErrors} from './utils/reportClientError'
import sleep from './utils/sleep'
import {rememberServerErrors} from './utils/staleClientNote'

;(RelayFeatureFlags as any).ENABLE_RELAY_CONTAINERS_SUSPENSE = false
;(RelayFeatureFlags as any).ENABLE_PRECISE_TYPE_REFINEMENT = true

const signOutMutation = graphql`
  mutation AtmosphereSignOutMutation {
    signOut
  }
`

const refreshSessionMutation = graphql`
  mutation AtmosphereRefreshSessionMutation {
    refreshSession
  }
`

// a query that never settles must not keep a busy subscription's messages forever
const MAX_SUBSCRIPTION_HOLD = 30_000

// uWebSockets closes an idle keep-alive connection after about 10 seconds, but Google's load balancer reuses one for up
// to 10 minutes, so now and then it sends a request down a connection the server is closing and answers 502 (classic) or
// 503 (Envoy). A query is safe to send again
const DROPPED_CONNECTION_STATUSES = new Set([502, 503])

interface ResponsePayload {
  data?: Record<string, unknown> | null
  errors?: readonly PayloadError[]
}

// Relay hides errors that come without data inside an error of its own, and completes a mutation
// whose nullable field failed as if it had succeeded
const toServerError = (
  {data, errors}: ResponsePayload,
  isMutationResult: boolean,
  traceId: string | undefined
) => {
  if (!errors?.length) return undefined
  const isFailure =
    !data || (isMutationResult && Object.values(data).every((value) => value === null))
  return isFailure ? new GraphQLServerError(errors, traceId) : undefined
}

interface RetainedSubscription {
  disposable: Disposable
  retainCount: number
  releaseTimer?: number
}

export type SubscriptionRequestor = {
  (atmosphere: Atmosphere, variables: any, router: {navigate: NavigateFn}): Disposable
  key: string
}

const noop = (): any => {
  /* noop */
}

export const noopSink = {
  next: noop,
  error: noop,
  complete: noop
}

const toFormData = (
  request: RequestParameters,
  variables: Variables,
  uploadables: UploadableMap
) => {
  const formData = new FormData()
  formData.append('operations', JSON.stringify({docId: request.id, variables}))

  // Map the uploadable files
  const map: Record<string, string[]> = {}
  let i = 0
  Object.keys(uploadables).forEach((key) => {
    map[i] = [`variables.${key}`]
    formData.append(i.toString(), uploadables[key]!)
    i++
  })

  formData.append('map', JSON.stringify(map))
  return formData
}

export interface AtmosphereEvents {
  addSnackbar: (snack: Snack) => void
  removeSnackbar: (filterFn: SnackbarRemoveFn) => void
  focusAgendaInput: () => void
  newSubscriptionClient: () => void
  removeGitHubRepo: () => void
  authChanged: () => void
}

const store = new Store(new RecordSource(), {gcReleaseBufferSize: 10000})

export default class Atmosphere extends Environment {
  // yjs only loads once a page or a meeting is open, so its provider manager finds the session & registers its teardown here
  // If the session imported the provider manager instead, yjs would be part of the entry bundle
  static current?: Atmosphere
  static closeHandlers = new Set<() => Promise<unknown>>()
  static getKey = (name: string, variables: Variables | undefined) => {
    return JSON.stringify({name, variables})
  }
  _authObj: AuthToken | null = null
  get authObj() {
    return this._authObj
  }
  set authObj(value: AuthToken | null) {
    this._authObj = value
    this.eventEmitter.emit('authChanged')
  }

  retries = new Set<() => void>()
  // by subKey, every subscription a component or the app is holding open
  private retainedSubscriptions = new Map<string, RetainedSubscription>()
  // by subKey, called each time the server acknowledges that a subscription is listening, including after a reconnect
  subscriptionAckHandlers = new Map<string, () => void>()
  // by subKey, messages kept from relay until the query that holds them has been written to the store
  private heldSubscriptionMessages = new Map<string, (() => void)[]>()
  // Our server only sends a single field per subscription, but relay requires every requested field
  // This object makes the server response whole without increasing the payload size
  subscriptionInterfaces = {} as Record<string, Record<string, null>>
  eventEmitter: StrictEventEmitter<EventEmitter, AtmosphereEvents> = new EventEmitter()
  // it's only null before login, so it's just a little white lie
  viewerId: string = null!
  tabCheckChannel?: BroadcastChannel
  subscriptionClient?: Client
  // while the socket is down, queries and mutations go over HTTP instead of waiting for it to reconnect
  isSocketConnected = false
  constructor() {
    // Relay only logs network events for the network it is given here, but the fetch functions exist once super returns
    let atmosphere: Atmosphere | undefined
    super({
      store,
      handlerProvider,
      network: Network.create(
        (request, variables, cacheConfig, uploadables) =>
          atmosphere!.fetchFunction(request, variables, cacheConfig, uploadables),
        (operation, variables, cacheConfig) =>
          atmosphere!.fetchOrSubscribe(operation, variables, cacheConfig)
      ),
      log: logRelayEvent
    })
    atmosphere = this
    Atmosphere.current = this
    this.initAuthFromCookie()
  }

  private initAuthFromCookie() {
    if (typeof window === 'undefined') return
    const authToken = getAuthCookie(window)
    if (!authToken) return
    try {
      const authObj = jwtDecode<AuthToken>(authToken)
      if (!authObj) return
      const {exp, sub: viewerId, rol} = authObj
      if (exp < Date.now() / 1000) return
      this._authObj = authObj
      if (rol !== 'impersonate') {
        this.viewerId = viewerId!
      }
    } catch {
      // invalid cookie, leave authObj null
    }
  }

  // the client holds what it is given until its socket connects, and sends it again after a reconnect
  getSubscriptionClient() {
    this.subscriptionClient ??= createWSClient(this)
    return this.subscriptionClient
  }

  fetchFunction: FetchFunction = (request, variables, cacheConfig, uploadables) => {
    // useDeleteUserMutation is required to unset the cookie
    // ReAuth mutations are required to set a new auth cookie
    const isAuth =
      request.name.startsWith('Atmosphere') ||
      request.name === 'useDeleteUserMutation' ||
      request.name === 'ReAuthWithGoogleMutation' ||
      request.name === 'ReAuthWithMicrosoftMutation' ||
      request.name === 'ReAuthWithPasswordMutation'
    const useHTTP = !!uploadables || !this.authObj || !this.isSocketConnected || isAuth
    if (useHTTP) {
      const traceparent = makeTraceparent()
      const traceId = traceparent.split('-')[1]
      addBreadcrumb('operation', `${request.operationKind} ${request.name}`, traceId)
      const abortController = new AbortController()
      const postOperation = () =>
        fetch('/graphql', {
          method: 'POST',
          signal: abortController.signal,
          headers: {
            accept: 'multipart/mixed, application/json',
            traceparent,
            'x-parabol-session-id': getTabSessionId(),
            ...(!uploadables && {['content-type']: 'application/json'})
          },
          body: uploadables
            ? toFormData(request, variables, uploadables)
            : JSON.stringify({
                docId: request.id,
                variables
              })
        })
      const isQuery = request.operationKind === 'query'
      const isMutation = request.operationKind === 'mutation'
      const postRetryingDroppedQuery = async () => {
        const res = await postOperation()
        if (isQuery && DROPPED_CONNECTION_STATUSES.has(res.status)) return postOperation()
        return res
      }
      const response = postRetryingDroppedQuery()
      return Observable.create<GraphQLResponse>((sink) => {
        response
          .then(async (res) => {
            if (!res.ok) {
              reportClientWarning(
                'GraphQLHttpError',
                `${request.name} got HTTP ${res.status}`,
                traceId
              )
              sink.error(new Error(`HTTP ${res.status}: ${res.statusText}`))
              return
            }
            const contentType = res.headers.get('content-type') ?? ''
            if (contentType.includes('multipart/mixed')) {
              const boundary = contentType.match(/boundary="?([^";]+)"?/)?.[1] ?? '-'
              // a delimiter starts its own line, and JSON escapes line breaks, so a boundary inside a payload's text can't end the part
              const delimiter = `\r\n--${boundary}`
              const reader = res.body!.getReader()
              const decoder = new TextDecoder()
              let buffer = ''
              try {
                while (true) {
                  const {done, value} = await reader.read()
                  if (done) break
                  buffer += decoder.decode(value, {stream: true})
                  const parts = buffer.split(delimiter)
                  buffer = parts.pop() ?? ''
                  for (const part of parts) {
                    if (!part.trim() || part.trim() === '--') continue
                    const sepIdx = part.indexOf('\r\n\r\n')
                    if (sepIdx === -1) continue
                    const body = part.slice(sepIdx + 4).trim()
                    if (!body) continue
                    let parsed
                    try {
                      parsed = JSON.parse(body)
                    } catch {
                      // a dropped part would finish the query with its data missing, and the page would crash wherever it read it
                      sink.error(new Error(`${request.name} got a multipart part that is not JSON`))
                      return
                    }
                    const isIncremental = Array.isArray(parsed.incremental)
                    const payloads = isIncremental
                      ? parsed.incremental.map((item: object) => ({
                          ...item,
                          hasNext: parsed.hasNext
                        }))
                      : [parsed]
                    for (const payload of payloads) {
                      reportUnexpectedGraphQLErrors(payload.errors, request.name, traceId)
                      rememberServerErrors(payload.errors)
                      const serverError = toServerError(
                        payload,
                        isMutation && !isIncremental,
                        traceId
                      )
                      if (serverError) {
                        sink.error(serverError)
                        return
                      }
                      sink.next(payload)
                    }
                    if (!parsed.hasNext) {
                      sink.complete()
                      return
                    }
                  }
                }
              } finally {
                reader.releaseLock()
              }
              sink.complete()
            } else {
              try {
                const result = await res.json()
                reportUnexpectedGraphQLErrors(result.errors, request.name, traceId)
                rememberServerErrors(result.errors)
                const serverError = toServerError(result, isMutation, traceId)
                if (serverError) {
                  sink.error(serverError)
                  return
                }
                sink.next(result)
                sink.complete()
              } catch (e) {
                sink.error(e instanceof Error ? e : new Error('Invalid JSON response'))
              }
            }
          })
          .catch((e: unknown) => {
            sink.error(e instanceof Error ? e : new Error(String(e)))
          })
        // relay unsubscribes once nothing needs the result, like a query whose component went away
        return () => abortController.abort()
      })
    }
    return this.fetchOrSubscribe(request, variables, cacheConfig)
  }
  fetchOrSubscribe = (
    operation: RequestParameters,
    variables: Variables,
    _cacheConfig: CacheConfig
  ) => {
    return Observable.create<GraphQLResponse>((sink) => {
      const traceparent = makeTraceparent()
      const traceId = traceparent.split('-')[1]
      addBreadcrumb('operation', `${operation.operationKind} ${operation.name}`, traceId)
      const isSubscription = operation.operationKind === 'subscription'
      const subKey = Atmosphere.getKey(operation.name, variables)
      const _next = sink.next
      const _error = sink.error
      sink.error = (error: Error | Error[] | CloseEvent | PayloadError) => {
        if (Array.isArray(error)) {
          const invalidSessionError = error.find(
            (e) => (e as PayloadError).extensions?.code === 'SESSION_INVALIDATED'
          )
          if (invalidSessionError) {
            this.invalidateSession(invalidSessionError.message)
          } else {
            reportUnexpectedGraphQLErrors(error, operation.name, traceId)
            rememberServerErrors(error)
            _error(new GraphQLServerError(error, traceId))
          }
        } else if (error instanceof CloseEvent) {
          // convert to an error so subscribers only have to worry about handling Error types
          _error(new Error(error.reason))
        } else {
          _error(error)
        }
      }
      sink.next = (value: any) => {
        if (Array.isArray(value.incremental)) {
          for (const item of value.incremental) {
            reportUnexpectedGraphQLErrors(item.errors, operation.name, traceId)
            rememberServerErrors(item.errors)
            const serverError = toServerError(item, false, traceId)
            if (serverError) {
              _error(serverError)
              return
            }
            _next({...item, hasNext: value.hasNext})
          }
          return
        }
        const {data, errors} = value
        reportUnexpectedGraphQLErrors(errors, operation.name, traceId)
        rememberServerErrors(errors)
        // Relay ends an operation that gets no data, so a subscription skips the event and keeps listening
        if (!data && isSubscription) return
        const serverError = toServerError(value, operation.operationKind === 'mutation', traceId)
        if (serverError) {
          _error(serverError)
          return
        }
        const subscriptionName = data ? Object.keys(data)[0] : undefined
        const nullObj = this.subscriptionInterfaces[subscriptionName!]
        const nextObj =
          nullObj && subscriptionName
            ? {
                ...value,
                data: {
                  ...data,
                  [subscriptionName]: {
                    ...nullObj,
                    ...data[subscriptionName]
                  }
                }
              }
            : value
        const heldMessages = isSubscription ? this.heldSubscriptionMessages.get(subKey) : undefined
        if (heldMessages) {
          heldMessages.push(() => _next(nextObj))
          return
        }
        _next(nextObj)
      }
      return this.getSubscriptionClient().subscribe(
        {
          operationName: operation.name,
          query: '',
          docId: operation.id,
          variables,
          extensions: isSubscription ? {traceparent, ackId: subKey} : {traceparent}
        } as any,
        sink as any
      )
    })
  }

  fetchQuery = async <T extends OperationType>(
    taggedNode: GraphQLTaggedNode,
    variables: Variables = {},
    cacheConfig?: {
      networkCacheConfig?: CacheConfig
      fetchPolicy?: FetchQueryFetchPolicy
    }
  ) => {
    try {
      const res = await fetchQuery<T>(
        this,
        taggedNode,
        variables,
        cacheConfig ?? {
          fetchPolicy: 'store-or-network'
        }
      ).toPromise()
      return res!
    } catch (e) {
      return e as Error
    }
  }
  registerCookieListener = (global: Window) => {
    const authToken = getAuthCookie(global)
    this.setAuthToken(authToken)

    return onAuthCookieChange(global, (newToken) => {
      this.setAuthToken(newToken)
    })
  }

  private validateImpersonation = async (iat: number) => {
    const isAnotherParabolTabOpen = async () => {
      const askOtherTabs = new Promise((resolve) => {
        if (!this.tabCheckChannel) {
          this.tabCheckChannel = new BroadcastChannel('tabCheck')
        }
        const tabCheckChannel = this.tabCheckChannel
        tabCheckChannel.onmessage = (event) => {
          if (event.data === 'ping') {
            tabCheckChannel.postMessage('pong')
          }
          if (event.data === 'pong') {
            resolve(true)
          }
        }
        tabCheckChannel.postMessage('ping')
      })
      return Promise.race([sleep(300), askOtherTabs])
    }
    // impersonation token must be < 10 seconds old (ie log them out automatically)
    const justOpened = iat > Date.now() / 1000 - 10

    const anotherTabIsOpen = await isAnotherParabolTabOpen()
    if (anotherTabIsOpen || justOpened) return
    this.invalidateSession('Removing impersonate token')
  }

  private setAuthToken = async (authToken: string | null | undefined) => {
    if (!authToken) {
      this.authObj = null
      return
    }
    try {
      this.authObj = jwtDecode(authToken)
    } catch {
      this.authObj = null
    }

    if (!this.authObj) return
    const {exp, sub: viewerId, rol, iat} = this.authObj
    if (rol === 'impersonate') {
      this.viewerId = viewerId
      return this.validateImpersonation(iat)
    }
    if (exp < Date.now() / 1000) {
      this.invalidateSession('Your session has expired. Please log in again.')
    } else {
      this.viewerId = viewerId!
    }
  }

  /*
   * Starts the subscription when the first caller retains it, and stops it once every caller has released it and
   * keepWarmMs has passed with nobody retaining it again, so a page that remounts keeps listening without a gap
   */
  retainSubscription(
    subscription: SubscriptionRequestor,
    variables: Variables,
    router: {navigate: NavigateFn},
    keepWarmMs = 0
  ) {
    const subKey = Atmosphere.getKey(subscription.key, variables)
    let retained = this.retainedSubscriptions.get(subKey)
    if (retained) {
      window.clearTimeout(retained.releaseTimer)
      retained.retainCount++
    } else {
      retained = {disposable: subscription(this, variables, router), retainCount: 1}
      this.retainedSubscriptions.set(subKey, retained)
    }
    const thisRetain = retained
    let isReleased = false
    return () => {
      if (isReleased) return
      isReleased = true
      thisRetain.retainCount--
      if (thisRetain.retainCount > 0) return
      thisRetain.releaseTimer = window.setTimeout(() => {
        if (this.retainedSubscriptions.get(subKey) !== thisRetain) return
        this.retainedSubscriptions.delete(subKey)
        thisRetain.disposable.dispose()
      }, keepWarmMs)
    }
  }

  isSubscribed(subKey: string) {
    return this.retainedSubscriptions.has(subKey)
  }

  /*
   * keeps the subscription's messages from relay until the returned release is called, or MAX_SUBSCRIPTION_HOLD passes,
   * which then hands them over in the order they arrived. A newer hold on the same subscription drops this one's messages
   */
  holdSubscription(subKey: string) {
    const heldMessages: (() => void)[] = []
    this.heldSubscriptionMessages.set(subKey, heldMessages)
    const release = () => {
      window.clearTimeout(releaseTimeout)
      if (this.heldSubscriptionMessages.get(subKey) !== heldMessages) return
      this.heldSubscriptionMessages.delete(subKey)
      heldMessages.forEach((deliver) => deliver())
    }
    const releaseTimeout = window.setTimeout(release, MAX_SUBSCRIPTION_HOLD)
    return release
  }

  /*
   * register the field name for this subscription so we know who handles it
   *
   * @returns the subscriptions field name, used for defining onNext and update handlers
   */
  registerSubscription(subscriptionRequest: GraphQLTaggedNode) {
    const request: ConcreteRequest = (subscriptionRequest as any).default ?? subscriptionRequest
    const payload = request.operation.selections[0] as NormalizationLinkedField
    const {selections, name} = payload
    const nullObj = Object.fromEntries(selections.map(({name}: any) => [name, null]))
    this.subscriptionInterfaces[name] = nullObj
    return name
  }
  // the server ended the subscription, so the next caller to retain it must start it again
  unregisterSub(name: string, variables: Variables) {
    this.retainedSubscriptions.delete(Atmosphere.getKey(name, variables))
  }
  invalidateSession(reason: string) {
    commitMutation<AtmosphereSignOutMutation>(this, {
      mutation: signOutMutation,
      variables: {},
      onCompleted: (_res, _err) => {
        this.setAuthToken(null)
        this.eventEmitter.emit('addSnackbar', {
          key: 'logOutJWT',
          message: reason,
          autoDismiss: 5
        })
        this.close()
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
      }
    })
  }
  refreshSession(onCompleted?: () => void) {
    commitMutation<AtmosphereSignOutMutation>(this, {
      mutation: refreshSessionMutation,
      variables: {},
      onCompleted
    })
  }
  close() {
    this.retainedSubscriptions.forEach(({disposable, releaseTimer}) => {
      window.clearTimeout(releaseTimer)
      disposable.dispose()
    })
    this.retainedSubscriptions.clear()
    // remove all records
    ;(this.getStore().getSource() as any).clear()
    this.authObj = null
    this.viewerId = null!
    // disposing a socket that never finished connecting rejects, and it is closing either way
    Promise.resolve(this.subscriptionClient?.dispose()).catch(noop)
    this.subscriptionClient = undefined
    this.isSocketConnected = false
    // fire-and-forget: clearing the local page data is best-effort before the page redirects
    void Promise.all([...Atmosphere.closeHandlers].map((closeHandler) => closeHandler())).then(
      deletePageDatabases
    )
  }
}
