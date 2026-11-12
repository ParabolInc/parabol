import type {WebSocket} from 'uWebSockets.js'
import type {Extra} from 'graphql-ws/use/uWebSockets'
import sleep from '../client/utils/sleep'
import {activeClients, activeYjsSockets} from './activeClients'
import {hocuspocus} from './hocusPocus'
import type {HocusPocusSocketData} from './hocusPocusHandler'
import socketDrainSchedule from './socketDrainSchedule'

const {closeSpread, maxWaitForIdle, maxWaitForYjsUnload, reconnectGrace} = socketDrainSchedule

// Service Restart: the client reconnects at once, and the load balancer sends it to another server
const SERVICE_RESTART = 1012

const waitUntil = async (isDone: () => boolean, maxWait: number) => {
  const giveUpAt = Date.now() + maxWait
  while (!isDone() && Date.now() < giveUpAt) {
    await sleep(50)
  }
}

// A query or mutation holds a dataloader until it completes. Closing under one would leave the client to send it
// again on its next socket, and a mutation the server already ran would then run twice
const isIdle = (extra: Extra) => Object.keys(extra.dataLoaders).length === 0

const closeGraphQLSocketWhenIdle = async (extra: Extra) => {
  const giveUpAt = Date.now() + maxWaitForIdle
  while (!isIdle(extra) && Date.now() < giveUpAt) {
    await new Promise<void>((resolve) => {
      extra.onIdle = resolve
      setTimeout(resolve, giveUpAt - Date.now())
    })
  }
  extra.onIdle = undefined
  if (activeClients.has(extra.socketId)) extra.socket.end(SERVICE_RESTART, 'Server restarting')
}

const closeYjsSocket = (socket: WebSocket<HocusPocusSocketData>) => {
  if (activeYjsSockets.has(socket)) socket.end(SERVICE_RESTART, 'Server restarting')
}

export const disconnectAllSockets = async () => {
  // a tab's GraphQL and Yjs sockets close together, so its user sees one reconnect instead of two
  const socketsToClose = [
    ...Array.from(activeClients.values(), (extra) => ({
      sessionId: extra.sessionId ?? '',
      close: () => closeGraphQLSocketWhenIdle(extra)
    })),
    ...Array.from(activeYjsSockets, (socket) => ({
      sessionId: socket.getUserData().sessionId ?? '',
      close: () => closeYjsSocket(socket)
    }))
  ].sort((a, b) => a.sessionId.localeCompare(b.sessionId))
  const closeEvery = Math.min(200, closeSpread / Math.max(1, socketsToClose.length))
  await Promise.allSettled(
    socketsToClose.map(async ({close}, idx) => {
      await sleep(idx * closeEvery)
      await close()
    })
  )
  // The documents still open here are held for sockets on other servers. Storing and unloading them releases each
  // one's lock, so the next server to ask takes it over at once instead of waiting for the lock to expire
  hocuspocus.closeConnections()
  hocuspocus.flushPendingStores()
  await waitUntil(() => hocuspocus.getDocumentsCount() === 0, maxWaitForYjsUnload)
  // wsHandler.onDisconnect waits out the reconnect grace before it tells teammates a user left
  await sleep(reconnectGrace + 1000)
}
