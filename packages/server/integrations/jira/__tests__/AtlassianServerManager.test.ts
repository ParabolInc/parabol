import fetchWithRetry from '../../../utils/fetchWithRetry'
import isExpectedError from '../../../utils/isExpectedError'
import {ThirdPartyResponseError} from '../../../utils/ThirdPartyResponseError'
import AtlassianServerManager, {JiraNoAccessResponseError} from '../AtlassianServerManager'

jest.mock('../../../utils/fetchWithRetry', () => jest.fn())
const mockFetchWithRetry = jest.mocked(fetchWithRetry)

const CLOUD_ID = '0e0e0e0e-0000-4000-8000-000000000000'
const htmlResponse = () =>
  new Response('<html><title>Atlassian is temporarily unavailable</title></html>', {
    status: 503,
    headers: {'content-type': 'text/html'}
  })

test('a page where JSON belongs comes back as an error that says what Atlassian sent', async () => {
  mockFetchWithRetry.mockResolvedValue(htmlResponse())
  const result = await new AtlassianServerManager('token').getMyself(CLOUD_ID)
  expect(result).toBeInstanceOf(ThirdPartyResponseError)
  const error = result as ThirdPartyResponseError
  expect(error.message).toBe('Received non-JSON Atlassian Response')
  expect(error.response).toEqual({
    integration: 'jira',
    method: 'GET',
    endpoint: 'api.atlassian.com/ex/jira/:id/rest/api/3/myself',
    path: `/ex/jira/${CLOUD_ID}/rest/api/3/myself`,
    status: 503,
    contentType: 'text/html',
    body: '<html><title>Atlassian is temporarily unavailable</title></html>'
  })
})

test('a POST that gets a page back says so instead of failing to parse it', async () => {
  mockFetchWithRetry.mockResolvedValue(htmlResponse())
  const result = await new AtlassianServerManager('token').createIssue(CLOUD_ID, 'PROJ', {
    summary: 'Fix the thing'
  } as Parameters<AtlassianServerManager['createIssue']>[2])
  expect(result).toBeInstanceOf(ThirdPartyResponseError)
  expect((result as ThirdPartyResponseError).response).toMatchObject({
    method: 'POST',
    endpoint: 'api.atlassian.com/ex/jira/:id/rest/api/3/issue',
    status: 503
  })
})

test('a site Jira no longer serves comes back as no access, not as an unexpected error', async () => {
  mockFetchWithRetry.mockResolvedValue(
    new Response(
      JSON.stringify({
        timestamp: '2020-01-01T00:00:00.000+0000',
        status: 404,
        error: 'Not Found',
        message: 'No message available',
        path: '/rest/api/3/issue/PROJ-1'
      }),
      {status: 404, headers: {'content-type': 'application/json'}}
    )
  )
  const result = await new AtlassianServerManager('token').getIssue(CLOUD_ID, 'PROJ-1')
  expect(result).toBeInstanceOf(JiraNoAccessResponseError)
  expect((result as Error).message).toBe('Not Found')
})

test('a JSON error that is not a 404 stays an unexpected error', async () => {
  mockFetchWithRetry.mockResolvedValue(
    new Response(JSON.stringify({code: 500, message: 'Internal Server Error'}), {
      status: 500,
      headers: {'content-type': 'application/json'}
    })
  )
  const result = await new AtlassianServerManager('token').getIssue(CLOUD_ID, 'PROJ-1')
  expect(result).toBeInstanceOf(Error)
  expect(result).not.toBeInstanceOf(JiraNoAccessResponseError)
  expect((result as Error).message).toBe('Internal Server Error')
})

test('a site the Parabol app is not installed on comes back as no access', async () => {
  mockFetchWithRetry.mockResolvedValue(
    new Response(
      JSON.stringify({code: 403, message: 'The app is not installed on this instance'}),
      {
        status: 403,
        headers: {'content-type': 'application/json'}
      }
    )
  )
  const result = await new AtlassianServerManager('token').getIssue(CLOUD_ID, 'PROJ-1')
  expect(result).toBeInstanceOf(JiraNoAccessResponseError)
  expect((result as Error).message).toBe('The app is not installed on this instance')
})

test('a Jira error list on a bad request stays an unexpected error', async () => {
  mockFetchWithRetry.mockResolvedValue(
    new Response(JSON.stringify({errorMessages: ['Field does not exist'], errors: {}}), {
      status: 400,
      headers: {'content-type': 'application/json'}
    })
  )
  const result = await new AtlassianServerManager('token').getIssue(CLOUD_ID, 'PROJ-1')
  expect(result).toBeInstanceOf(Error)
  expect(result).not.toBeInstanceOf(JiraNoAccessResponseError)
  expect((result as Error).message).toBe('Field does not exist')
})

test('Atlassian not answering in time is an expected error', async () => {
  mockFetchWithRetry.mockRejectedValue(new Error('Request aborted: deadline exceeded'))
  const result = await new AtlassianServerManager('token').getCloudNameLookup()
  expect(result).toBeInstanceOf(Error)
  expect((result as Error).message).toBe('Request aborted: deadline exceeded')
  expect(isExpectedError(result)).toBe(true)
})
