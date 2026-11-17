jest.mock('../../../rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))
jest.mock('../fetchParabolIssues', () => ({__esModule: true, default: jest.fn()}))

import type {GraphQLResolveInfo} from 'graphql'
import {serverIntegrations} from '../../../../../integrations/platform/registry'
import type {GQLContext} from '../../../../graphql'
import fetchIssues from '../fetchIssues'
import fetchParabolIssues from '../fetchParabolIssues'

const dataLoader = {}
const context = {dataLoader} as unknown as GQLContext
const info = {} as GraphQLResolveInfo
const issue = {
  kind: 'Issue',
  title: 't',
  reference: 'r',
  url: 'u',
  updatedAt: null,
  description: null
}

describe('fetchIssues', () => {
  it('reads Parabol tasks without the registry', async () => {
    jest.mocked(fetchParabolIssues).mockResolvedValue([issue])
    await expect(fetchIssues('PARABOL', 'q', 'team1', 'user1', context, info)).resolves.toEqual([
      issue
    ])
    expect(fetchParabolIssues).toHaveBeenCalledWith('team1', 'user1', 'q')
  })

  it('dispatches an integration through its issueList capability', async () => {
    const listIssues = jest
      .spyOn(serverIntegrations.github.capabilities.issueList, 'listIssues')
      .mockResolvedValue([issue])
    await expect(fetchIssues('github', 'is:pr', 'team1', 'user1', context, info)).resolves.toEqual([
      issue
    ])
    expect(listIssues).toHaveBeenCalledWith(
      {dataLoader, teamId: 'team1', userId: 'user1', context, info},
      'is:pr'
    )
  })

  it('rejects a service that lists no issues', async () => {
    await expect(fetchIssues('gitlab', 'q', 'team1', 'user1', context, info)).rejects.toThrow(
      'Inspiration items are not yet supported for gitlab'
    )
  })
})
