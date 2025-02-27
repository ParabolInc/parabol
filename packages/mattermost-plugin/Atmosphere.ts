import {Variables} from 'react-relay'
import {
  Environment,
  GraphQLResponse,
  Network,
  Observable,
  RecordSource,
  RelayFeatureFlags,
  RelayFieldLogger,
  RequestParameters
} from 'relay-runtime'
import RelayModernStore from 'relay-runtime/lib/store/RelayModernStore'
import {v4 as uuid} from 'uuid'

import {AnyAction, Store} from '@reduxjs/toolkit'
import {Client4} from 'mattermost-redux/client'
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users'
import {GlobalState} from 'mattermost-redux/types/store'
import {Sink} from 'relay-runtime/lib/network/RelayObservable'
import {login as onLogin} from './reducers'
import {authToken as getAuthToken} from './selectors'
RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true

type State = {
  id: number
  connectionId: string
  serverUrl: string
  store: Store<GlobalState, AnyAction>
  subscriptions: Record<
    string,
    {
      sink: Sink<any>
    }
  >
}

const decode = (msg: string) => {
  const parsedData = JSON.parse(msg)
  if (!Array.isArray(parsedData)) return {message: parsedData}
  const [message, mid] = parsedData
  return {message, mid}
}

const fetchGraphQL = (state: State) => (params: RequestParameters, variables: Variables) => {
  const {serverUrl, store, connectionId, id} = state
  const authToken = getAuthToken(store.getState())
  const response = fetch(
    serverUrl + '/graphql',
    Client4.getOptions({
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-application-authorization': authToken ? `Bearer ${authToken}` : '',
        'x-correlation-id': connectionId || ''
      },
      body: JSON.stringify({
        id,
        type: 'start',
        payload: {
          documentId: params.id,
          query: params.text,
          variables
        }
      })
    })
  )
  ++state.id

  return Observable.from(
    response.then(async (data) => {
      const json = await data.json()
      return json.payload
    })
  )
}

const subscribeGraphQL = (state: State) => (request: RequestParameters, variables: Variables) => {
  return Observable.create<GraphQLResponse>((sink) => {
    /*
    const _next = sink.next
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
      _next(value)
    }
          */

    const {serverUrl, store, connectionId, id, subscriptions} = state
    const authToken = getAuthToken(store.getState())
    fetch(
      serverUrl + '/graphql',
      Client4.getOptions({
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-application-authorization': authToken ? `Bearer ${authToken}` : '',
          'x-correlation-id': connectionId || ''
        },
        body: JSON.stringify({
          id,
          type: 'start',
          payload: {
            documentId: request.id,
            query: request.text,
            variables
          }
        })
      })
    )
    subscriptions[id] = {
      sink
    }
    ++state.id
  })
}

const login = (state: State) => async () => {
  const {serverUrl, store, connectionId} = state
  const response = await fetch(
    serverUrl + '/login',
    Client4.getOptions({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': connectionId || ''
      }
    })
  )
  const body = await response.json()
  store.dispatch(onLogin(body.authToken))
}

const relayFieldLogger: RelayFieldLogger = (event) => {
  if (event.kind === 'relay_resolver.error') {
    console.warn(`Resolver error encountered in ${event.owner}.${event.fieldPath}`)
    console.warn(event.error)
  }
}

export type ResolverContext = {
  serverUrl: string
  store: Store<GlobalState, AnyAction>
}

export class Atmosphere extends Environment {
  state: State
  login: () => Promise<void>

  constructor(serverUrl: string, reduxStore: Store<GlobalState, AnyAction>) {
    const currentUser = getCurrentUser(reduxStore.getState())
    const {id} = currentUser

    const state = {
      id: 1,
      connectionId: `${id}/${uuid()}`,
      serverUrl,
      store: reduxStore,
      authToken: null,
      subscriptions: {}
    }

    const network = Network.create(fetchGraphQL(state), subscribeGraphQL(state))
    const relayStore = new RelayModernStore(new RecordSource(), {
      resolverContext: {
        store: reduxStore,
        serverUrl
      }
    })
    super({
      store: relayStore,
      network,
      relayFieldLogger
    })
    this.state = state
    // bind it here to avoid this == undefined errors
    this.login = login(state)
  }

  onMessage(data: string) {
    const {message} = decode(data)
    const {id, type, payload} = message
    const {subscriptions} = this.state
    const subscription = subscriptions[id]
    if (!subscription) return
    const {sink} = subscription
    switch (type) {
      case 'data':
        sink.next(payload)
        break
      case 'error':
        sink.error(payload)
        break
      case 'complete':
        sink.complete()
        break
    }
  }
}

/**
 * Creates a new Relay environment instance for managing (fetching, storing) GraphQL data.
 */
export function createEnvironment(serverUrl: string, reduxStore: Store<GlobalState, AnyAction>) {
  return new Atmosphere(serverUrl, reduxStore)
}
