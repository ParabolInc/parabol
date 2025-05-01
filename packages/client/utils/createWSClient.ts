import {createClient, type Client} from 'graphql-ws'
import ms from 'ms'
import {commitLocalUpdate} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import createProxyRecord from './relay/createProxyRecord'

const setConnectedStatus = (atmosphere: Atmosphere, isConnected: boolean) => {
  commitLocalUpdate(atmosphere, (store) => {
    const root = store.getRoot()
    const viewer = root.getLinkedRecord('viewer')
    if (!viewer) {
      const tempViewer = createProxyRecord(store, 'User', {isConnected})
      root.setLinkedRecord(tempViewer, 'viewer')
    } else {
      viewer.setValue(isConnected, 'isConnected')
    }
  })
}

let firewallMessageSent = false
let recentDisconnects = [] as number[]

export const onDisconnected = (atmosphere: Atmosphere) => {
  setConnectedStatus(atmosphere, false)
  if (!firewallMessageSent) {
    const now = Date.now()
    recentDisconnects = recentDisconnects.filter((time) => time > now - ms('1m'))
    recentDisconnects.push(now)
    if (recentDisconnects.length >= 4) {
      firewallMessageSent = true
      atmosphere.eventEmitter.emit('addSnackbar', {
        autoDismiss: 0,
        message: 'Your internet is unstable. Behind a firewall? Contact us for support',
        key: 'firewall'
      })
      return
    }
  }
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 0,
    message: 'You’re offline, reconnecting…',
    key: 'offline'
  })
}

export const onReconnect = (atmosphere: Atmosphere) => {
  setConnectedStatus(atmosphere, true)
  atmosphere.eventEmitter.emit('removeSnackbar', ({key}) => key === 'offline')
}

export function createWSClient(atmosphere: Atmosphere) {
  return new Promise<Client>((resolve, reject) => {
    const wsProtocol = window.location.protocol.replace('http', 'ws')
    const host = __PRODUCTION__
      ? window.location.host
      : `${window.location.hostname}:${__SOCKET_PORT__}`
    const url = `${wsProtocol}//${host}`
    let hasConnected = false
    let abruptlyClosed = false
    let nextId = 1
    let timedOut: number
    const subscriptionClient = createClient({
      lazy: false,
      generateID: () => {
        return String(nextId++)
      },
      retryAttempts: 20,
      shouldRetry: () => {
        if (!atmosphere.authToken) return false
        return true
      },
      keepAlive: 10_000,
      on: {
        ping: (received) => {
          if (!received) {
            timedOut = window.setTimeout(() => {
              subscriptionClient.terminate()
            }, 5_000)
          }
        },
        pong: (received) => {
          if (received) {
            clearTimeout(timedOut)
          }
        },
        connected: async (_socket, payload, _wasRetry) => {
          const {version, authToken} = payload as {version: string; authToken?: string | null}
          if (authToken) {
            atmosphere.setAuthToken(authToken)
          }
          const isNewVersion = version !== __APP_VERSION__
          if (isNewVersion) {
            const registration = await navigator.serviceWorker.getRegistration()
            registration?.update().catch(() => {
              /*ignore*/
            })
          }
          if (abruptlyClosed) {
            // if the client abruptly closed, this is then a reconnect
            abruptlyClosed = false
            onReconnect(atmosphere)
            if (!isNewVersion) {
              // don't refetch on version bumps because the reconnect is fast & it'll strangle the server if everyone does that at once
              atmosphere.retries.forEach((retry) => retry())
            }
          }
          if (!hasConnected) {
            hasConnected = true
            atmosphere.subscriptionClient = subscriptionClient
            resolve(subscriptionClient)
          }
          setConnectedStatus(atmosphere, true)
        },
        closed: (event) => {
          if (!hasConnected) {
            console.error('Could not connect via WebSocket', event)
            reject(event)
          }
          const {code, reason} = event as CloseEvent
          // This code is sent from wsHandler.onConnect on the server
          if (code === 4403) {
            atmosphere.invalidateSession(reason)
          }
          // non-1000 close codes are abrupt closes
          if (code !== 1000) {
            abruptlyClosed = true
            if (hasConnected) {
              onDisconnected(atmosphere)
            }
          }
          hasConnected = false
        }
      },
      url,
      connectionParams: () => {
        return {
          token: atmosphere.authToken
        }
      }
    })
  })
}
