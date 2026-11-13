import type {GraphQLResolveInfo} from 'graphql'
import type {InternalContext} from '../../../graphql/graphql'
import {gitlabRequest} from '../../../graphql/public/rootSchema'
import type {TeamMemberIntegrationAuth} from '../../../postgres/types'
import GitLabServerManager, {GitLabRateLimitError} from '../GitLabServerManager'

jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))

const manager = new GitLabServerManager(
  {providerId: 7, userId: 'user1', accessToken: 'tok'} as TeamMemberIntegrationAuth,
  {} as InternalContext,
  {} as GraphQLResolveInfo,
  'https://gitlab.example.com'
)

const searchIssuesAnswering = async (error: {message: string; extensions?: object}) => {
  jest.mocked(gitlabRequest).mockResolvedValue({data: {project: null}, errors: [error]})
  const [, err] = await manager.getProjectIssues({fullPath: 'acme/web', first: 25})
  return err
}

const SEARCH_LIMIT_MESSAGE =
  'This endpoint has been requested with the search argument too many times. Try again later.'

test.each([
  ['an older GitLab', {message: SEARCH_LIMIT_MESSAGE}],
  [
    'a GitLab that tags it',
    {message: 'Slow down', extensions: {error_type: 'rate_limited', limit: 'search_rate_limit'}}
  ]
])('recognizes the rate limit of %s', async (_name, error) => {
  expect(await searchIssuesAnswering(error)).toBeInstanceOf(GitLabRateLimitError)
})

test('keeps any other GitLab error as it is', async () => {
  const err = await searchIssuesAnswering({
    message: 'The resource that you are attempting to access does not exist'
  })
  expect(err).not.toBeInstanceOf(GitLabRateLimitError)
  expect(err?.message).toBe('The resource that you are attempting to access does not exist')
})
