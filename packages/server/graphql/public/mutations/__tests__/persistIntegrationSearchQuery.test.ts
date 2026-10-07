import type {GraphQLResolveInfo} from 'graphql'
import type {IntegrationSearchQuery as IntegrationSearchQueryDB} from '../../../../postgres/types'
import type {GQLContext} from '../../../graphql'
import IntegrationSearchQuery from '../../types/IntegrationSearchQuery'
import IntegrationService, {type IntegrationServiceSource} from '../../types/IntegrationService'
import persistIntegrationSearchQuery from '../persistIntegrationSearchQuery'

jest.mock('../../../../integrations/platform/registry', () => ({
  isRegisteredServerIntegration: () => true,
  getServerIntegration: () => ({
    title: 'Jira',
    isConnected: async () => true,
    getAuthRow: async () => ({providerId: 1}),
    capabilities: {
      issueSearch: {
        buildQuery: jest.requireActual('../../../../integrations/jira/buildJiraSearchQuery').default
      }
    }
  })
}))

jest.mock('../../../../postgres/getKysely', () => {
  const values = jest.fn(() => ({
    onConflict: (build: (oc: unknown) => unknown) => {
      build({columns: () => ({where: () => ({doUpdateSet: () => undefined})})})
      return {execute: async () => undefined}
    }
  }))
  const kysely = {insertInto: () => ({values})}
  return {__esModule: true, default: () => kysely, values}
})

jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))

const {values: insertedValues} = jest.requireMock('../../../../postgres/getKysely') as {
  values: jest.Mock<unknown, [{query: IntegrationSearchQueryDB['query']}]>
}

const teamId = 'team1'
const providerId = 'integrationProvider:1'
const persistedRows: IntegrationSearchQueryDB[] = []

const buildContext = () => {
  const loaders: Record<string, unknown> = {
    integrationProviders: {load: async () => ({service: 'jira'})},
    teams: {loadNonNull: async () => ({orgId: 'org1'})},
    sharedIntegrationProviders: {load: async () => [{id: 1}]},
    recentIntegrationSearchQueries: {load: async () => persistedRows}
  }
  return {
    authToken: {sub: 'viewer1'},
    socketId: 'socket1',
    dataLoader: {get: (name: string) => loaders[name], share: () => 'op'}
  } as unknown as GQLContext
}

const info = {} as GraphQLResolveInfo
const resolve = persistIntegrationSearchQuery
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const run = (queryString: string, meta: string | null) =>
  resolve({}, {teamId, providerId, queryString, meta}, buildContext(), info)

describe('persistIntegrationSearchQuery', () => {
  beforeEach(() => {
    insertedValues.mockClear()
  })

  it.each([
    ['invalid JSON', '{isJQL', 'meta must be valid JSON'],
    ['a JSON array', '[]', 'meta must be a JSON object'],
    ['a JSON scalar', '"isJQL"', 'meta must be a JSON object'],
    ['more than 4096 characters', JSON.stringify({junk: 'x'.repeat(4096)}), 'at most 4096']
  ])('rejects meta that is %s before the service sees it', async (_label, meta, message) => {
    await expect(run('bug', meta)).rejects.toThrow(message)
    expect(insertedValues).not.toHaveBeenCalled()
  })

  it('rejects a meta key the service does not own', async () => {
    await expect(
      run('bug', JSON.stringify({isJQL: false, projectKeyFilters: [], repos: []}))
    ).rejects.toThrow('Unknown meta keys')
    expect(insertedValues).not.toHaveBeenCalled()
  })

  it('canonicalizes list order so a reordered search produces the same stored query', async () => {
    await run('bug', JSON.stringify({isJQL: false, projectKeyFilters: ['B', 'A']}))
    await run('bug', JSON.stringify({projectKeyFilters: ['A', 'B'], isJQL: false}))
    const [firstCall, secondCall] = insertedValues.mock.calls.map(([row]) => row!.query)
    expect(firstCall).toEqual(secondCall)
  })

  it('round-trips a saved search through IntegrationService.searchQueries', async () => {
    await run(
      '  project = flow  ',
      JSON.stringify({isJQL: true, projectKeyFilters: ['B', 'A', 'B']})
    )
    const [persisted] = insertedValues.mock.calls.map(([row]) => row!)
    const at = new Date('2026-01-01')
    persistedRows.length = 0
    persistedRows.push({
      ...persisted,
      id: 7,
      providerId: 1,
      createdAt: at,
      updatedAt: at,
      lastUsedAt: at
    } as IntegrationSearchQueryDB)

    const source: IntegrationServiceSource = {
      service: 'jira',
      title: 'Jira',
      capabilities: [],
      teamId,
      userId: 'viewer1'
    }
    const readBack = IntegrationService.searchQueries
    if (typeof readBack !== 'function') throw new Error('resolver must be a function')
    const rows = await readBack(source, {}, buildContext(), info)
    const row = rows[0]!

    const read = (resolver: unknown) => {
      if (typeof resolver !== 'function') throw new Error('resolver must be a function')
      return resolver(row, {}, buildContext(), info)
    }
    expect(read(IntegrationSearchQuery.queryString)).toBe('project = flow')
    expect(JSON.parse(read(IntegrationSearchQuery.meta))).toEqual({
      isJQL: true,
      projectKeyFilters: ['A', 'B']
    })
  })
})
