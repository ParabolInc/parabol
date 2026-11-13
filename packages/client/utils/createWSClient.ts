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

// a socket that has been down for a while still comes back within this long of the network returning
const MAX_RETRY_WAIT = ms('30s')

// A server closes with Service Restart when it hands its sockets to the other servers. It spreads those closes out
// itself, and the load balancer no longer sends anything to it, so the first retry needs no wait
const SERVICE_RESTART_CLOSE_CODE = 1012

// the default retryWait of graphql-ws, capped, and cut short when the browser comes back online or into view
const waitToRetry = (retries: number) =>
  new Promise<void>((resolve) => {
    const retryNow = () => {
      window.clearTimeout(retryTimer)
      window.removeEventListener('online', retryNow)
      document.removeEventListener('visibilitychange', retryIfVisible)
      resolve()
    }
    const retryIfVisible = () => {
      if (document.visibilityState === 'visible') retryNow()
    }
    const retryTimer = window.setTimeout(
      retryNow,
      Math.min(2 ** retries * 1000, MAX_RETRY_WAIT) + 300 + Math.random() * 2700
    )
    window.addEventListener('online', retryNow)
    document.addEventListener('visibilitychange', retryIfVisible)
  })

// a tab nobody has used while its socket has been down this long stops retrying until someone does
const MAX_UNATTENDED_OUTAGE = ms('30m')
const TAB_USE_EVENTS = ['pointerdown', 'keydown', 'focus']

const onTabUse = (callback: () => void) => {
  const callbackIfVisible = () => {
    if (document.visibilityState === 'visible') callback()
  }
  TAB_USE_EVENTS.forEach((eventName) => window.addEventListener(eventName, callback, true))
  document.addEventListener('visibilitychange', callbackIfVisible)
  return () => {
    TAB_USE_EVENTS.forEach((eventName) => window.removeEventListener(eventName, callback, true))
    document.removeEventListener('visibilitychange', callbackIfVisible)
  }
}

const waitUntilUsedOrOnline = () =>
  new Promise<void>((resolve) => {
    const resume = () => {
      stopListening()
      window.removeEventListener('online', resume)
      resolve()
    }
    const stopListening = onTabUse(resume)
    window.addEventListener('online', resume)
  })

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

export function createWSClient(atmosphere: Atmosphere): Client {
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
  let lastUsedAt = Date.now()
  let disconnectedAt = Date.now()
  let lastCloseCode: number | undefined
  onTabUse(() => {
    lastUsedAt = Date.now()
  })
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
    retryAttempts: Infinity,
    shouldRetry: () => {
      if (!atmosphere.authObj) return false
      return true
    },
    // graphql-ws hands this what ended the socket for good, which it would log with console.error.
    // A signed-out session ends it on purpose, and the closed handler already reported the failure close codes
    onNonLazyError: (errorOrCloseEvent) => {
      if (!atmosphere.authObj) return
      const {code, reason} = errorOrCloseEvent as CloseEvent
      if (FAILURE_CLOSE_CODES.has(code)) return
      reportClientWarning('WebSocketCloseError', `closed ${code} ${reason}`.trim())
    },
    retryWait: async (retries) => {
      const isServerRestart = lastCloseCode === SERVICE_RESTART_CLOSE_CODE && retries === 0
      if (!backgroundPause.isPaused() && !isServerRestart) await waitToRetry(retries)
      await backgroundPause.waitUntilResumed()
      const now = Date.now()
      if (
        now - disconnectedAt > MAX_UNATTENDED_OUTAGE &&
        now - lastUsedAt > MAX_UNATTENDED_OUTAGE
      ) {
        await waitUntilUsedOrOnline()
      }
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
        atmosphere.isSocketConnected = true
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
        hasConnected = true
        setConnectedStatus(atmosphere, true)
      },
      closed: (event) => {
        // a ping that was waiting on this socket must not terminate the next one
        clearTimeout(timedOut)
        if (atmosphere.isSocketConnected) disconnectedAt = Date.now()
        atmosphere.isSocketConnected = false
        const {code, reason} = event as CloseEvent
        lastCloseCode = code
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
        // signing out disposes a socket that may still be connecting, which is no failure
        if (!hasConnected && atmosphere.subscriptionClient === subscriptionClient) {
          console.warn('Could not connect via WebSocket', event)
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
  return subscriptionClient
}
