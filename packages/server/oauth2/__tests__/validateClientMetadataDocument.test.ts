import isRegisteredRedirectUri from '../isRegisteredRedirectUri'
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

const isListed = (redirectUris: string[], redirectUri: string) =>
  isRegisteredRedirectUri({clientType: 'public', redirectUris}, redirectUri)

test('accepts a document whose client_id matches its URL', () => {
  expect(validateClientMetadataDocument(CLIENT_ID, makeDocument())).toEqual({
    clientName: 'app.example.com',
    redirectUris: [REDIRECT_URI]
  })
  const {token_endpoint_auth_method: _omitted, ...withoutAuthMethod} = makeDocument()
  expect(validateClientMetadataDocument(CLIENT_ID, withoutAuthMethod)).toEqual({
    clientName: 'app.example.com',
    redirectUris: [REDIRECT_URI]
  })
})

test('rejects a client_id that differs from the URL', () => {
  const document = makeDocument({client_id: 'https://other.example.com/oauth/client.json'})
  expect(validateClientMetadataDocument(CLIENT_ID, document)).toEqual({
    error: expect.stringMatching(/^Invalid client_id/)
  })
  expect(validateClientMetadataDocument(CLIENT_ID, null)).toHaveProperty('error')
  expect(validateClientMetadataDocument(CLIENT_ID, [CLIENT_ID])).toHaveProperty('error')
})

test('rejects redirect_uris that are not a list of strings', () => {
  expect(
    validateClientMetadataDocument(CLIENT_ID, makeDocument({redirect_uris: REDIRECT_URI}))
  ).toHaveProperty('error')
  expect(
    validateClientMetadataDocument(CLIENT_ID, makeDocument({redirect_uris: [REDIRECT_URI, 42]}))
  ).toHaveProperty('error')
})

test('a redirect URI the document does not list is not registered', () => {
  const metadata = validateClientMetadataDocument(CLIENT_ID, makeDocument())
  if ('error' in metadata) throw new Error(metadata.error)
  expect(isListed(metadata.redirectUris, 'https://evil.example.com/callback')).toBe(false)
  expect(isListed(metadata.redirectUris, REDIRECT_URI)).toBe(true)
})

test('rejects a token_endpoint_auth_method other than none', () => {
  for (const method of ['client_secret_post', 'client_secret_basic', 'private_key_jwt', null]) {
    const document = makeDocument({token_endpoint_auth_method: method})
    expect(validateClientMetadataDocument(CLIENT_ID, document)).toHaveProperty('error')
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
    expect(validateClientMetadataDocument(url, document)).toEqual({
      error: expect.stringMatching(/^Invalid client_id/)
    })
  }
})

test('names the client by its host, never its own client_name', () => {
  const document = makeDocument({client_name: 'Parabol Official', logo_uri: 'https://x/logo.png'})
  expect(validateClientMetadataDocument(CLIENT_ID, document)).toMatchObject({
    clientName: 'app.example.com'
  })
})

test('a listed loopback redirect URI registers every port', () => {
  const document = makeDocument({redirect_uris: ['http://localhost/callback']})
  const metadata = validateClientMetadataDocument(CLIENT_ID, document)
  expect(metadata).toEqual({
    clientName: 'app.example.com',
    redirectUris: ['http://localhost/callback']
  })
  if ('error' in metadata) throw new Error(metadata.error)
  expect(isListed(metadata.redirectUris, 'http://localhost:53682/callback')).toBe(true)
})

test('drops listed redirect URIs that are neither https nor loopback http', () => {
  const document = makeDocument({
    redirect_uris: ['javascript:alert(1)', 'http://app.example.com/callback', REDIRECT_URI]
  })
  expect(validateClientMetadataDocument(CLIENT_ID, document)).toEqual({
    clientName: 'app.example.com',
    redirectUris: [REDIRECT_URI]
  })
})
