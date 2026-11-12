import {ThirdPartyResponseError} from '../../../utils/ThirdPartyResponseError'
import JiraServerRestManager from '../JiraServerRestManager'

test('a Jira Data Center page where JSON belongs is reported with what the server sent', async () => {
  const response = new Response('<html><title>Log in - Jira</title></html>', {
    status: 200,
    headers: {'content-type': 'text/html;charset=UTF-8'}
  })
  Object.defineProperty(response, 'url', {value: 'https://jira.acme.co/rest/api/2/issue/PROJ-12'})
  const result = await JiraServerRestManager.prototype.parseJsonResponse.call(
    {} as JiraServerRestManager,
    response,
    'GET'
  )
  expect(result).toBeInstanceOf(ThirdPartyResponseError)
  expect((result as ThirdPartyResponseError).response).toEqual({
    integration: 'jiraServer',
    method: 'GET',
    endpoint: 'jira.acme.co/rest/api/2/issue/:id',
    path: '/rest/api/2/issue/PROJ-12',
    status: 200,
    contentType: 'text/html;charset=UTF-8',
    body: '<html><title>Log in - Jira</title></html>'
  })
})
