import type {GraphQLResolveInfo} from 'graphql'
import type {InternalContext} from '../../../graphql/graphql'
import type {TeamMemberIntegrationAuth} from '../../../postgres/types'
import GitLabServerManager from '../GitLabServerManager'

jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))

const auth = {providerId: 7, userId: 'user1', accessToken: 'tok'} as TeamMemberIntegrationAuth

test('created issues carry the global provider id the scoping UI compares against', async () => {
  const manager = new GitLabServerManager(
    auth,
    {} as InternalContext,
    {} as GraphQLResolveInfo,
    'https://gitlab.com'
  )
  jest
    .spyOn(manager, 'createIssue')
    .mockResolvedValue([{createIssue: {issue: {id: 'gid://gitlab/Issue/123'}}}, null] as never)
  const res = await manager.createTask({
    rawContentJSON: {
      type: 'doc',
      content: [{type: 'paragraph', content: [{type: 'text', text: 'Fix the build'}]}]
    },
    integrationRepoId: 'group/project'
  })
  expect(res).toEqual({
    integrationHash: 'integrationProvider:7::gid://gitlab/Issue/123',
    issueId: 'gid://gitlab/Issue/123',
    integration: {
      accessUserId: 'user1',
      service: 'gitlab',
      gid: 'gid://gitlab/Issue/123',
      providerId: 'integrationProvider:7'
    }
  })
})
