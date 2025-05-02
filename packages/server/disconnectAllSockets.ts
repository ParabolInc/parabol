import sleep from '../client/utils/sleep'
import {activeClients} from './activeClients'

export const disconnectAllSockets = async (disconnectWindow: number = 60_000) => {
  const ONDISCONNECT_LIMIT = 3000
  const connectionsToClose = Array.from(activeClients.values())
  if (connectionsToClose.length > 0) {
    const msPerClose = (disconnectWindow - ONDISCONNECT_LIMIT) / connectionsToClose.length
    const closeEvery = Math.min(200, msPerClose)
    await Promise.allSettled(
      connectionsToClose.map(async (extra, idx) => {
        const disconnectIn = idx * closeEvery
        await sleep(disconnectIn)
        extra.socket.end(1012, 'Closing connection')
      })
    )
    //socket.end will fire wsHandler.onDisconnect. Give it this long to complete
    await sleep(ONDISCONNECT_LIMIT)
  }
}
