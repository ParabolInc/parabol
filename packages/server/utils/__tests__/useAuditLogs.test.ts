import {GraphQLError, GraphQLSchema} from 'graphql'
import {createSchema, createYoga, type Plugin} from 'graphql-yoga'
import {Logger} from '../Logger'
import {useAuditLogs} from '../useAuditLogs'
import {useErrorLogging} from '../useErrorLogging'

process.env.AUDIT_LOGS = 'true'

interface TestContext {
  authToken: {sub: string; act?: {sub: string}} | null
}

const makeSchema = () =>
  createSchema<TestContext>({
    typeDefs: `
      type Query { ping: String }
      type StandardError { message: String }
      type LoginPayload { userId: ID, error: StandardError }
      type Mutation {
        ping: String
        renameTeam(teamId: ID!, name: String!): String
        removeTeamMember(teamMemberId: ID!): String
        archiveTeam(teamId: ID!): String
        loginWithPassword(email: String!, password: String!): LoginPayload
        uploadOrgImage(orgId: ID!, file: String): String
      }`,
    resolvers: {
      Mutation: {
        ping: () => 'pong',
        renameTeam: (_source, {name}) => name,
        removeTeamMember: () => new GraphQLError('Not authorized'),
        archiveTeam: () => {
          throw new TypeError('boom')
        },
        loginWithPassword: (_source, {password}, context) => {
          if (password !== 'hunter2') return {error: {message: 'Invalid email or password'}}
          context.authToken = {sub: 'user2'}
          return {userId: 'user2'}
        },
        uploadOrgImage: () => 'https://example.com/logo.png'
      }
    }
  })

const yoga = createYoga({
  schema: makeSchema(),
  plugins: [
    useAuditLogs({
      excludeArgs: {uploadOrgImage: ['file']},
      includeOps: new Set([
        'renameTeam',
        'removeTeamMember',
        'archiveTeam',
        'loginWithPassword',
        'uploadOrgImage'
      ])
    }),
    useErrorLogging()
  ],
  logging: Logger
})

const execute = async (query: string, serverContext?: Record<string, unknown>, server = yoga) => {
  const response = await server.fetch(
    'http://localhost/graphql',
    {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({query})
    },
    {authToken: {sub: 'user1'}, ip: '203.0.113.7', ...serverContext}
  )
  return response.json()
}

let logSpy: jest.SpyInstance
const getAuditRecords = () =>
  logSpy.mock.calls
    .map(([line]) => JSON.parse(line))
    .filter((record: {type?: string}) => record.type === 'audit')

beforeEach(() => {
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  jest.restoreAllMocks()
})

test('an audited field that is not the first root field is audited, with its outcome', async () => {
  const result = await execute('mutation { ping renameTeam(teamId: "team1", name: "Retro") }')
  expect(result.data).toEqual({ping: 'pong', renameTeam: 'Retro'})
  expect(getAuditRecords()).toEqual([
    expect.objectContaining({
      userId: 'user1',
      ipAddress: '203.0.113.7',
      operation: 'renameTeam',
      variables: {teamId: 'team1', name: 'Retro'},
      outcome: 'success'
    })
  ])
})

test('every audited root field is audited, behind aliases and fragments', async () => {
  await execute(`
    mutation { first: renameTeam(teamId: "team1", name: "A") ...SecondRename }
    fragment SecondRename on Mutation { second: renameTeam(teamId: "team2", name: "B") }
  `)
  expect(getAuditRecords().map(({variables}) => variables.teamId)).toEqual(['team1', 'team2'])
})

test('a denied or crashed field is audited as a failure with its reason', async () => {
  const result = await execute(
    'mutation { ping removeTeamMember(teamMemberId: "tm1") archiveTeam(teamId: "team1") }'
  )
  expect(result.data.ping).toBe('pong')
  expect(getAuditRecords()).toEqual([
    expect.objectContaining({
      operation: 'removeTeamMember',
      outcome: 'failure',
      reason: 'Not authorized'
    }),
    expect.objectContaining({operation: 'archiveTeam', outcome: 'failure', reason: 'boom'})
  ])
})

test('an error payload is a failure even when the document does not select it', async () => {
  await execute(
    'mutation { loginWithPassword(email: "jane@example.com", password: "wrong") { userId } }',
    {authToken: null}
  )
  expect(getAuditRecords()).toEqual([
    expect.objectContaining({
      userId: '',
      variables: {email: 'jane@example.com', password: '******'},
      outcome: 'failure',
      reason: 'Invalid email or password'
    })
  ])
})

test('a login is attributed to the user it signs in', async () => {
  await execute(
    'mutation { loginWithPassword(email: "jane@example.com", password: "hunter2") { userId } }',
    {authToken: null}
  )
  expect(getAuditRecords()).toEqual([
    expect.objectContaining({userId: 'user2', outcome: 'success'})
  ])
})

test('an impersonated operation names the staff member, a token operation names its token', async () => {
  await execute('mutation { renameTeam(teamId: "team1", name: "A") }', {
    authToken: {sub: 'user1', act: {sub: 'staff1'}}
  })
  await execute('mutation { renameTeam(teamId: "team1", name: "B") }', {
    personalAccessTokenId: 'pat_abcdefgh'
  })
  const [impersonated, withToken] = getAuditRecords()
  expect(impersonated).toMatchObject({userId: 'user1', impersonatorId: 'staff1'})
  expect(impersonated.personalAccessTokenId).toBeUndefined()
  expect(withToken).toMatchObject({userId: 'user1', personalAccessTokenId: 'pat_abcdefgh'})
  expect(withToken.impersonatorId).toBeUndefined()
})

test('excluded arguments are masked', async () => {
  await execute('mutation { uploadOrgImage(orgId: "org1", file: "<binary>") }')
  expect(getAuditRecords()).toEqual([
    expect.objectContaining({variables: {orgId: 'org1', file: '******'}, outcome: 'success'})
  ])
})

test('an audit record joins the trace and the tab session of its operation', async () => {
  await execute('mutation { renameTeam(teamId: "team1", name: "A") }', {
    traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
    sessionId: 'tab-1'
  })
  expect(getAuditRecords()).toEqual([
    expect.objectContaining({trace_id: '4bf92f3577b34da6a3ce929d0e0e4736', sessionId: 'tab-1'})
  ])
})

test('an audited field is audited once, however often its schema is swapped in', async () => {
  const schema = makeSchema()
  // like a superuser's schema swap, after which useDeferStream copies the schema around the same fields
  const swapInCopy: Plugin = {
    onEnveloped: ({setSchema}) => setSchema(new GraphQLSchema(schema.toConfig()))
  }
  const swappingYoga = createYoga({
    schema,
    plugins: [swapInCopy, useAuditLogs({includeOps: new Set(['renameTeam'])})]
  })
  await execute('mutation { renameTeam(teamId: "team1", name: "A") }', undefined, swappingYoga)
  await execute('mutation { renameTeam(teamId: "team1", name: "B") }', undefined, swappingYoga)
  expect(getAuditRecords().map(({variables}) => variables.name)).toEqual(['A', 'B'])
})
