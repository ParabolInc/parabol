import OAuthScopeEnum from '../graphql/public/types/OAuthScopeEnum'
import packageJSON from '../package.json'
import encodeAuthToken from '../utils/encodeAuthToken'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {HOST, PROTOCOL, sendPublic, signUp} from './common'
import {
  bearer,
  callTool,
  callToolForData,
  createPersonalAccessToken,
  expectToolError,
  expectToolErrorCode,
  listTools,
  MCP_URL,
  PROTOCOL_VERSION,
  postMCP
} from './mcpClient'
import {createClient, createCode, createPKCEPair} from './oauthClient'

const ORIGIN = `${PROTOCOL}://${HOST}`
const CREATE_TASK = `
  mutation CreateTask($newTask: CreateTaskInput!) {
    createTask(newTask: $newTask) {
      task {
        id
      }
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

const createOAuthAccessToken = async (
  resource?: string,
  {
    cookie: userCookie,
    scope = 'users:read',
    redirectUri: clientRedirectUri
  }: {cookie?: string; scope?: string; redirectUri?: string} = {}
) => {
  const [cookie, {clientId, redirectUri}] = await Promise.all([
    userCookie ?? signUp().then((user) => user.cookie),
    createClient(clientRedirectUri)
  ])
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const authorized = await createCode(
    {clientId, redirectUri, scope, codeChallenge, resource},
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

const COMPILED_TOOLS = [
  'get_me',
  'list_meetings',
  'get_meeting',
  'get_standup',
  'get_poker_meeting',
  'reveal_poker_votes',
  'set_poker_final_score',
  'get_team_health_meeting',
  'get_discussion',
  'list_discussions',
  'list_tasks',
  'search_pages',
  'read_page',
  'create_page',
  'set_page_content',
  'edit_page',
  'select_template',
  'start_retrospective',
  'start_check_in',
  'start_sprint_poker',
  'start_standup',
  'start_team_health',
  'get_report',
  'list_pinned_reports',
  'list_retro_columns'
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
  for (const tool of [
    'read_page',
    'edit_page',
    'get_me',
    'create_page',
    'set_page_content',
    'select_template',
    'get_meeting',
    'search_pages',
    'get_report',
    'list_pinned_reports',
    'graphql_query',
    'graphql_mutate',
    'describe_graphql'
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

test('tools/list lists every compiled tool with annotations and its JSON Schema', async () => {
  const tools = await listTools(await createPersonalAccessToken())
  const byName = Object.fromEntries(tools.map((tool: {name: string}) => [tool.name, tool]))
  expect(Object.keys(byName)).toEqual(expect.arrayContaining(COMPILED_TOOLS))
  expect(byName.list_tasks.inputSchema.properties.first).toEqual({
    type: 'integer',
    default: 50,
    description: 'Most tasks to return'
  })
  expect(byName.create_page.inputSchema.required).toBeUndefined()
  expect(byName.get_me.annotations.readOnlyHint).toBe(true)
  expect(byName.start_check_in.annotations.destructiveHint).toBe(true)
  expect(
    byName.get_report.inputSchema.properties.spec.properties.measures.items.description
  ).toContain('MEETINGS: Meetings that at least 2 people joined')
})

test('get_me answers with the viewer', async () => {
  const {userId, cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(['USERS_READ', 'ORGS_READ', 'TEAMS_READ'], {
    cookie
  })
  const {viewer} = await callToolForData(token, 'get_me', {})
  expect(viewer.id).toBe(userId)
  expect(viewer.teams.map(({id}: {id: string}) => id)).toContain(teamId)
})

test("GraphQL refuses a compiled tool's bad argument", async () => {
  const token = await createPersonalAccessToken(['USERS_READ', 'TASKS_READ'])
  const result = await callTool(token, 'list_tasks', {first: 'ten'})
  expectToolError(result, '$first')
  expect(JSON.parse(result.content[0]!.text)[0].message).toContain('Variable "$first"')
})

test('a missing required argument is refused', async () => {
  const token = await createPersonalAccessToken(['PAGES_READ'])
  const result = await callTool(token, 'read_page', {})
  expectToolError(result, '$pageId')
  expect(JSON.parse(result.content[0]!.text)[0].message).toContain(
    'Variable "$pageId" of required type "ID!" was not provided'
  )
})

test('a compiled tool fills in a default the caller leaves out', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(
    ['USERS_READ', 'TASKS_READ', 'MEETINGS_READ', 'MEETINGS_WRITE'],
    {cookie}
  )
  const tasks = await callToolForData(token, 'list_tasks', {})
  expect(tasks.viewer.tasks.edges).toEqual(expect.any(Array))
  const started = await callToolForData(token, 'start_check_in', {teamId})
  const meetings = await callToolForData(token, 'list_meetings', {
    teamIds: [teamId],
    before: new Date().toISOString()
  })
  expect(meetings.viewer.meetings.edges.map(({node}: {node: {id: string}}) => node.id)).toContain(
    started.startCheckIn.meeting.id
  )
})

test('create_page, set_page_content and edit_page write a team page read_page returns', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(['PAGES_READ', 'PAGES_WRITE'], {cookie})
  const created = await callToolForData(token, 'create_page', {teamId})
  const pageId = created.createPage.page.id
  await callToolForData(token, 'set_page_content', {pageId, content: '# Plan\n\nShip it'})
  const edited = await callToolForData(token, 'edit_page', {
    pageId,
    edits: [{oldText: 'Ship it', newText: 'Ship it today'}]
  })
  expect(edited.patchPageContent.page.id).toBe(pageId)
  const read = await callToolForData(token, 'read_page', {pageId})
  expect(read.public.page.content).toContain('Ship it today')
})

test('search_pages answers with a list of pages', async () => {
  const token = await createPersonalAccessToken(['USERS_READ', 'PAGES_READ'])
  const found = await callToolForData(token, 'search_pages', {query: 'plan'})
  expect(found.viewer.search.edges).toEqual(expect.any(Array))
})

test('start_check_in starts a meeting on the team that get_meeting shows', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(['USERS_READ', 'MEETINGS_READ', 'MEETINGS_WRITE'], {
    cookie
  })
  const started = await callToolForData(token, 'start_check_in', {teamId})
  expect(started.startCheckIn.meeting.teamId).toBe(teamId)
  const meetingId = started.startCheckIn.meeting.id
  const {viewer} = await callToolForData(token, 'get_meeting', {meetingId})
  expect(viewer.meeting).toMatchObject({id: meetingId, meetingType: 'action', teamId})
})

test('get_meeting needs tasks:read to show the tasks a meeting made', async () => {
  const {cookie, teamId, userId} = await signUp()
  const withoutTasks = await createPersonalAccessToken(
    ['USERS_READ', 'MEETINGS_READ', 'MEETINGS_WRITE'],
    {cookie}
  )
  const started = await callToolForData(withoutTasks, 'start_check_in', {teamId})
  const meetingId = started.startCheckIn.meeting.id
  const created = await sendPublic({
    query: CREATE_TASK,
    variables: {newTask: {teamId, userId, meetingId, status: 'active'}},
    cookie
  })
  expect(created.errors).toBeUndefined()

  expectToolError(await callTool(withoutTasks, 'get_meeting', {meetingId}), 'tasks:read')

  const withTasks = await createPersonalAccessToken(['USERS_READ', 'MEETINGS_READ', 'TASKS_READ'], {
    cookie
  })
  const {viewer} = await callToolForData(withTasks, 'get_meeting', {meetingId})
  expect(viewer.meeting.tasks).toEqual([
    expect.objectContaining({id: created.data.createTask.task.id})
  ])
})

test('start_retrospective, start_sprint_poker and start_standup start meetings on the team', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(['MEETINGS_WRITE'], {cookie})
  const retrospective = await callToolForData(token, 'start_retrospective', {teamId})
  expect(retrospective.startRetrospective.meeting).toMatchObject({
    meetingType: 'retrospective',
    teamId
  })
  const poker = await callToolForData(token, 'start_sprint_poker', {teamId})
  expect(poker.startSprintPoker.meeting).toMatchObject({meetingType: 'poker', teamId})
  const standup = await callToolForData(token, 'start_standup', {teamId})
  expect(standup.startTeamPrompt.meeting).toMatchObject({meetingType: 'teamPrompt', teamId})
})

test("select_template selects the team's retrospective template", async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(['USERS_READ', 'TEAMS_READ', 'TEAMS_WRITE'], {
    cookie
  })
  const {viewer} = await callToolForData(token, 'graphql_query', {
    query: `query SelectedTemplate($teamId: ID!) {
      viewer { team(teamId: $teamId) { meetingSettings(meetingType: retrospective) {
        ... on RetrospectiveMeetingSettings { selectedTemplate { id } }
      } } }
    }`,
    variables: {teamId}
  })
  const selected = await callToolForData(token, 'select_template', {
    templateId: viewer.team.meetingSettings.selectedTemplate.id,
    teamId
  })
  expect(selected.selectTemplate.meetingSettings.meetingType).toBe('retrospective')
})

test('a token limited to one organization sees only its teams', async () => {
  const {cookie, orgId, teamId, secondTeamId} = await signUpWithTwoOrgs()
  const token = await createPersonalAccessToken(
    ['USERS_READ', 'ORGS_READ', 'TEAMS_READ', 'MEETINGS_WRITE'],
    {cookie, grantedOrgIds: [orgId], grantedTeamIds: []}
  )
  const {viewer} = await callToolForData(token, 'get_me', {})
  expect(viewer.teams.map(({id}: {id: string}) => id)).toEqual([teamId])
  const started = await callTool(token, 'start_check_in', {teamId: secondTeamId})
  expect(started.isError).toBe(true)
})

const REPORT_SCOPES = ['USERS_READ', 'ORGS_READ', 'REPORTS_READ']

test('get_report runs the spec of a report list_pinned_reports lists', async () => {
  const {cookie, orgId} = await signUp()
  const token = await createPersonalAccessToken(REPORT_SCOPES, {cookie})
  const {viewer: pinned} = await callToolForData(token, 'list_pinned_reports', {orgId})
  const [firstPin] = pinned.organization.pinnedReports
  expect(firstPin.title).toEqual(expect.any(String))
  const {viewer} = await callToolForData(token, 'get_report', {
    orgId,
    spec: JSON.parse(firstPin.spec)
  })
  expect(viewer.organization.report).toMatchObject({
    teamCount: expect.any(Number),
    rows: expect.any(Array),
    notes: expect.any(Array)
  })
})

test('get_report counts what a spec asks for', async () => {
  const {cookie, orgId} = await signUp()
  const token = await createPersonalAccessToken(REPORT_SCOPES, {cookie})
  const {viewer} = await callToolForData(token, 'get_report', {
    orgId,
    spec: {measures: ['USERS'], showAs: 'NUMBER'},
    timeZone: 'America/New_York'
  })
  expect(viewer.organization.report).toMatchObject({
    breakdown: [],
    rows: expect.any(Array)
  })
})

test('a token limited to a team cannot report on its organization', async () => {
  const {cookie, orgId, teamId} = await signUp()
  const token = await createPersonalAccessToken(REPORT_SCOPES, {
    cookie,
    grantedOrgIds: [],
    grantedTeamIds: [teamId]
  })
  const [report, pinned] = await Promise.all([
    callTool(token, 'get_report', {orgId, spec: {measures: ['MEETINGS'], showAs: 'NUMBER'}}),
    callTool(token, 'list_pinned_reports', {orgId})
  ])
  expectToolError(report, 'does not grant access to this organization')
  expectToolError(pinned, 'does not grant access to this organization')
})

test('an unknown tool is a JSON-RPC error', async () => {
  const token = await createPersonalAccessToken()
  const response = await postMCP(
    {jsonrpc: '2.0', id: 4, method: 'tools/call', params: {name: 'no_such_tool', arguments: {}}},
    {...bearer(token), 'mcp-protocol-version': PROTOCOL_VERSION}
  )
  const body = await response.json()
  expect(body.error.code).toBe(-32602)
})

const TOOL_NAMES = [
  'add_comment',
  'add_poker_stories',
  'add_reflection',
  'answer_standup',
  'answer_team_health',
  'create_page',
  'create_retro_template',
  'create_standup_template',
  'create_task',
  'create_team_health_template',
  'describe_graphql',
  'edit_page',
  'end_meeting',
  'get_discussion',
  'get_me',
  'get_meeting',
  'get_poker_meeting',
  'get_report',
  'get_standup',
  'get_team_health_meeting',
  'graphql_mutate',
  'graphql_query',
  'list_discussions',
  'list_meetings',
  'list_pages',
  'list_pinned_reports',
  'list_retro_columns',
  'list_tasks',
  'list_templates',
  'read_page',
  'reveal_poker_votes',
  'search_pages',
  'select_template',
  'set_page_content',
  'set_poker_final_score',
  'start_check_in',
  'start_retrospective',
  'start_sprint_poker',
  'start_standup',
  'start_team_health',
  'update_reflection',
  'update_task',
  'upload_from_url',
  'upload_image',
  'vote_poker_story'
]

const JPEG_BASE64 = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0
]).toString('base64')

test('create_task turns markdown into the task text', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(['TASKS_WRITE', 'TASKS_READ'], {cookie})
  const created = await callToolForData(token, 'create_task', {
    teamId,
    content: 'Fix the **login** bug'
  })
  expect(created.createTask.task.content).toBe('Fix the **login** bug')
  expect(created.createTask.task).not.toHaveProperty('plaintextContent')
  expect(created.createTask.task.status).toBe('active')
})

test('create_task and update_task return a markdown list as a markdown list', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(['TASKS_WRITE', 'TASKS_READ'], {cookie})
  const created = await callToolForData(token, 'create_task', {teamId, content: '- one\n- two'})
  expect(created.createTask.task.content).toBe('- one\n- two')
  const updated = await callToolForData(token, 'update_task', {
    taskId: created.createTask.task.id,
    content: 'Plan:\n\n1. one\n2. two'
  })
  expect(updated.updateTask.task.content).toBe('Plan:\n\n1. one\n2. two')
  expect(updated.updateTask.task.content).not.toMatch(/\n{3,}/)
})

test('create_task and update_task with only tasks:write write the task and return its id', async () => {
  const {cookie, teamId} = await signUp()
  const writeOnly = await createPersonalAccessToken(['TASKS_WRITE'], {cookie})
  const created = await callToolForData(writeOnly, 'create_task', {
    teamId,
    content: 'Write without reading'
  })
  const taskId = created.createTask.task.id
  expect(created.createTask.task).toEqual({id: expect.any(String)})
  const updated = await callToolForData(writeOnly, 'update_task', {taskId, status: 'done'})
  expect(updated.updateTask.task).toEqual({id: taskId})

  const reader = await createPersonalAccessToken(['USERS_READ', 'TASKS_READ'], {cookie})
  const listed = await callToolForData(reader, 'list_tasks', {teamIds: [teamId]})
  expect(listed.viewer.tasks.edges.map(({node}: {node: object}) => node)).toContainEqual(
    expect.objectContaining({id: taskId, plaintextContent: 'Write without reading', status: 'done'})
  )
})

test('update_task with nothing to change is refused', async () => {
  const token = await createPersonalAccessToken(['TASKS_WRITE'])
  const result = await callTool(token, 'update_task', {taskId: 'task-1'})
  expectToolError(result, 'Pass content, status, userId or teamId')
})

const ADD_TEAM = `
  mutation AddTeam($newTeam: NewTeamInput!) {
    addTeam(newTeam: $newTeam) {
      team {
        id
      }
    }
  }
`

const signUpOnTwoTeams = async () => {
  const {cookie, teamId, orgId} = await signUp()
  const added = await sendPublic({
    query: ADD_TEAM,
    variables: {newTeam: {name: 'Second team', orgId, isPublic: false}},
    cookie
  })
  expect(added.errors).toBeUndefined()
  const token = await createPersonalAccessToken(['TASKS_WRITE', 'TASKS_READ', 'USERS_READ'], {
    cookie
  })
  return {cookie, token, teamId, secondTeamId: added.data.addTeam.team.id as string}
}

test('update_task moves a task to another team the caller is on, alone or with other changes', async () => {
  const {token, teamId, secondTeamId} = await signUpOnTwoTeams()
  const created = await callToolForData(token, 'create_task', {teamId, content: 'Move me'})
  const taskId = created.createTask.task.id as string

  const moved = await callToolForData(token, 'update_task', {taskId, teamId: secondTeamId})
  expect(moved.changeTaskTeam.task).toMatchObject({id: taskId, teamId: secondTeamId})

  const movedBack = await callToolForData(token, 'update_task', {taskId, teamId, status: 'done'})
  expect(movedBack.updateTask.task).toMatchObject({id: taskId, teamId, status: 'done'})
})

test('update_task says where it moved a task when the changes after the move fail', async () => {
  const {token, teamId, secondTeamId} = await signUpOnTwoTeams()
  const stranger = await signUp()
  const created = await callToolForData(token, 'create_task', {teamId, content: 'Half done'})
  const taskId = created.createTask.task.id as string

  const result = await callTool(token, 'update_task', {
    taskId,
    teamId: secondTeamId,
    userId: stranger.userId
  })
  expect(result.isError).toBe(true)
  const [error] = JSON.parse(result.content[0]!.text)
  expect(error.movedToTeamId).toBe(secondTeamId)
})

test("update_task refuses a team the caller isn't on and leaves the task where it was", async () => {
  const {token, teamId} = await signUpOnTwoTeams()
  const stranger = await signUp()
  const created = await callToolForData(token, 'create_task', {teamId, content: 'Stay put'})
  const taskId = created.createTask.task.id as string

  const refused = await callTool(token, 'update_task', {taskId, teamId: stranger.teamId})
  expectToolErrorCode(refused, 'FORBIDDEN')
  const listed = await callToolForData(token, 'list_tasks', {teamIds: [teamId]})
  expect(listed.viewer.tasks.edges.map(({node}: {node: {id: string}}) => node.id)).toContain(taskId)
})

test('create_task advertises only the fields without a default as required', async () => {
  const tools = await listTools(await createPersonalAccessToken())
  const createTask = tools.find(({name}: {name: string}) => name === 'create_task')
  expect(createTask.inputSchema.required).toEqual(['teamId', 'content'])
})

test('a TypeScript tool refuses arguments that fail its schema with BAD_USER_INPUT', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(['TASKS_WRITE'], {cookie})
  const result = await callTool(token, 'create_task', {teamId})
  expectToolError(result, 'content')
  expect(JSON.parse(result.content[0]!.text)[0].code).toBe('BAD_USER_INPUT')
})

test('upload_image refuses bytes that are not the named type', async () => {
  const {cookie, userId} = await signUp()
  const token = await createPersonalAccessToken(['USERS_WRITE'], {cookie})
  const result = await callTool(token, 'upload_image', {
    filename: 'a.png',
    mimeType: 'image/png',
    base64: JPEG_BASE64,
    scope: 'User',
    scopeKey: userId
  })
  expectToolError(result, 'not a image/png')
})

test('graphql_query refuses a mutation', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  const result = await callTool(token, 'graphql_query', {query: 'mutation { logout }'})
  expectToolError(result, 'graphql_query runs queries only')
})

test('graphql_query can introspect the schema', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  const data = await callToolForData(token, 'graphql_query', {
    query: '{ __type(name: "Task") { fields { name } } }'
  })
  expect(data.__type.fields.map(({name}: {name: string}) => name)).toContain('plaintextContent')
})

test('graphql_query and graphql_mutate point at describe_graphql instead of a field-by-field introspection', async () => {
  const tools = await listTools(await createPersonalAccessToken())
  for (const name of ['graphql_query', 'graphql_mutate']) {
    const {description} = tools.find((tool: {name: string}) => tool.name === name)
    expect(description).toContain('describe_graphql')
    expect(description).not.toContain('type { name }')
  }
  const mutate = tools.find((tool: {name: string}) => tool.name === 'graphql_mutate')
  expect(mutate.description).toContain('select only id when the connection lacks the read scope')
})

test('graphql_mutate runs a mutation', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(['PAGES_WRITE'], {cookie})
  const data = await callToolForData(token, 'graphql_mutate', {
    query: 'mutation CreatePage($teamId: ID!) { createPage(teamId: $teamId) { page { id } } }',
    variables: {teamId}
  })
  expect(data.createPage.page.id).toEqual(expect.any(String))
})

test('tools/list lists exactly these tools, each once', async () => {
  const tools = await listTools(await createPersonalAccessToken())
  const names: string[] = tools.map(({name}: {name: string}) => name)
  expect(new Set(names).size).toBe(names.length)
  expect(names.toSorted()).toEqual(TOOL_NAMES)
})

test('llms.txt describes the server and names each tool once', async () => {
  const response = await fetch(`${ORIGIN}/llms.txt`)
  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8')
  const llmsTxt = await response.text()
  expect(llmsTxt).toMatch(/^# Parabol\n\n> /)
  expect(llmsTxt).toContain(`The MCP server is at ${MCP_URL}.`)
  expect(llmsTxt).toContain(`${ORIGIN}/.well-known/oauth-protected-resource/mcp`)
  const toolSection = llmsTxt.split('\n## Tools\n')[1]!.split('\n## ')[0]!
  const names = [...toolSection.matchAll(/`([a-z_]+)`/g)].map(([, name]) => name)
  expect(names.toSorted()).toEqual(TOOL_NAMES)
})

const GENERIC_TOOLS = ['graphql_query', 'graphql_mutate', 'describe_graphql']

test('a client that signs in through ChatGPT gets every tool but the generic GraphQL ones, and never reads their names', async () => {
  const token = await createOAuthAccessToken(undefined, {
    redirectUri: 'https://chatgpt.com/connector/oauth/test-callback'
  })
  const tools: {name: string; description: string}[] = await listTools(token)
  expect(tools.map(({name}) => name).toSorted()).toEqual(
    TOOL_NAMES.filter((name) => !GENERIC_TOOLS.includes(name))
  )
  for (const {description} of tools) {
    for (const generic of GENERIC_TOOLS) expect(description).not.toContain(generic)
  }
  const standupTemplate = tools.find(({name}) => name === 'create_standup_template')!
  expect(standupTemplate.description).toContain('Needs users:read, teams:read and templates:write.')

  const initialized = await postMCP(INITIALIZE, bearer(token))
  const {instructions} = (await initialized.json()).result
  for (const generic of GENERIC_TOOLS) expect(instructions).not.toContain(generic)
  expect(instructions).toContain('Start with get_me')

  const response = await postMCP(
    {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {name: 'graphql_query', arguments: {query: '{ viewer { id } }'}}
    },
    {...bearer(token), 'mcp-protocol-version': PROTOCOL_VERSION}
  )
  expect((await response.json()).error.code).toBe(-32602)
})

test("OpenAI's domain challenge is plain text: the configured token, or 404 without one", async () => {
  const response = await fetch(`${ORIGIN}/.well-known/openai-apps-challenge`)
  expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8')
  const token = process.env.OPENAI_APPS_CHALLENGE
  if (token) {
    expect(response.status).toBe(200)
    expect(await response.text()).toBe(token)
  } else {
    expect(response.status).toBe(404)
  }
})

test('an OAuth client signed in elsewhere gets every tool', async () => {
  const tools: {name: string}[] = await listTools(await createOAuthAccessToken())
  expect(tools.map(({name}) => name).toSorted()).toEqual(TOOL_NAMES)
})
