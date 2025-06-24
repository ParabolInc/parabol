import {usePrometheus} from '@graphql-yoga/plugin-prometheus'
import {Gauge, Histogram, Registry, collectDefaultMetrics} from 'prom-client'
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
new Gauge({
  name: 'node_memory_usage_bytes',
  help: 'Memory usage by type',
  labelNames: ['type'],
  registers: [register],
  collect() {
    const memoryUsage = process.memoryUsage()
    const {heapTotal, heapUsed, external, rss, arrayBuffers} = memoryUsage

    this.set({type: 'heapTotal'}, heapTotal)
    this.set({type: 'heapUsed'}, heapUsed)
    this.set({type: 'external'}, external)
    this.set({type: 'rss'}, rss)
    this.set({type: 'arrayBuffers'}, arrayBuffers)
  }
})

new Gauge({
  name: 'node_cpu_usage_seconds',
  help: 'CPU usage in seconds',
  labelNames: ['type'],
  registers: [register],
  collect() {
    const cpuUsage = process.cpuUsage()
    const userCpu = cpuUsage.user / 1_000_000
    const systemCpu = cpuUsage.system / 1_000_000
    this.set({type: 'user'}, userCpu)
    this.set({type: 'system'}, systemCpu)
  }
})

new Gauge({
  name: 'node_eventloop_lag_seconds',
  help: 'Event loop lag in seconds',
  registers: [register],
  collect() {
    return new Promise<void>((resolve) => {
      const end = this.startTimer()
      setTimeout(() => {
        end()
        resolve()
      }, 0)
    })
  }
})

const nodeGcDuration = new Histogram({
  name: 'node_gc_duration_seconds',
  help: 'Duration of garbage collection in seconds',
  labelNames: ['type'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
  registers: [register]
})

new Gauge({
  name: 'node_heap_size_bytes',
  help: 'Heap size in bytes',
  labelNames: ['type'],
  registers: [register],
  collect() {
    const memoryUsage = process.memoryUsage()
    const {heapTotal, heapUsed} = memoryUsage

    this.set({type: 'total'}, heapTotal)
    this.set({type: 'used'}, heapUsed)
  }
})

new Gauge({
  name: 'node_active_handles',
  help: 'Number of active handles',
  registers: [register],
  collect() {
    const activeResources = process.getActiveResourcesInfo()
    this.set(activeResources.length)
  }
})

// WebSocket metrics
new Gauge({
  name: 'websocket_connections_total',
  help: 'Total number of active WebSocket connections',
  labelNames: ['port'],
  registers: [register],
  collect() {
    this.set({port: PORT.toString()}, activeClients.size)
  }
})

// TODO wire up these ws metrics
/*
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
*/

// GraphQL Yoga Prometheus plugin configuration
export const graphqlPrometheusPlugin = usePrometheus({
  registry: register
})

const updateHistorgrams = () => {
  const activeResources = process.getActiveResourcesInfo()
  const gcCount = activeResources.reduce(
    (count, resource) => (resource.includes('gc') ? count + 1 : count),
    0
  )
  nodeGcDuration.observe({type: 'total'}, gcCount)
}

if (process.env.ENABLE_METRICS === 'true') {
  setInterval(() => {
    updateHistorgrams()
  }, 30000)
}

export const metricsHandler = async (res: HttpResponse) => {
  let aborted = false
  res.onAborted(() => {
    aborted = true
  })

  if (process.env.ENABLE_METRICS !== 'true') {
    if (!aborted) {
      res.writeStatus('404 Not Found')
      res.end()
    }
    return
  }

  try {
    const metrics = await register.metrics()
    if (!aborted) {
      res.cork(() => {
        res.writeStatus('200 OK')
        res.writeHeader('Content-Type', register.contentType)
        res.writeHeader('Cache-Control', 'no-cache')
        res.end(metrics)
      })
    }
  } catch (error) {
    console.error('Error generating metrics:', error)
    if (!aborted) {
      res.cork(() => {
        res.writeStatus('500 Internal Server Error')
        res.end()
      })
    }
  }
}
