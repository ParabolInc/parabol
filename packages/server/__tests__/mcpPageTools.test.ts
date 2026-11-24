import {HOST, PROTOCOL, sendPublic, signUp} from './common'

const MCP_URL = `${PROTOCOL}://${HOST}/mcp`
const PROTOCOL_VERSION = '2025-06-18'

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessToken(
    $name: String!
    $scopes: [OAuthScopeEnum!]!
    $expiresAt: DateTime!
    $grantedOrgIds: [ID!]
    $grantedTeamIds: [ID!]
    $grantedPageIds: [ID!]
  ) {
    createPersonalAccessToken(
      name: $name
      scopes: $scopes
      expiresAt: $expiresAt
      grantedOrgIds: $grantedOrgIds
      grantedTeamIds: $grantedTeamIds
      grantedPageIds: $grantedPageIds
    ) {
      token
    }
  }
`

const postMCP = (body: unknown, headers: Record<string, string> = {}) =>
  fetch(MCP_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  })

const bearer = (token: string) => ({authorization: `Bearer ${token}`})

interface TokenOptions {
  cookie?: string
  grantedOrgIds?: string[]
  grantedTeamIds?: string[]
  grantedPageIds?: string[]
}

const createPersonalAccessToken = async (
  scopes = ['USERS_READ'],
  {cookie, ...grants}: TokenOptions = {}
) => {
  const res = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'mcp',
      scopes,
      ...grants,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie: cookie ?? (await signUp()).cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

const callTool = async (token: string, name: string, args: Record<string, unknown>) => {
  const response = await postMCP(
    {jsonrpc: '2.0', id: 2, method: 'tools/call', params: {name, arguments: args}},
    {...bearer(token), 'mcp-protocol-version': PROTOCOL_VERSION}
  )
  expect(response.status).toBe(200)
  return (await response.json()).result as {
    isError?: boolean
    content: {type: string; text: string}[]
  }
}

const callToolForData = async (token: string, name: string, args: Record<string, unknown>) => {
  const result = await callTool(token, name, args)
  expect(result.content[0]!.text).not.toContain('"code"')
  expect(result.isError).toBeUndefined()
  return JSON.parse(result.content[0]!.text)
}

const listTools = async (token: string) => {
  const response = await postMCP(
    {jsonrpc: '2.0', id: 3, method: 'tools/list'},
    {...bearer(token), 'mcp-protocol-version': PROTOCOL_VERSION}
  )
  expect(response.status).toBe(200)
  return (await response.json()).result.tools
}

const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

test('tools/list includes list_pages and upload_from_url', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  const names = (await listTools(token)).map(({name}: {name: string}) => name)
  expect(names).toContain('list_pages')
  expect(names).toContain('upload_from_url')
})

test('create_page with no arguments makes a private page', async () => {
  const {cookie} = await signUp()
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {cookie})
  const created = await callToolForData(token, 'create_page', {})
  const page = await callToolForData(token, 'read_page', {pageId: created.createPage.page.id})
  expect(page.public.page.isPrivate).toBe(true)
  expect(page.public.page.teamId).toBeNull()
})

test('create_page with parentPageId nests the page and list_pages finds it', async () => {
  const {cookie} = await signUp()
  const token = await createPersonalAccessToken(['USERS_READ', 'PAGES_READ', 'PAGES_WRITE'], {
    cookie
  })
  const parent = await callToolForData(token, 'create_page', {})
  const parentPageId = parent.createPage.page.id
  const child = await callToolForData(token, 'create_page', {parentPageId})
  const childPageId = child.createPage.page.id
  const read = await callToolForData(token, 'read_page', {pageId: childPageId})
  expect(read.public.page.parentPageId).toBe(parentPageId)
  const listed = await callToolForData(token, 'list_pages', {parentPageId})
  const ids = listed.viewer.pages.edges.map(({node}: {node: {id: string}}) => node.id)
  expect(ids).toEqual([childPageId])
  expect(listed.viewer.pages.pageInfo.hasNextPage).toBe(false)
})

test('upload_from_url copies an uploaded image into Parabol', async () => {
  const {cookie, userId} = await signUp()
  const token = await createPersonalAccessToken(['USERS_WRITE', 'USERS_READ'], {cookie})
  const uploaded = await callToolForData(token, 'upload_image', {
    filename: 'a.png',
    mimeType: 'image/png',
    base64: PNG_BASE64,
    scope: 'User',
    scopeKey: userId
  })
  const sourceUrl = uploaded.uploadUserAsset.url as string
  const copied = await callToolForData(token, 'upload_from_url', {
    url: new URL(sourceUrl, `${PROTOCOL}://${HOST}`).toString(),
    scope: 'User',
    scopeKey: userId
  })
  expect(copied.embedUserAsset.url).toContain('/assets/User/')
  expect(copied.embedUserAsset.type).toBe('image/avif')
  expect(copied.embedUserAsset.size).toBeGreaterThan(0)
})
