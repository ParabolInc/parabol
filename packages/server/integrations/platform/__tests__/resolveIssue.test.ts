jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))
jest.mock('../../jira/hasAtlassianSiteAccess')

import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql/graphql'
import hasAtlassianSiteAccess from '../../jira/hasAtlassianSiteAccess'
import {getServerIntegration} from '../registry'
import type {GqlIntegrationCtx} from '../ServerIntegrationDefinition'

const ctx = {
  teamId: 't1',
  userId: 'u1',
  context: {} as GQLContext,
  info: {} as GraphQLResolveInfo,
  dataLoader: {get: jest.fn()}
} as unknown as GqlIntegrationCtx

type MockIntegrationAuth =
  | {service: 'jira'; accessToken: string; scope: string; cloudIds: string[]}
  | {service: 'jiraServer'; accessToken: string; providerId: number}

const makeCtx = (auth: MockIntegrationAuth | null) =>
  ({
    teamId: 't1',
    userId: 'u1',
    context: {} as GQLContext,
    info: {} as GraphQLResolveInfo,
    dataLoader: {
      get: (name: string) => {
        if (name === 'freshAuth' || name === 'freshAtlassianAuth') {
          return {load: jest.fn().mockResolvedValue(auth)}
        }
        throw new Error(`Unexpected loader ${name}`)
      }
    }
  }) as unknown as GqlIntegrationCtx

const mockedHasAtlassianSiteAccess = jest.mocked(hasAtlassianSiteAccess)

const jiraAuth: MockIntegrationAuth = {
  service: 'jira',
  accessToken: 'tok',
  scope: 'read:jira-user read:jira-work write:jira-work',
  cloudIds: ['cloud1']
}

describe('resolveIssue for services whose TaskIntegration.id is the stored hash', () => {
  it('jira', async () => {
    mockedHasAtlassianSiteAccess.mockResolvedValue(true)
    expect(
      await getServerIntegration('jira').resolveIssue(makeCtx(jiraAuth), 'cloud1:WEB-12')
    ).toEqual({
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
    expect(await getServerIntegration('jira').resolveIssue(makeCtx(null), 'WEB-12')).toBeNull()
  })

  it('jira rejects an id with an empty part', async () => {
    expect(await getServerIntegration('jira').resolveIssue(makeCtx(null), ':WEB-12')).toBeNull()
    expect(await getServerIntegration('jira').resolveIssue(makeCtx(null), 'cloud1:')).toBeNull()
  })

  it('jira rejects an id whose cloud id the auth does not cover', async () => {
    mockedHasAtlassianSiteAccess.mockResolvedValue(false)
    expect(
      await getServerIntegration('jira').resolveIssue(makeCtx(jiraAuth), 'other:WEB-12')
    ).toBeNull()
  })

  it('jira rejects when there is no auth', async () => {
    expect(
      await getServerIntegration('jira').resolveIssue(makeCtx(null), 'cloud1:WEB-12')
    ).toBeNull()
    expect(mockedHasAtlassianSiteAccess).not.toHaveBeenCalled()
  })

  it('jiraServer', async () => {
    const jiraServerCtx = makeCtx({service: 'jiraServer', providerId: 9, accessToken: 'tok'})
    expect(
      await getServerIntegration('jiraServer').resolveIssue(jiraServerCtx, '9:10001:10555')
    ).toEqual({
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
    expect(await getServerIntegration('jiraServer').resolveIssue(makeCtx(null), 'nope')).toBeNull()
  })

  it('jiraServer rejects a provider id the auth does not cover', async () => {
    const jiraServerCtx = makeCtx({service: 'jiraServer', providerId: 8, accessToken: 'tok'})
    expect(
      await getServerIntegration('jiraServer').resolveIssue(jiraServerCtx, '9:10001:10555')
    ).toBeNull()
  })

  it('jiraServer rejects when there is no auth', async () => {
    expect(
      await getServerIntegration('jiraServer').resolveIssue(makeCtx(null), '9:10001:10555')
    ).toBeNull()
  })

  it('jiraServer rejects an id with extra segments', async () => {
    const jiraServerCtx = makeCtx({service: 'jiraServer', providerId: 9, accessToken: 'tok'})
    expect(
      await getServerIntegration('jiraServer').resolveIssue(jiraServerCtx, '9:10001:10555:extra')
    ).toBeNull()
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

  it('azureDevOps rejects an instance id that is not a dev.azure.com host', async () => {
    expect(
      await getServerIntegration('azureDevOps').resolveIssue(ctx, 'evil.example.com/acme:Web:42')
    ).toBeNull()
  })
})
