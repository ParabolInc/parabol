import OAuthScopeEnum from '../graphql/public/types/OAuthScopeEnum'
import packageJSON from '../package.json'
import encodeAuthToken from '../utils/encodeAuthToken'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {createPage, HOST, PROTOCOL, sendPublic, signUp} from './common'
import {createClient, createCode, createPKCEPair} from './oauthClient'

const ORIGIN = `${PROTOCOL}://${HOST}`
const MCP_URL = `${ORIGIN}/mcp`
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

const ADD_ORG = `
  mutation AddOrg($newTeam: NewTeamInput!, $orgName: String!) {
    addOrg(newTeam: $newTeam, orgName: $orgName) {
      team {
        id
        orgId
      }
    }
  }
`

const COUNT_PAGES = `
  query CountPages {
    viewer {
      pages(first: 100) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

const INITIALIZE = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: {name: 'mcpServer.test', version: '1.0.0'}
  }
}

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

const createOAuthAccessToken = async (resource?: string) => {
  const [{cookie}, {clientId, redirectUri}] = await Promise.all([signUp(), createClient()])
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const authorized = await createCode(
    {clientId, redirectUri, scope: 'users:read', codeChallenge, resource},
    cookie
  )
  expect(authorized.errors).toBeUndefined()
  const code = new URL(authorized.data.createOAuthAPICode.redirectUri).searchParams.get('code')!
  const response = await fetch(`${ORIGIN}/oauth/token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
      ...(resource && {resource})
    })
  })
  expect(response.status).toBe(200)
  return (await response.json()).access_token as string
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

const expectToolError = (result: Awaited<ReturnType<typeof callTool>>, text: string) => {
  expect(result.isError).toBe(true)
  expect(result.content[0]!.text).toContain(text)
}

const callToolForData = async (token: string, name: string, args: Record<string, unknown>) => {
  const result = await callTool(token, name, args)
  expect(result.content[0]!.text).not.toContain('"code"')
  expect(result.isError).toBeUndefined()
  return JSON.parse(result.content[0]!.text)
}

const signUpWithTwoOrgs = async () => {
  const {userId, cookie, orgId, teamId} = await signUp()
  const added = await sendPublic({
    query: ADD_ORG,
    variables: {newTeam: {name: 'Second team', orgId: '', isPublic: false}, orgName: 'Second org'},
    cookie
  })
  expect(added.errors).toBeUndefined()
  const {id: secondTeamId, orgId: secondOrgId} = added.data.addOrg.team
  return {userId, cookie, orgId, teamId, secondOrgId, secondTeamId}
}

const ONE_PIXEL_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

const READ_TOOLS = [
  'describe_type',
  'get_me',
  'get_meeting',
  'graphql_query',
  'list_meetings',
  'list_tasks',
  'read_page',
  'search_pages',
  'search_schema'
]
const WRITE_TOOLS = [
  'create_page',
  'create_task',
  'edit_page',
  'graphql_mutate',
  'start_meeting',
  'update_task',
  'upload_image'
]

const expectUnauthorized = (response: Response) => {
  expect(response.status).toBe(401)
  expect(response.headers.get('www-authenticate')).toBe(
    `Bearer resource_metadata="${ORIGIN}/.well-known/oauth-protected-resource/mcp", scope="${Object.values(OAuthScopeEnum).join(' ')}"`
  )
  expect(response.headers.get('access-control-allow-origin')).toBe('*')
  expect(response.headers.get('access-control-expose-headers')).toBe('www-authenticate')
}

const expectInitialized = async (response: Response) => {
  expect(response.status).toBe(200)
  const body = await response.json()
  expect(body).toMatchObject({
    jsonrpc: '2.0',
    id: 1,
    result: {
      protocolVersion: PROTOCOL_VERSION,
      serverInfo: {name: 'parabol', version: packageJSON.version}
    }
  })
  const {instructions} = body.result
  expect(instructions.length).toBeLessThan(2000)
  for (const scope of Object.values(OAuthScopeEnum)) {
    expect(instructions).toContain(scope)
  }
  for (const tool of [
    'get_me',
    'read_page',
    'edit_page',
    'search_schema',
    'describe_type',
    'graphql_query',
    'graphql_mutate'
  ]) {
    expect(instructions).toContain(tool)
  }
}

test('no token answers 401 with the resource metadata address and scopes', async () => {
  const response = await postMCP(INITIALIZE)
  expectUnauthorized(response)
})

test('a session cookie alone is refused', async () => {
  const {cookie} = await signUp()
  const response = await postMCP(INITIALIZE, {cookie})
  expectUnauthorized(response)
})

test('a session token sent as a bearer is refused', async () => {
  const {cookie} = await signUp()
  const sessionToken = cookie.split(';')[0]!.split('=').slice(1).join('=')
  const response = await postMCP(INITIALIZE, bearer(sessionToken))
  expectUnauthorized(response)
})

test('an invalid bearer token answers 401', async () => {
  for (const token of ['not-a-token', 'pat_notarealtoken']) {
    const response = await postMCP(INITIALIZE, bearer(token))
    expectUnauthorized(response)
  }
})

test('initialize succeeds with a PAT and returns the instructions', async () => {
  const token = await createPersonalAccessToken()
  const response = await postMCP(INITIALIZE, bearer(token))
  expect(response.headers.get('access-control-allow-origin')).toBe('*')
  await expectInitialized(response)
})

test('a notification is accepted with 202', async () => {
  const token = await createPersonalAccessToken()
  const response = await postMCP(
    {jsonrpc: '2.0', method: 'notifications/initialized'},
    {...bearer(token), 'mcp-protocol-version': PROTOCOL_VERSION}
  )
  expect(response.status).toBe(202)
})

test('initialize succeeds with an OAuth token bound to /mcp', async () => {
  const token = await createOAuthAccessToken(MCP_URL)
  const response = await postMCP(INITIALIZE, bearer(token))
  await expectInitialized(response)
})

test('initialize succeeds with an OAuth token bound to no resource', async () => {
  const token = await createOAuthAccessToken()
  const response = await postMCP(INITIALIZE, bearer(token))
  await expectInitialized(response)
})

test('a body over 4 MiB answers 413', async () => {
  const token = await createPersonalAccessToken()
  const response = await postMCP(
    {...INITIALIZE, padding: 'x'.repeat(4 * 1024 * 1024)},
    bearer(token)
  )
  expect(response.status).toBe(413)
})

test('the same /mcp-bound token is still refused at /graphql', async () => {
  const token = await createOAuthAccessToken(MCP_URL)
  const response = await fetch(`${ORIGIN}/graphql`, {
    method: 'POST',
    headers: {'content-type': 'application/json', ...bearer(token)},
    body: JSON.stringify({query: '{viewer{id}}'})
  })
  const body = await response.json()
  expect(body.data?.viewer?.id).toBeUndefined()
  expect(body.errors?.[0]).toMatchObject({
    message: `This access token is for ${MCP_URL}`,
    extensions: {code: 'UNAUTHENTICATED'}
  })
})

test('GET and DELETE /mcp answer 405 and allow POST', async () => {
  for (const method of ['GET', 'DELETE']) {
    const response = await fetch(MCP_URL, {method})
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST')
  }
})

test('a browser client can preflight /mcp', async () => {
  const response = await fetch(MCP_URL, {
    method: 'OPTIONS',
    headers: {
      origin: 'http://localhost:6274',
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'authorization, content-type, mcp-protocol-version'
    }
  })
  expect(response.status).toBe(204)
  expect(response.headers.get('access-control-allow-origin')).toBe('*')
  expect(response.headers.get('access-control-allow-headers')).toBe(
    'authorization, content-type, mcp-protocol-version'
  )
  expect(response.headers.get('access-control-expose-headers')).toBe('www-authenticate')
})

test('an OAuth token bound to another resource is refused', async () => {
  const token = await createOAuthAccessToken(MCP_URL)
  const authToken = getVerifiedAuthToken(token, true, 'action-oauth2')!
  const forged = encodeAuthToken({...authToken, resource: 'https://evil/mcp'})
  const response = await postMCP(INITIALIZE, bearer(forged))
  expectUnauthorized(response)
  expect(await response.json()).toMatchObject({
    error_description: 'This access token is for https://evil/mcp'
  })
})

test('tools/list gives every tool a title and annotations', async () => {
  const token = await createPersonalAccessToken()
  const response = await postMCP(
    {jsonrpc: '2.0', id: 3, method: 'tools/list'},
    {...bearer(token), 'mcp-protocol-version': PROTOCOL_VERSION}
  )
  const {tools} = (await response.json()).result
  expect(tools.map(({name}: {name: string}) => name).sort()).toEqual(
    [...READ_TOOLS, ...WRITE_TOOLS].sort()
  )
  for (const tool of tools) {
    expect(tool.title).toBeTruthy()
    expect(tool.description).toBeTruthy()
    expect(tool.annotations).toBeDefined()
  }
  const byName = Object.fromEntries(tools.map((tool: {name: string}) => [tool.name, tool]))
  for (const name of WRITE_TOOLS) {
    expect(byName[name].annotations).toEqual({
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: false
    })
  }
  for (const name of READ_TOOLS) {
    expect(byName[name].annotations).toEqual({
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    })
  }
})

test('graphql_query runs a query with a PAT', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'graphql_query', {query: '{viewer{id}}'})
  expect(result.isError).toBeUndefined()
  expect(JSON.parse(result.content[0]!.text).viewer.id).toEqual(expect.any(String))
})

test('graphql_query runs a query with an OAuth token bound to /mcp', async () => {
  const token = await createOAuthAccessToken(MCP_URL)
  const result = await callTool(token, 'graphql_query', {
    query: 'query Me {viewer{id}}',
    operationName: 'Me'
  })
  expect(result.isError).toBeUndefined()
  expect(JSON.parse(result.content[0]!.text).viewer.id).toEqual(expect.any(String))
})

test('graphql_query refuses a mutation', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'graphql_query', {query: 'mutation {logout}'})
  expectToolError(result, 'graphql_mutate')
})

test('graphql_mutate refuses a query', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'graphql_mutate', {query: '{viewer{id}}'})
  expectToolError(result, 'graphql_query')
})

test('a GraphQL error comes back as a tool error with its code', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'graphql_query', {query: '{viewer{noSuchField}}'})
  expect(result.isError).toBe(true)
  expect(JSON.parse(result.content[0]!.text)[0].message).toContain('noSuchField')
})

test('a missing scope comes back as a tool error naming the scope', async () => {
  const token = await createPersonalAccessToken(['PAGES_READ'])
  const result = await callTool(token, 'graphql_mutate', {
    query: `mutation {
      createTask(newTask: {status: active, teamId: "nope"}) {
        task {
          id
        }
      }
    }`
  })
  expectToolError(result, 'tasks:write')
  expect(JSON.parse(result.content[0]!.text)[0].code).toBe('FORBIDDEN')
})

test('search_schema finds a type and a field', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'search_schema', {query: 'createTask', limit: 5})
  expect(result.isError).toBeUndefined()
  expect(result.content[0]!.text).toContain('Mutation.createTask')
})

test('search_schema says when nothing matches', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'search_schema', {query: 'zzzqqqxxx'})
  expect(result.content[0]!.text).toContain('No types or fields match')
})

test('describe_type shows the scopes a mutation needs', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'describe_type', {name: 'Mutation'})
  expect(result.isError).toBeUndefined()
  const createTask = result.content[0]!.text.split('\n').find((line) =>
    line.startsWith('  createTask(')
  )
  expect(createTask).toContain('tasks:write')
})

test('describe_type refuses an unknown type', async () => {
  const token = await createPersonalAccessToken()
  const result = await callTool(token, 'describe_type', {name: 'NoSuchType'})
  expectToolError(result, 'NOT_FOUND')
})

test('get_me returns the viewer with a PAT', async () => {
  const {userId, cookie, orgId, teamId} = await signUp()
  const token = await createPersonalAccessToken(['USERS_READ', 'ORGS_READ', 'TEAMS_READ'], {
    cookie
  })
  const {viewer} = await callToolForData(token, 'get_me', {})
  expect(viewer).toMatchObject({
    id: userId,
    preferredName: expect.any(String),
    email: expect.any(String),
    organizations: [{id: orgId, name: expect.any(String)}],
    teams: [{id: teamId, name: expect.any(String), orgId}]
  })
})

test('create_page then read_page then edit_page round-trips a change', async () => {
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'])
  const created = await callToolForData(token, 'create_page', {
    title: 'Round trip',
    markdown: 'Say hello to the team.'
  })
  const pageId = created.editPageContent.page.id
  const before = await callToolForData(token, 'read_page', {pageId})
  expect(before.public.page.title).toBe('Round trip')
  expect(before.public.page.content).toContain('# Round trip')
  expect(before.public.page.content).toContain('Say hello to the team.')
  await callToolForData(token, 'edit_page', {
    pageId,
    edits: [{oldText: 'hello', newText: 'goodbye'}]
  })
  const after = await callToolForData(token, 'read_page', {pageId})
  expect(after.public.page.content).toContain('Say goodbye to the team.')
  expect(after.public.page.content).not.toContain('hello')
})

test('edit_page refuses text that is not on the page', async () => {
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'])
  const created = await callToolForData(token, 'create_page', {title: 'Edits', markdown: 'one'})
  const result = await callTool(token, 'edit_page', {
    pageId: created.editPageContent.page.id,
    edits: [{oldText: 'missing text', newText: 'two'}]
  })
  expect(result.isError).toBe(true)
})

test('create_task then list_tasks finds it', async () => {
  const {userId, cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(
    ['USERS_READ', 'TEAMS_READ', 'TASKS_READ', 'TASKS_WRITE'],
    {
      cookie
    }
  )
  const created = await callToolForData(token, 'create_task', {
    teamId,
    content: 'Ship the **MCP** tools',
    userId
  })
  const {task} = created.createTask
  expect(task).toMatchObject({
    plaintextContent: 'Ship the MCP tools',
    status: 'active',
    teamId,
    userId
  })
  const listed = await callToolForData(token, 'list_tasks', {teamId})
  expect(listed.viewer.tasks.edges.map(({node}: {node: {id: string}}) => node.id)).toContain(
    task.id
  )
  const everywhere = await callToolForData(token, 'list_tasks', {})
  expect(everywhere.viewer.tasks.edges.map(({node}: {node: {id: string}}) => node.id)).toContain(
    task.id
  )
})

test('update_task changes a task and list_tasks filters by status', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(
    ['USERS_READ', 'TEAMS_READ', 'TASKS_READ', 'TASKS_WRITE'],
    {
      cookie
    }
  )
  const created = await callToolForData(token, 'create_task', {teamId, content: 'Draft the plan'})
  const taskId = created.createTask.task.id
  const updated = await callToolForData(token, 'update_task', {
    taskId,
    content: 'Write the plan',
    status: 'done'
  })
  expect(updated.updateTask.task).toMatchObject({
    id: taskId,
    plaintextContent: 'Write the plan',
    status: 'done'
  })
  const done = await callToolForData(token, 'list_tasks', {teamId, status: 'done'})
  const active = await callToolForData(token, 'list_tasks', {teamId, status: 'active'})
  const ids = (listed: {viewer: {tasks: {edges: {node: {id: string}}[]}}}) =>
    listed.viewer.tasks.edges.map(({node}) => node.id)
  expect(ids(done)).toContain(taskId)
  expect(ids(active)).not.toContain(taskId)
})

test('upload_image stores a PNG and returns its URL', async () => {
  const {cookie} = await signUp()
  const pageId = await createPage(cookie)
  const writer = await createPersonalAccessToken(['PAGES_WRITE'], {cookie})
  const reader = await createPersonalAccessToken(['PAGES_READ'], {cookie})
  const uploaded = await callToolForData(writer, 'upload_image', {
    filename: 'pixel.png',
    mimeType: 'image/png',
    base64: ONE_PIXEL_PNG,
    scope: 'Page',
    scopeKey: pageId
  })
  const {url} = uploaded.uploadUserAsset
  expect(url).toMatch(/^https?:\/\//)
  const response = await fetch(url, {headers: bearer(reader)})
  expect(response.status).toBe(200)
})

test('upload_image refuses a non-image type', async () => {
  const {userId, cookie} = await signUp()
  const token = await createPersonalAccessToken(['USERS_WRITE'], {cookie})
  const result = await callTool(token, 'upload_image', {
    filename: 'page.html',
    mimeType: 'text/html',
    base64: Buffer.from('<p>hi</p>').toString('base64'),
    scope: 'User',
    scopeKey: userId
  })
  expectToolError(result, 'mimeType')
})

test('upload_image refuses base64 that is not an image of its type', async () => {
  const {userId, cookie} = await signUp()
  const token = await createPersonalAccessToken(['USERS_WRITE'], {cookie})
  const result = await callTool(token, 'upload_image', {
    filename: 'fake.png',
    mimeType: 'image/png',
    base64: Buffer.from('not a png').toString('base64'),
    scope: 'User',
    scopeKey: userId
  })
  expectToolError(result, 'BAD_USER_INPUT')
})

test('a token limited to one org cannot list another org team tasks or meetings', async () => {
  const {cookie, orgId, secondTeamId} = await signUpWithTwoOrgs()
  const token = await createPersonalAccessToken(
    ['USERS_READ', 'TEAMS_READ', 'TASKS_READ', 'MEETINGS_READ'],
    {cookie, grantedOrgIds: [orgId], grantedTeamIds: []}
  )
  for (const tool of ['list_tasks', 'list_meetings']) {
    const result = await callTool(token, tool, {teamId: secondTeamId})
    expectToolError(result, 'does not grant access')
    expect(JSON.parse(result.content[0]!.text)[0].code).toBe('FORBIDDEN')
  }
})

test('create_page without teamId is refused for an org-limited token', async () => {
  const {cookie, orgId} = await signUp()
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {
    cookie,
    grantedOrgIds: [orgId],
    grantedTeamIds: []
  })
  const result = await callTool(token, 'create_page', {title: 'Private', markdown: 'text'})
  expectToolError(result, 'teamId')
  expect(JSON.parse(result.content[0]!.text)[0].code).toBe('FORBIDDEN')
})

test('create_page with a granted teamId works for an org-limited token, and read_page reads it back', async () => {
  const {cookie, orgId, teamId} = await signUp()
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {
    cookie,
    grantedOrgIds: [orgId],
    grantedTeamIds: []
  })
  const created = await callToolForData(token, 'create_page', {
    title: 'Team notes',
    markdown: 'Shared with the team.',
    teamId
  })
  const read = await callToolForData(token, 'read_page', {
    pageId: created.editPageContent.page.id
  })
  expect(read.public.page.content).toContain('Shared with the team.')
})

test('a token limited to specific pages can create a team page but not a personal one', async () => {
  const {cookie, teamId} = await signUp()
  const grantedPageId = await createPage(cookie)
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {
    cookie,
    grantedPageIds: [grantedPageId]
  })
  const personal = await callTool(token, 'create_page', {title: 'Private', markdown: 'text'})
  expectToolError(personal, 'teamId')
  expect(JSON.parse(personal.content[0]!.text)[0].code).toBe('FORBIDDEN')
  const created = await callToolForData(token, 'create_page', {
    title: 'Team page',
    markdown: 'Reachable through the team.',
    teamId
  })
  const read = await callToolForData(token, 'read_page', {
    pageId: created.editPageContent.page.id
  })
  expect(read.public.page.content).toContain('Reachable through the team.')
})

test('a token limited to pages alone cannot create a page', async () => {
  const {cookie, teamId} = await signUp()
  const grantedPageId = await createPage(cookie)
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {
    cookie,
    grantedOrgIds: [],
    grantedTeamIds: [],
    grantedPageIds: [grantedPageId]
  })
  const countPages = async () => {
    const res = await sendPublic({query: COUNT_PAGES, cookie})
    expect(res.errors).toBeUndefined()
    return res.data.viewer.pages.edges.length as number
  }
  const pageCount = await countPages()
  const personal = await callTool(token, 'create_page', {title: 'Private', markdown: 'text'})
  expectToolError(personal, 'teamId')
  expect(JSON.parse(personal.content[0]!.text)[0].code).toBe('FORBIDDEN')
  const team = await callTool(token, 'create_page', {title: 'Team', markdown: 'text', teamId})
  expect(team.isError).toBe(true)
  expect(JSON.parse(team.content[0]!.text)[0].code).toBe('FORBIDDEN')
  expect(await countPages()).toBe(pageCount)
})

test('start_meeting starts a check-in that get_meeting and list_meetings find', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(
    ['USERS_READ', 'TEAMS_READ', 'MEETINGS_READ', 'MEETINGS_WRITE'],
    {
      cookie
    }
  )
  const started = await callToolForData(token, 'start_meeting', {teamId, kind: 'checkin'})
  const meetingId = started.startCheckIn.meeting.id
  const {viewer} = await callToolForData(token, 'get_meeting', {meetingId})
  expect(viewer.meeting).toMatchObject({id: meetingId, meetingType: 'action', teamId, tasks: []})
  const listed = await callToolForData(token, 'list_meetings', {teamId})
  expect(listed.viewer.meetings.edges.map(({node}: {node: {id: string}}) => node.id)).toContain(
    meetingId
  )
  const everywhere = await callToolForData(token, 'list_meetings', {})
  expect(everywhere.viewer.meetings.edges.map(({node}: {node: {id: string}}) => node.id)).toContain(
    meetingId
  )
})

test('start_meeting asks for a templateId to start a team health check', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(['MEETINGS_WRITE'], {cookie})
  const result = await callTool(token, 'start_meeting', {teamId, kind: 'teamHealth'})
  expectToolError(result, 'templateId')
})

test('start_meeting starts nothing when it cannot select the template', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(
    ['USERS_READ', 'TEAMS_READ', 'TEMPLATES_READ', 'MEETINGS_READ', 'MEETINGS_WRITE'],
    {cookie}
  )
  const result = await callTool(token, 'start_meeting', {
    teamId,
    kind: 'retrospective',
    templateId: 'fourLsTemplate'
  })
  expectToolError(result, 'teams:write')
  const listed = await callToolForData(token, 'list_meetings', {teamId})
  expect(listed.viewer.meetings.edges).toEqual([])
})

test('start_meeting refuses a template of another kind before selecting it', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(
    [
      'USERS_READ',
      'TEAMS_READ',
      'TEAMS_WRITE',
      'TEMPLATES_READ',
      'MEETINGS_READ',
      'MEETINGS_WRITE'
    ],
    {cookie}
  )
  const result = await callTool(token, 'start_meeting', {
    teamId,
    kind: 'retrospective',
    templateId: 'wsjfTemplate'
  })
  expectToolError(result, 'BAD_USER_INPUT')
  expect(result.content[0]!.text).toContain('poker')
  const listed = await callToolForData(token, 'list_meetings', {teamId})
  expect(listed.viewer.meetings.edges).toEqual([])
  const settings = await callToolForData(token, 'graphql_query', {
    query: `query PokerTemplate($teamId: ID!) {
      viewer {
        team(teamId: $teamId) {
          meetingSettings(meetingType: poker) {
            ... on PokerMeetingSettings {
              selectedTemplateId
            }
          }
        }
      }
    }`,
    variables: {teamId}
  })
  expect(settings.viewer.team.meetingSettings.selectedTemplateId).not.toBe('wsjfTemplate')
})

test('start_meeting refuses a team health check with a template of another kind', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(
    ['USERS_READ', 'TEAMS_READ', 'TEMPLATES_READ', 'MEETINGS_READ', 'MEETINGS_WRITE'],
    {cookie}
  )
  const result = await callTool(token, 'start_meeting', {
    teamId,
    kind: 'teamHealth',
    templateId: 'fourLsTemplate'
  })
  expectToolError(result, 'BAD_USER_INPUT')
  expect(result.content[0]!.text).toContain('retrospective')
  const listed = await callToolForData(token, 'list_meetings', {teamId})
  expect(listed.viewer.meetings.edges).toEqual([])
})

test('start_meeting selects a standup template and starts the standup with it', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(
    [
      'USERS_READ',
      'TEAMS_READ',
      'TEAMS_WRITE',
      'TEMPLATES_READ',
      'MEETINGS_READ',
      'MEETINGS_WRITE'
    ],
    {cookie}
  )
  const started = await callToolForData(token, 'start_meeting', {
    teamId,
    kind: 'standup',
    templateId: 'weeklyWinsAndPrioritiesTemplate'
  })
  expect(started.selectTemplate.meetingSettings.meetingType).toBe('teamPrompt')
  const {id: meetingId, meetingType} = started.startTeamPrompt.meeting
  expect(meetingType).toBe('teamPrompt')
  const read = await callToolForData(token, 'graphql_query', {
    query: `query StandupTemplate($meetingId: ID!) {
      viewer {
        meeting(meetingId: $meetingId) {
          ... on TeamPromptMeeting {
            template {
              id
            }
          }
        }
      }
    }`,
    variables: {meetingId}
  })
  expect(read.viewer.meeting.template.id).toBe('weeklyWinsAndPrioritiesTemplate')
})

test('an unrestricted token is told it is not on a team it is not on', async () => {
  const [{cookie}, {teamId: otherTeamId}] = await Promise.all([signUp(), signUp()])
  const token = await createPersonalAccessToken(
    ['USERS_READ', 'TEAMS_READ', 'TASKS_READ', 'MEETINGS_READ'],
    {cookie}
  )
  for (const tool of ['list_tasks', 'list_meetings']) {
    for (const teamId of [otherTeamId, 'noSuchTeam']) {
      const result = await callTool(token, tool, {teamId})
      expectToolError(result, 'Viewer is not on team')
      expect(JSON.parse(result.content[0]!.text)[0].code).toBe('FORBIDDEN')
    }
  }
})

test('search_pages finds a page by its title', async () => {
  const {cookie} = await signUp()
  const token = await createPersonalAccessToken(['USERS_READ', 'PAGES_READ', 'PAGES_WRITE'], {
    cookie
  })
  const title = `Quarterly zeppelin plan ${Date.now()}`
  const created = await callToolForData(token, 'create_page', {title, markdown: 'Airships.'})
  const found = await callToolForData(token, 'search_pages', {query: 'zeppelin'})
  expect(found.viewer.search.edges.map(({node}: {node: {id: string}}) => node.id)).toContain(
    created.editPageContent.page.id
  )
})
