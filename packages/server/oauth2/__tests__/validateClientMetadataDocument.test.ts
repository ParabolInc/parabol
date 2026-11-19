import validateClientMetadataDocument from '../validateClientMetadataDocument'

const CLIENT_ID = 'https://app.example.com/oauth/client.json'
const REDIRECT_URI = 'https://app.example.com/callback'

const makeDocument = (overrides: Record<string, unknown> = {}) => ({
  client_id: CLIENT_ID,
  client_name: 'Example App',
  redirect_uris: [REDIRECT_URI],
  token_endpoint_auth_method: 'none',
  ...overrides
})

test('accepts a document whose client_id matches its URL and lists the redirect URI', () => {
  expect(validateClientMetadataDocument(CLIENT_ID, makeDocument(), REDIRECT_URI)).toEqual({
    clientName: 'app.example.com',
    redirectUris: [REDIRECT_URI]
  })
  const {token_endpoint_auth_method: _omitted, ...withoutAuthMethod} = makeDocument()
  expect(validateClientMetadataDocument(CLIENT_ID, withoutAuthMethod, REDIRECT_URI)).toEqual({
    clientName: 'app.example.com',
    redirectUris: [REDIRECT_URI]
  })
})

test('rejects a client_id that differs from the URL', () => {
  const document = makeDocument({client_id: 'https://other.example.com/oauth/client.json'})
  expect(validateClientMetadataDocument(CLIENT_ID, document, REDIRECT_URI)).toEqual({
    error: expect.stringMatching(/^Invalid client_id/)
  })
  expect(validateClientMetadataDocument(CLIENT_ID, null, REDIRECT_URI)).toHaveProperty('error')
  expect(validateClientMetadataDocument(CLIENT_ID, [CLIENT_ID], REDIRECT_URI)).toHaveProperty(
    'error'
  )
})

test('rejects a redirect URI the document does not list', () => {
  expect(
    validateClientMetadataDocument(CLIENT_ID, makeDocument(), 'https://evil.example.com/callback')
  ).toEqual({error: expect.stringMatching(/^Invalid redirect_uri/)})
  expect(
    validateClientMetadataDocument(
      CLIENT_ID,
      makeDocument({redirect_uris: REDIRECT_URI}),
      REDIRECT_URI
    )
  ).toHaveProperty('error')
  expect(
    validateClientMetadataDocument(
      CLIENT_ID,
      makeDocument({redirect_uris: [REDIRECT_URI, 42]}),
      REDIRECT_URI
    )
  ).toHaveProperty('error')
})

test('rejects a token_endpoint_auth_method other than none', () => {
  for (const method of ['client_secret_post', 'client_secret_basic', 'private_key_jwt', null]) {
    const document = makeDocument({token_endpoint_auth_method: method})
    expect(validateClientMetadataDocument(CLIENT_ID, document, REDIRECT_URI)).toHaveProperty(
      'error'
    )
  }
})

test('rejects URLs that are not https, have no path, or carry a fragment', () => {
  for (const url of [
    'http://app.example.com/oauth/client.json',
    'https://app.example.com',
    'https://app.example.com/',
    'https://app.example.com/oauth/client.json#top',
    'https://app.example.com/oauth/client.json#',
    'https://user:pass@app.example.com/oauth/client.json',
    'https://app.example.com/oauth/../client.json',
    'not a url'
  ]) {
    const document = makeDocument({client_id: url})
    expect(validateClientMetadataDocument(url, document, REDIRECT_URI)).toEqual({
      error: expect.stringMatching(/^Invalid client_id/)
    })
  }
})

test('names the client by its host, never its own client_name', () => {
  const document = makeDocument({client_name: 'Parabol Official', logo_uri: 'https://x/logo.png'})
  expect(validateClientMetadataDocument(CLIENT_ID, document, REDIRECT_URI)).toMatchObject({
    clientName: 'app.example.com'
  })
})

test('a loopback redirect URI may use any port', () => {
  const document = makeDocument({redirect_uris: ['http://localhost/callback']})
  expect(
    validateClientMetadataDocument(CLIENT_ID, document, 'http://localhost:53682/callback')
  ).toEqual({clientName: 'app.example.com', redirectUris: ['http://localhost/callback']})
})

test('drops listed redirect URIs that are neither https nor loopback http', () => {
  const unsafe = ['javascript:alert(1)', 'http://app.example.com/callback']
  const document = makeDocument({redirect_uris: [...unsafe, REDIRECT_URI]})
  expect(validateClientMetadataDocument(CLIENT_ID, document, REDIRECT_URI)).toEqual({
    clientName: 'app.example.com',
    redirectUris: [REDIRECT_URI]
  })
  for (const redirectUri of unsafe) {
    expect(validateClientMetadataDocument(CLIENT_ID, document, redirectUri)).toHaveProperty('error')
  }
})
