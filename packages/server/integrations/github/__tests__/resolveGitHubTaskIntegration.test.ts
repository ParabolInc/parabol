import type {GraphQLResolveInfo} from 'graphql'
import type {InternalContext} from '../../../graphql/graphql'
import {githubRequest} from '../../../graphql/public/rootSchema'
import type {Task} from '../../../postgres/types'
import isExpectedError from '../../../utils/isExpectedError'
import logError from '../../../utils/logError'
import type {IssueReadCtx} from '../../platform/ServerIntegrationDefinition'
import {PROVIDER_UNAVAILABLE} from '../../platform/toNestedRequestError'
import resolveGitHubTaskIntegration from '../resolveGitHubTaskIntegration'

jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))
jest.mock('../../../utils/logError', () => jest.fn())

const mockGitHubRequest = jest.mocked(githubRequest)
const mockLogError = jest.mocked(logError)

beforeEach(() => {
  jest.clearAllMocks()
})

const githubAnswers = (data: unknown, error: {message: string} & Record<string, unknown>) => {
  mockGitHubRequest.mockResolvedValue({data, errors: [error]})
}

const readIssue = () =>
  resolveGitHubTaskIntegration({
    task: {
      teamId: 'team1',
      integration: {
        service: 'github',
        accessUserId: 'user1',
        nameWithOwner: 'acme/web',
        issueNumber: 42
      }
    } as unknown as Task,
    dataLoader: {
      get: () => ({load: async () => ({accessToken: 'gho_token'})})
    } as unknown as IssueReadCtx['dataLoader'],
    context: {} as InternalContext,
    info: {} as GraphQLResolveInfo,
    viewerId: 'user1',
    teamId: 'team1',
    userId: 'user1',
    fieldsToFetch: 'id'
  } as IssueReadCtx)

test('an issue deleted in GitHub resolves to what GitHub answered and is not logged', async () => {
  githubAnswers(
    {repository: {issue: null}},
    {
      type: 'NOT_FOUND',
      path: ['repository', 'issue'],
      locations: [{line: 4, column: 19}],
      message: 'Could not resolve to an Issue with the number of 42.'
    }
  )
  expect(await readIssue()).toEqual({repository: {issue: null}})
  expect(mockLogError).not.toHaveBeenCalled()
})

test('GitHub not answering in time is logged as an expected error', async () => {
  githubAnswers(null, {type: PROVIDER_UNAVAILABLE, message: 'The operation was aborted'})
  expect(await readIssue()).toBeNull()
  expect(mockLogError).toHaveBeenCalledTimes(1)
  const [error] = mockLogError.mock.calls[0]!
  expect(error.message).toBe('The operation was aborted')
  expect(isExpectedError(error)).toBe(true)
})

test('a failure GitHub does not blame on the request is still logged as unexpected', async () => {
  githubAnswers(null, {type: 'SERVICE_UNAVAILABLE', message: 'Something went wrong'})
  await readIssue()
  expect(mockLogError).toHaveBeenCalledTimes(1)
  const [error] = mockLogError.mock.calls[0]!
  expect(error.message).toBe('Something went wrong')
  expect(isExpectedError(error)).toBe(false)
})
