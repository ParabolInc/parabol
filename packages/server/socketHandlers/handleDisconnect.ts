import {WebSocket} from 'uWebSockets.js'
import activeClients from '../activeClients'
import {wsConnectionDuration, wsConnections, wsErrors} from '../metrics/metricsHandler'
import {Logger} from '../utils/Logger'
import relayUnsubscribeAll from '../utils/relayUnsubscribeAll'
import sendToSentry from '../utils/sendToSentry'
import {SocketUserData} from './handleOpen'

// Get the port from environment variables
const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)

export const handleDisconnect = (ws: WebSocket<SocketUserData>) => {
  const userData = ws.getUserData()
  if (!userData) return

  try {
    const {connectionContext, startTime} = userData
    if (!connectionContext) return

    // Remove the client from active clients
    activeClients.delete(connectionContext.id)

    // Update WebSocket metrics
    if (process.env.ENABLE_METRICS === 'true') {
      wsConnections.dec({port: PORT.toString()})
      if (startTime) {
        wsConnectionDuration.observe({port: PORT.toString()}, (Date.now() - startTime) / 1000)
      }
    }

    // Clean up the connection context
    const {ip, cancelKeepAlive, id: socketId} = connectionContext
    Logger.log(`Client disconnected: ${ip} (${socketId})`)

    // Cancel any pending keep-alive timer
    if (cancelKeepAlive) {
      clearInterval(cancelKeepAlive)
    }

    // Clean up subscriptions
    relayUnsubscribeAll(connectionContext)
  } catch (error) {
    console.error('Error in handleDisconnect:', error)
    if (process.env.ENABLE_METRICS === 'true') {
      wsErrors.inc({type: 'disconnect_error', port: PORT.toString()})
    }
    if (error instanceof Error) {
      sendToSentry(error)
    }
  }
}
