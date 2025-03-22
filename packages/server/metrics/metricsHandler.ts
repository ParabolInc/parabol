import {Counter, Gauge, Histogram, Registry, collectDefaultMetrics} from 'prom-client'
import {HttpResponse} from 'uWebSockets.js'
import activeClients from '../activeClients'

// Create a Registry to hold the metrics
const register = new Registry()

// Get the port from environment variables
const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)

// Collect default Node.js metrics with optimized settings
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
const EVENT_LOOP_CHECK_INTERVAL = 1000 // Check every second

// Update WebSocket metrics (every 30 seconds)
const updateWebSocketMetrics = () => {
  // Use Object.keys().length instead of Object.values().length for better performance
  wsConnections.set({port: PORT.toString()}, Object.keys(activeClients.store).length)
}

// Update Node.js metrics (every 30 seconds)
const updateNodeMetrics = () => {
  // Update memory and heap metrics together since they use the same data
  const memoryUsage = process.memoryUsage()
  // Pre-calculate values to avoid multiple property lookups
  const heapTotal = memoryUsage.heapTotal
  const heapUsed = memoryUsage.heapUsed
  const external = memoryUsage.external
  const rss = memoryUsage.rss
  const arrayBuffers = memoryUsage.arrayBuffers

  // Set memory metrics with pre-calculated values
  nodeMemoryUsage.set({type: 'heapTotal'}, heapTotal)
  nodeMemoryUsage.set({type: 'heapUsed'}, heapUsed)
  nodeMemoryUsage.set({type: 'external'}, external)
  nodeMemoryUsage.set({type: 'rss'}, rss)
  nodeMemoryUsage.set({type: 'arrayBuffers'}, arrayBuffers)

  // Set heap size metrics with pre-calculated values
  nodeHeapSize.set({type: 'total'}, heapTotal)
  nodeHeapSize.set({type: 'used'}, heapUsed)

  // Update CPU metrics
  const cpuUsage = process.cpuUsage()
  // Pre-calculate CPU values
  const userCpu = cpuUsage.user / 1_000_000
  const systemCpu = cpuUsage.system / 1_000_000
  nodeCpuUsage.set({type: 'user'}, userCpu)
  nodeCpuUsage.set({type: 'system'}, systemCpu)

  // Update event loop lag with cached value
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

  // Update GC metrics and active handles together since they use the same data
  const activeResources = process.getActiveResourcesInfo()
  // Use a more efficient way to count GC resources
  const gcCount = activeResources.reduce(
    (count, resource) => (resource.includes('gc') ? count + 1 : count),
    0
  )
  nodeGcDuration.observe({type: 'total'}, gcCount)
  nodeActiveHandles.set(activeResources.length)
}

// Start metrics collection if enabled
if (process.env.ENABLE_METRICS === 'true') {
  // Use a single interval for all metrics to reduce timer overhead
  setInterval(() => {
    updateWebSocketMetrics()
    updateNodeMetrics()
  }, 30000) // Update every 30 seconds
}

export const metricsHandler = async (res: HttpResponse) => {
  if (process.env.ENABLE_METRICS !== 'true') {
    res.writeStatus('404').end()
    return
  }

  try {
    const metrics = await register.metrics()
    res
      .writeHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
      .writeHeader('Cache-Control', 'no-cache')
      .end(metrics)
  } catch (error) {
    console.error('Error generating metrics:', error)
    res.writeStatus('500').end()
  }
}
