import {
  normalizeEndpoint,
  readBodyStart,
  readThirdPartyResponse,
  ThirdPartyResponseError
} from '../ThirdPartyResponseError'

test('an endpoint keeps its host and shape and loses its ids', () => {
  expect(
    normalizeEndpoint(
      new URL(
        'https://api.atlassian.com/ex/jira/0e0e0e0e-0000-4000-8000-000000000000/rest/api/3/issue/PROJ-12?expand=names'
      )
    )
  ).toBe('api.atlassian.com/ex/jira/:id/rest/api/3/issue/:id')
})

test('only the start of a long body is read, and its credentials are masked', async () => {
  let pulledChunkCount = 0
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      pulledChunkCount++
      controller.enqueue(new TextEncoder().encode(`{"token":"abc","page":"${'x'.repeat(300)}`))
    }
  })
  const text = await readBodyStart(new Response(body), 512)
  expect(text.startsWith('{"token":******,"page":"xxx')).toBe(true)
  // 512 bytes are read; masking can change the length a little
  expect(text.length).toBeLessThan(530)
  expect(pulledChunkCount).toBeLessThan(5)
})

test('a response becomes the record of what the service answered', async () => {
  const res = new Response('<html><title>Atlassian is down</title></html>', {
    status: 503,
    headers: {'content-type': 'text/html;charset=UTF-8'}
  })
  const response = await readThirdPartyResponse('jira', res, {
    url: 'https://api.atlassian.com/ex/jira/0e0e0e0e-0000-4000-8000-000000000000/rest/api/3/myself'
  })
  expect(response).toEqual({
    integration: 'jira',
    method: 'GET',
    endpoint: 'api.atlassian.com/ex/jira/:id/rest/api/3/myself',
    path: '/ex/jira/0e0e0e0e-0000-4000-8000-000000000000/rest/api/3/myself',
    status: 503,
    contentType: 'text/html;charset=UTF-8',
    body: '<html><title>Atlassian is down</title></html>'
  })
})

test('the error keeps the name and top frame a plain Error has, so its fingerprint stays put', () => {
  const getIssue = () =>
    new ThirdPartyResponseError('Received non-JSON Atlassian Response', {
      integration: 'jira',
      method: 'GET',
      endpoint: '',
      path: '',
      status: 503,
      contentType: '',
      body: ''
    })
  const error = getIssue()
  expect(error.name).toBe('Error')
  expect(error.stack?.split('\n')[1]).toContain('getIssue')
})
