import getKysely from '../postgres/getKysely'
import getRedis from '../utils/getRedis'
import {sendPublic} from './common'
import {
  callTool,
  callToolForData,
  createPersonalAccessToken,
  expectToolErrorCode,
  getChargedCost,
  signUpWithoutAI
} from './mcpClient'

afterAll(async () => {
  await getRedis().quit()
})

const ADMIN_SCOPES = [
  'USERS_READ',
  'TEAMS_READ',
  'TEAMS_WRITE',
  'TEMPLATES_READ',
  'TEMPLATES_WRITE',
  'MEETINGS_WRITE'
]

const COLUMNS = [{question: 'Glad'}, {question: 'Sad'}]

const ADD_TEAM = `
  mutation AddTeam($newTeam: NewTeamInput!) {
    addTeam(newTeam: $newTeam) {
      team {
        id
      }
    }
  }
`

const ADD_POKER_TEMPLATE = `
  mutation AddPokerTemplate($teamId: ID!) {
    addPokerTemplate(teamId: $teamId) {
      pokerTemplate {
        id
        dimensions {
          name
        }
      }
    }
  }
`

const ADD_POKER_SCALE = `
  mutation AddPokerScale($teamId: ID!) {
    addPokerTemplateScale(teamId: $teamId) {
      scale {
        id
      }
    }
  }
`

const RENAME_POKER_SCALE = `
  mutation RenamePokerScale($scaleId: ID!, $name: String!) {
    renamePokerTemplateScale(scaleId: $scaleId, name: $name) {
      __typename
    }
  }
`

const ADD_POKER_SCALE_VALUE = `
  mutation AddPokerScaleValue($scaleId: ID!, $scaleValue: AddTemplateScaleInput!) {
    addPokerTemplateScaleValue(scaleId: $scaleId, scaleValue: $scaleValue) {
      __typename
    }
  }
`

type ListedTemplate = {
  id: string
  name: string
  scope: string
  prompts?: string[]
  dimensions?: {name: string; scale: string}[]
  questions?: string[]
}
type ListedScale = {id: string; name: string; values: string[]}

const listTemplates = async (token: string, teamId: string, meetingType: string) =>
  (await callToolForData(token, 'list_templates', {teamId, meetingType})) as {
    templates: ListedTemplate[]
    scales?: ListedScale[]
  }

const getIds = (items: {id: string}[]) => items.map(({id}) => id)

const signUpAdmin = async () => {
  const member = await signUpWithoutAI()
  return {
    ...member,
    token: await createPersonalAccessToken(ADMIN_SCOPES, {cookie: member.cookie})
  }
}

const addPokerTemplate = async (cookie: string, teamId: string) => {
  const added = await sendPublic({query: ADD_POKER_TEMPLATE, variables: {teamId}, cookie})
  expect(added.errors).toBeUndefined()
  return added.data.addPokerTemplate.pokerTemplate as {id: string; dimensions: {name: string}[]}
}

const addPokerScale = async (cookie: string, teamId: string, name: string, labels: string[]) => {
  const added = await sendPublic({query: ADD_POKER_SCALE, variables: {teamId}, cookie})
  expect(added.errors).toBeUndefined()
  const scaleId = added.data.addPokerTemplateScale.scale.id as string
  const renamed = await sendPublic({query: RENAME_POKER_SCALE, variables: {scaleId, name}, cookie})
  expect(renamed.errors).toBeUndefined()
  for (const label of labels) {
    const scaleValue = {label, color: '#FD6157'}
    const valueAdded = await sendPublic({
      query: ADD_POKER_SCALE_VALUE,
      variables: {scaleId, scaleValue},
      cookie
    })
    expect(valueAdded.errors).toBeUndefined()
  }
  return {id: scaleId}
}

const setTemplateScope = (templateId: string, scope: 'TEAM' | 'ORGANIZATION') =>
  getKysely().updateTable('MeetingTemplate').set({scope}).where('id', '=', templateId).execute()

test('list_templates lists the retro templates a team can pick: its own, org-wide and built-in ones', async () => {
  const {cookie, orgId, teamId} = await signUpWithoutAI()
  const addedTeam = await sendPublic({
    query: ADD_TEAM,
    variables: {newTeam: {name: 'Second team', orgId, isPublic: false}},
    cookie
  })
  expect(addedTeam.errors).toBeUndefined()
  const secondTeamId = addedTeam.data.addTeam.team.id
  const token = await createPersonalAccessToken(ADMIN_SCOPES, {cookie})
  const {template: own} = await callToolForData(token, 'create_retro_template', {
    teamId,
    name: 'Team Columns',
    columns: COLUMNS
  })
  const {template: secondTeams} = await callToolForData(token, 'create_retro_template', {
    teamId: secondTeamId,
    name: 'Second Team Columns',
    columns: COLUMNS
  })
  await setTemplateScope(own.id, 'TEAM')
  await setTemplateScope(secondTeams.id, 'TEAM')

  const teamOnly = await listTemplates(token, teamId, 'retrospective')
  expect(teamOnly.templates).toContainEqual({
    id: own.id,
    name: 'Team Columns',
    scope: 'TEAM',
    prompts: ['Glad', 'Sad']
  })
  expect(getIds(teamOnly.templates)).not.toContain(secondTeams.id)
  expect(teamOnly.templates).toContainEqual({
    id: 'startStopContinueTemplate',
    name: 'Start, Stop, Continue',
    scope: 'PUBLIC',
    prompts: ['Start', 'Stop', 'Continue']
  })
  expect(teamOnly.scales).toBeUndefined()

  await setTemplateScope(secondTeams.id, 'ORGANIZATION')
  const shared = await listTemplates(token, teamId, 'retrospective')
  expect(shared.templates).toContainEqual({
    id: secondTeams.id,
    name: 'Second Team Columns',
    scope: 'ORGANIZATION',
    prompts: ['Glad', 'Sad']
  })
})

test('list_templates lists sprint poker templates with their dimensions and the scales the team can vote with', async () => {
  const {cookie, teamId, token} = await signUpAdmin()
  const scale = await addPokerScale(cookie, teamId, 'Agent Scale', ['1', '2'])
  const pokerTemplate = await addPokerTemplate(cookie, teamId)

  const {templates, scales} = await listTemplates(token, teamId, 'poker')
  expect(templates).toContainEqual(
    expect.objectContaining({
      id: pokerTemplate.id,
      scope: 'ORGANIZATION',
      dimensions: pokerTemplate.dimensions.map(({name}) => ({name, scale: 'Fibonacci'}))
    })
  )
  expect(templates).toContainEqual({
    id: 'estimatedEffortTemplate',
    name: 'Estimated Effort',
    scope: 'PUBLIC',
    dimensions: [{name: 'Story Points', scale: 'Fibonacci'}]
  })
  expect(scales).toContainEqual({
    id: scale.id,
    name: 'Agent Scale',
    values: ['1', '2', '?', 'Pass']
  })
  expect(scales).toContainEqual(expect.objectContaining({id: 'fibonacciScale', name: 'Fibonacci'}))
})

test('list_templates lists standup and team health templates and needs a meeting type', async () => {
  const {teamId, token} = await signUpAdmin()
  const {template: standup} = await callToolForData(token, 'create_standup_template', {
    teamId,
    name: 'Agent Standup',
    prompts: [{question: 'What did you ship?'}]
  })
  const {template: teamHealth} = await callToolForData(token, 'create_team_health_template', {
    teamId,
    name: 'Agent Health',
    questions: [{question: 'We ship often.'}]
  })

  const standups = await listTemplates(token, teamId, 'teamPrompt')
  expect(standups.templates).toContainEqual(
    expect.objectContaining({
      id: standup.id,
      name: 'Agent Standup',
      prompts: ['What did you ship?']
    })
  )
  expect(standups.templates).toContainEqual(
    expect.objectContaining({id: 'teamPrompt', scope: 'PUBLIC'})
  )

  const checks = await listTemplates(token, teamId, 'teamHealth')
  expect(checks.templates).toContainEqual(
    expect.objectContaining({
      id: teamHealth.id,
      name: 'Agent Health',
      questions: ['We ship often.']
    })
  )
  expect(checks.templates).toContainEqual(
    expect.objectContaining({id: 'everythingBagelTemplate', scope: 'PUBLIC'})
  )

  expectToolErrorCode(await callTool(token, 'list_templates', {teamId}), 'BAD_USER_INPUT')
})

test('list_templates for sprint poker stays under the 300 cost cap of one operation', async () => {
  const {userId, teamId, token} = await signUpAdmin()
  const beforeList = await getChargedCost(userId)
  await listTemplates(token, teamId, 'poker')
  expect((await getChargedCost(userId)) - beforeList).toBeLessThanOrEqual(300)
})

test('a Starter agent can list templates, pick one and start a retro within the minute budget', async () => {
  const {userId, teamId, token} = await signUpAdmin()
  await callToolForData(token, 'get_me', {})
  const beforeList = await getChargedCost(userId)
  const {templates} = await listTemplates(token, teamId, 'retrospective')
  expect((await getChargedCost(userId)) - beforeList).toBeLessThanOrEqual(300)
  const sailboat = templates.find(({name}) => name === 'Sailboat')!
  await callToolForData(token, 'select_template', {templateId: sailboat.id, teamId})
  await callToolForData(token, 'start_retrospective', {teamId})
  expect(await getChargedCost(userId)).toBeLessThanOrEqual(500)
})

test('list_templates refuses a caller off the team', async () => {
  const {teamId} = await signUpAdmin()
  const outsider = await signUpAdmin()
  expectToolErrorCode(
    await callTool(outsider.token, 'list_templates', {teamId, meetingType: 'retrospective'}),
    'FORBIDDEN'
  )
})

const describeGraphql = async (token: string, name: string) => {
  const result = await callTool(token, 'describe_graphql', {name})
  expect(result.isError ? result.content[0]!.text : undefined).toBeUndefined()
  return result.content[0]!.text
}

test('describe_graphql gives a mutation with its arguments and the input types of those arguments, to any connection', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])

  const createPage = await describeGraphql(token, 'Mutation.createPage')
  expect(createPage).toContain('createPage(')
  expect(createPage).toContain('teamId: ID')
  expect(createPage).toContain('parentPageId: ID')
  expect(createPage).toContain('): CreatePagePayload!')
  expect(createPage).not.toContain('deleteTask(')

  const createTask = await describeGraphql(token, 'Mutation.createTask')
  expect(createTask).toContain('newTask: CreateTaskInput!')
  expect(createTask).toContain('input CreateTaskInput {')
  expect(createTask).toContain('enum AreaEnum {')
  expect(createTask).not.toContain('input CreateTaskIntegrationInput')
})

test('describe_graphql gives a type with the descriptions of its fields', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  const task = await describeGraphql(token, 'Task')
  expect(task).toContain('type Task implements Threadable {')
  expect(task).toContain('"""The rich text body of the item"""\n  content: String!')
})

test('describe_graphql refuses a name that is not in the schema with the closest matches', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  expect(
    expectToolErrorCode(await callTool(token, 'describe_graphql', {name: 'Taks'}), 'BAD_USER_INPUT')
  ).toContain('Did you mean "Task"')
  expect(
    expectToolErrorCode(
      await callTool(token, 'describe_graphql', {name: 'Mutation.createPag'}),
      'BAD_USER_INPUT'
    )
  ).toContain('Did you mean "Mutation.createPage"')
  expectToolErrorCode(await callTool(token, 'describe_graphql', {name: ' '}), 'BAD_USER_INPUT')
})

test('describe_graphql lists the fields of a type too long for one answer and describes any one of them in full', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  const mutation = await describeGraphql(token, 'Mutation')
  expect(mutation.length).toBeLessThanOrEqual(20_000)
  expect(mutation.startsWith('type Mutation {\n')).toBe(true)
  expect(mutation).toContain('\n  createPage(teamId, parentPageId): CreatePagePayload!\n')
  expect(mutation).toContain('\n  createTask(newTask, area): CreateTaskPayload!\n')
  expect(mutation).toMatch(/\n {2}autogroup\(meetingId\): AutogroupPayload! @deprecated\n/)
  expect(mutation).not.toContain('"""')
  expect(mutation).toMatch(
    /fields, too many to show in full\. Describe one as Mutation\.\w+ for its/
  )

  const user = await describeGraphql(token, 'User')
  expect(user).toContain('"""')
  expect(user.length).toBeLessThanOrEqual(20_000)

  const createTask = await describeGraphql(token, 'Mutation.createTask')
  expect(createTask).toContain('"""Create a new task, triggering a CreateCard for other viewers"""')
  expect(createTask).toContain('input CreateTaskInput {')
  expect(createTask.length).toBeLessThan(10_000)
})

test('describe_graphql names the root field that a bare field name belongs to', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  const message = expectToolErrorCode(
    await callTool(token, 'describe_graphql', {name: 'createTask'}),
    'BAD_USER_INPUT'
  )
  expect(message).toBe('No type named "createTask". Did you mean "Mutation.createTask"?')
})

test('describe_graphql refuses a name too long to be a type or field', async () => {
  const token = await createPersonalAccessToken(['USERS_READ'])
  const result = await callTool(token, 'describe_graphql', {name: 'x'.repeat(201)})
  expectToolErrorCode(result, 'BAD_USER_INPUT')
  expect(result.content[0]!.text.length).toBeLessThan(500)
})
