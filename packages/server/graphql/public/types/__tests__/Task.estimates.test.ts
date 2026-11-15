import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import Task from '../Task'

const mockSentSql: string[] = []
let mockIssueLabelNames: string[] = []

jest.mock('../../../../postgres/getKysely', () => {
  const {DummyDriver, Kysely, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler} =
    jest.requireActual<typeof import('kysely')>('kysely')
  const kysely = new Kysely({
    dialect: {
      createAdapter: () => new PostgresAdapter(),
      createDriver: () => new DummyDriver(),
      createIntrospector: (db) => new PostgresIntrospector(db),
      createQueryCompiler: () => new PostgresQueryCompiler()
    },
    log: (event) => {
      mockSentSql.push(event.query.sql)
    }
  })
  return {__esModule: true, default: () => kysely}
})

jest.mock('../../../../integrations/github/getGitHubRequest', () => ({
  __esModule: true,
  default: () => async () => [
    {repository: {issue: {labels: {nodes: mockIssueLabelNames.map((name) => ({name}))}}}},
    null
  ]
}))

jest.mock('../../../resolvers/resolveTaskIntegration', () => ({resolveTaskIntegration: jest.fn()}))

const resolve = Task.estimates
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const task = {
  id: 'task1',
  teamId: 'team1',
  integration: {service: 'github', accessUserId: 'user1', nameWithOwner: 'acme/web', issueNumber: 7}
} as unknown as Parameters<typeof resolve>[0]
const info = {} as GraphQLResolveInfo

const commentPushedEstimate = {
  taskId: 'task1',
  name: 'Story Points',
  label: '3',
  discussionId: null,
  pushService: null,
  pushTargetId: null
}

const resolveEstimates = (issueLabelNames: string[], repoTaskIds: string[]) => {
  mockIssueLabelNames = issueLabelNames
  const loaders: Record<string, unknown> = {
    githubAuth: {load: async () => ({accessToken: 'token'})},
    latestTaskEstimates: {load: async () => [commentPushedEstimate], clear: () => {}},
    taskIdsByTeamAndIntegration: {load: async () => repoTaskIds}
  }
  const context = {
    authToken: {sub: 'viewer1'},
    dataLoader: {get: (name: string) => loaders[name]}
  } as unknown as GQLContext
  return resolve(task, {}, context, info)
}

describe('Task.estimates for a GitHub issue', () => {
  beforeEach(() => {
    mockSentSql.length = 0
  })

  it('returns the estimates of an issue with no labels without sending an empty IN list', async () => {
    await expect(resolveEstimates([], ['task1'])).resolves.toEqual([commentPushedEstimate])
    expect(mockSentSql).toEqual([])
  })

  it('sends no empty IN list when the repo has no tasks', async () => {
    await expect(resolveEstimates(['SP: 3'], [])).resolves.toEqual([commentPushedEstimate])
    expect(mockSentSql).toEqual([])
  })

  it('still looks for a similar estimate among the labels on the issue', async () => {
    await resolveEstimates(['SP: 3', 'bug'], ['task1', 'task2'])
    expect(mockSentSql).toEqual([
      'select * from "TaskEstimate" where "taskId" in ($1, $2) and "name" = $3 and "pushService" = $4 and "pushTargetId" in ($5, $6) limit $7'
    ])
  })
})
