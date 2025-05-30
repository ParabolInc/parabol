import {Variables} from 'react-relay'
import {
  Environment,
  Network,
  Observable,
  RecordSource,
  RelayFeatureFlags,
  RelayFieldLogger,
  RequestParameters
} from 'relay-runtime'
import RelayModernStore from 'relay-runtime/lib/store/RelayModernStore'

import {AnyAction, Store} from '@reduxjs/toolkit'
import {Client4} from 'mattermost-redux/client'
import {GlobalState} from 'mattermost-redux/types/store'
import {login as onLogin} from './reducers'
import {authToken as getAuthToken} from './selectors'
RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true

type State = {
  serverUrl: string
  store: Store<GlobalState, AnyAction>
}

const fetchGraphQL = (state: State) => (params: RequestParameters, variables: Variables) => {
  return Observable.create((sink) => {
    const {serverUrl, store} = state
    const authToken = getAuthToken(store.getState())
    const response = fetch(
      serverUrl + '/graphql',
      Client4.getOptions({
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-application-authorization': authToken ? `Bearer ${authToken}` : ''
        },
        body: JSON.stringify({
          docId: params.id,
          query: params.text,
          variables
        })
      })
    )

    response
      .then(async (data) => {
        const json = await data.json()
        sink.next(json)
        sink.complete()
      })
      .catch((error) => {
        sink.error(error)
        sink.complete()
      })
  })
}

const login = (state: State) => async () => {
  const {serverUrl, store} = state
  const response = await fetch(
    serverUrl + '/login',
    Client4.getOptions({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  )
  const body = await response.json()
  store.dispatch(onLogin(body.authToken))
  return !!body.authToken
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
  login: () => Promise<boolean>

  constructor(serverUrl: string, reduxStore: Store<GlobalState, AnyAction>) {
    const state = {
      serverUrl,
      store: reduxStore,
      authToken: null
    }

    const network = Network.create(fetchGraphQL(state))
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
}

/**
 * Creates a new Relay environment instance for managing (fetching, storing) GraphQL data.
 */
export function createEnvironment(serverUrl: string, reduxStore: Store<GlobalState, AnyAction>) {
  return new Atmosphere(serverUrl, reduxStore)
}
