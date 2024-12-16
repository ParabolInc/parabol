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
RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true

type State = {
  authToken: string | null
  serverUrl: string
  store: Store<GlobalState, AnyAction>
}

const fetchFunction = (state: State) => (params: RequestParameters, variables: Variables) => {
  const {serverUrl, authToken} = state
  const response = fetch(
    serverUrl,
    Client4.getOptions({
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-application-authorization': authToken ? `Bearer ${authToken}` : ''
      },
      body: JSON.stringify({
        type: 'start',
        payload: {
          query: params.text,
          variables
        }
      })
    })
  )

  return Observable.from(
    response.then(async (data) => {
      const json = await data.json()
      return json.payload
    })
  )
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

  constructor(serverUrl: string, reduxStore: Store<GlobalState, AnyAction>) {
    const state = {
      serverUrl: serverUrl + '/graphql',
      store: reduxStore,
      authToken: null
    }

    const network = Network.create(fetchFunction(state))
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
  }
}

/**
 * Creates a new Relay environment instance for managing (fetching, storing) GraphQL data.
 */
export function createEnvironment(serverUrl: string, reduxStore: Store<GlobalState, AnyAction>) {
  return new Atmosphere(serverUrl, reduxStore)
}
