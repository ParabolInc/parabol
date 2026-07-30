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
import {parabolUrl} from './env.js'
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

function generateVerifier(): string {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function generateChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

const login = (state: State) => async (): Promise<boolean> => {
  const {serverUrl, store} = state

  // Open popup synchronously before any await — popup blockers require a sync call from user gesture
  const popup = window.open('', 'ParabolOAuth', 'popup,width=500,height=700')
  if (!popup) {
    console.error('Popup was blocked. Allow popups for this site and try again.')
    return false
  }

  // Fetch clientId from Go plugin KV store (set during admin setup flow)
  const configRes = await fetch(serverUrl + '/config', Client4.getOptions({method: 'GET'})).catch(
    () => null
  )
  const config = configRes?.ok ? await configRes.json().catch(() => null) : null
  const clientId = config?.clientId as string | undefined
  if (!clientId) {
    popup.close()
    console.error('Parabol OAuth client ID not configured. Run the Mattermost setup flow first.')
    return false
  }

  const verifier = generateVerifier()
  const challenge = await generateChallenge(verifier)
  const oauthState = crypto.randomUUID()
  const redirectUri = `${parabolUrl}/oauth/mattermost-callback`

  const authorizeUrl = new URL(`${parabolUrl}/oauth/authorize`)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('state', oauthState)
  authorizeUrl.searchParams.set('code_challenge', challenge)
  authorizeUrl.searchParams.set('code_challenge_method', 'S256')
  popup.location.href = authorizeUrl.toString()

  return new Promise<boolean>((resolve) => {
    const cleanup = (result: boolean) => {
      clearInterval(closedPoll)
      window.removeEventListener('message', handler)
      resolve(result)
    }

    // Detect popup closed without completing auth (user pressed X)
    const closedPoll = setInterval(() => {
      if (popup.closed) cleanup(false)
    }, 500)

    const handler = async (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return
      const {code, state: returnedState} = event.data as {code?: string; state?: string}
      if (!code || returnedState !== oauthState) return
      popup.close()
      try {
        const tokenRes = await fetch(`${parabolUrl}/oauth/token`, {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: verifier
          })
        })
        const {access_token} = await tokenRes.json()
        if (access_token) store.dispatch(onLogin(access_token))
        cleanup(!!access_token)
      } catch {
        cleanup(false)
      }
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
