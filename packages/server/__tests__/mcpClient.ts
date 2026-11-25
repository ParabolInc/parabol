import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import getKysely from '../postgres/getKysely'
import getRedis from '../utils/getRedis'
import {HOST, PROTOCOL, sendPublic, signUp} from './common'

const STARTER_HOURLY_QUERY_BUDGET = 5000

export const getChargedCost = async (userId: string) => {
  const buckets = await getRedis().hvals(`adhocGQL:${userId}`)
  return buckets.reduce((total, cost) => total + Number(cost), 0)
}

export const leaveHourlyQueryBudget = async (userId: string, room: number) => {
  const tenMinutesAgo = String(Math.floor(Date.now() / 60_000) * 60 - 600)
  await getRedis().hincrby(
    `adhocGQL:${userId}`,
    tenMinutesAgo,
    STARTER_HOURLY_QUERY_BUDGET - (await getChargedCost(userId)) - room
  )
}

export const signUpWithoutAI = async () => {
  const member = await signUp()
  await getKysely()
    .updateTable('Organization')
    .set({useAI: false})
    .where('id', '=', member.orgId)
    .execute()
  return member
}

export const MCP_URL = `${PROTOCOL}://${HOST}/mcp`
export const PROTOCOL_VERSION = '2025-06-18'

export const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

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

export const postMCP = (body: unknown, headers: Record<string, string> = {}) =>
  fetch(MCP_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  })

export const bearer = (token: string) => ({authorization: `Bearer ${token}`})

interface TokenOptions {
  cookie?: string
  grantedOrgIds?: string[]
  grantedTeamIds?: string[]
  grantedPageIds?: string[]
}

export const createPersonalAccessToken = async (
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

export const callTool = async (token: string, name: string, args: Record<string, unknown>) => {
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

export const callToolForData = async (
  token: string,
  name: string,
  args: Record<string, unknown>
) => {
  const result = await callTool(token, name, args)
  expect(result.isError ? `${name}: ${result.content[0]!.text}` : undefined).toBeUndefined()
  return JSON.parse(result.content[0]!.text)
}

export const expectToolError = (result: Awaited<ReturnType<typeof callTool>>, text: string) => {
  expect(result.isError).toBe(true)
  expect(result.content[0]!.text).toContain(text)
}

export const expectToolErrorCode = (result: Awaited<ReturnType<typeof callTool>>, code: string) => {
  expect(result.isError).toBe(true)
  const [error] = JSON.parse(result.content[0]!.text)
  expect(error.code).toBe(code)
  return error.message as string
}

export const listTools = async (token: string) => {
  const response = await postMCP(
    {jsonrpc: '2.0', id: 3, method: 'tools/list'},
    {...bearer(token), 'mcp-protocol-version': PROTOCOL_VERSION}
  )
  expect(response.status).toBe(200)
  return (await response.json()).result.tools
}

export const addTeammate = async (teamId: string, scopes: string[]) => {
  const teammate = await signUpWithoutAI()
  await getKysely()
    .insertInto('TeamMember')
    .values({
      id: TeamMemberId.join(teamId, teammate.userId),
      teamId,
      userId: teammate.userId,
      isLead: false
    })
    .execute()
  return {
    ...teammate,
    token: await createPersonalAccessToken(scopes, {cookie: teammate.cookie})
  }
}

export const isSpectating = async (meetingId: string, userId: string) => {
  const member = await getKysely()
    .selectFrom('MeetingMember')
    .select('isSpectating')
    .where('id', '=', MeetingMemberId.join(meetingId, userId))
    .executeTakeFirstOrThrow()
  return member.isSpectating
}

export const waitForSummaryText = async (meetingId: string, expectedText: string) => {
  const deadline = Date.now() + 20000
  while (true) {
    const summaryPage = await getKysely()
      .selectFrom('Page')
      .select('plaintextContent')
      .where('summaryMeetingId', '=', meetingId)
      .executeTakeFirst()
    const summaryText = summaryPage?.plaintextContent ?? ''
    if (summaryText.includes(expectedText) || Date.now() > deadline) return summaryText
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
}
