import mcpInstructions from '../mcp/mcpInstructions'
import getKysely from '../postgres/getKysely'
import getRedis from '../utils/getRedis'
import {sendPublic} from './common'
import {
  callTool,
  callToolForData,
  createPersonalAccessToken,
  expectToolErrorCode,
  getChargedCost,
  leaveHourlyQueryBudget,
  PNG_BASE64,
  signUpWithoutAI
} from './mcpClient'

afterAll(async () => {
  await getRedis().quit()
})

test('get_me answers on a connection without orgs:read', async () => {
  const {userId, cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(['USERS_READ', 'TEAMS_READ'], {cookie})
  const result = await callTool(token, 'get_me', {})
  expect(result.isError).toBeUndefined()
  const {viewer} = JSON.parse(result.content[0]!.text)
  expect(viewer.id).toBe(userId)
  expect(viewer.organizations).toBeUndefined()
  expect(viewer.teams.map(({id}: {id: string}) => id)).toContain(teamId)
})

const getColumns = (meetingResult: {
  viewer: {meeting: {phases: {reflectPrompts?: {id: string; question: string}[]}[]}}
}) => meetingResult.viewer.meeting.phases.flatMap(({reflectPrompts}) => reflectPrompts ?? [])

const RETRO_SCOPES = ['USERS_READ', 'MEETINGS_READ', 'MEETINGS_WRITE', 'TEAMS_READ']

test('an agent adds and edits cards on a retro', async () => {
  const {cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(RETRO_SCOPES, {cookie})
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

  const after = await callToolForData(token, 'get_meeting', {meetingId})
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

test('a card too long for Parabol once formatted is refused with the limit named', async () => {
  const {cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(RETRO_SCOPES, {cookie})
  const started = await callToolForData(token, 'start_retrospective', {teamId})
  const meetingId = started.startRetrospective.meeting.id as string
  const meeting = await callToolForData(token, 'list_retro_columns', {meetingId})
  const promptId = getColumns(meeting)[0]!.id
  const shortButHeavilyFormatted = '**bold** '.repeat(150)
  expect(shortButHeavilyFormatted.length).toBeLessThan(2000)

  const added = await callTool(token, 'add_reflection', {
    meetingId,
    promptId,
    content: shortButHeavilyFormatted
  })
  const message = expectToolErrorCode(added, 'BAD_USER_INPUT')
  expect(message).toContain('2,000')
  expect(message).toContain('formatting included')

  const card = await callToolForData(token, 'add_reflection', {
    meetingId,
    promptId,
    content: 'Deploys are slow'
  })
  const reflectionId = card.createReflection.reflection.id as string
  const updated = await callTool(token, 'update_reflection', {
    reflectionId,
    content: shortButHeavilyFormatted
  })
  expectToolErrorCode(updated, 'BAD_USER_INPUT')

  const after = await callToolForData(token, 'get_meeting', {meetingId})
  const groups = after.viewer.meeting.reflectionGroups as {
    reflections: {id: string; plaintextContent: string}[]
  }[]
  expect(groups.flatMap(({reflections}) => reflections)).toEqual([
    {id: reflectionId, plaintextContent: 'Deploys are slow'}
  ])
})

test('a card can show an image uploaded to Parabol', async () => {
  const {cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken([...RETRO_SCOPES, 'TEAMS_WRITE'], {cookie})
  const uploaded = await callToolForData(token, 'upload_image', {
    filename: 'burndown.png',
    mimeType: 'image/png',
    base64: PNG_BASE64,
    scope: 'Team',
    scopeKey: teamId
  })
  const imageUrl = uploaded.uploadUserAsset.url as string
  const started = await callToolForData(token, 'start_retrospective', {teamId})
  const meetingId = started.startRetrospective.meeting.id as string
  const meeting = await callToolForData(token, 'list_retro_columns', {meetingId})
  const added = await callToolForData(token, 'add_reflection', {
    meetingId,
    promptId: getColumns(meeting)[0]!.id,
    content: `Our burndown\n\n![burndown](${imageUrl})`
  })

  const stored = await getKysely()
    .selectFrom('RetroReflection')
    .select('content')
    .where('id', '=', added.createReflection.reflection.id)
    .executeTakeFirstOrThrow()
  expect(JSON.parse(stored.content).content).toEqual([
    {type: 'paragraph', content: [{type: 'text', text: 'Our burndown'}]},
    expect.objectContaining({type: 'imageBlock', attrs: expect.objectContaining({src: imageUrl})})
  ])
})

const TEMPLATE_SCOPES = [...RETRO_SCOPES, 'TEAMS_WRITE', 'TEMPLATES_WRITE']

const COLUMNS = [
  {question: 'What went well?'},
  {question: 'What dragged?', description: 'Anything that slowed the sprint down'},
  {question: 'What will we try?'}
]

const GET_TEMPLATE = `
  query GetTemplate($templateId: ID!) {
    viewer {
      activity(activityId: $templateId) {
        name
        ... on PromptTemplate {
          prompts {
            id
            question
            description
          }
        }
      }
    }
  }
`

const getActiveTemplateNames = async (teamId: string) => {
  const templates = await getKysely()
    .selectFrom('MeetingTemplate')
    .select('name')
    .where('teamId', '=', teamId)
    .where('isActive', '=', true)
    .orderBy('createdAt')
    .execute()
  return templates.map(({name}) => name)
}

test('create_retro_template makes a template with exactly those columns, in order', async () => {
  const {cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(TEMPLATE_SCOPES, {cookie})
  const {template} = await callToolForData(token, 'create_retro_template', {
    teamId,
    name: 'Agent Columns',
    columns: COLUMNS
  })
  expect(template.name).toBe('Agent Columns')
  expect(template.scope).toBe('ORGANIZATION')
  expect(template.columns).toEqual([
    {id: expect.any(String), question: 'What went well?', description: ''},
    {
      id: expect.any(String),
      question: 'What dragged?',
      description: 'Anything that slowed the sprint down'
    },
    {id: expect.any(String), question: 'What will we try?', description: ''}
  ])

  const res = await sendPublic({query: GET_TEMPLATE, variables: {templateId: template.id}, cookie})
  expect(res.errors).toBeUndefined()
  expect(res.data.viewer.activity).toEqual({name: 'Agent Columns', prompts: template.columns})
})

test('a retro started with the new template has its columns', async () => {
  const {cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(TEMPLATE_SCOPES, {cookie})
  const {template} = await callToolForData(token, 'create_retro_template', {
    teamId,
    name: 'Agent Columns',
    columns: COLUMNS
  })
  await callToolForData(token, 'select_template', {templateId: template.id, teamId})
  const started = await callToolForData(token, 'start_retrospective', {teamId})
  const meetingId = started.startRetrospective.meeting.id as string

  const meeting = await callToolForData(token, 'list_retro_columns', {meetingId})
  expect(getColumns(meeting)).toEqual(template.columns)
})

test("a card can't go under a column from another template, and nothing is stored", async () => {
  const [member, otherTeam] = await Promise.all([signUpWithoutAI(), signUpWithoutAI()])
  const token = await createPersonalAccessToken(TEMPLATE_SCOPES, {cookie: member.cookie})
  const otherToken = await createPersonalAccessToken(TEMPLATE_SCOPES, {cookie: otherTeam.cookie})
  const {template: foreignTemplate} = await callToolForData(otherToken, 'create_retro_template', {
    teamId: otherTeam.teamId,
    name: 'Other Team Columns',
    columns: COLUMNS
  })
  const started = await callToolForData(token, 'start_retrospective', {teamId: member.teamId})
  const meetingId = started.startRetrospective.meeting.id as string
  const ownColumns = getColumns(await callToolForData(token, 'list_retro_columns', {meetingId}))

  const refused = await callTool(token, 'add_reflection', {
    meetingId,
    promptId: foreignTemplate.columns[0].id,
    content: 'Deploys are slow'
  })
  const message = expectToolErrorCode(refused, 'BAD_USER_INPUT')
  expect(message).toContain('not part of this meeting')

  const empty = await callToolForData(token, 'get_meeting', {meetingId})
  expect(empty.viewer.meeting.reflectionGroups).toEqual([])

  const added = await callToolForData(token, 'add_reflection', {
    meetingId,
    promptId: ownColumns[0]!.id,
    content: 'Deploys are slow'
  })
  expect(added.createReflection.reflection.plaintextContent).toBe('Deploys are slow')
})

test("twelve described columns and the retro that uses them fit a starter user's query budget", async () => {
  const {cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(TEMPLATE_SCOPES, {cookie})
  const columns = Array.from({length: 12}, (_, idx) => ({
    question: `Column ${idx + 1}`,
    description: `What column ${idx + 1} is for`
  }))
  const {template} = await callToolForData(token, 'create_retro_template', {
    teamId,
    name: 'Twelve Columns',
    columns
  })
  expect(template.columns).toEqual(columns.map((column) => ({id: expect.any(String), ...column})))

  await callToolForData(token, 'select_template', {templateId: template.id, teamId})
  const started = await callToolForData(token, 'start_retrospective', {teamId})
  const meetingId = started.startRetrospective.meeting.id as string
  const meeting = await callToolForData(token, 'list_retro_columns', {meetingId})
  expect(getColumns(meeting)).toEqual(template.columns)
})

test('a starter user out of free custom templates gets that error and no template', async () => {
  const {cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(TEMPLATE_SCOPES, {cookie})
  for (const name of ['First Columns', 'Second Columns']) {
    await callToolForData(token, 'create_retro_template', {teamId, name, columns: COLUMNS})
  }

  const result = await callTool(token, 'create_retro_template', {
    teamId,
    name: 'Third Columns',
    columns: COLUMNS
  })
  const message = expectToolErrorCode(result, 'UPGRADE_REQUIRED')
  expect(message).toBe('You have reached the limit of free custom templates.')
  expect(await getActiveTemplateNames(teamId)).toEqual(['First Columns', 'Second Columns'])
})

test('a name the team already uses is refused before a free template is spent', async () => {
  const {cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(TEMPLATE_SCOPES, {cookie})
  await callToolForData(token, 'create_retro_template', {
    teamId,
    name: 'Agent Columns',
    columns: COLUMNS
  })

  const duplicate = await callTool(token, 'create_retro_template', {
    teamId,
    name: ' Agent Columns ',
    columns: COLUMNS
  })
  const message = expectToolErrorCode(duplicate, 'CONFLICT')
  expect(message).toContain('"Agent Columns"')

  await callToolForData(token, 'create_retro_template', {
    teamId,
    name: 'Other Columns',
    columns: COLUMNS
  })
  expect(await getActiveTemplateNames(teamId)).toEqual(['Agent Columns', 'Other Columns'])
})

test('a half-made template it could not remove is named in the error', async () => {
  const {userId, cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(TEMPLATE_SCOPES, {cookie})
  const defaultColumn = [{question: 'New prompt'}]
  const before = await getChargedCost(userId)
  await callToolForData(token, 'create_retro_template', {
    teamId,
    name: 'First Columns',
    columns: defaultColumn
  })
  const checkCreateAndRenameCost = (await getChargedCost(userId)) - before
  await leaveHourlyQueryBudget(userId, checkCreateAndRenameCost - 1)

  const result = await callTool(token, 'create_retro_template', {
    teamId,
    name: 'Second Columns',
    columns: defaultColumn
  })
  expectToolErrorCode(result, 'TOO_MANY_REQUESTS')
  const [error] = JSON.parse(result.content[0]!.text)
  const unfinished = await getKysely()
    .selectFrom('MeetingTemplate')
    .select('isActive')
    .where('id', '=', error.unfinishedTemplateId)
    .executeTakeFirst()
  expect(unfinished?.isActive).toBe(true)
})

test('columns that repeat a question are refused before anything is made', async () => {
  const {cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(TEMPLATE_SCOPES, {cookie})
  const result = await callTool(token, 'create_retro_template', {
    teamId,
    name: 'Agent Columns',
    columns: [{question: 'Glad'}, {question: ' Glad '}]
  })
  expectToolErrorCode(result, 'BAD_USER_INPUT')
  expect(await getActiveTemplateNames(teamId)).toEqual([])
})

test('the instructions walk through a retro with custom columns', () => {
  expect(mcpInstructions).toMatch(
    /create_retro_template.*select_template.*start_retrospective.*list_retro_columns.*add_reflection/s
  )
})
