import AtlassianServerManager from '../AtlassianServerManager'
import fetchWithRetry from '../fetchWithRetry'
import {ThirdPartyResponseError} from '../ThirdPartyResponseError'

jest.mock('../fetchWithRetry', () => jest.fn())
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
