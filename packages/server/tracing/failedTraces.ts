type FailedTraceKeeper = (traceId: string) => boolean

let keeper: FailedTraceKeeper | undefined

// the logger reports each failure here, so tracing can export a request it did not sample
export const setFailedTraceKeeper = (failedTraceKeeper: FailedTraceKeeper | undefined) => {
  keeper = failedTraceKeeper
}

export const keepFailedTrace = (traceId: string) => keeper?.(traceId) ?? false
