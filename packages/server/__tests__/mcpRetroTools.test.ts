import {HOST, PROTOCOL, sendPublic, signUp} from './common'

const MCP_URL = `${PROTOCOL}://${HOST}/mcp`
const PROTOCOL_VERSION = '2025-06-18'

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessToken(
    $name: String!
    $scopes: [OAuthScopeEnum!]!
    $expiresAt: DateTime!
  ) {
    createPersonalAccessToken(name: $name, scopes: $scopes, expiresAt: $expiresAt) {
      token
    }
  }
`

const createPersonalAccessToken = async (scopes: string[], cookie: string) => {
  const res = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'mcp',
      scopes,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

const callTool = async (token: string, name: string, args: Record<string, unknown>) => {
  const response = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      'mcp-protocol-version': PROTOCOL_VERSION
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {name, arguments: args}
    })
  })
  expect(response.status).toBe(200)
  return (await response.json()).result as {
    isError?: boolean
    content: {type: string; text: string}[]
  }
}

test('get_me answers on a connection without orgs:read', async () => {
  const {userId, cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(['USERS_READ', 'TEAMS_READ'], cookie)
  const result = await callTool(token, 'get_me', {})
  expect(result.isError).toBeUndefined()
  const {viewer} = JSON.parse(result.content[0]!.text)
  expect(viewer.id).toBe(userId)
  expect(viewer.organizations).toBeUndefined()
  expect(viewer.teams.map(({id}: {id: string}) => id)).toContain(teamId)
})
