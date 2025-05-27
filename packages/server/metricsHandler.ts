import {Counter, Gauge, Histogram, Registry, collectDefaultMetrics} from 'prom-client'
import {HttpResponse} from 'uWebSockets.js'
import {activeClients} from './activeClients'

const register = new Registry()

const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)

collectDefaultMetrics({
  register,
  prefix: 'node_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
  eventLoopMonitoringPrecision: 1000,
  labels: {
    server_id: process.env.SERVER_ID || 'unknown',
    port: PORT.toString()
  }
})

// Node.js metrics
const nodeMemoryUsage = new Gauge({
  name: 'node_memory_usage_bytes',
  help: 'Memory usage by type',
  labelNames: ['type'],
  registers: [register]
})

const nodeCpuUsage = new Gauge({
  name: 'node_cpu_usage_seconds',
  help: 'CPU usage in seconds',
  labelNames: ['type'],
  registers: [register]
})

const nodeEventLoopLag = new Gauge({
  name: 'node_eventloop_lag_seconds',
  help: 'Event loop lag in seconds',
  registers: [register]
})

const nodeGcDuration = new Histogram({
  name: 'node_gc_duration_seconds',
  help: 'Duration of garbage collection in seconds',
  labelNames: ['type'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
  registers: [register]
})

const nodeHeapSize = new Gauge({
  name: 'node_heap_size_bytes',
  help: 'Heap size in bytes',
  labelNames: ['type'],
  registers: [register]
})

const nodeActiveHandles = new Gauge({
  name: 'node_active_handles',
  help: 'Number of active handles',
  registers: [register]
})

// WebSocket metrics
export const wsConnections = new Gauge({
  name: 'websocket_connections_total',
  help: 'Total number of active WebSocket connections',
  labelNames: ['port'],
  registers: [register]
})

export const wsMessages = new Counter({
  name: 'websocket_messages_total',
  help: 'Total number of WebSocket messages',
  labelNames: ['type', 'port'],
  registers: [register]
})

export const wsMessageSize = new Histogram({
  name: 'websocket_message_size_bytes',
  help: 'Size of WebSocket messages in bytes',
  labelNames: ['type', 'port'],
  buckets: [100, 500, 1000, 5000, 10000, 50000, 100000],
  registers: [register]
})

export const wsConnectionDuration = new Histogram({
  name: 'websocket_connection_duration_seconds',
  help: 'Duration of WebSocket connections in seconds',
  labelNames: ['port'],
  buckets: [60, 300, 600, 1800, 3600, 7200, 14400, 28800, 57600, 86400],
  registers: [register]
})

export const wsErrors = new Counter({
  name: 'websocket_errors_total',
  help: 'Total number of WebSocket errors',
  labelNames: ['type', 'port'],
  registers: [register]
})

// Cache for event loop lag measurement
let lastEventLoopLag = 0
let lastEventLoopCheck = 0
const EVENT_LOOP_CHECK_INTERVAL = 1000

// GraphQL Yoga Prometheus plugin configuration
// export const graphqlPrometheusPlugin = usePrometheus({
//   registry: register
// })

const updateWebSocketMetrics = () => {
  wsConnections.set({port: PORT.toString()}, activeClients.size)
}

const updateNodeMetrics = () => {
  const memoryUsage = process.memoryUsage()
  const {heapTotal, heapUsed, external, rss, arrayBuffers} = memoryUsage

  nodeMemoryUsage.set({type: 'heapTotal'}, heapTotal)
  nodeMemoryUsage.set({type: 'heapUsed'}, heapUsed)
  nodeMemoryUsage.set({type: 'external'}, external)
  nodeMemoryUsage.set({type: 'rss'}, rss)
  nodeMemoryUsage.set({type: 'arrayBuffers'}, arrayBuffers)

  nodeHeapSize.set({type: 'total'}, heapTotal)
  nodeHeapSize.set({type: 'used'}, heapUsed)

  const cpuUsage = process.cpuUsage()
  const userCpu = cpuUsage.user / 1_000_000
  const systemCpu = cpuUsage.system / 1_000_000
  nodeCpuUsage.set({type: 'user'}, userCpu)
  nodeCpuUsage.set({type: 'system'}, systemCpu)

  const now = Date.now()
  if (now - lastEventLoopCheck >= EVENT_LOOP_CHECK_INTERVAL) {
    const start = process.hrtime.bigint()
    setTimeout(() => {
      const end = process.hrtime.bigint()
      lastEventLoopLag = Number(end - start) / 1_000_000_000
      lastEventLoopCheck = now
    }, 0)
  }
  nodeEventLoopLag.set(lastEventLoopLag)

  const activeResources = process.getActiveResourcesInfo()
  const gcCount = activeResources.reduce(
    (count, resource) => (resource.includes('gc') ? count + 1 : count),
    0
  )
  nodeGcDuration.observe({type: 'total'}, gcCount)
  nodeActiveHandles.set(activeResources.length)
}

if (process.env.ENABLE_METRICS?.toLowerCase() === 'true') {
  setInterval(() => {
    updateWebSocketMetrics()
    updateNodeMetrics()
  }, 30000)
}

export const metricsHandler = async (res: HttpResponse) => {
  let aborted = false
  res.onAborted(() => {
    aborted = true
  })

  if (process.env.ENABLE_METRICS?.toLowerCase() !== 'true') {
    if (!aborted) {
      res.writeStatus('404 Not Found')
      res.end()
    }
    return
  }

  try {
    const metrics = await register.metrics()
    if (!aborted) {
      res.writeStatus('200 OK')
      res.writeHeader('Content-Type', register.contentType)
      res.writeHeader('Cache-Control', 'no-cache')
      res.end(metrics)
    }
  } catch (error) {
    console.error('Error generating metrics:', error)
    if (!aborted) {
      res.writeStatus('500 Internal Server Error')
      res.end()
    }
  }
}
