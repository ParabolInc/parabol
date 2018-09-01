/* global fetch */
import jwtDecode from 'jwt-decode'
import {requestSubscription} from 'react-relay'
import {Environment, Network, RecordSource, Store} from 'relay-runtime'
import {APP_TOKEN_KEY, NEW_AUTH_TOKEN} from 'universal/utils/constants'
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription'
import EventEmitter from 'eventemitter3'
import handlerProvider from 'universal/utils/relay/handlerProvider'
import getTrebuchet, {SocketTrebuchet, SSETrebuchet} from '@mattkrick/trebuchet-client'
import GQLTrebuchetClient, {GQLHTTPClient} from '@mattkrick/graphql-trebuchet-client'

const defaultErrorHandler = (err) => {
  console.error('Captured error:', err)
}

export default class Atmosphere extends Environment {
  static getKey = (name, variables) => {
    return JSON.stringify({name, variables})
  }

  constructor () {
    // deal with Environment
    const store = new Store(new RecordSource())
    super({store, handlerProvider})
    this._network = Network.create(this.handleFetch, this.handleSubscribe)
    this.transport = new GQLHTTPClient(this.fetchHTTP)
    // now atmosphere
    this.authToken = undefined
    this.authObj = undefined
    this.querySubscriptions = []
    this.querySubscriptions = []
    this.subscriptions = {}
    this.eventEmitter = new EventEmitter()
  }

  fetchPing = async (connectionId) => {
    return fetch('/sse-ping', {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        'x-correlation-id': connectionId || ''
      }
    })
  }

  fetchHTTP = async (body, connectionId) => {
    const res = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${this.authToken}`,
        'x-correlation-id': connectionId || ''
      },
      body
    })
    if (
      res.headers
        .get('content-type')
        .toLowerCase()
        .startsWith('application/json')
    ) {
      return res.json()
    }
    return null
  }

  registerQuery = async (queryKey, subscriptions, subParams, queryVariables, queryFetcher) => {
    const subConfigs = subscriptions.map((subCreator) =>
      subCreator(this, queryVariables, subParams)
    )
    await this.upgradeTransport()
    const newQuerySubs = subConfigs.map((config) => {
      const {subscription, variables = {}} = config
      const {name} = subscription()
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

  handleSubscribe = async (operation, variables, cacheConfig, observer) => {
    const {name, text} = operation
    const subKey = Atmosphere.getKey(name, variables)
    await this.upgradeTransport()
    const disposable = this.transport.subscribe({query: text, variables}, observer)
    this.subscriptions[subKey] = disposable
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
    const {text: query} = NewAuthTokenSubscription().subscription()
    this.transport.operations[NEW_AUTH_TOKEN] = {
      payload: {query},
      observer: {
        onNext: (payload) => {
          this.setAuthToken(payload.authToken)
        },
        onCompleted: () => {},
        onError: () => {}
      }
    }
  }

  handleFetch = async (operation, variables) => {
    // await sleep(100)
    return this.transport.fetch({query: operation.text, variables})
  }

  getAuthToken = (global) => {
    if (!global) return
    const authToken = global.localStorage.getItem(APP_TOKEN_KEY)
    this.setAuthToken(authToken)
  }

  setAuthToken = (authToken) => {
    this.authToken = authToken
    if (!authToken) return
    this.authObj = jwtDecode(authToken)
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
  makeDisposable = (subKeyToRemove) => {
    return {
      dispose: () => {
        // get every query that is powered by this subscription
        const associatedQueries = this.querySubscriptions.filter(
          ({subKey}) => subKey === subKeyToRemove
        )
        // these queries are no longer supported, so drop them
        associatedQueries.forEach(({queryFetcher}) => {
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

  unregisterQuery = (maybeQueryKeys) => {
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
        this.subscriptions[subKey].unsubscribe()
      }
    })

    this.querySubscriptions = this.querySubscriptions.filter((qs) => {
      return !peerSubKeys.includes(qs.subKey) || !queryKeys.includes(qs.queryKey)
    })
  }

  close () {
    // race condition when logging out & the autoLogin
    this.authObj = null
    this.transport.close && this.transport.close()
  }
}
