import {type Client, CloseCode, createClient} from 'graphql-ws'
import ms from 'ms'
import {commitLocalUpdate} from 'relay-runtime'
import type Atmosphere from '../Atmosphere'
import {addBreadcrumb} from './clientBreadcrumbs'
import getTabSessionId from './getTabSessionId'
import createProxyRecord from './relay/createProxyRecord'
import {reportClientWarning} from './reportClientError'

// a server or protocol failure, unlike a dropped network, a page leaving or a rejected session
const FAILURE_CLOSE_CODES = new Set<number>([
  1011,
  CloseCode.InternalServerError,
  CloseCode.InternalClientError,
  CloseCode.BadRequest,
  CloseCode.BadResponse,
  CloseCode.ConnectionAcknowledgementTimeout,
  CloseCode.SubscriberAlreadyExists,
  CloseCode.TooManyInitialisationRequests
])

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
  // This gets too noisy, so we're going to try not mentioning it
  // atmosphere.eventEmitter.emit('addSnackbar', {
  //   autoDismiss: 0,
  //   message: 'You’re offline, reconnecting…',
  //   key: 'offline'
  // })
}

export const onReconnect = (atmosphere: Atmosphere) => {
  setConnectedStatus(atmosphere, true)
  // atmosphere.eventEmitter.emit('removeSnackbar', ({key}) => key === 'offline')
}

export function createWSClient(atmosphere: Atmosphere) {
  return new Promise<Client>((resolve, reject) => {
    const wsProtocol = window.location.protocol.replace('http', 'ws')
    const host = window.location.host
    const url = `${wsProtocol}//${host}`
    let hasConnected = false
    let abruptlyClosed = false
    let nextId = 1
    let timedOut: number
    const subscriptionClient = createClient({
      lazy: false,
      connectionParams: () => ({sessionId: getTabSessionId()}),
      generateID: () => {
        return String(nextId++)
      },
      retryAttempts: 20,
      shouldRetry: () => {
        if (!atmosphere.authObj) return false
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
          addBreadcrumb('websocket', 'connected')
          const {version} = payload as {
            version: string
          }
          const isNewVersion = version !== __APP_VERSION__
          if (isNewVersion) {
            // Safari is not ready immediately after a refresh and getRegistration() will return null, so wait till ready for the update
            // ready will wait indefinitely if the service worker is not registered, so do not await
            navigator.serviceWorker.ready.then((registration) => {
              registration
                ?.update()
                .then(() => {
                  console.log(`Service worker updated from ${__APP_VERSION__} to ${version}`)
                })
                .catch((error) => {
                  console.error('Error updating service worker:', error)
                })
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
          const {code, reason} = event as CloseEvent
          const closedMessage = `closed ${code} ${reason}`.trim()
          addBreadcrumb('websocket', closedMessage)
          if (FAILURE_CLOSE_CODES.has(code)) {
            reportClientWarning('WebSocketCloseError', closedMessage)
          }
          // This code is sent from wsHandler.onConnect on the server
          if (code === 4403) {
            atmosphere.invalidateSession(reason)
          }
          if (!hasConnected) {
            console.error('Could not connect via WebSocket', event)
            reject(event)
          }
          // non-1000 close codes are abrupt closes
          if (code !== 1000) {
            abruptlyClosed = true
            if (hasConnected) {
              onDisconnected(atmosphere)
            }
          }
        }
      },
      url
    })
  })
}
