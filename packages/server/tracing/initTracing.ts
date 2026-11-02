import {hostname} from 'node:os'
import {context, DiagLogLevel, diag, ROOT_CONTEXT, trace} from '@opentelemetry/api'
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks'
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http'
import {detectResources, envDetector, resourceFromAttributes} from '@opentelemetry/resources'
import {
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
  TracerProvider
} from '@opentelemetry/sdk-trace'
import {GoogleAuth} from 'google-auth-library'
import {getLogIdentity, Logger} from '../utils/Logger'
import {runWithoutLogContext} from '../utils/requestLogContext'
import traceOutboundHttp from './traceOutboundHttp'
import traceRedisCommands from './traceRedisCommands'

const SAMPLE_RATIO = Number(process.env.OTEL_TRACES_SAMPLER_ARG || 1)
if (!(SAMPLE_RATIO >= 0 && SAMPLE_RATIO <= 1)) {
  throw new Error(
    `Invalid OTEL_TRACES_SAMPLER_ARG: ${process.env.OTEL_TRACES_SAMPLER_ARG}, allowed values are 0 to 1`
  )
}

// an export runs in the context of whichever request started the batch, which has nothing to do with the export
const warnOutsideRequest = (message: unknown, ...params: unknown[]) =>
  context.with(ROOT_CONTEXT, () => runWithoutLogContext(() => Logger.warn(message, ...params)))

const getGoogleAuthHeaders = async (googleAuth: GoogleAuth) => {
  try {
    return Object.fromEntries(await googleAuth.getRequestHeaders())
  } catch (error) {
    warnOutsideRequest('Tracing could not get a Google access token', error)
    return {}
  }
}

const startTracing = (url: string) => {
  const googleAuth = new URL(url).hostname.endsWith('.googleapis.com')
    ? new GoogleAuth({scopes: 'https://www.googleapis.com/auth/cloud-platform'})
    : undefined
  const {service, env, version} = getLogIdentity()
  const resource = resourceFromAttributes({
    'service.name': service,
    'service.version': version,
    'deployment.environment.name': env,
    'host.name': hostname(),
    ...(googleAuth && {'gcp.project_id': googleAuth.getProjectId()})
  }).merge(detectResources({detectors: [envDetector]}))
  const ratioSampler = new TraceIdRatioBasedSampler(SAMPLE_RATIO)
  const provider = new TracerProvider({
    resource,
    // the client marks every operation sampled, so the server makes the decision for remote parents too
    sampler: new ParentBasedSampler({
      root: ratioSampler,
      remoteParentSampled: ratioSampler,
      remoteParentNotSampled: ratioSampler
    }),
    spanProcessors: [
      new BatchSpanProcessor({
        exporter: new OTLPTraceExporter({
          url,
          headers: googleAuth && (() => getGoogleAuthHeaders(googleAuth))
        })
      })
    ]
  })
  diag.setLogger(
    {
      error: warnOutsideRequest,
      warn: warnOutsideRequest,
      info: Logger.info,
      debug: Logger.debug,
      verbose: Logger.debug
    },
    DiagLogLevel.WARN
  )
  context.setGlobalContextManager(new AsyncLocalStorageContextManager())
  trace.setGlobalTracerProvider(provider)
  traceRedisCommands()
  traceOutboundHttp()
  return provider
}

const endpoint = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
const provider = endpoint ? startTracing(endpoint) : undefined

export const TRACING_ENABLED = !!provider

// a pod's grace period on shutdown is short, so a slow endpoint must not hold up the exit
export const flushTracing = async () => {
  await provider?.forceFlush({timeoutMillis: 2000})
}
