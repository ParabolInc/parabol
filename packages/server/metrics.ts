import {collectDefaultMetrics, Counter, Gauge, Histogram, register} from 'prom-client'
import {HttpResponse} from 'uWebSockets.js'

// Default Node.js metrics collection
collectDefaultMetrics()

// Caching for metrics
let cachedMetrics = ''
let lastMetricsUpdate = 0
const METRICS_CACHE_DURATION = 5000 // 5 seconds

async function getMetrics(): Promise<string> {
  const now = Date.now()
  if (now - lastMetricsUpdate > METRICS_CACHE_DURATION) {
    cachedMetrics = await register.metrics()
    lastMetricsUpdate = now
  }
  return cachedMetrics
}

export async function handleMetricsRequest(res: HttpResponse): Promise<void> {
  let aborted = false
  res.onAborted(() => (aborted = true))

  try {
    const metrics = await getMetrics()
    if (aborted) return

    res.cork(() => {
      res.writeHeader('Content-Type', register.contentType)
      res.end(metrics)
    })
  } catch (error) {
    console.error('Error retrieving metrics:', error)
    if (!aborted) {
      res.cork(() => {
        res.writeHeader('Content-Type', 'text/plain')
        res.end('Error retrieving metrics')
      })
    }
  }
}

// Websocket metrics
export const websocketConnections = new Gauge({
  name: 'websocket_active_connections',
  help: 'Number of active WebSocket connections'
})

export const websocketMessagesSent = new Counter({
  name: 'websocket_messages_sent_total',
  help: 'Total number of WebSocket messages sent'
})

export const websocketMessagesReceived = new Counter({
  name: 'websocket_messages_received_total',
  help: 'Total number of WebSocket messages received'
})

export const websocketConnectionDuration = new Histogram({
  name: 'websocket_connection_duration_seconds',
  help: 'Duration of WebSocket connections',
  buckets: [1, 5, 10, 30, 60, 120, 300] // Buckets for duration
})

const connectionStartTimes = new Map()

export function incrementWebSocketConnections() {
  websocketConnections.inc()
}

export function decrementWebSocketConnections(ws: any) {
  websocketConnections.dec()

  // Track connection duration
  const startTime = connectionStartTimes.get(ws)
  if (startTime) {
    websocketConnectionDuration.observe((Date.now() - startTime) / 1000)
    connectionStartTimes.delete(ws)
  }
}

export function trackWebSocketOpen(ws: any) {
  connectionStartTimes.set(ws, Date.now())
}

export function trackWsMessageSent() {
  websocketMessagesSent.inc()
}

export function trackWsMessageReceived() {
  websocketMessagesReceived.inc()
}
