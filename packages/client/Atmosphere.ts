import graphql from 'babel-plugin-relay/macro'
import EventEmitter from 'eventemitter3'
import type {Client} from 'graphql-ws'
import jwtDecode from 'jwt-decode'
import {type Disposable, commitMutation} from 'react-relay'
import type {RouterProps} from 'react-router'
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
  RecordSource,
  RelayFeatureFlags,
  type RequestParameters,
  Store,
  type UploadableMap,
  type Variables
} from 'relay-runtime'
import type StrictEventEmitter from 'strict-event-emitter-types'
import type {InviteToTeamMutation_notification$data} from './__generated__/InviteToTeamMutation_notification.graphql'
import type {AtmosphereSignOutMutation} from './__generated__/AtmosphereSignOutMutation.graphql'
import type {Snack, SnackbarRemoveFn} from './components/Snackbar'
import {providerManager} from './tiptap/providerManager'
import {createWSClient} from './utils/createWSClient'
import handlerProvider from './utils/relay/handlerProvider'
import sleep from './utils/sleep'
import {getAuthCookie, onAuthCookieChange} from './utils/authCookie'
import {AuthToken} from './types/AuthToken'

;(RelayFeatureFlags as any).ENABLE_RELAY_CONTAINERS_SUSPENSE = false
;(RelayFeatureFlags as any).ENABLE_PRECISE_TYPE_REFINEMENT = true

const signOutMutation = graphql`
  mutation AtmosphereSignOutMutation {
    signOut
  }
`

interface QuerySubscription {
  subKey: string
  queryKey: string
  disposable?: {unsubscribe: () => void}
}

interface Subscriptions {
  [subKey: string]: {unsubscribe: () => void}
}

export type SubscriptionRequestor = {
  (atmosphere: Atmosphere, variables: any, router: {history: RouterProps['history']}): Disposable
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
  inviteToTeam: (
    notification: NonNullable<InviteToTeamMutation_notification$data['teamInvitationNotification']>
  ) => void
  newSubscriptionClient: () => void
  removeGitHubRepo: () => void
}

const store = new Store(new RecordSource(), {gcReleaseBufferSize: 10000})

export default class Atmosphere extends Environment {
  static getKey = (name: string, variables: Variables | undefined) => {
    return JSON.stringify({name, variables})
  }
  _network: typeof Network
  authObj: AuthToken | null = null
  querySubscriptions: QuerySubscription[] = []
  queryTimeouts: {
    [queryKey: string]: number
  } = {}
  retries = new Set<() => void>()
  subscriptions: Subscriptions = {}
  // Our server only sends a single field per subscription, but relay requires every requested field
  // This object makes the server response whole without increasing the payload size
  subscriptionInterfaces = {} as Record<string, Record<string, null>>
  eventEmitter: StrictEventEmitter<EventEmitter, AtmosphereEvents> = new EventEmitter()
  queryCache = {} as {[key: string]: GraphQLResponse}
  // it's only null before login, so it's just a little white lie
  viewerId: string = null!
  tabCheckChannel?: BroadcastChannel
  subscriptionClient!: Awaited<ReturnType<typeof createWSClient>>
  connectWebsocketPromise: Promise<Client> | null = null
  constructor() {
    super({
      store,
      handlerProvider,
      network: Network.create(noop)
    })
    this._network = Network.create(this.fetchFunction, this.fetchOrSubscribe) as any
    providerManager.setAtmosphere(this)
  }

  private async connectWebsocket() {
    // wait until the first and only upgrade has completed
    if (!this.connectWebsocketPromise) {
      this.connectWebsocketPromise = createWSClient(this)
    }
    return this.connectWebsocketPromise
  }

  fetchFunction: FetchFunction = (request, variables, cacheConfig, uploadables) => {
    const useHTTP = !!uploadables || !this.authObj || !this.subscriptionClient
    if (useHTTP) {
      const response = fetch('/graphql', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          ...(!uploadables && {['content-type']: 'application/json'})
        },
        body: uploadables
          ? toFormData(request, variables, uploadables)
          : JSON.stringify({
              docId: request.id,
              variables
            })
      })
      return Observable.from(response.then((data) => data.json()))
    }
    return this.fetchOrSubscribe(request, variables, cacheConfig)
  }
  fetchOrSubscribe = (
    operation: RequestParameters,
    variables: Variables,
    _cacheConfig: CacheConfig
  ) => {
    return Observable.create<GraphQLResponse>((sink) => {
      const _next = sink.next
      const _error = sink.error
      sink.error = (error: Error | Error[] | CloseEvent) => {
        if (Array.isArray(error)) {
          const invalidSessionError = error.find(
            (e) => (e as any).extensions?.code === 'SESSION_INVALIDATED'
          )
          if (invalidSessionError) {
            this.invalidateSession(invalidSessionError.message)
          } else {
            _error(new Error(error[0]?.message ?? 'Unknown Error'))
          }
        } else if (error instanceof CloseEvent) {
          // convert to an error so subscribers only have to worry about handling Error types
          _error(new Error(error.reason))
        } else {
          _error(error)
        }
      }
      sink.next = (value: any) => {
        const {data} = value
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
        _next(nextObj)
      }
      ;(async () => {
        // waiting a tick prevents `client.subscribe` from creating 2 websocket instances
        try {
          await this.connectWebsocket()
        } catch {
          // errors are handled in the closed handler
          return
        }

        const unsubscribe = this.subscriptionClient.subscribe(
          {
            operationName: operation.name,
            query: '',
            docId: operation.id,
            variables
          } as any,
          sink as any
        )
        if (operation.operationKind === 'subscription') {
          const subKey = Atmosphere.getKey(operation.name, variables)
          this.subscriptions[subKey] = {unsubscribe}
        }
      })()
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
  getAuthToken = async (global: Window) => {
    const authToken = await getAuthCookie(global)
    this.setAuthToken(authToken)

    onAuthCookieChange(global, (newToken) => {
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
    // since this is async, useAuthRoute will have already run
    window.location.href = '/'
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

  registerQuery = async (
    queryKey: string,
    subscription: SubscriptionRequestor,
    variables: Variables,
    router: {history: RouterProps['history']}
  ) => {
    window.clearTimeout(this.queryTimeouts[queryKey])
    delete this.queryTimeouts[queryKey]
    const {key} = subscription
    // runtime error in case relay changes
    if (!key) throw new Error(`Missing name for sub`)
    const subKey = Atmosphere.getKey(key, variables)
    const isRequested = Boolean(this.querySubscriptions.find((qs) => qs.subKey === subKey))
    if (!isRequested) {
      subscription(this, variables, router)
    }
    this.querySubscriptions.push({queryKey, subKey})
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
  /*
   * When a subscription encounters an error, it affects the subscription itself,
   * the queries that depend on that subscription to stay valid,
   * and the peer subscriptions that also keep that component valid.
   *
   * For example, in my app component A subscribes to 1,2,3, component B subscribes to 1, component C subscribes to 2,4.
   * If subscription 1 fails, then the data for component A and B get removed from the queryCache, since it might be invalid now
   * Subscription 1 gets unsubscribed,
   * Subscription 2 does not because it is used by component C.
   * Subscription 3 does because no other component depends on it.
   * Subscription 4 does not because there is no overlap
   */
  scheduleUnregisterQuery(queryKey: string, delay: number) {
    if (this.queryTimeouts[queryKey]) return
    this.queryTimeouts[queryKey] = window.setTimeout(() => {
      this.unregisterQuery(queryKey)
    }, delay)
  }

  /*
   * removes the query & if the subscription is no longer needed, unsubscribes from it
   */
  unregisterQuery(queryKey: string) {
    window.clearTimeout(this.queryTimeouts[queryKey])
    delete this.queryTimeouts[queryKey]
    // for each query that is no longer 100% supported, find the subs that power them
    const rowsToRemove = this.querySubscriptions.filter((qs) => qs.queryKey === queryKey)
    // rowsToRemove.forEach((qsToRemove) => {
    // the query is no longer valid, nuke it
    // delete this.queryCache[qsToRemove.queryKey]
    // })
    const subsToRemove = Array.from(new Set<string>(rowsToRemove.map(({subKey}) => subKey)))
    this.querySubscriptions = this.querySubscriptions.filter((qs) => qs.queryKey !== queryKey)
    subsToRemove.forEach((subKey) => {
      const unaffectedSub = this.querySubscriptions.find((qs) => qs.subKey === subKey)
      if (!unaffectedSub) {
        this.subscriptions[subKey]?.unsubscribe()
      }
    })
  }

  /* When the server wants to end the subscription, it sends a GQL_COMPLETE payload
   * GQL_Trebuchet cleans itself up & calls the onCompleted observer
   * unregisterSub should therefore be called in each subs onCompleted callback
   */
  unregisterSub(name: string, variables: Variables) {
    const subKey = Atmosphere.getKey(name, variables)
    delete this.subscriptions[subKey]
    const rowsToRemove = this.querySubscriptions.filter((qs) => qs.subKey === subKey)
    rowsToRemove.forEach((qsToRemove) => {
      // the query is no longer valid, nuke it
      delete this.queryCache[qsToRemove.queryKey]
    })
    this.querySubscriptions = this.querySubscriptions.filter((qs) => qs.subKey !== subKey)
    // does not remove other subs because they may still do interesting things like pop toasts
  }
  invalidateSession(reason: string) {
    // clearing the auth token will cause the mutation to be sent via http
    this.setAuthToken(null)
    commitMutation<AtmosphereSignOutMutation>(this, {
      mutation: signOutMutation,
      variables: {},
      onCompleted: (_res, _err) => {
        this.eventEmitter.emit('addSnackbar', {
          key: 'logOutJWT',
          message: reason,
          autoDismiss: 5
        })
        this.close()
        setTimeout(() => {
          window.location.href = '/'
        }, 5000)
      }
    })
  }
  close() {
    // TODO
    this.querySubscriptions.forEach((querySub) => {
      this.unregisterQuery(querySub.queryKey)
    })
    // remove all records
    ;(this.getStore().getSource() as any).clear()
    this.authObj = null
    this.querySubscriptions = []
    this.subscriptions = {}
    this.viewerId = null!
    this.connectWebsocketPromise = null
    providerManager.close()
  }
}
