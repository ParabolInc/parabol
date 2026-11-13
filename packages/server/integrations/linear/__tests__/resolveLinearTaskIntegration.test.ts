import type {GraphQLResolveInfo} from 'graphql'
import type {InternalContext} from '../../../graphql/graphql'
import {linearRequest} from '../../../graphql/public/rootSchema'
import type {Task} from '../../../postgres/types'
import isExpectedError from '../../../utils/isExpectedError'
import logError from '../../../utils/logError'
import type {IssueReadCtx} from '../../platform/ServerIntegrationDefinition'
import {PROVIDER_UNAVAILABLE} from '../../platform/toNestedRequestError'
import resolveLinearTaskIntegration from '../resolveLinearTaskIntegration'

jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))
jest.mock('../../../utils/logError', () => jest.fn())

const mockLinearRequest = jest.mocked(linearRequest)
const mockLogError = jest.mocked(logError)

const linearAnswers = (error: {message: string} & Record<string, unknown>) => {
  mockLinearRequest.mockResolvedValue({data: null, errors: [error]})
}

const readIssue = () =>
  resolveLinearTaskIntegration({
    task: {
      teamId: 'team1',
      integration: {
        service: 'linear',
        accessUserId: 'user1',
        issueId: 'issue1',
        repoId: 'linearTeam1'
      }
    } as unknown as Task,
    dataLoader: {
      get: () => ({load: async () => ({accessToken: 'lin_at', userId: 'user1'})})
    } as unknown as IssueReadCtx['dataLoader'],
    context: {} as InternalContext,
    info: {} as GraphQLResolveInfo,
    viewerId: 'user1',
    teamId: 'team1',
    userId: 'user1',
    fieldsToFetch: 'id'
  } as IssueReadCtx)

test('an issue deleted in Linear renders without its integration and is not logged', async () => {
  linearAnswers({
    message: 'Entity not found: Issue',
    extensions: {
      type: 'invalid input',
      code: 'INPUT_ERROR',
      statusCode: 400,
      userError: true,
      userPresentableMessage: 'Could not find referenced Issue.'
    }
  })
  expect(await readIssue()).toBeNull()
  expect(mockLogError).not.toHaveBeenCalled()
})

test('Linear not answering in time is logged as an expected error', async () => {
  linearAnswers({type: PROVIDER_UNAVAILABLE, message: 'The operation was aborted'})
  expect(await readIssue()).toBeNull()
  expect(mockLogError).toHaveBeenCalledTimes(1)
  const [error] = mockLogError.mock.calls[0]!
  expect(error.message).toBe('The operation was aborted')
  expect(isExpectedError(error)).toBe(true)
})

test('a failure Linear does not blame on the request is still logged as unexpected', async () => {
  linearAnswers({
    message: 'Internal server error',
    extensions: {type: 'internal error', statusCode: 500, userError: false}
  })
  await readIssue()
  expect(mockLogError).toHaveBeenCalledTimes(1)
  expect(isExpectedError(mockLogError.mock.calls[0]![0])).toBe(false)
})
