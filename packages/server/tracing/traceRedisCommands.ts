import {tracingChannel} from 'node:diagnostics_channel'
import {type Span, SpanKind, SpanStatusCode, trace} from '@opentelemetry/api'
import tracer from './tracer'

interface RedisCommand {
  command: string
  database: number
  serverAddress: string
  serverPort?: number
}

const commandSpans = new WeakMap<RedisCommand, Span>()

const traceRedisCommands = () => {
  tracingChannel<RedisCommand>('ioredis:command').subscribe({
    start(redisCommand) {
      // pub/sub and background jobs send commands too, but only those inside a sampled request are traced
      if (!trace.getActiveSpan()?.isRecording()) return
      const {command, database, serverAddress, serverPort} = redisCommand
      const operationName = command.toUpperCase()
      const span = tracer.startSpan(operationName, {
        kind: SpanKind.CLIENT,
        attributes: {
          'db.system.name': 'redis',
          'db.operation.name': operationName,
          'db.namespace': String(database),
          'server.address': serverAddress,
          ...(serverPort && {'server.port': serverPort})
        }
      })
      commandSpans.set(redisCommand, span)
    },
    end() {},
    asyncStart() {},
    asyncEnd(redisCommand) {
      commandSpans.get(redisCommand)?.end()
    },
    error(redisCommand) {
      const span = commandSpans.get(redisCommand)
      if (!span) return
      const {error} = redisCommand
      span.recordException(error instanceof Error ? error : String(error))
      span.setStatus({code: SpanStatusCode.ERROR})
    }
  })
}

export default traceRedisCommands
