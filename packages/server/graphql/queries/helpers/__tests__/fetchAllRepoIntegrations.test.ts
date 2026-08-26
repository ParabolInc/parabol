import type {GraphQLResolveInfo} from 'graphql'
import logError from '../../../../utils/logError'
import type {GQLContext} from '../../../graphql'
import fetchAllRepoIntegrations from '../fetchAllRepoIntegrations'

jest.mock('../../../../utils/logError')
jest.mock('../../../../integrations/platform/registry', () => ({
  serverIntegrations: {
    github: {
      service: 'github',
      capabilities: {
        repoList: {
          fetchRepos: jest.fn().mockResolvedValue([
            {id: 'o/a', service: 'github', nameWithOwner: 'o/a'},
            {id: 'o/b', service: 'github', nameWithOwner: 'o/b'}
          ])
        }
      }
    },
    gitlab: {
      service: 'gitlab',
      capabilities: {repoList: {fetchRepos: jest.fn().mockRejectedValue(new Error('gitlab down'))}}
    },
    jira: {
      service: 'jira',
      capabilities: {
        repoList: {fetchRepos: jest.fn().mockResolvedValue([{id: 'P', service: 'jira'}])}
      }
    }
  }
}))

describe('fetchAllRepoIntegrations', () => {
  it('interleaves every service and isolates one failing service', async () => {
    const context = {dataLoader: {}} as GQLContext
    const repos = await fetchAllRepoIntegrations('t1', 'u1', context, {} as GraphQLResolveInfo)
    expect(repos).toEqual([
      {id: 'o/a', service: 'github', nameWithOwner: 'o/a'},
      {id: 'P', service: 'jira'},
      {id: 'o/b', service: 'github', nameWithOwner: 'o/b'}
    ])
    expect(logError).toHaveBeenCalledWith(expect.objectContaining({message: 'gitlab down'}), {
      userId: 'u1',
      tags: {teamId: 't1', service: 'gitlab'}
    })
  })
})
