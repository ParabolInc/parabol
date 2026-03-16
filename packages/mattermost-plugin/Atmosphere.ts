import type {GlobalState} from '@mattermost/types/store'
import type {AnyAction, Store} from '@reduxjs/toolkit'
import {Client4} from 'mattermost-redux/client'
import type {Variables} from 'react-relay'
import {
  Environment,
  Network,
  Observable,
  RecordSource,
  RelayFeatureFlags,
  type RelayFieldLogger,
  type RequestParameters
} from 'relay-runtime'
import RelayModernStore from 'relay-runtime/lib/store/RelayModernStore'
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

const login = (state: State) => async (): Promise<boolean> => {
  const {serverUrl, store} = state
  // Encode a random nonce and the current origin into the OAuth state parameter.
  // The nonce is validated when the callback page postMessages back the token,
  // preventing cross-site request forgery.
  const nonce = Math.random().toString(36).slice(2)
  const encodedState = btoa(JSON.stringify({nonce, origin: window.location.origin}))
  const authUrl = `${serverUrl}/auth?state=${encodeURIComponent(encodedState)}`

  // The Go plugin backend handles /auth by redirecting to Parabol's OAuth authorize
  // page. After the user logs in, Parabol redirects to /mattermost/callback which
  // postMessages {authToken, nonce} back to this opener window.
  const popup = window.open(authUrl, 'parabol-oauth', 'width=600,height=700,noopener=no')
  if (!popup) return false

  return new Promise<boolean>((resolve) => {
    const timer = setTimeout(
      () => {
        cleanup()
        resolve(false)
      },
      5 * 60 * 1000
    )

    const handler = (event: MessageEvent) => {
      const {authToken, nonce: receivedNonce} = event.data ?? {}
      if (!authToken || receivedNonce !== nonce) return
      cleanup()
      store.dispatch(onLogin(authToken))
      popup.close()
      resolve(true)
    }

    const cleanup = () => {
      clearTimeout(timer)
      window.removeEventListener('message', handler)
    }

    window.addEventListener('message', handler)
  })
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
