import {SpanKind, SpanStatusCode, trace} from '@opentelemetry/api'
import type {LogEvent} from 'kysely'
import tracer from './tracer'

const MAX_QUERY_TEXT_LENGTH = 2000
const QUERY_OPERATION = /^\s*(select|insert|update|delete|with)\b/i
const QUERY_TABLE = /\b(?:from|into|update)\s+"?(\w+)/i

const getQuerySummary = (sql: string) => {
  const operation = sql.match(QUERY_OPERATION)?.[1]?.toUpperCase() ?? 'SQL'
  const table = sql.match(QUERY_TABLE)?.[1]
  return table ? `${operation} ${table}` : operation
}

// Kysely calls its log hook once a query settles, so the span is drawn after the fact, under the span that awaited the query.
// Kysely awaits the hook inside the query, so it must never throw
const traceKyselyQuery = (event: LogEvent) => {
  if (!trace.getActiveSpan()?.isRecording()) return
  const endTime = performance.timeOrigin + performance.now()
  const {sql} = event.query
  const span = tracer.startSpan(getQuerySummary(sql), {
    kind: SpanKind.CLIENT,
    startTime: endTime - event.queryDurationMillis,
    attributes: {
      'db.system.name': 'postgresql',
      // parameterized, so it holds no values
      'db.query.text': sql.slice(0, MAX_QUERY_TEXT_LENGTH)
    }
  })
  if (event.level === 'error') {
    const {error} = event
    span.recordException(error instanceof Error ? error : String(error))
    span.setStatus({code: SpanStatusCode.ERROR})
  }
  span.end(endTime)
}

export default traceKyselyQuery
