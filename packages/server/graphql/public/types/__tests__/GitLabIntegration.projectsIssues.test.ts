import type {GraphQLResolveInfo} from 'graphql'
import {freshAuth} from '../../../../dataloader/freshAuthLoaders'
import type RootDataLoader from '../../../../dataloader/RootDataLoader'
import GitLabServerManager from '../../../../integrations/gitlab/GitLabServerManager'
import createOAuth2Manager from '../../../../integrations/platform/createOAuth2Manager'
import type {TeamMemberIntegrationAuth} from '../../../../postgres/types'
import logError from '../../../../utils/logError'
import type {GQLContext} from '../../../graphql'
import GitLabIntegration from '../GitLabIntegration'

jest.mock('../../../../integrations/gitlab/GitLabServerManager', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../../../integrations/platform/createOAuth2Manager')
jest.mock('../../../../postgres/queries/syncTeamMemberIntegrationAuthTokens')
jest.mock('../../../../utils/logError')

const source = {teamId: 'team1', userId: 'user1'}
const provider = {
  id: 7,
  service: 'gitlab',
  authStrategy: 'oauth2',
  serverBaseUrl: 'https://gitlab.example.com'
}
const expiredAuth = {
  id: 1,
  service: 'gitlab',
  ...source,
  providerId: 7,
  providerUserId: '99',
  accessToken: 'expired-token',
  refreshToken: 'refresh-token',
  scopes: 'api',
  expiresAt: new Date(Date.now() - 60_000)
} as TeamMemberIntegrationAuth

const makeContext = () => {
  const loaders: Record<string, unknown> = {
    teamMemberIntegrationAuthsByServiceTeamAndUserId: {load: async () => expiredAuth},
    integrationProviders: {load: async () => provider, loadNonNull: async () => provider}
  }
  const dataLoader = {dataLoaderOptions: {}, get: (name: string) => loaders[name]}
  loaders.freshAuth = freshAuth(dataLoader as unknown as RootDataLoader)
  return {dataLoader} as unknown as GQLContext
}

const resolve = GitLabIntegration.projectsIssues
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

describe('GitLabIntegration.projectsIssues', () => {
  beforeEach(() => {
    jest.mocked(createOAuth2Manager).mockReturnValue({
      refresh: async () => ({accessToken: 'fresh-token', refreshToken: '', expiresIn: 7200})
    } as unknown as ReturnType<typeof createOAuth2Manager>)
    jest.mocked(GitLabServerManager).mockImplementation(
      (auth) =>
        ({
          getProjects: async () =>
            auth.accessToken === 'fresh-token'
              ? [{projects: {edges: []}}, null]
              : [null, new Error('401 Unauthorized')]
        }) as unknown as GitLabServerManager
    )
  })

  it('refreshes an expired access token before asking GitLab for projects', async () => {
    const connection = await resolve(
      source,
      {first: 25, searchQuery: '', sort: 'UPDATED_DESC', state: 'opened'},
      makeContext(),
      {} as GraphQLResolveInfo
    )
    expect(jest.mocked(GitLabServerManager).mock.calls[0]?.[0]).toMatchObject({
      accessToken: 'fresh-token'
    })
    expect(logError).not.toHaveBeenCalled()
    expect(connection).toMatchObject({edges: [], pageInfo: {hasNextPage: false}})
  })
})
