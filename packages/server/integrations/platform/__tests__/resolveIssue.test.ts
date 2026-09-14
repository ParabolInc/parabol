jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))

import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql/graphql'
import {getServerIntegration} from '../registry'
import type {GqlIntegrationCtx} from '../ServerIntegrationDefinition'

const ctx = {
  teamId: 't1',
  userId: 'u1',
  context: {} as GQLContext,
  info: {} as GraphQLResolveInfo,
  dataLoader: {get: jest.fn()}
} as unknown as GqlIntegrationCtx

describe('resolveIssue for services whose TaskIntegration.id is the stored hash', () => {
  it('jira', async () => {
    expect(await getServerIntegration('jira').resolveIssue(ctx, 'cloud1:WEB-12')).toEqual({
      integrationHash: 'cloud1:WEB-12',
      integration: {
        accessUserId: 'u1',
        service: 'jira',
        cloudId: 'cloud1',
        issueKey: 'WEB-12',
        projectKey: 'WEB'
      }
    })
  })

  it('jira rejects an id with no cloud id', async () => {
    expect(await getServerIntegration('jira').resolveIssue(ctx, 'WEB-12')).toBeNull()
  })

  it('jira rejects an id with an empty part', async () => {
    expect(await getServerIntegration('jira').resolveIssue(ctx, ':WEB-12')).toBeNull()
    expect(await getServerIntegration('jira').resolveIssue(ctx, 'cloud1:')).toBeNull()
  })

  it('jiraServer', async () => {
    expect(await getServerIntegration('jiraServer').resolveIssue(ctx, '9:10001:10555')).toEqual({
      integrationHash: '9:10001:10555',
      integration: {
        accessUserId: 'u1',
        service: 'jiraServer',
        providerId: 9,
        repositoryId: '10001',
        issueId: '10555'
      }
    })
  })

  it('jiraServer rejects a non-numeric provider', async () => {
    expect(await getServerIntegration('jiraServer').resolveIssue(ctx, 'nope')).toBeNull()
  })

  it('azureDevOps', async () => {
    expect(
      await getServerIntegration('azureDevOps').resolveIssue(ctx, 'dev.azure.com/acme:Web:42')
    ).toEqual({
      integrationHash: 'dev.azure.com/acme:Web:42',
      integration: {
        accessUserId: 'u1',
        service: 'azureDevOps',
        instanceId: 'dev.azure.com/acme',
        projectKey: 'Web',
        issueKey: '42'
      }
    })
  })

  it('azureDevOps rejects an id with too few parts', async () => {
    expect(await getServerIntegration('azureDevOps').resolveIssue(ctx, 'instance:42')).toBeNull()
    expect(await getServerIntegration('azureDevOps').resolveIssue(ctx, '42')).toBeNull()
  })
})
