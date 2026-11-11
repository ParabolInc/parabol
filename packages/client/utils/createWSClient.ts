import {type Client, CloseCode, createClient} from 'graphql-ws'
import ms from 'ms'
import {commitLocalUpdate} from 'relay-runtime'
import type Atmosphere from '../Atmosphere'
import {addBreadcrumb} from './clientBreadcrumbs'
import {isClientOutdated, setConnectedServerVersion} from './connectedServerVersion'
import {createBackgroundSocketPause} from './createBackgroundSocketPause'
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

// a background tab pings once a minute, then reconnects within seconds of a deploy closing its socket
const MAX_DEPLOY_RECONNECT_GAP = ms('2m')

// graphql-ws reconnects at once after a 1000, but waits on retryWait after an application code like this one
const BACKGROUND_PAUSE_CLOSE_CODE = 4000

// the default retryWait of graphql-ws
const waitToRetry = (retries: number) =>
  new Promise((resolve) => setTimeout(resolve, 2 ** retries * 1000 + 300 + Math.random() * 2700))

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

// A proxy that strips the Upgrade header fails every handshake while plain HTTP to the same host works.
// HTTP failing too means the user is offline or Parabol is down, which this message would misdiagnose
const FAILED_HANDSHAKES_BEFORE_WARNING = 4
const warnIfWebSocketsBlocked = async (atmosphere: Atmosphere) => {
  const healthResponse = await fetch('/health', {cache: 'no-store'}).catch(() => null)
  if (!healthResponse?.ok || firewallMessageSent) return
  firewallMessageSent = true
  atmosphere.eventEmitter.emit('addSnackbar', {
    autoDismiss: 0,
    showDismissButton: true,
    message: `Your network is blocking Parabol’s live connection, so you won’t see your team’s changes as they happen and pages won’t load. Ask your IT team to allow WebSockets to ${window.location.host}`,
    key: 'firewall'
  })
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
    let lastPongAt = Date.now()
    let currentSocket: WebSocket | undefined
    let isSocketOpen = false
    let failedHandshakeCount = 0
    let pausedSinceConnect = false
    const backgroundPause = createBackgroundSocketPause(() => {
      pausedSinceConnect = true
      currentSocket?.close(BACKGROUND_PAUSE_CLOSE_CODE, 'Paused in a background tab')
    })
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
      retryWait: async (retries) => {
        if (!backgroundPause.isPaused()) await waitToRetry(retries)
        await backgroundPause.waitUntilResumed()
      },
      keepAlive: 10_000,
      on: {
        opened: (socket) => {
          currentSocket = socket as WebSocket
          isSocketOpen = true
          failedHandshakeCount = 0
        },
        ping: (received, payload) => {
          if (!received) {
            timedOut = window.setTimeout(() => {
              subscriptionClient.terminate()
            }, 5_000)
            return
          }
          // the server acknowledges a subscription with a ping that carries the ackId Atmosphere sent with it
          const ackId = payload?.ackId
          if (typeof ackId === 'string') atmosphere.subscriptionAckHandlers.get(ackId)?.()
        },
        pong: (received) => {
          if (received) {
            clearTimeout(timedOut)
            lastPongAt = Date.now()
          }
        },
        connected: async (_socket, payload, _wasRetry) => {
          addBreadcrumb('websocket', 'connected')
          const {version} = payload as {
            version: string
          }
          const isNewVersion = version !== __APP_VERSION__
          setConnectedServerVersion(version)
          if (isClientOutdated() && 'serviceWorker' in navigator) {
            // Safari is not ready immediately after a refresh and getRegistration() will return null, so wait till ready for the update
            // ready will wait indefinitely if the service worker is not registered, so do not await
            // The new worker caches the new build, so the quiet reload is quick
            navigator.serviceWorker.ready.then((registration) => {
              registration.update().catch((error) => {
                console.error('Error updating service worker:', error)
              })
            })
          }
          if (abruptlyClosed) {
            // if the client abruptly closed, this is then a reconnect
            abruptlyClosed = false
            onReconnect(atmosphere)
            // A deploy reconnects every client at once, so a client that was connected a moment ago skips the refetch to spare the server
            // A tab that was paused, frozen or asleep through the deploy missed everything since its last pong
            const wasAway = pausedSinceConnect || Date.now() - lastPongAt > MAX_DEPLOY_RECONNECT_GAP
            if (!isNewVersion || wasAway) {
              atmosphere.retries.forEach((retry) => retry())
            }
          }
          pausedSinceConnect = false
          if (!hasConnected) {
            hasConnected = true
            atmosphere.subscriptionClient = subscriptionClient
            resolve(subscriptionClient)
          }
          setConnectedStatus(atmosphere, true)
        },
        closed: (event) => {
          // a ping that was waiting on this socket must not terminate the next one
          clearTimeout(timedOut)
          const {code, reason} = event as CloseEvent
          const closedMessage = `closed ${code} ${reason}`.trim()
          addBreadcrumb('websocket', closedMessage)
          if (!isSocketOpen) {
            failedHandshakeCount++
            if (failedHandshakeCount === FAILED_HANDSHAKES_BEFORE_WARNING) {
              void warnIfWebSocketsBlocked(atmosphere)
            }
          }
          isSocketOpen = false
          if (FAILURE_CLOSE_CODES.has(code)) {
            reportClientWarning('WebSocketCloseError', closedMessage)
          }
          // This code is sent from wsHandler.onConnect on the server
          if (code === 4403) {
            atmosphere.invalidateSession(reason)
          }
          if (!hasConnected) {
            console.warn('Could not connect via WebSocket', event)
            reject(event)
          }
          // non-1000 close codes are abrupt closes
          if (code !== 1000) {
            abruptlyClosed = true
            if (hasConnected) {
              if (backgroundPause.isPaused()) setConnectedStatus(atmosphere, false)
              else onDisconnected(atmosphere)
            }
          }
        }
      },
      url
    })
  })
}
