import GQLTrebuchetClient, {
  GQLHTTPClient,
  OperationPayload
} from '@mattkrick/graphql-trebuchet-client'
import getTrebuchet, {SocketTrebuchet, SSETrebuchet} from '@mattkrick/trebuchet-client'
import {InviteToTeamMutation_notification} from '__generated__/InviteToTeamMutation_notification.graphql'
import EventEmitter from 'eventemitter3'
import jwtDecode from 'jwt-decode'
import {requestSubscription} from 'react-relay'
import {
  CacheConfig,
  Environment,
  getRequest,
  GraphQLResponse,
  GraphQLSubscriptionConfig,
  Network,
  ObservableFromValue,
  RecordSource,
  RequestParameters,
  Store,
  Variables
} from 'relay-runtime'
import StrictEventEmitter from 'strict-event-emitter-types'
import LinearPublishQueue from 'universal/LinearPublishQueue'
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription'
import {APP_TOKEN_KEY, NEW_AUTH_TOKEN} from 'universal/utils/constants'
import handlerProvider from 'universal/utils/relay/handlerProvider'
import {MasonryDragEndPayload} from './components/PhaseItemMasonry'
import {IAuthToken} from './types/graphql'

// import sleep from 'universal/utils/sleep'

const defaultErrorHandler = (err: any) => {
  console.error('Captured error:', err)
}

interface QuerySubscription {
  // subKey is undefined is there are no subscriptions but we have a ttl in the cacheConfig
  subKey?: string
  queryKey: string
  queryFetcher: QueryFetcher
}

interface Subscriptions {
  [subKey: string]: ReturnType<GQLTrebuchetClient['subscribe']>
}

interface Operation {
  id?: string
  name: string
  text?: string
}

interface QueryFetcher {
  dispose: () => void
}

type SubCreator = (
  atmosphere: Atmosphere,
  queryVariables: Variables | undefined,
  subParams
) => GraphQLSubscriptionConfig<unknown>

const noop = (): any => {
  /* noop */
}

interface Toast {
  level: 'info' | 'warning' | 'error' | 'success'
  autoDismiss?: number
  title: string
  message: string
}

interface AtmosphereEvents {
  addToast: Toast
  removeToast: (toast: string | any) => void
  endDraggingReflection: MasonryDragEndPayload
  inviteToTeam: NonNullable<InviteToTeamMutation_notification['teamInvitationNotification']>
  meetingSidebarCollapsed: boolean
  newSubscriptionClient: void
  removeGitHubRepo: void
}

const store = new Store(new RecordSource())
export default class Atmosphere extends Environment {
  static getKey = (name: string, variables: Variables | undefined) => {
    return JSON.stringify({name, variables})
  }
  _network: Network

  transport!: GQLHTTPClient | GQLTrebuchetClient
  authToken: string | null = null
  authObj: IAuthToken | null = null
  querySubscriptions: Array<QuerySubscription> = []
  queryTimeouts: {
    [queryKey: string]: number
  } = {}
  subscriptions: Subscriptions = {}
  eventEmitter: StrictEventEmitter<EventEmitter, AtmosphereEvents> = new EventEmitter()
  upgradeTransportPromise: Promise<void> | null = null
  // it's only null before login, so it's just a little white lie
  viewerId: string = null!
  userId: string | null = null // DEPRECATED
  constructor () {
    super({
      store,
      handlerProvider,
      network: Network.create(noop),
      // @ts-ignore
      publishQueue: new LinearPublishQueue(store, handlerProvider)
    })
    // @ts-ignore we should update the relay-runtime typings, this.handleSubscribe should be able to return a promise
    this._network = Network.create(this.handleFetch, this.handleSubscribe)
    this.transport = new GQLHTTPClient(this.fetchHTTP)
  }

  fetchPing = async (connectionId?: string) => {
    return fetch('/sse-ping', {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        'x-correlation-id': connectionId || ''
      }
    })
  }

  fetchHTTP = async (body: string, connectionId?: string) => {
    const res = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: this.authToken ? `Bearer ${this.authToken}` : '',
        'x-correlation-id': connectionId || ''
      },
      body
    })
    const contentTypeHeader = res.headers.get('content-type') || ''
    const contentType = contentTypeHeader.toLowerCase()
    return contentType.startsWith('application/json') ? res.json() : null
  }

  registerQuery = async (
    queryKey: string,
    queryFetcher: QueryFetcher,
    options: {
      subscriptions?: Array<SubCreator>
      subParams?: any
      queryVariables?: Variables | undefined
    } = {}
  ) => {
    window.clearTimeout(this.queryTimeouts[queryKey])
    delete this.queryTimeouts[queryKey]
    if (!options.subscriptions) {
      this.querySubscriptions.push({queryKey, queryFetcher})
      return
    }
    await this.upgradeTransport()
    const {subscriptions, queryVariables, subParams} = options
    const subConfigs = subscriptions.map((subCreator) =>
      subCreator(this, queryVariables, subParams)
    )
    const newQuerySubs = subConfigs.map((config) => {
      const {subscription, variables = {}} = config
      const request = getRequest(subscription)
      const name = request.params && request.params.name
      if (!name) throw new Error(`No name found for request ${request}`)
      const subKey = JSON.stringify({name, variables})
      const isRequested = Boolean(this.querySubscriptions.find((qs) => qs.subKey === subKey))
      if (!isRequested) {
        requestSubscription(this, {onError: defaultErrorHandler, ...config})
      }
      return {
        subKey,
        queryKey,
        queryFetcher
      }
    })
    this.querySubscriptions.push(...newQuerySubs)
  }

  handleSubscribe = async (
    operation: Operation,
    variables: OperationPayload['variables'] | undefined,
    _cacheConfig: CacheConfig,
    observer: any
  ) => {
    const {name, id: documentId} = operation
    const subKey = Atmosphere.getKey(name, variables)
    await this.upgradeTransport()
    this.subscriptions[subKey] = (this.transport as GQLTrebuchetClient).subscribe(
      {documentId, variables},
      observer
    )
    return this.makeDisposable(subKey)
  }

  trySockets = () => {
    const wsProtocol = window.location.protocol.replace('http', 'ws')
    const url = `${wsProtocol}//${window.location.host}/?token=${this.authToken}`
    return new SocketTrebuchet({url})
  }

  trySSE = () => {
    const url = `/sse/?token=${this.authToken}`
    return new SSETrebuchet({url, fetchData: this.fetchHTTP, fetchPing: this.fetchPing})
  }

  async promiseToUpgrade () {
    const trebuchets = [this.trySockets, this.trySSE]
    const trebuchet = await getTrebuchet(trebuchets)
    if (!trebuchet) throw new Error('Cannot connect!')
    this.transport = new GQLTrebuchetClient(trebuchet)
    this.addAuthTokenSubscriber()
    this.eventEmitter.emit('newSubscriptionClient')
  }

  async upgradeTransport () {
    // wait until the first and only upgrade has completed
    if (!this.upgradeTransportPromise) {
      this.upgradeTransportPromise = this.promiseToUpgrade()
    }
    return this.upgradeTransportPromise
  }

  addAuthTokenSubscriber () {
    if (!this.authToken) throw new Error('No Auth Token provided!')
    const {params} = getRequest(NewAuthTokenSubscription().subscription)
    const documentId = params && params.id
    if (!documentId) throw new Error(`No documentId found for request params ${params}`)
    const transport = this.transport as GQLTrebuchetClient
    transport.operations[NEW_AUTH_TOKEN] = {
      id: NEW_AUTH_TOKEN,
      payload: {documentId},
      observer: {
        onNext: (payload) => {
          this.setAuthToken(payload.authToken)
        },
        onCompleted: noop,
        onError: noop
      }
    }
  }

  handleFetch = async (
    request: RequestParameters,
    variables: Variables,
    _cacheConfig?: CacheConfig
  ): Promise<ObservableFromValue<GraphQLResponse>> => {
    // await sleep(500)
    const field = request.id ? 'documentId' : 'query'
    const data = request.id || request.text
    // @ts-ignore
    return this.transport.fetch({[field]: data, variables})
  }

  getAuthToken = (global: Window) => {
    if (!global) return
    const authToken = global.localStorage.getItem(APP_TOKEN_KEY)
    this.setAuthToken(authToken)
  }

  setAuthToken = (authToken: string | null) => {
    this.authToken = authToken
    if (!authToken) return
    this.authObj = jwtDecode(authToken)
    if (!this.authObj) return
    const {exp, sub: viewerId} = this.authObj
    if (exp < Date.now() / 1000) {
      this.authToken = null
      this.authObj = null
      window.localStorage.removeItem(APP_TOKEN_KEY)
    } else {
      this.viewerId = viewerId!
      window.localStorage.setItem(APP_TOKEN_KEY, authToken)
      // deprecated! will be removed soon
      this.userId = viewerId
    }
  }

  /*
   * When a subscription encounters an error, it affects the subscription itself,
   * the queries that depend on that subscription to stay valid,
   * and the peer subscriptions that also keep that component valid.
   *
   * For example, in my app component A subscribes to 1,2,3, component B subscribes to 1, component C subscribes to 2,4.
   * If subscription 1 fails, then the data for component A and B get released on unmount (or immediately, if already unmounted)
   * Subscription 1 gets unsubscribed,
   * Subscription 2 does not because it is used by component C.
   * Subscription 3 does because no other component depends on it.
   * Subscription 4 does not because it is a k > 1 nearest neighbor
   */
  makeDisposable = (subKeyToRemove: string) => {
    return {
      dispose: () => {
        // get every query that is powered by this subscription
        const queryKeys = this.querySubscriptions
          .filter(({subKey}) => subKey === subKeyToRemove)
          .map(({queryKey}) => queryKey)
        this.unregisterQuery(queryKeys)
      }
    }
  }

  unregisterQuery (maybeQueryKeys: string | Array<string>, delay?: number) {
    if (delay && delay > 0) {
      if (typeof maybeQueryKeys !== 'string') throw new Error('must not use arr')
      this.queryTimeouts[maybeQueryKeys] = window.setTimeout(() => {
        this.unregisterQuery(maybeQueryKeys)
      }, delay)
      return
    }

    if (typeof maybeQueryKeys === 'string' && this.queryTimeouts[maybeQueryKeys]) {
      window.clearTimeout(this.queryTimeouts[maybeQueryKeys])
      delete this.queryTimeouts[maybeQueryKeys]
    }

    const queryKeys = Array.isArray(maybeQueryKeys) ? maybeQueryKeys : [maybeQueryKeys]

    // for each query that is no longer 100% supported, find the subs that power them
    const peerSubs = this.querySubscriptions.filter(({queryKey}) => queryKeys.includes(queryKey))

    peerSubs.forEach(({queryFetcher}) => {
      queryFetcher.dispose()
    })

    // get a unique list of the subs to release & maybe unsub
    const peerSubKeys = Array.from(new Set(peerSubs.map(({subKey}) => subKey)))

    peerSubKeys.forEach((subKey) => {
      if (!subKey) return
      // for each peerSubKey, see if there exists a query that is not affected.
      const unaffectedQuery = this.querySubscriptions.find(
        (qs) => qs.subKey === subKey && !queryKeys.includes(qs.queryKey)
      )
      if (!unaffectedQuery) {
        const disposable = this.subscriptions[subKey]
        // tell the server to unsub
        disposable && disposable.unsubscribe()
      }
    })

    this.querySubscriptions = this.querySubscriptions.filter((qs) => {
      return !peerSubKeys.includes(qs.subKey) || !queryKeys.includes(qs.queryKey)
    })
  }

  close () {
    this.querySubscriptions.forEach((querySub) => {
      this.unregisterQuery(querySub.queryKey)
    })
    // remove all records
    this.getStore()
      .getSource()
      .clear()
    this.upgradeTransportPromise = null
    this.authObj = null
    this.authToken = null
    this.transport = new GQLHTTPClient(this.fetchHTTP)
    this.querySubscriptions = []
    this.subscriptions = {}
    this.viewerId = null!
    this.userId = null // DEPRECATED
    if (this.transport instanceof GQLTrebuchetClient) {
      this.transport.close()
    }
  }
}
