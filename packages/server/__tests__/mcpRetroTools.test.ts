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

const callToolForData = async (token: string, name: string, args: Record<string, unknown>) => {
  const result = await callTool(token, name, args)
  expect(result.isError ? `${name}: ${result.content[0]!.text}` : undefined).toBeUndefined()
  return JSON.parse(result.content[0]!.text)
}

const getColumns = (meetingResult: {
  viewer: {meeting: {phases: {reflectPrompts?: {id: string; question: string}[]}[]}}
}) => meetingResult.viewer.meeting.phases.flatMap(({reflectPrompts}) => reflectPrompts ?? [])

const RETRO_SCOPES = ['USERS_READ', 'MEETINGS_READ', 'MEETINGS_WRITE', 'TEAMS_READ']

test('an agent adds, edits and renames cards on a retro', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(RETRO_SCOPES, cookie)
  const started = await callToolForData(token, 'start_retrospective', {teamId})
  const meetingId = started.startRetrospective.meeting.id as string

  const before = await callToolForData(token, 'list_retro_columns', {meetingId})
  const columns = getColumns(before)
  expect(columns.length).toBeGreaterThan(1)

  const added = await callToolForData(token, 'add_reflection', {
    meetingId,
    promptId: columns[0]!.id,
    content: 'Deploys are **slow**'
  })
  const reflectionId = added.createReflection.reflection.id as string
  expect(added.createReflection.reflection.plaintextContent).toBe('Deploys are slow')

  const second = await callToolForData(token, 'add_reflection', {
    meetingId,
    promptId: columns[0]!.id,
    content: 'Reviews are quick'
  })
  const secondId = second.createReflection.reflection.id as string
  expect(secondId).not.toBe(reflectionId)

  const updated = await callToolForData(token, 'update_reflection', {
    reflectionId,
    content: 'Deploys are *fast* now'
  })
  expect(updated.updateReflectionContent.reflection.plaintextContent).toBe('Deploys are fast now')

  await callToolForData(token, 'rename_meeting', {meetingId, name: 'Agent Retro'})

  const after = await callToolForData(token, 'get_meeting', {meetingId})
  expect(after.viewer.meeting.name).toBe('Agent Retro')
  const groups = after.viewer.meeting.reflectionGroups as {
    reflections: {id: string; plaintextContent: string}[]
  }[]
  const cards = groups.flatMap(({reflections}) => reflections)
  expect(cards.map(({id}) => id)).toEqual([reflectionId, secondId])
  expect(cards.map(({plaintextContent}) => plaintextContent)).toEqual([
    'Deploys are fast now',
    'Reviews are quick'
  ])
})

test('a card too long for Parabol is refused with the limit named', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(RETRO_SCOPES, cookie)
  const started = await callToolForData(token, 'start_retrospective', {teamId})
  const meetingId = started.startRetrospective.meeting.id as string
  const meeting = await callToolForData(token, 'list_retro_columns', {meetingId})
  const promptId = getColumns(meeting)[0]!.id
  const tooLong = 'word '.repeat(500)

  const added = await callTool(token, 'add_reflection', {meetingId, promptId, content: tooLong})
  expect(added.isError).toBe(true)
  const [error] = JSON.parse(added.content[0]!.text)
  expect(error.code).toBe('BAD_USER_INPUT')
  expect(error.message).toContain('2,000')

  const updated = await callTool(token, 'update_reflection', {
    reflectionId: 'whatever',
    content: tooLong
  })
  expect(updated.isError).toBe(true)
  expect(JSON.parse(updated.content[0]!.text)[0].code).toBe('BAD_USER_INPUT')
})
