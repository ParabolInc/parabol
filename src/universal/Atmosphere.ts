import GQLTrebuchetClient, {
  GQLHTTPClient,
  OperationPayload
} from '@mattkrick/graphql-trebuchet-client'
import getTrebuchet, {SocketTrebuchet, SSETrebuchet} from '@mattkrick/trebuchet-client'
import EventEmitter from 'eventemitter3'
import jwtDecode from 'jwt-decode'
import {requestSubscription} from 'react-relay'
import {
  CacheConfig,
  Environment,
  // @ts-ignore
  getRequest,
  GraphQLSubscriptionConfig,
  Network,
  RecordSource,
  Store,
  Variables
} from 'relay-runtime'
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription'
import {APP_TOKEN_KEY, NEW_AUTH_TOKEN} from 'universal/utils/constants'
import handlerProvider from 'universal/utils/relay/handlerProvider'
import {IAuthToken} from './types/graphql'
// import sleep from 'universal/utils/sleep'

const defaultErrorHandler = (err: any) => {
  console.error('Captured error:', err)
}

interface QuerySubscription {
  subKey: string
  queryKey: string
  queryFetcher: QueryFetcher
}

interface Subscriptions {
  [subKey: string]: ReturnType<GQLTrebuchetClient['subscribe']>
}

interface Operation {
  name: string
  text: string
}

interface QueryFetcher {
  readyToGC: () => boolean
  dispose: () => void
  flagForGC: () => void
}

type SubCreator = (
  atmosphere: Atmosphere,
  queryVariables: Variables | undefined,
  subParams
) => GraphQLSubscriptionConfig

const noop = (): any => {
  /* noop */
}

export default class Atmosphere extends Environment {
  static getKey = (name: string, variables: Variables | undefined) => {
    return JSON.stringify({name, variables})
  }
  _network: Network
  _store!: Store

  transport!: GQLHTTPClient | GQLTrebuchetClient
  authToken: string | null = null
  authObj: IAuthToken | null = null
  querySubscriptions: Array<QuerySubscription> = []
  subscriptions: Subscriptions = {}
  eventEmitter = new EventEmitter()
  upgradeTransportPromise: Promise<void> | null = null
  viewerId: string | null = null
  userId: string | null = null // DEPRECATED
  constructor () {
    super({store: new Store(new RecordSource()), handlerProvider, network: Network.create(noop)})

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
    subscriptions: Array<SubCreator>,
    subParams: any,
    queryVariables: Variables | undefined,
    queryFetcher: QueryFetcher
  ) => {
    const subConfigs = subscriptions.map((subCreator) =>
      subCreator(this, queryVariables, subParams)
    )
    await this.upgradeTransport()
    const newQuerySubs = subConfigs.map((config) => {
      const {subscription, variables = {}} = config
      const {name} = getRequest(subscription)
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
    const {name, text} = operation
    const subKey = Atmosphere.getKey(name, variables)
    await this.upgradeTransport()
    this.subscriptions[subKey] = (this.transport as GQLTrebuchetClient).subscribe(
      {query: text, variables},
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
    const {text: query} = getRequest(NewAuthTokenSubscription().subscription)
    const transport = this.transport as GQLTrebuchetClient
    transport.operations[NEW_AUTH_TOKEN] = {
      id: NEW_AUTH_TOKEN,
      payload: {query},
      observer: {
        onNext: (payload) => {
          this.setAuthToken(payload.authToken)
        },
        onCompleted: noop,
        onError: noop
      }
    }
  }

  handleFetch = async (operation: Operation, variables?: Variables) => {
    // await sleep(100)
    return this.transport.fetch({query: operation.text, variables})
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
      this.viewerId = viewerId
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
        const associatedQueries = this.querySubscriptions.filter(
          ({subKey}) => subKey === subKeyToRemove
        )
        // these queries are no longer supported, so drop them
        associatedQueries.forEach(({queryFetcher}: {queryFetcher: QueryFetcher}) => {
          if (queryFetcher.readyToGC()) {
            queryFetcher.dispose()
          } else {
            queryFetcher.flagForGC()
          }
        })
        const queryKeys = associatedQueries.map(({queryKey}) => queryKey)
        this.unregisterQuery(queryKeys)
      }
    }
  }

  unregisterQuery = (maybeQueryKeys: string | Array<string>) => {
    const queryKeys = Array.isArray(maybeQueryKeys) ? maybeQueryKeys : [maybeQueryKeys]

    // for each query that is no longer 100% supported, find the subs that power them
    const peerSubs = this.querySubscriptions.filter(({queryKey}) => queryKeys.includes(queryKey))

    // get a unique list of the subs to release & maybe unsub
    const peerSubKeys = Array.from(new Set(peerSubs.map(({subKey}) => subKey)))

    peerSubKeys.forEach((subKey) => {
      // for each peerSubKey, see if there exists a query that is not affected.
      const unaffectedQuery = this.querySubscriptions.find(
        (qs) => qs.subKey === subKey && !queryKeys.includes(qs.queryKey)
      )
      if (!unaffectedQuery) {
        const disposable = this.subscriptions[subKey]
        disposable && disposable.unsubscribe()
      }
    })

    this.querySubscriptions = this.querySubscriptions.filter((qs) => {
      return !peerSubKeys.includes(qs.subKey) || !queryKeys.includes(qs.queryKey)
    })
  }

  close () {
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
    this.viewerId = null
    this.userId = null // DEPRECATED
    if (this.transport instanceof GQLTrebuchetClient) {
      this.transport.close()
    }
  }
}
