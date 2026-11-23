import {REGISTER_URL, registerClient} from './oauthClient'

const expectRefusal = async (response: Response, error: string) => {
  expect(response.status).toBe(400)
  expect(await response.json()).toMatchObject({error, error_description: expect.any(String)})
}

test('an agent registers itself as a public client', async () => {
  const registeredAt = Math.floor(Date.now() / 1000)
  const response = await registerClient({
    client_name: 'Claude Code',
    redirect_uris: ['http://localhost/callback', 'https://claude.ai/api/mcp/auth_callback'],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
    scope: 'users:read'
  })
  expect(response.status).toBe(201)
  expect(response.headers.get('Cache-Control')).toBe('no-store')
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  const client = await response.json()
  expect(client).toEqual({
    client_id: expect.stringMatching(/^prbl-cid-/),
    client_id_issued_at: expect.any(Number),
    client_name: 'Claude Code',
    redirect_uris: ['http://localhost/callback', 'https://claude.ai/api/mcp/auth_callback'],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none'
  })
  expect(client.client_id_issued_at).toBeGreaterThanOrEqual(registeredAt - 5)
})

test('every registration gets its own client_id', async () => {
  const metadata = {client_name: 'Twin', redirect_uris: ['https://example.com/callback']}
  const [first, second] = await Promise.all([registerClient(metadata), registerClient(metadata)])
  const [{client_id: firstId}, {client_id: secondId}] = await Promise.all([
    first.json(),
    second.json()
  ])
  expect(firstId).not.toBe(secondId)
})

test('a client that gives no name registers as an unnamed app', async () => {
  const response = await registerClient({redirect_uris: ['https://example.com/callback']})
  expect(response.status).toBe(201)
  expect(await response.json()).toMatchObject({client_name: 'Unnamed app'})
})

test('control and formatting characters are stripped from the name', async () => {
  const response = await registerClient({
    client_name: ' Claude‮\u0007 Code ',
    redirect_uris: ['https://example.com/callback']
  })
  expect(response.status).toBe(201)
  expect(await response.json()).toMatchObject({client_name: 'Claude Code'})
})

test('a name over 100 characters is refused', async () => {
  const response = await registerClient({
    client_name: 'x'.repeat(101),
    redirect_uris: ['https://example.com/callback']
  })
  await expectRefusal(response, 'invalid_client_metadata')
})

test('loopback redirect URIs may use HTTP', async () => {
  const response = await registerClient({
    client_name: 'Native app',
    redirect_uris: ['http://127.0.0.1/callback', 'http://[::1]:8080/callback']
  })
  expect(response.status).toBe(201)
})

test('redirect URIs must use HTTPS, or HTTP to a loopback address, with no fragment', async () => {
  for (const redirectUris of [
    undefined,
    [],
    'https://example.com/callback',
    ['http://example.com/callback'],
    ['https://example.com/callback#fragment'],
    ['javascript:alert(1)'],
    ['not a url'],
    [`https://example.com/${'x'.repeat(2048)}`],
    Array.from({length: 11}, (_, index) => `https://example.com/callback/${index}`)
  ]) {
    const response = await registerClient({client_name: 'Bad', redirect_uris: redirectUris})
    await expectRefusal(response, 'invalid_redirect_uri')
  }
})

test('a client that wants to authenticate with a secret is refused', async () => {
  const response = await registerClient({
    client_name: 'Confidential',
    redirect_uris: ['https://example.com/callback'],
    token_endpoint_auth_method: 'client_secret_basic'
  })
  await expectRefusal(response, 'invalid_client_metadata')
})

test('only the authorization code and refresh token grants register', async () => {
  for (const metadata of [
    {grant_types: ['client_credentials']},
    {grant_types: 'authorization_code'},
    {response_types: ['token']}
  ]) {
    const response = await registerClient({
      client_name: 'Other grants',
      redirect_uris: ['https://example.com/callback'],
      ...metadata
    })
    await expectRefusal(response, 'invalid_client_metadata')
  }
})

test('a body that is not a JSON object is refused', async () => {
  for (const body of ['not json', '[]', 'null', '']) {
    const response = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body
    })
    await expectRefusal(response, 'invalid_client_metadata')
  }
})
