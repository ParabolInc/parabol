import {AsyncLocalStorage} from 'node:async_hooks'
import type {Plugin} from 'graphql-yoga'
import {Histogram} from 'prom-client'

export interface VendorRequestInterval {
  start: number
  end: number
}

export interface OperationVendorWait {
  startedAt: number
  answeredRequests: VendorRequestInterval[]
}

// The latency SLO's threshold, which is also a bucket of graphql_envelop_request_duration
const LATENCY_SLO_SECONDS = 1

// Registered by metricsHandler, which is too heavy an import for the HTTP hooks that observe it
export const vendorRequestDuration = new Histogram({
  name: 'parabol_vendor_request_duration_seconds',
  help: 'Seconds until a third-party HTTP request got its response headers, by vendor host (other for hosts not listed in getVendorHost) and status class (error when no response came)',
  labelNames: ['host', 'status_class'] as const,
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30, 60],
  registers: []
})

const operationStorage = new AsyncLocalStorage<OperationVendorWait>()
const operationsByContext = new WeakMap<object, OperationVendorWait>()

export const getCurrentOperation = () => operationStorage.getStore()

// Work an operation starts without waiting for it, like a background cache refresh, must not count as its vendor wait
export const runOutsideOperation = <T>(fn: () => T) => operationStorage.exit(fn)

export const useVendorWait = (): Plugin => ({
  onExecute({args, executeFn, setExecuteFn}) {
    const operation: OperationVendorWait = {startedAt: performance.now(), answeredRequests: []}
    operationsByContext.set(args.contextValue, operation)
    setExecuteFn((executeArgs) => operationStorage.run(operation, executeFn, executeArgs))
  }
})

export const getUnionMs = (intervals: VendorRequestInterval[]) => {
  let unionMs = 0
  let coveredUntil = -Infinity
  for (const {start, end} of intervals.toSorted((a, b) => a.start - b.start)) {
    if (end <= coveredUntil) continue
    unionMs += end - Math.max(start, coveredUntil)
    coveredUntil = end
  }
  return unionMs
}

export const getSlowBecause = (durationSeconds: number, vendorWaitSeconds: number) =>
  durationSeconds > LATENCY_SLO_SECONDS &&
  durationSeconds - vendorWaitSeconds <= LATENCY_SLO_SECONDS
    ? 'vendor'
    : 'parabol'

export const getOperationSlowBecause = (contextValue: object) => {
  const operation = operationsByContext.get(contextValue)
  if (!operation) return 'parabol'
  const durationMs = performance.now() - operation.startedAt
  return getSlowBecause(durationMs / 1000, getUnionMs(operation.answeredRequests) / 1000)
}
