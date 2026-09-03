import type {GraphQLResolveInfo} from 'graphql'
import type {
  GitHubIntegrationSearchQuery,
  IntegrationSearchQuery as IntegrationSearchQueryDB,
  JiraIntegrationSearchQuery
} from '../../../../postgres/types'
import type {GQLContext} from '../../../graphql'
import GitHubSearchQuery from '../GitHubSearchQuery'
import IntegrationSearchQuery from '../IntegrationSearchQuery'
import JiraSearchQuery from '../JiraSearchQuery'

const lastUsedAt = new Date('2026-01-01')
const baseRow = {
  createdAt: lastUsedAt,
  updatedAt: lastUsedAt,
  lastUsedAt,
  providerId: 1,
  teamId: 'team1',
  userId: 'user1'
}

const jiraRow: JiraIntegrationSearchQuery = {
  ...baseRow,
  id: 7,
  service: 'jira',
  query: {queryString: 'q', isJQL: true, projectKeyFilters: ['c:P']}
}

const githubRow: GitHubIntegrationSearchQuery = {
  ...baseRow,
  id: 8,
  service: 'github',
  query: {queryString: 'is:issue is:open'}
}

const context = {} as GQLContext
const info = {} as GraphQLResolveInfo

const call = (resolver: unknown, row: IntegrationSearchQueryDB) => {
  if (typeof resolver !== 'function') throw new Error('resolver must be a function')
  return resolver(row, {}, context, info)
}

const resolveLastUsedAt = (resolvers: {lastUsedAt?: unknown}, row: IntegrationSearchQueryDB) =>
  typeof resolvers.lastUsedAt === 'function'
    ? resolvers.lastUsedAt(row, {}, context, info)
    : row.lastUsedAt

describe('JiraSearchQuery', () => {
  it('resolves every field from the db row', () => {
    expect(call(JiraSearchQuery.id, jiraRow)).toBe('JiraSearchQuery:7')
    expect(call(JiraSearchQuery.queryString, jiraRow)).toBe('q')
    expect(call(JiraSearchQuery.isJQL, jiraRow)).toBe(true)
    expect(call(JiraSearchQuery.projectKeyFilters, jiraRow)).toEqual(['c:P'])
    expect(resolveLastUsedAt(JiraSearchQuery, jiraRow)).toEqual(lastUsedAt)
  })
})

describe('GitHubSearchQuery', () => {
  it('resolves every field from the db row', () => {
    expect(call(GitHubSearchQuery.id, githubRow)).toBe('GitHubSearchQuery:8')
    expect(call(GitHubSearchQuery.queryString, githubRow)).toBe('is:issue is:open')
    expect(resolveLastUsedAt(GitHubSearchQuery, githubRow)).toEqual(lastUsedAt)
  })
})

describe('IntegrationSearchQuery', () => {
  it('resolves the concrete type from the row service', () => {
    expect(call(IntegrationSearchQuery.__resolveType, jiraRow)).toBe('JiraSearchQuery')
    expect(call(IntegrationSearchQuery.__resolveType, githubRow)).toBe('GitHubSearchQuery')
  })
})
