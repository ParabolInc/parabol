import type {GraphQLResolveInfo} from 'graphql'
import type {IntegrationSearchQuery as IntegrationSearchQueryDB} from '../../../../postgres/types'
import {CipherId} from '../../../../utils/CipherId'
import type {GQLContext} from '../../../graphql'
import IntegrationSearchQuery from '../IntegrationSearchQuery'

const lastUsedAt = new Date('2026-01-01')

const jiraRow: IntegrationSearchQueryDB = {
  createdAt: lastUsedAt,
  updatedAt: lastUsedAt,
  lastUsedAt,
  providerId: 1,
  teamId: 'team1',
  userId: 'user1',
  id: 7,
  service: 'jira',
  query: {queryString: 'bug', isJQL: false, projectKeyFilters: ['c:P']}
}

const legacyGitHubRow: IntegrationSearchQueryDB = {
  ...jiraRow,
  id: 8,
  service: 'github',
  query: {queryString: 'is:issue'}
}

const context = {} as GQLContext
const info = {} as GraphQLResolveInfo

const call = (resolver: unknown, row: IntegrationSearchQueryDB) => {
  if (typeof resolver !== 'function') throw new Error('resolver must be a function')
  return resolver(row, {}, context, info)
}

describe('IntegrationSearchQuery', () => {
  it('exposes everything the service stored beside queryString as meta JSON', () => {
    expect(call(IntegrationSearchQuery.id, jiraRow)).toBe(
      CipherId.toClient(jiraRow.id, 'integrationSearchQuery')
    )
    expect(call(IntegrationSearchQuery.id, jiraRow)).not.toContain(String(jiraRow.id))
    expect(call(IntegrationSearchQuery.queryString, jiraRow)).toBe('bug')
    expect(JSON.parse(call(IntegrationSearchQuery.meta, jiraRow))).toEqual({
      isJQL: false,
      projectKeyFilters: ['c:P']
    })
  })

  it('exposes an empty meta object for a row that stored only a queryString', () => {
    expect(call(IntegrationSearchQuery.meta, legacyGitHubRow)).toBe('{}')
  })
})
