import {GraphQLError} from 'graphql'
import {createSchema, createYoga} from 'graphql-yoga'
import {unexpectedGraphQLErrors} from '../../metricsHandler'
import {Logger} from '../Logger'
import maskErrorWithTraceId from '../maskErrorWithTraceId'
import {annotateLogContext, getLogContext} from '../requestLogContext'
import {useErrorLogging} from '../useErrorLogging'

const yoga = createYoga({
  schema: createSchema({
    typeDefs:
      'type Query { caughtBug: String, crash: String, denied: String, logContext(teamId: ID): String, team: Team, tenantCrash: String } type Team { teamLead: String } type Subscription { logContext: String, notInvited: String, subscribeCrash: String }',
    resolvers: {
      Query: {
        caughtBug: () => {
          throw new GraphQLError('Couldn’t create a poll', {
            extensions: {code: 'INTERNAL_SERVER_ERROR'}
          })
        },
        crash: () => {
          throw new TypeError('boom')
        },
        team: () => ({}),
        tenantCrash: () => {
          annotateLogContext({orgId: 'org1'})
          throw new TypeError('boom')
        },
        denied: () => {
          throw new GraphQLError('Not authorized')
        },
        logContext: () => JSON.stringify(getLogContext())
      },
      Team: {
        teamLead: () => {
          throw new TypeError('no lead')
        }
      },
      Subscription: {
        logContext: {
          // like a published message, the event arrives after the subscription starts
          subscribe: async function* () {
            await new Promise((resolve) => setTimeout(resolve, 0))
            yield {}
          },
          resolve: () => JSON.stringify(getLogContext())
        },
        notInvited: {
          subscribe: async () => {
            throw new GraphQLError('Not invited to the meeting', {extensions: {code: 'FORBIDDEN'}})
          }
        },
        subscribeCrash: {
          subscribe: async () => {
            throw new TypeError('no channel')
          }
        }
      }
    }
  }),
  plugins: [useErrorLogging()],
  logging: Logger,
  maskedErrors: {maskError: maskErrorWithTraceId}
})

const execute = async (
  query: string,
  variables?: Record<string, unknown>,
  serverContext?: Record<string, unknown>
) => {
  const response = await yoga.fetch(
    'http://localhost/graphql',
    {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({query, variables})
    },
    {authToken: {sub: 'user1'}, ip: '203.0.113.7', ...serverContext}
  )
  return response.json()
}

// reads the first event from yoga's server-sent event stream, which pulls events from its own loop as graphql-ws does
const subscribe = async (query: string, serverContext?: Record<string, unknown>) => {
  const response = await yoga.fetch(
    'http://localhost/graphql',
    {
      method: 'POST',
      headers: {'content-type': 'application/json', accept: 'text/event-stream'},
      body: JSON.stringify({query})
    },
    {authToken: {sub: 'user1'}, ip: '203.0.113.7', ...serverContext}
  )
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let stream = ''
  let event: RegExpMatchArray | null = null
  while (!event) {
    const {value, done} = await reader.read()
    if (done) break
    stream += decoder.decode(value)
    event = stream.match(/^data: (\{.*\})$/m)
  }
  await reader.cancel()
  return JSON.parse(event![1]!)
}

let errorSpy: jest.SpyInstance
let warnSpy: jest.SpyInstance
beforeEach(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  errorSpy.mockRestore()
  warnSpy.mockRestore()
})

test('a resolver crash is logged once, as an error, with the thrown error', async () => {
  const result = await execute('query Crash { crash }')
  expect(result.errors[0].message).toBe('Unexpected error.')
  expect(errorSpy).toHaveBeenCalledTimes(1)
  expect(errorSpy.mock.calls[0][0]).toBeInstanceOf(TypeError)
  expect(warnSpy).not.toHaveBeenCalled()
})

test('an intentional GraphQLError is logged once, as a warning', async () => {
  const result = await execute('query Denied { denied }')
  expect(result.errors[0].message).toBe('Not authorized')
  expect(warnSpy).toHaveBeenCalledTimes(1)
  expect(errorSpy).not.toHaveBeenCalled()
})

test('a bug the server catches keeps its message and is logged once, as an error', async () => {
  const result = await execute('query CaughtBug { caughtBug }')
  expect(result.errors[0].message).toBe('Couldn’t create a poll')
  expect(errorSpy).toHaveBeenCalledTimes(1)
  expect(warnSpy).not.toHaveBeenCalled()
})

test('a crash and a caught bug hand their trace id to the client, an intentional error does not', async () => {
  const serverContext = {traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'}
  const traceId = '4bf92f3577b34da6a3ce929d0e0e4736'
  const crash = await execute('query Crash { crash }', undefined, serverContext)
  expect(crash.errors[0]).toMatchObject({
    message: 'Unexpected error.',
    extensions: {code: 'INTERNAL_SERVER_ERROR', traceId}
  })
  const caughtBug = await execute('query CaughtBug { caughtBug }', undefined, serverContext)
  expect(caughtBug.errors[0]).toMatchObject({
    message: 'Couldn’t create a poll',
    extensions: {code: 'INTERNAL_SERVER_ERROR', traceId}
  })
  const denied = await execute('query Denied { denied }', undefined, serverContext)
  expect(denied.errors[0].extensions?.traceId).toBeUndefined()
})

test('only a crash or a caught bug counts as an unexpected error, once per operation', async () => {
  const countUnexpectedQueries = async () =>
    (await unexpectedGraphQLErrors.get()).values.find(
      ({labels}) => labels.operation_type === 'query'
    )?.value ?? 0
  const before = await countUnexpectedQueries()
  await execute('query Denied { denied }')
  expect(await countUnexpectedQueries()).toBe(before)
  await execute('query TwoCrashes { crash again: crash }')
  expect(await countUnexpectedQueries()).toBe(before + 1)
  await execute('query CaughtBug { caughtBug }')
  expect(await countUnexpectedQueries()).toBe(before + 2)
})

test('code running inside an operation sees its user, operation and variables', async () => {
  const result = await execute('query LogContext($teamId: ID) { logContext(teamId: $teamId) }', {
    teamId: 'team1'
  })
  expect(JSON.parse(result.data.logContext)).toMatchObject({
    userId: 'user1',
    ip: '203.0.113.7',
    operationName: 'LogContext',
    operationKind: 'query',
    variables: {teamId: 'team1'}
  })
})

test('an operation joins the trace and the tab session its client sent', async () => {
  const result = await execute('query LogContext { logContext }', undefined, {
    traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
    sessionId: 'tab-1',
    socketId: 'socket-1'
  })
  expect(JSON.parse(result.data.logContext)).toMatchObject({
    traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
    traceSampled: true,
    sessionId: 'tab-1',
    socketId: 'socket-1',
    component: 'graphql'
  })
})

test('a subscription event resolves inside the log context of its operation', async () => {
  const event = await subscribe('subscription LogContext { logContext }', {
    traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'
  })
  expect(JSON.parse(event.data.logContext)).toMatchObject({
    userId: 'user1',
    operationName: 'LogContext',
    operationKind: 'subscription',
    traceId: '4bf92f3577b34da6a3ce929d0e0e4736'
  })
})

test('a resolver error names its response path and the field that failed', async () => {
  await execute('query TeamLead { team { teamLead } }')
  expect(errorSpy.mock.calls[0][1]).toEqual({
    graphql: {path: 'team.teamLead', field: 'Team.teamLead'}
  })
})

test('the failed field is found through aliases and fragments', async () => {
  await execute(
    'query TeamLead { myTeam: team { ...TeamFields } } fragment TeamFields on Team { lead: teamLead }'
  )
  expect(errorSpy.mock.calls[0][1]).toEqual({
    graphql: {path: 'myTeam.lead', field: 'Team.teamLead'}
  })
})

test('what a resolver adds to the log context reaches the error logged after it', async () => {
  Reflect.set(globalThis, '__PRODUCTION__', true)
  try {
    await execute('query TenantCrash { tenantCrash }')
  } finally {
    Reflect.set(globalThis, '__PRODUCTION__', false)
  }
  expect(JSON.parse(errorSpy.mock.calls[0][0])).toMatchObject({
    orgId: 'org1',
    operationName: 'TenantCrash',
    graphql: {path: 'tenantCrash', field: 'Query.tenantCrash'}
  })
})

const subscribeInProduction = async (query: string) => {
  Reflect.set(globalThis, '__PRODUCTION__', true)
  try {
    return await subscribe(query)
  } finally {
    Reflect.set(globalThis, '__PRODUCTION__', false)
  }
}

test('a subscription the server refuses is logged once, as a warning, in its operation context', async () => {
  const event = await subscribeInProduction('subscription NotInvited { notInvited }')
  expect(event.errors[0].message).toBe('Not invited to the meeting')
  expect(errorSpy).not.toHaveBeenCalled()
  expect(warnSpy).toHaveBeenCalledTimes(1)
  expect(JSON.parse(warnSpy.mock.calls[0][0])).toMatchObject({
    level: 'warn',
    userId: 'user1',
    operationName: 'NotInvited',
    error: {message: 'Not invited to the meeting', expected: true}
  })
})

test('a subscription that crashes while subscribing is logged once, as an error, in its operation context', async () => {
  const event = await subscribeInProduction('subscription SubscribeCrash { subscribeCrash }')
  expect(event.errors[0].message).toBe('Unexpected error.')
  expect(warnSpy).not.toHaveBeenCalled()
  expect(errorSpy).toHaveBeenCalledTimes(1)
  expect(JSON.parse(errorSpy.mock.calls[0][0])).toMatchObject({
    level: 'error',
    userId: 'user1',
    operationName: 'SubscribeCrash',
    graphql: {path: 'subscribeCrash', field: 'Subscription.subscribeCrash'},
    error: {message: 'no channel', expected: false}
  })
})
