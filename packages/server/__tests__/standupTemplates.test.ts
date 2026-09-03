import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const CANONICAL_TEMPLATE_ID = 'teamPrompt'
const ENTERPRISE_TEMPLATE_ID = 'enterpriseDailyStandupTemplate'

const ADD_TEAM_PROMPT_TEMPLATE = `
  mutation AddTeamPromptTemplate($teamId: ID!, $parentTemplateId: ID) {
    addTeamPromptTemplate(teamId: $teamId, parentTemplateId: $parentTemplateId) {
      teamPromptTemplate {
        __typename
        id
        name
        type
        category
        scope
        teamId
        prompts {
          id
          question
          description
          groupColor
          sortOrder
        }
      }
      user {
        freeCustomStandupTemplatesRemaining
      }
    }
  }
`

const REMOVE_TEAM_PROMPT_TEMPLATE = `
  mutation RemoveTeamPromptTemplate($templateId: ID!) {
    removeTeamPromptTemplate(templateId: $templateId) {
      teamPromptTemplate {
        id
        isActive
      }
      meetingSettings {
        selectedTemplateId
      }
    }
  }
`

const ADD_PROMPT = `
  mutation AddReflectTemplatePrompt($templateId: ID!) {
    addReflectTemplatePrompt(templateId: $templateId) {
      error {
        message
      }
      prompt {
        id
        question
      }
    }
  }
`

const RENAME_PROMPT = `
  mutation RenameReflectTemplatePrompt($promptId: ID!, $question: String!) {
    renameReflectTemplatePrompt(promptId: $promptId, question: $question) {
      error {
        message
      }
      prompt {
        id
        question
      }
    }
  }
`

const REMOVE_PROMPT = `
  mutation RemoveReflectTemplatePrompt($promptId: ID!) {
    removeReflectTemplatePrompt(promptId: $promptId) {
      error {
        message
      }
      prompt {
        id
      }
    }
  }
`

const ADD_POKER_TEMPLATE = `
  mutation AddPokerTemplate($teamId: ID!) {
    addPokerTemplate(teamId: $teamId) {
      ... on AddPokerTemplateSuccess {
        pokerTemplate {
          id
        }
      }
    }
  }
`

const SELECT_TEMPLATE = `
  mutation SelectTemplate($selectedTemplateId: ID!, $teamId: ID!) {
    selectTemplate(selectedTemplateId: $selectedTemplateId, teamId: $teamId) {
      meetingSettings {
        selectedTemplateId
      }
      error {
        message
      }
    }
  }
`

const STANDUP_SETTINGS = `
  query StandupSettings($teamId: ID!) {
    viewer {
      freeCustomStandupTemplatesRemaining
      team(teamId: $teamId) {
        meetingSettings(meetingType: teamPrompt) {
          ... on TeamPromptMeetingSettings {
            selectedTemplateId
            selectedTemplate {
              id
              name
              prompts {
                question
              }
            }
            teamPromptTemplates {
              id
            }
          }
        }
      }
    }
  }
`

const AVAILABLE_STANDUP_TEMPLATES = `
  query AvailableStandupTemplates {
    viewer {
      availableTemplates(first: 2000, type: teamPrompt) {
        edges {
          node {
            __typename
            id
            name
            isRecommended
            ... on TeamPromptTemplate {
              prompts {
                question
                groupColor
              }
            }
          }
        }
      }
    }
  }
`

const getStandupSettings = async (teamId: string, cookie: string) => {
  const res = await sendPublic({query: STANDUP_SETTINGS, variables: {teamId}, cookie})
  return res.data.viewer
}

test('seeded standup templates are TeamPromptTemplates with prompts', async () => {
  const {cookie} = await signUp()
  const res = await sendPublic({query: AVAILABLE_STANDUP_TEMPLATES, cookie})
  const nodes = res.data.viewer.availableTemplates.edges.map((edge: any) => edge.node)

  const canonical = nodes.find((node: any) => node.id === CANONICAL_TEMPLATE_ID)
  expect(canonical).toMatchObject({
    __typename: 'TeamPromptTemplate',
    name: 'Standup',
    prompts: [{question: 'What are you working on today? Stuck on anything?'}]
  })

  const enterprise = nodes.find((node: any) => node.id === ENTERPRISE_TEMPLATE_ID)
  expect(enterprise).toMatchObject({
    __typename: 'TeamPromptTemplate',
    name: 'Enterprise Daily Standup',
    isRecommended: true
  })
  expect(enterprise.prompts.map((prompt: any) => prompt.question)).toEqual([
    'What have you completed recently?',
    "What's next for you?",
    'What are you stuck on?'
  ])
})

test('every team has standup settings defaulting to the canonical template', async () => {
  const {teamId, cookie} = await signUp()
  const viewer = await getStandupSettings(teamId, cookie)
  expect(viewer.freeCustomStandupTemplatesRemaining).toBe(2)
  expect(viewer.team.meetingSettings).toMatchObject({
    selectedTemplateId: CANONICAL_TEMPLATE_ID,
    selectedTemplate: {id: CANONICAL_TEMPLATE_ID},
    teamPromptTemplates: []
  })
})

test('addTeamPromptTemplate creates a blank standup template with one prompt', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({query: ADD_TEAM_PROMPT_TEMPLATE, variables: {teamId}, cookie})
  expect(res.errors).toBeUndefined()
  const {teamPromptTemplate, user} = res.data.addTeamPromptTemplate
  expect(teamPromptTemplate).toMatchObject({
    __typename: 'TeamPromptTemplate',
    name: '*New Template #1',
    type: 'teamPrompt',
    category: 'standup',
    teamId,
    prompts: [{question: 'New prompt', description: '', groupColor: '#66BC8C'}]
  })
  expect(user.freeCustomStandupTemplatesRemaining).toBe(1)

  const viewer = await getStandupSettings(teamId, cookie)
  expect(viewer.team.meetingSettings.teamPromptTemplates).toEqual([{id: teamPromptTemplate.id}])
})

test('addTeamPromptTemplate clones a public template with its prompts', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: ADD_TEAM_PROMPT_TEMPLATE,
    variables: {teamId, parentTemplateId: ENTERPRISE_TEMPLATE_ID},
    cookie
  })
  expect(res.errors).toBeUndefined()
  const {teamPromptTemplate} = res.data.addTeamPromptTemplate
  expect(teamPromptTemplate.name).toBe('Enterprise Daily Standup Copy')
  expect(teamPromptTemplate.prompts.map((prompt: any) => prompt.question)).toEqual([
    'What have you completed recently?',
    "What's next for you?",
    'What are you stuck on?'
  ])
  expect(teamPromptTemplate.prompts.map((prompt: any) => prompt.groupColor)).toEqual([
    '#66BC8C',
    '#329AE5',
    '#FD6157'
  ])
  const clonedPromptIds = teamPromptTemplate.prompts.map((prompt: any) => prompt.id)
  const rows = await getKysely()
    .selectFrom('ReflectPrompt')
    .select(['id', 'parentPromptId'])
    .where('id', 'in', clonedPromptIds)
    .execute()
  expect(rows.map((row) => row.parentPromptId).sort()).toEqual([
    'enterpriseDailyStandupTemplate:completedPrompt',
    'enterpriseDailyStandupTemplate:nextPrompt',
    'enterpriseDailyStandupTemplate:stuckPrompt'
  ])
})

test('starter tier is limited by freeCustomStandupTemplatesRemaining', async () => {
  const {teamId, cookie} = await signUp()
  const first = await sendPublic({query: ADD_TEAM_PROMPT_TEMPLATE, variables: {teamId}, cookie})
  expect(first.errors).toBeUndefined()
  const second = await sendPublic({query: ADD_TEAM_PROMPT_TEMPLATE, variables: {teamId}, cookie})
  expect(second.errors).toBeUndefined()
  expect(second.data.addTeamPromptTemplate.user.freeCustomStandupTemplatesRemaining).toBe(0)

  const third = await sendPublic({query: ADD_TEAM_PROMPT_TEMPLATE, variables: {teamId}, cookie})
  expect(third.data).toBeNull()
  expect(third.errors).toEqual([
    expect.objectContaining({
      message: 'You have reached the limit of free custom templates.'
    })
  ])
})

test('addTeamPromptTemplate rejects a team the viewer is not on', async () => {
  const [attacker, victim] = await Promise.all([signUp(), signUp()])
  const res = await sendPublic({
    query: ADD_TEAM_PROMPT_TEMPLATE,
    variables: {teamId: victim.teamId},
    cookie: attacker.cookie
  })
  expect(res.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('Viewer is not on team')})
  ])
})

test('prompt mutations work on a standup template and reject a poker template', async () => {
  const {teamId, cookie} = await signUp()
  const created = await sendPublic({query: ADD_TEAM_PROMPT_TEMPLATE, variables: {teamId}, cookie})
  const {id: templateId, prompts} = created.data.addTeamPromptTemplate.teamPromptTemplate
  const [firstPrompt] = prompts

  const added = await sendPublic({query: ADD_PROMPT, variables: {templateId}, cookie})
  expect(added.data.addReflectTemplatePrompt.error).toBeNull()
  expect(added.data.addReflectTemplatePrompt.prompt.question).toBe('New prompt #2')

  const renamed = await sendPublic({
    query: RENAME_PROMPT,
    variables: {promptId: firstPrompt.id, question: 'What did you ship?'},
    cookie
  })
  expect(renamed.data.renameReflectTemplatePrompt.prompt.question).toBe('What did you ship?')

  const removed = await sendPublic({
    query: REMOVE_PROMPT,
    variables: {promptId: added.data.addReflectTemplatePrompt.prompt.id},
    cookie
  })
  expect(removed.data.removeReflectTemplatePrompt.error).toBeNull()

  const lastPrompt = await sendPublic({
    query: REMOVE_PROMPT,
    variables: {promptId: firstPrompt.id},
    cookie
  })
  expect(lastPrompt.data.removeReflectTemplatePrompt.error.message).toBe('No prompts remain')

  const poker = await sendPublic({query: ADD_POKER_TEMPLATE, variables: {teamId}, cookie})
  const pokerTemplateId = poker.data.addPokerTemplate.pokerTemplate.id
  const rejected = await sendPublic({
    query: ADD_PROMPT,
    variables: {templateId: pokerTemplateId},
    cookie
  })
  expect(rejected.data.addReflectTemplatePrompt.error.message).toBe('Template not found')
})

test('selectTemplate persists the standup template for the team', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: SELECT_TEMPLATE,
    variables: {selectedTemplateId: ENTERPRISE_TEMPLATE_ID, teamId},
    cookie
  })
  expect(res.data.selectTemplate.error).toBeNull()
  const viewer = await getStandupSettings(teamId, cookie)
  expect(viewer.team.meetingSettings.selectedTemplate).toMatchObject({
    id: ENTERPRISE_TEMPLATE_ID,
    name: 'Enterprise Daily Standup'
  })
})

test('removeTeamPromptTemplate soft-deletes and falls back the selected template', async () => {
  const {teamId, cookie} = await signUp()
  const created = await sendPublic({query: ADD_TEAM_PROMPT_TEMPLATE, variables: {teamId}, cookie})
  const {id: templateId} = created.data.addTeamPromptTemplate.teamPromptTemplate
  await sendPublic({
    query: SELECT_TEMPLATE,
    variables: {selectedTemplateId: templateId, teamId},
    cookie
  })

  const res = await sendPublic({
    query: REMOVE_TEAM_PROMPT_TEMPLATE,
    variables: {templateId},
    cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.removeTeamPromptTemplate).toEqual({
    teamPromptTemplate: {id: templateId, isActive: false},
    meetingSettings: {selectedTemplateId: CANONICAL_TEMPLATE_ID}
  })

  const viewer = await getStandupSettings(teamId, cookie)
  expect(viewer.team.meetingSettings.teamPromptTemplates).toEqual([])
  const prompts = await getKysely()
    .selectFrom('ReflectPrompt')
    .select('removedAt')
    .where('templateId', '=', templateId)
    .execute()
  expect(prompts.length).toBeGreaterThan(0)
  for (const prompt of prompts) {
    expect(prompt.removedAt).not.toBeNull()
  }
})

test('removeTeamPromptTemplate is blocked while a recurring standup uses the template', async () => {
  const pg = getKysely()
  const {userId, teamId, cookie} = await signUp()
  const created = await sendPublic({query: ADD_TEAM_PROMPT_TEMPLATE, variables: {teamId}, cookie})
  const {id: templateId} = created.data.addTeamPromptTemplate.teamPromptTemplate
  const series = await pg
    .insertInto('MeetingSeries')
    .values({
      meetingType: 'teamPrompt',
      title: 'Daily Standup',
      recurrenceRule:
        'DTSTART;TZID=America/Toronto:20260520T070000\nRRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR',
      duration: 24 * 60,
      teamId,
      facilitatorId: userId,
      templateId
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  const blocked = await sendPublic({
    query: REMOVE_TEAM_PROMPT_TEMPLATE,
    variables: {templateId},
    cookie
  })
  expect(blocked.errors).toEqual([
    expect.objectContaining({message: 'Template is used by a recurring standup'})
  ])

  await pg
    .updateTable('MeetingSeries')
    .set({cancelledAt: new Date()})
    .where('id', '=', series.id)
    .execute()
  const allowed = await sendPublic({
    query: REMOVE_TEAM_PROMPT_TEMPLATE,
    variables: {templateId},
    cookie
  })
  expect(allowed.errors).toBeUndefined()
  expect(allowed.data.removeTeamPromptTemplate.teamPromptTemplate.isActive).toBe(false)
})

test('removeTeamPromptTemplate rejects a template the viewer does not own', async () => {
  const [owner, attacker] = await Promise.all([signUp(), signUp()])
  const created = await sendPublic({
    query: ADD_TEAM_PROMPT_TEMPLATE,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const {id: templateId} = created.data.addTeamPromptTemplate.teamPromptTemplate
  const res = await sendPublic({
    query: REMOVE_TEAM_PROMPT_TEMPLATE,
    variables: {templateId},
    cookie: attacker.cookie
  })
  expect(res.errors).toEqual([expect.objectContaining({message: 'Viewer is not on Organization'})])
})
