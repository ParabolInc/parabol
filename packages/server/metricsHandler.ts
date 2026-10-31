import type {HttpResponse} from 'uWebSockets.js'
import {createHistogram, usePrometheus} from '@graphql-yoga/plugin-prometheus'
import {Counter, collectDefaultMetrics, Gauge, Histogram, Registry} from 'prom-client'
import {activeClients} from './activeClients'
import getKysely from './postgres/getKysely'
import type {Embeddingsjobstateenum} from './postgres/types/pg'
import {Logger} from './utils/Logger'

export const ENABLE_METRICS = process.env.ENABLE_METRICS
  ? process.env.ENABLE_METRICS === 'true'
  : __PRODUCTION__
export const METRICS_PORT = process.env.METRICS_PORT ? parseInt(process.env.METRICS_PORT, 10) : 9090

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

export const websocketConnects = new Counter({
  name: 'parabol_websocket_connects_total',
  help: 'Websocket connections accepted after authentication',
  registers: [register]
})

export const websocketConnectAttempts = new Counter({
  name: 'parabol_websocket_connect_attempts_total',
  help: 'Websocket upgrades started, before authentication',
  registers: [register]
})

export const websocketConnectDuration = new Histogram({
  name: 'parabol_websocket_connect_duration_seconds',
  help: 'Seconds from the websocket upgrade until the connection is accepted or its authentication rejected, by outcome',
  labelNames: ['outcome'] as const,
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
})

export const unexpectedGraphQLErrors = new Counter({
  name: 'parabol_graphql_unexpected_errors_total',
  help: 'Queries and mutations that returned an error the server did not mean to, by operation type',
  labelNames: ['operation_type'] as const,
  registers: [register]
})

export const logins = new Counter({
  name: 'parabol_logins_total',
  help: 'Successful logins, including sign-ups through an identity provider, by method',
  labelNames: ['method'] as const,
  registers: [register]
})

export const meetingsEnded = new Counter({
  name: 'parabol_meetings_ended_total',
  help: 'Meetings ended, whether completed or ended early, by meeting type',
  labelNames: ['meeting_type'] as const,
  registers: [register]
})

const EMBEDDER_JOB_STATES = [
  'queued',
  'running',
  'failed'
] as const satisfies readonly Embeddingsjobstateenum[]

new Gauge({
  name: 'parabol_embedder_jobs',
  help: 'Jobs in the embedder queue by state. Every web server reports the same totals, so aggregate with max',
  labelNames: ['state'] as const,
  registers: [register],
  async collect() {
    try {
      const jobCounts = await getKysely()
        .selectFrom('EmbeddingsJobQueueV2')
        .select(({fn}) => ['state', fn.countAll<string>().as('jobs')])
        .groupBy('state')
        .execute()
      const jobsByState = new Map(jobCounts.map(({state, jobs}) => [state, Number(jobs)]))
      EMBEDDER_JOB_STATES.forEach((state) => {
        this.set({state}, jobsByState.get(state) ?? 0)
      })
    } catch (error) {
      Logger.error('Could not count embedder jobs for metrics', error)
    }
  }
})

export const graphqlPrometheusPlugin = usePrometheus({
  registry: register,
  endpoint: false,
  skipIntrospection: true,
  labels: {
    operationName: true,
    operationType: true,
    phase: true,
    path: false,
    fieldName: false,
    typeName: false,
    returnType: false
  },
  metrics: {
    graphql_envelop_request: true,
    graphql_envelop_error_result: true,
    graphql_envelop_request_duration: createHistogram({
      registry: register,
      histogram: {
        name: 'graphql_envelop_request_duration',
        help: 'Time to execute or subscribe to a GraphQL operation, in seconds',
        labelNames: ['operationType'] as const,
        buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
      },
      fillLabelsFn: ({operationType}) => ({operationType: operationType ?? 'unknown'})
    }),
    graphql_envelop_request_time_summary: false,
    graphql_envelop_phase_parse: false,
    graphql_envelop_phase_validate: false,
    graphql_envelop_phase_context: false,
    graphql_envelop_phase_execute: false,
    graphql_envelop_phase_subscribe: false,
    graphql_envelop_deprecated_field: false,
    graphql_envelop_schema_change: false,
    graphql_envelop_execute_resolver: false,
    graphql_yoga_http_duration: false
  }
})

export const metricsHandler = async (res: HttpResponse) => {
  let aborted = false
  res.onAborted(() => {
    aborted = true
  })

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
    Logger.error('Could not generate metrics', error)
    if (!aborted) {
      res.cork(() => {
        res.writeStatus('500 Internal Server Error')
        res.end()
      })
    }
  }
}
