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
    ['azureDevOps', 'AzureDevOpsRemoteProject']
  ])('picks the Parabol-owned %s type by service', (service, typename) => {
    expect(resolveType({service} as unknown as RemoteRepoIntegration)).toBe(typename)
  })

  it.each(['github', 'gitlab', 'linear'])(
    'wraps a stitched %s record in a RepoContainer',
    (service) => {
      expect(resolveType({service} as unknown as RemoteRepoIntegration)).toBe('RepoContainer')
    }
  )
})
