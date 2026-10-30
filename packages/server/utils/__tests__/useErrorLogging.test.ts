import {GraphQLError} from 'graphql'
import {createSchema, createYoga} from 'graphql-yoga'
import {Logger} from '../Logger'
import {getLogContext} from '../requestLogContext'
import {useErrorLogging} from '../useErrorLogging'

const yoga = createYoga({
  schema: createSchema({
    typeDefs: 'type Query { crash: String, denied: String, logContext(teamId: ID): String }',
    resolvers: {
      Query: {
        crash: () => {
          throw new TypeError('boom')
        },
        denied: () => {
          throw new GraphQLError('Not authorized')
        },
        logContext: () => JSON.stringify(getLogContext())
      }
    }
  }),
  plugins: [useErrorLogging()],
  logging: Logger
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
