import {context, trace} from '@opentelemetry/api'
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks'
import {
  AlwaysOffSampler,
  createAlwaysRecordSampler,
  ParentBasedSampler,
  type ReadableSpan,
  type SpanProcessor,
  TracerProvider
} from '@opentelemetry/sdk-trace'
import {createSchema, createYoga} from 'graphql-yoga'
import {CompiledQuery} from 'kysely'
import {Logger} from '../../utils/Logger'
import traceKyselyQuery from '../traceKyselyQuery'
import {useTracing} from '../useTracing'

jest.mock('../initTracing', () => ({TRACING_ENABLED: true}))

// what production does for the share of requests it does not sample
const recordedSpans: ReadableSpan[] = []
const recordingProcessor: SpanProcessor = {
  onStart: () => {},
  onEnd: (span) => {
    recordedSpans.push(span)
  },
  forceFlush: async () => {},
  shutdown: async () => {}
}
trace.setGlobalTracerProvider(
  new TracerProvider({
    sampler: createAlwaysRecordSampler(new ParentBasedSampler({root: new AlwaysOffSampler()})),
    spanProcessors: [recordingProcessor]
  })
)
context.setGlobalContextManager(new AsyncLocalStorageContextManager())

const yoga = createYoga({
  schema: createSchema({
    typeDefs: 'type Query { team: Team } type Team { members: [String] }',
    resolvers: {
      Query: {
        team: async () => {
          await Promise.resolve()
          traceKyselyQuery({
            level: 'query',
            query: CompiledQuery.raw('select "id" from "Team" where "id" = $1', ['team1']),
            queryDurationMillis: 3
          })
          return {}
        }
      },
      Team: {
        members: async () => ['user1']
      }
    }
  }),
  plugins: [useTracing()],
  logging: Logger
})

test('an unsampled operation records itself and its queries, but not one span per resolver', async () => {
  const response = await yoga.fetch(
    'http://localhost/graphql',
    {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({query: 'query TeamQuery { team { members } }'})
    },
    {authToken: {sub: 'user1'}, ip: '203.0.113.7'}
  )
  expect((await response.json()).data.team.members).toEqual(['user1'])
  expect(recordedSpans.map(({name}) => name).sort()).toEqual(['SELECT Team', 'query TeamQuery'])
  const [querySpan, operationSpan] = ['SELECT Team', 'query TeamQuery'].map(
    (name) => recordedSpans.find((span) => span.name === name)!
  )
  expect(querySpan!.parentSpanContext?.spanId).toBe(operationSpan!.spanContext().spanId)
})
