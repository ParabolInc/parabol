import fetchWithRetry from '../../utils/fetchWithRetry'
import logError from '../../utils/logError'
import {jiraIssue} from '../atlassianLoaders'
import type RootDataLoader from '../RootDataLoader'

jest.mock('../../utils/fetchWithRetry', () => jest.fn())
jest.mock('../../utils/logError', () => jest.fn())
jest.mock('../../utils/publish', () => jest.fn())

const mockFetchWithRetry = jest.mocked(fetchWithRetry)
const mockLogError = jest.mocked(logError)

const suffix = `jil-${Date.now()}`
const teamId = `team-${suffix}`
const userId = `user-${suffix}`
const cloudId = '0e0e0e0e-0000-4000-8000-000000000000'

const makeLoader = () => {
  const parent = {
    dataLoaderOptions: {},
    get: (name: string) => ({
      load: async () => (name === 'freshAtlassianAuth' ? {accessToken: 'token'} : [])
    })
  } as unknown as RootDataLoader
  return jiraIssue(parent)
}

const jsonResponse = (status: number, body: object) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {'content-type': 'application/json'}
  })

beforeEach(() => {
  jest.clearAllMocks()
})

test('an issue that is gone or hidden from the user is not logged as an error', async () => {
  mockFetchWithRetry.mockResolvedValue(
    jsonResponse(404, {
      errorMessages: ['Der Vorgang existiert nicht oder Sie haben keine Berechtigung.'],
      errors: {}
    })
  )
  const issue = await makeLoader().load({
    teamId,
    userId,
    cloudId,
    issueKey: `GONE-${Date.now()}`,
    viewerId: userId
  })
  expect(issue).toBeNull()
  expect(mockLogError).not.toHaveBeenCalled()
})

test('an issue Jira refuses with its 403 page is not logged as an error', async () => {
  mockFetchWithRetry.mockResolvedValue(
    new Response('<html>\n<head>\n    <title> (null)</title>\n</head>\n</html>', {
      status: 403,
      headers: {'content-type': 'text/html;charset=utf-8'}
    })
  )
  const issue = await makeLoader().load({
    teamId,
    userId,
    cloudId,
    issueKey: `DENIED-${Date.now()}`,
    viewerId: userId
  })
  expect(issue).toBeNull()
  expect(mockLogError).not.toHaveBeenCalled()
})

test('an issue on a site the Parabol app is not installed on is not logged as an error', async () => {
  mockFetchWithRetry.mockResolvedValue(
    jsonResponse(403, {code: 403, message: 'The app is not installed on this instance'})
  )
  const issue = await makeLoader().load({
    teamId,
    userId,
    cloudId,
    issueKey: `UNINSTALLED-${Date.now()}`,
    viewerId: userId
  })
  expect(issue).toBeNull()
  expect(mockLogError).not.toHaveBeenCalled()
})

test('other Jira failures are still logged', async () => {
  mockFetchWithRetry.mockResolvedValue(jsonResponse(500, {message: 'Internal server error'}))
  const issue = await makeLoader().load({
    teamId,
    userId,
    cloudId,
    issueKey: `BOOM-${Date.now()}`,
    viewerId: userId
  })
  expect(issue).toBeNull()
  expect(mockLogError).toHaveBeenCalledTimes(1)
})
