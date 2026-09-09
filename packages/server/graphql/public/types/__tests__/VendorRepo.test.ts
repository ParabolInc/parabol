jest.mock('../../rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

import type {GraphQLResolveInfo} from 'graphql'
import type {VendorRepoIntegration} from '../../../../integrations/platform/RemoteRepoIntegration'
import type {GQLContext} from '../../../graphql'
import VendorRepo from '../VendorRepo'

const resolveType = (repo: VendorRepoIntegration) => {
  const resolver = VendorRepo.__resolveType
  if (typeof resolver !== 'function') throw new Error('resolver must be a function')
  return resolver(repo, {} as unknown as GQLContext, {} as GraphQLResolveInfo)
}

describe('VendorRepo.__resolveType', () => {
  it('picks the stitched type by service', () => {
    expect(resolveType({id: 'acme/web', service: 'github', nameWithOwner: 'acme/web'})).toBe(
      '_xGitHubRepository'
    )
    expect(
      resolveType({
        __typename: 'Project',
        id: 'gid://gitlab/Project/1',
        fullPath: 'acme/web',
        service: 'gitlab'
      })
    ).toBe('_xGitLabProject')
  })

  it('tells a cached Linear team from a cached Linear project, ignoring the vendor typename', () => {
    expect(
      resolveType({
        __typename: 'Team',
        id: 'team1',
        teamId: 'team1',
        displayName: 'Parabol',
        key: 'PAR',
        service: 'linear'
      })
    ).toBe('_xLinearTeam')
    expect(
      resolveType({
        __typename: 'Project',
        id: 'proj1',
        teamId: 'team1',
        name: 'Test project',
        teams: {nodes: []},
        service: 'linear'
      })
    ).toBe('_xLinearProject')
  })
})
