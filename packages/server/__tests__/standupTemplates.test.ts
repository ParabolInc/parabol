import {randomUUIDv7} from 'crypto'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const CANONICAL_TEMPLATE_ID = 'teamPrompt'
const ENTERPRISE_TEMPLATE_ID = 'enterpriseDailyStandupTemplate'
const STANDUP = 'teamPrompt'

const ADD_PROMPT_TEMPLATE = `
  mutation AddPromptTemplate($teamId: ID!, $parentTemplateId: ID, $type: PromptTemplateTypeEnum!) {
    addPromptTemplate(teamId: $teamId, parentTemplateId: $parentTemplateId, type: $type) {
      template {
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
        freeCustomRetroTemplatesRemaining
        freeCustomStandupTemplatesRemaining
      }
    }
  }
`

const REMOVE_PROMPT_TEMPLATE = `
  mutation RemovePromptTemplate($templateId: ID!) {
    removePromptTemplate(templateId: $templateId) {
      template {
        id
        isActive
      }
      meetingSettings {
        ... on RetrospectiveMeetingSettings {
          selectedTemplateId
        }
        ... on TeamPromptMeetingSettings {
          selectedTemplateId
        }
      }
    }
  }
`

const ADD_PROMPT = `
  mutation AddTemplatePrompt($templateId: ID!) {
    addTemplatePrompt(templateId: $templateId) {
      prompt {
        id
        question
      }
    }
  }
`

const RENAME_PROMPT = `
  mutation RenameTemplatePrompt($promptId: ID!, $question: String!) {
    renameTemplatePrompt(promptId: $promptId, question: $question) {
      prompt {
        id
        question
      }
    }
  }
`

const REMOVE_PROMPT = `
  mutation RemoveTemplatePrompt($promptId: ID!) {
    removeTemplatePrompt(promptId: $promptId) {
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

const UPDATE_TEMPLATE_SCOPE = `
  mutation UpdateTemplateScope($templateId: ID!, $scope: SharingScopeEnum!) {
    updateTemplateScope(templateId: $templateId, scope: $scope) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on UpdateTemplateScopeSuccess {
        template {
          id
          isActive
          scope
        }
        clonedTemplate {
          __typename
          id
          isActive
          scope
          ... on PromptTemplate {
            prompts {
              question
              groupColor
            }
          }
        }
      }
    }
  }
`

const UPDATE_TEMPLATE_CATEGORY = `
  mutation UpdateTemplateCategory($templateId: ID!, $mainCategory: String!) {
    updateTemplateCategory(templateId: $templateId, mainCategory: $mainCategory) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on UpdateTemplateCategorySuccess {
        template {
          id
          category
        }
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
            teamTemplates {
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
            ... on PromptTemplate {
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

test('seeded standup templates are PromptTemplates with prompts', async () => {
  const {cookie} = await signUp()
  const res = await sendPublic({query: AVAILABLE_STANDUP_TEMPLATES, cookie})
  const nodes = res.data.viewer.availableTemplates.edges.map((edge: any) => edge.node)

  const canonical = nodes.find((node: any) => node.id === CANONICAL_TEMPLATE_ID)
  expect(canonical).toMatchObject({
    __typename: 'PromptTemplate',
    name: 'Standup',
    prompts: [{question: 'What are you working on today? Stuck on anything?'}]
  })

  const enterprise = nodes.find((node: any) => node.id === ENTERPRISE_TEMPLATE_ID)
  expect(enterprise).toMatchObject({
    __typename: 'PromptTemplate',
    name: 'Enterprise Daily Standup',
    isRecommended: true
  })
  expect(enterprise.prompts.map((prompt: any) => prompt.question)).toEqual([
    'What are you working on? What has been completed recently?',
    "What are you stuck on, what's holding you back?",
    'What are you planning to work on next?'
  ])

  const demoDay = nodes.find((node: any) => node.id === 'demoDayTemplate')
  expect(demoDay).toMatchObject({__typename: 'PromptTemplate', name: 'Demo Day'})
  expect(demoDay.prompts.map((prompt: any) => prompt.question)).toEqual([
    'What did you ship?',
    'Show it off',
    'What feedback do you want?'
  ])

  const weeklyWins = nodes.find((node: any) => node.id === 'weeklyWinsAndPrioritiesTemplate')
  expect(weeklyWins).toMatchObject({
    __typename: 'PromptTemplate',
    name: 'Weekly Wins & Priorities'
  })
  expect(weeklyWins.prompts.map((prompt: any) => prompt.question)).toEqual([
    'What were your wins this week?',
    'What did you learn?',
    'What are your top priorities next week?'
  ])
})

test('every team has standup settings defaulting to the Enterprise Daily Standup', async () => {
  const {teamId, cookie} = await signUp()
  const viewer = await getStandupSettings(teamId, cookie)
  expect(viewer.freeCustomStandupTemplatesRemaining).toBe(2)
  expect(viewer.team.meetingSettings).toMatchObject({
    selectedTemplateId: ENTERPRISE_TEMPLATE_ID,
    selectedTemplate: {id: ENTERPRISE_TEMPLATE_ID},
    teamTemplates: []
  })
})

test('addPromptTemplate creates a blank standup template with one prompt', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, type: STANDUP},
    cookie
  })
  expect(res.errors).toBeUndefined()
  const {template, user} = res.data.addPromptTemplate
  expect(template).toMatchObject({
    __typename: 'PromptTemplate',
    name: '*New Template #1',
    type: 'teamPrompt',
    category: 'standup',
    teamId,
    prompts: [{question: 'New prompt', description: '', groupColor: '#66BC8C'}]
  })
  expect(user.freeCustomStandupTemplatesRemaining).toBe(1)

  const viewer = await getStandupSettings(teamId, cookie)
  expect(viewer.team.meetingSettings.teamTemplates).toEqual([{id: template.id}])
})

test('addPromptTemplate clones a public template with its prompts', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, parentTemplateId: ENTERPRISE_TEMPLATE_ID, type: STANDUP},
    cookie
  })
  expect(res.errors).toBeUndefined()
  const {template} = res.data.addPromptTemplate
  expect(template.name).toBe('Enterprise Daily Standup Copy')
  expect(template.prompts.map((prompt: any) => prompt.question)).toEqual([
    'What are you working on? What has been completed recently?',
    "What are you stuck on, what's holding you back?",
    'What are you planning to work on next?'
  ])
  expect(template.prompts.map((prompt: any) => prompt.groupColor)).toEqual([
    '#66BC8C',
    '#FD6157',
    '#329AE5'
  ])
  const clonedPromptIds = template.prompts.map((prompt: any) => prompt.id)
  const rows = await getKysely()
    .selectFrom('TemplatePrompt')
    .select(['id', 'parentPromptId'])
    .where('id', 'in', clonedPromptIds)
    .execute()
  expect(rows.map((row) => row.parentPromptId).sort()).toEqual([
    'enterpriseDailyStandupTemplate:nextPrompt',
    'enterpriseDailyStandupTemplate:stuckPrompt',
    'enterpriseDailyStandupTemplate:workingOnPrompt'
  ])
})

test('starter tier is limited by freeCustomStandupTemplatesRemaining', async () => {
  const {teamId, cookie} = await signUp()
  const first = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, type: STANDUP},
    cookie
  })
  expect(first.errors).toBeUndefined()
  const second = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, type: STANDUP},
    cookie
  })
  expect(second.errors).toBeUndefined()
  expect(second.data.addPromptTemplate.user.freeCustomStandupTemplatesRemaining).toBe(0)

  const third = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, type: STANDUP},
    cookie
  })
  expect(third.data).toBeNull()
  expect(third.errors).toEqual([
    expect.objectContaining({
      message: 'You have reached the limit of free custom templates.'
    })
  ])
})

test('addPromptTemplate rejects a team the viewer is not on', async () => {
  const [attacker, victim] = await Promise.all([signUp(), signUp()])
  const res = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId: victim.teamId, type: STANDUP},
    cookie: attacker.cookie
  })
  expect(res.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('Viewer is not on team')})
  ])
})

test('prompt mutations work on a standup template and reject a poker template', async () => {
  const {teamId, cookie} = await signUp()
  const created = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, type: STANDUP},
    cookie
  })
  const {id: templateId, prompts} = created.data.addPromptTemplate.template
  const [firstPrompt] = prompts

  const added = await sendPublic({query: ADD_PROMPT, variables: {templateId}, cookie})
  expect(added.errors).toBeUndefined()
  expect(added.data.addTemplatePrompt.prompt.question).toBe('New prompt #2')

  const renamed = await sendPublic({
    query: RENAME_PROMPT,
    variables: {promptId: firstPrompt.id, question: 'What did you ship?'},
    cookie
  })
  expect(renamed.data.renameTemplatePrompt.prompt.question).toBe('What did you ship?')

  const removed = await sendPublic({
    query: REMOVE_PROMPT,
    variables: {promptId: added.data.addTemplatePrompt.prompt.id},
    cookie
  })
  expect(removed.errors).toBeUndefined()

  const lastPrompt = await sendPublic({
    query: REMOVE_PROMPT,
    variables: {promptId: firstPrompt.id},
    cookie
  })
  expect(lastPrompt.errors).toEqual([expect.objectContaining({message: 'No prompts remain'})])

  const poker = await sendPublic({query: ADD_POKER_TEMPLATE, variables: {teamId}, cookie})
  const pokerTemplateId = poker.data.addPokerTemplate.pokerTemplate.id
  const rejected = await sendPublic({
    query: ADD_PROMPT,
    variables: {templateId: pokerTemplateId},
    cookie
  })
  expect(rejected.errors).toEqual([expect.objectContaining({message: 'Template not found'})])
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

test('removePromptTemplate soft-deletes and falls back the selected template', async () => {
  const {teamId, cookie} = await signUp()
  const created = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, type: STANDUP},
    cookie
  })
  const {id: templateId} = created.data.addPromptTemplate.template
  await sendPublic({
    query: SELECT_TEMPLATE,
    variables: {selectedTemplateId: templateId, teamId},
    cookie
  })

  const res = await sendPublic({
    query: REMOVE_PROMPT_TEMPLATE,
    variables: {templateId},
    cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.removePromptTemplate).toEqual({
    template: {id: templateId, isActive: false},
    meetingSettings: {selectedTemplateId: ENTERPRISE_TEMPLATE_ID}
  })

  const viewer = await getStandupSettings(teamId, cookie)
  expect(viewer.team.meetingSettings.teamTemplates).toEqual([])
  const prompts = await getKysely()
    .selectFrom('TemplatePrompt')
    .select('removedAt')
    .where('templateId', '=', templateId)
    .execute()
  expect(prompts.length).toBeGreaterThan(0)
  for (const prompt of prompts) {
    expect(prompt.removedAt).not.toBeNull()
  }
})

test('removePromptTemplate is blocked while a recurring standup uses the template', async () => {
  const pg = getKysely()
  const {userId, teamId, cookie} = await signUp()
  const created = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, type: STANDUP},
    cookie
  })
  const {id: templateId} = created.data.addPromptTemplate.template
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
    query: REMOVE_PROMPT_TEMPLATE,
    variables: {templateId},
    cookie
  })
  expect(blocked.errors).toEqual([
    expect.objectContaining({message: 'Template is used by a recurring meeting'})
  ])

  await pg
    .updateTable('MeetingSeries')
    .set({cancelledAt: new Date()})
    .where('id', '=', series.id)
    .execute()
  const allowed = await sendPublic({
    query: REMOVE_PROMPT_TEMPLATE,
    variables: {templateId},
    cookie
  })
  expect(allowed.errors).toBeUndefined()
  expect(allowed.data.removePromptTemplate.template.isActive).toBe(false)
})

test('removePromptTemplate rejects a template the viewer does not own', async () => {
  const [owner, attacker] = await Promise.all([signUp(), signUp()])
  const created = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId: owner.teamId, type: STANDUP},
    cookie: owner.cookie
  })
  const {id: templateId} = created.data.addPromptTemplate.template
  const res = await sendPublic({
    query: REMOVE_PROMPT_TEMPLATE,
    variables: {templateId},
    cookie: attacker.cookie
  })
  expect(res.errors).toEqual([expect.objectContaining({message: 'Viewer is not on Organization'})])
})

test('removePromptTemplate refuses the seeded standup templates', async () => {
  const {cookie} = await signUp()
  for (const templateId of [CANONICAL_TEMPLATE_ID, ENTERPRISE_TEMPLATE_ID]) {
    const res = await sendPublic({
      query: REMOVE_PROMPT_TEMPLATE,
      variables: {templateId},
      cookie
    })
    expect(res.errors).toEqual([
      expect.objectContaining({message: 'Viewer is not on Organization'})
    ])
  }
  const rows = await getKysely()
    .selectFrom('MeetingTemplate')
    .select(['id', 'isActive'])
    .where('id', 'in', [CANONICAL_TEMPLATE_ID, ENTERPRISE_TEMPLATE_ID])
    .execute()
  expect(rows.every((row) => row.isActive)).toBe(true)
})

test('addPromptTemplate honors the parent template scope', async () => {
  const [owner, attacker] = await Promise.all([signUp(), signUp()])
  const created = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId: owner.teamId, type: STANDUP},
    cookie: owner.cookie
  })
  const {id: templateId, scope} = created.data.addPromptTemplate.template
  expect(scope).toBe('ORGANIZATION')

  const outsideOrg = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId: attacker.teamId, parentTemplateId: templateId, type: STANDUP},
    cookie: attacker.cookie
  })
  expect(outsideOrg.errors).toEqual([
    expect.objectContaining({message: 'Template is scoped to organization'})
  ])

  const downscoped = await sendPublic({
    query: UPDATE_TEMPLATE_SCOPE,
    variables: {templateId, scope: 'TEAM'},
    cookie: owner.cookie
  })
  expect(downscoped.data.updateTemplateScope.template).toMatchObject({
    id: templateId,
    scope: 'TEAM'
  })

  const outsideTeam = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId: attacker.teamId, parentTemplateId: templateId, type: STANDUP},
    cookie: attacker.cookie
  })
  expect(outsideTeam.errors).toEqual([
    expect.objectContaining({message: 'Template is scoped to team'})
  ])
})

test('updateTemplateCategory keeps standup templates in the standup category', async () => {
  const {teamId, cookie} = await signUp()
  const created = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, type: STANDUP},
    cookie
  })
  const {id: templateId} = created.data.addPromptTemplate.template

  const rejected = await sendPublic({
    query: UPDATE_TEMPLATE_CATEGORY,
    variables: {templateId, mainCategory: 'retrospective'},
    cookie
  })
  expect(rejected.data.updateTemplateCategory.error.message).toBe(
    'Standup templates stay in the standup category'
  )

  const allowed = await sendPublic({
    query: UPDATE_TEMPLATE_CATEGORY,
    variables: {templateId, mainCategory: 'standup'},
    cookie
  })
  expect(allowed.data.updateTemplateCategory.template).toEqual({
    id: templateId,
    category: 'standup'
  })
})

test('updateTemplateScope clones a standup template used by another team', async () => {
  const pg = getKysely()
  const {userId, teamId, orgId, cookie} = await signUp()
  const created = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, type: STANDUP},
    cookie
  })
  const {id: templateId, prompts} = created.data.addPromptTemplate.template

  const borrowerTeamId = randomUUIDv7()
  await pg
    .insertInto('Team')
    .values({id: borrowerTeamId, name: `Team ${borrowerTeamId}`, orgId})
    .execute()
  await pg
    .insertInto('NewMeeting')
    .values({
      id: randomUUIDv7(),
      teamId: borrowerTeamId,
      templateId,
      meetingType: 'teamPrompt',
      name: 'Standup #1',
      meetingCount: 0,
      meetingNumber: 1,
      facilitatorUserId: userId,
      facilitatorStageId: 'stage1',
      phases: JSON.stringify([{id: 'phase1', phaseType: 'RESPONSES', stages: [{id: 'stage1'}]}])
    })
    .execute()

  const res = await sendPublic({
    query: UPDATE_TEMPLATE_SCOPE,
    variables: {templateId, scope: 'TEAM'},
    cookie
  })
  const {clonedTemplate} = res.data.updateTemplateScope
  expect(clonedTemplate).toMatchObject({
    __typename: 'PromptTemplate',
    isActive: true,
    scope: 'TEAM',
    prompts: prompts.map(({question, groupColor}: any) => ({question, groupColor}))
  })
  expect(clonedTemplate.id).not.toBe(templateId)

  const rows = await pg
    .selectFrom('MeetingTemplate')
    .select(['id', 'isActive', 'parentTemplateId'])
    .where('id', 'in', [templateId, clonedTemplate.id])
    .execute()
  expect(rows.find((row) => row.id === templateId)!.isActive).toBe(false)
  expect(rows.find((row) => row.id === clonedTemplate.id)).toMatchObject({
    isActive: true,
    parentTemplateId: templateId
  })
})

test('a soft-deleted selected template falls back to the Enterprise Daily Standup', async () => {
  const pg = getKysely()
  const {teamId, cookie} = await signUp()
  const created = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, type: STANDUP},
    cookie
  })
  const {id: templateId} = created.data.addPromptTemplate.template
  await sendPublic({
    query: SELECT_TEMPLATE,
    variables: {selectedTemplateId: templateId, teamId},
    cookie
  })

  await pg
    .updateTable('MeetingTemplate')
    .set({isActive: false})
    .where('id', '=', templateId)
    .execute()

  const viewer = await getStandupSettings(teamId, cookie)
  expect(viewer.team.meetingSettings.selectedTemplate).toMatchObject({
    id: ENTERPRISE_TEMPLATE_ID,
    name: 'Enterprise Daily Standup'
  })
  const settings = await pg
    .selectFrom('MeetingSettings')
    .select('selectedTemplateId')
    .where('teamId', '=', teamId)
    .where('meetingType', '=', 'teamPrompt')
    .executeTakeFirstOrThrow()
  expect(settings.selectedTemplateId).toBe(ENTERPRISE_TEMPLATE_ID)

  const reread = await getStandupSettings(teamId, cookie)
  expect(reread.team.meetingSettings.selectedTemplateId).toBe(ENTERPRISE_TEMPLATE_ID)
})

test('addPromptTemplate creates a blank retrospective template', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, type: 'retrospective'},
    cookie
  })
  expect(res.errors).toBeUndefined()
  const {template, user} = res.data.addPromptTemplate
  expect(template).toMatchObject({
    __typename: 'PromptTemplate',
    name: '*New Template #1',
    type: 'retrospective',
    category: 'retrospective',
    prompts: [{question: 'New prompt', groupColor: '#66BC8C'}]
  })
  expect(user).toEqual({
    freeCustomRetroTemplatesRemaining: 1,
    freeCustomStandupTemplatesRemaining: 2
  })
})

test('addPromptTemplate rejects a parent template of another type', async () => {
  const {teamId, cookie} = await signUp()
  const res = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, parentTemplateId: 'workingStuckTemplate', type: STANDUP},
    cookie
  })
  expect(res.errors).toEqual([expect.objectContaining({message: 'Parent template not found'})])
})

test('standup templates are capped at 5 prompts', async () => {
  const {teamId, cookie} = await signUp()
  const created = await sendPublic({
    query: ADD_PROMPT_TEMPLATE,
    variables: {teamId, type: STANDUP},
    cookie
  })
  const {id: templateId} = created.data.addPromptTemplate.template
  for (let i = 0; i < 4; i++) {
    const added = await sendPublic({query: ADD_PROMPT, variables: {templateId}, cookie})
    expect(added.errors).toBeUndefined()
  }
  const rejected = await sendPublic({query: ADD_PROMPT, variables: {templateId}, cookie})
  expect(rejected.errors).toEqual([expect.objectContaining({message: 'Too many prompts'})])
})
