import type {GraphQLResolveInfo} from 'graphql'
import type {RemoteRepoIntegration} from '../../../../integrations/platform/RemoteRepoIntegration'
import type {GQLContext} from '../../../graphql'
import RepoIntegration from '../RepoIntegration'

const resolveType = (repo: RemoteRepoIntegration) => {
  const resolver = RepoIntegration.__resolveType
  if (typeof resolver !== 'function') throw new Error('resolver must be a function')
  return resolver(repo, {} as unknown as GQLContext, {} as GraphQLResolveInfo)
}

describe('RepoIntegration.__resolveType', () => {
  it.each([
    ['jira', 'JiraRemoteProject'],
    ['jiraServer', 'JiraServerRemoteProject'],
    ['azureDevOps', 'AzureDevOpsRemoteProject'],
    ['github', '_xGitHubRepository'],
    ['gitlab', '_xGitLabProject']
  ])('picks the %s type by service', (service, typename) => {
    expect(resolveType({service} as unknown as RemoteRepoIntegration)).toBe(typename)
  })

  it('tells a cached Linear team from a cached Linear project, ignoring the vendor typename', () => {
    expect(
      resolveType({
        __typename: '_xLinearTeam',
        service: 'linear',
        id: 'team1',
        teamId: 'team1',
        displayName: 'Parabol'
      } as unknown as RemoteRepoIntegration)
    ).toBe('_xLinearTeam')
    expect(
      resolveType({
        __typename: '_xLinearProject',
        service: 'linear',
        id: 'proj1',
        teamId: 'team1',
        name: 'Test project'
      } as unknown as RemoteRepoIntegration)
    ).toBe('LinearRemoteProject')
  })
})
