import dayjs from 'dayjs'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {toDateTime} from 'parabol-client/shared/rruleUtil'
import AuthToken from '../database/types/AuthToken'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'
import {sendPublic, signUp} from './common'

const ENTERPRISE_TEMPLATE_ID = 'enterpriseDailyStandupTemplate'
const RRULE = `DTSTART;TZID=America/Toronto:20260520T070000
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR`
const WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
const immediateRrule = () => {
  const start = dayjs().utc().add(5, 'second')
  return `DTSTART;TZID=UTC:${toDateTime(start, 'UTC')}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=${WEEKDAY_CODES[start.day()]}`
}

const paragraph = (text: string) =>
  JSON.stringify({type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text}]}]})
const paragraphWithMention = (text: string, userId: string, label: string) =>
  JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {type: 'text', text},
          {type: 'mention', attrs: {id: userId, label}}
        ]
      }
    ]
  })
const paragraphWithMentions = (text: string, mentions: {userId: string; label: string}[]) =>
  JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {type: 'text', text},
          ...mentions.map(({userId, label}) => ({type: 'mention', attrs: {id: userId, label}}))
        ]
      }
    ]
  })
const EMPTY_DOC = JSON.stringify({type: 'doc', content: []})

const START_TEAM_PROMPT = `
  mutation StartTeamPrompt($teamId: ID!, $rrule: RRule) {
    startTeamPrompt(teamId: $teamId, rrule: $rrule) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on StartTeamPromptSuccess {
        meeting {
          id
          meetingPrompt
          template {
            id
          }
          prompts {
            id
            question
          }
        }
        meetingSeries {
          id
        }
      }
    }
  }
`

const JOIN_MEETING = `
  mutation JoinMeeting($meetingId: ID!) {
    joinMeeting(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on JoinMeetingSuccess {
        meetingId
      }
    }
  }
`

const UPSERT = `
  mutation Upsert($meetingId: ID!, $promptId: ID!, $content: String!) {
    upsertTeamPromptResponse(meetingId: $meetingId, promptId: $promptId, content: $content) {
      teamPromptResponse {
        id
        promptId
        sharedAt
        content
        plaintextContent
      }
    }
  }
`

const SHARE = `
  mutation Share($meetingId: ID!) {
    shareTeamPromptResponses(meetingId: $meetingId) {
      responses {
        id
        promptId
        sharedAt
        plaintextContent
      }
    }
  }
`

const ADD_REACTJI = `
  mutation AddReactji($meetingId: ID!, $reactableId: ID!) {
    addReactjiToReactable(
      meetingId: $meetingId
      reactableId: $reactableId
      reactableType: RESPONSE
      reactji: "heart"
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
    }
  }
`

const MEETING_RESPONSES = `
  query MeetingResponses($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        ... on TeamPromptMeeting {
          id
          responseCount
          responses {
            userId
            promptId
            sharedAt
            content
            plaintextContent
          }
          phases {
            ... on TeamPromptResponsesPhase {
              stages {
                teamMemberId
                responses {
                  promptId
                  sharedAt
                  content
                  plaintextContent
                }
              }
            }
          }
        }
      }
    }
  }
`

const END_TEAM_PROMPT = `
  mutation EndTeamPrompt($meetingId: ID!) {
    endTeamPrompt(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on EndTeamPromptSuccess {
        meeting {
          id
        }
      }
    }
  }
`

const START_SERIES_NOW = `
  mutation StartMeetingSeriesNow($meetingSeriesId: ID!) {
    startMeetingSeriesNow(meetingSeriesId: $meetingSeriesId) {
      meeting {
        id
        ... on TeamPromptMeeting {
          template {
            id
          }
          prompts {
            id
          }
        }
      }
    }
  }
`

const ADD_TEAM_PROMPT_TEMPLATE = `
  mutation AddPromptTemplate($teamId: ID!, $parentTemplateId: ID) {
    addPromptTemplate(teamId: $teamId, parentTemplateId: $parentTemplateId, type: teamPrompt) {
      template {
        id
        prompts {
          id
        }
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
          scope
        }
      }
    }
  }
`

const SELECT_TEMPLATE = `
  mutation SelectTemplate($selectedTemplateId: ID!, $teamId: ID!) {
    selectTemplate(selectedTemplateId: $selectedTemplateId, teamId: $teamId) {
      error {
        message
      }
    }
  }
`

const UPDATE_RECURRENCE_SETTINGS = `
  mutation UpdateRecurrenceSettings($meetingId: ID!, $name: String, $rrule: RRule) {
    updateRecurrenceSettings(meetingId: $meetingId, name: $name, rrule: $rrule) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on UpdateRecurrenceSettingsSuccess {
        meeting {
          id
          meetingSeries {
            id
            nextMeetingDate
          }
        }
      }
    }
  }
`

const authTokenFor = async (userId: string) => {
  const teamMembers = await getKysely()
    .selectFrom('TeamMember')
    .select('teamId')
    .where('userId', '=', userId)
    .where('isNotRemoved', '=', true)
    .execute()
  return encodeAuthToken(new AuthToken({sub: userId, tms: teamMembers.map(({teamId}) => teamId)}))
}

const addTeammate = async (teamId: string) => {
  const teammate = await signUp()
  await getKysely()
    .insertInto('TeamMember')
    .values({
      id: TeamMemberId.join(teamId, teammate.userId),
      teamId,
      userId: teammate.userId,
      isLead: false
    })
    .execute()
  return {...teammate, bearerToken: await authTokenFor(teammate.userId)}
}

const startStandup = async (
  auth: {cookie?: string; bearerToken?: string},
  teamId: string,
  rrule?: string
) => {
  const res = await sendPublic({
    query: START_TEAM_PROMPT,
    variables: {teamId, rrule},
    ...auth
  })
  expect(res.errors).toBeUndefined()
  return res.data.startTeamPrompt
}

const selectTemplate = async (
  auth: {cookie: string},
  teamId: string,
  selectedTemplateId: string
) => {
  const res = await sendPublic({
    query: SELECT_TEMPLATE,
    variables: {teamId, selectedTemplateId},
    ...auth
  })
  expect(res.errors).toBeUndefined()
  return res.data.selectTemplate
}

const joinMeeting = async (auth: {cookie?: string; bearerToken?: string}, meetingId: string) => {
  const res = await sendPublic({query: JOIN_MEETING, variables: {meetingId}, ...auth})
  expect(res.data.joinMeeting.error).toBeUndefined()
}

const waitForSummaryText = async (meetingId: string, lastExpectedText: string) => {
  const deadline = Date.now() + 20000
  while (true) {
    const summaryPage = await getKysely()
      .selectFrom('Page')
      .select('plaintextContent')
      .where('summaryMeetingId', '=', meetingId)
      .executeTakeFirstOrThrow()
    const summaryText = summaryPage.plaintextContent ?? ''
    if (summaryText.includes(lastExpectedText) || Date.now() > deadline) return summaryText
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
}

const seriesTemplateIdForMeeting = async (meetingId: string) => {
  const row = await getKysely()
    .selectFrom('NewMeeting')
    .innerJoin('MeetingSeries', 'MeetingSeries.id', 'NewMeeting.meetingSeriesId')
    .select('MeetingSeries.templateId')
    .where('NewMeeting.id', '=', meetingId)
    .executeTakeFirstOrThrow()
  return row.templateId
}

const startTemplatedStandup = async () => {
  const owner = await signUp()
  const {meeting} = await startStandup({cookie: owner.cookie}, owner.teamId)
  await joinMeeting({cookie: owner.cookie}, meeting.id)
  return {owner, meeting}
}

test('startTeamPrompt uses the team default template and freezes its prompts', async () => {
  const {meeting} = await startTemplatedStandup()
  expect(meeting.template.id).toBe(ENTERPRISE_TEMPLATE_ID)
  expect(meeting.prompts.map((prompt: any) => prompt.question)).toEqual([
    'What are you working on? What has been completed recently?',
    "What are you stuck on, what's holding you back?",
    'What are you planning to work on next?'
  ])
  expect(meeting.meetingPrompt).toBe('What are you working on? What has been completed recently?')
})

test('startTeamPrompt uses the template selected for the team', async () => {
  const {teamId, cookie} = await signUp()
  const created = await sendPublic({
    query: ADD_TEAM_PROMPT_TEMPLATE,
    variables: {teamId, parentTemplateId: ENTERPRISE_TEMPLATE_ID},
    cookie
  })
  const {id: customTemplateId} = created.data.addPromptTemplate.template
  const selected = await selectTemplate({cookie}, teamId, customTemplateId)
  expect(selected.error).toBeNull()
  const {meeting} = await startStandup({cookie}, teamId)
  expect(meeting.template.id).toBe(customTemplateId)
  expect(meeting.prompts).toHaveLength(3)
})

test('a template scoped to another org cannot be selected or started', async () => {
  const [owner, attacker] = await Promise.all([signUp(), signUp()])
  const created = await sendPublic({
    query: ADD_TEAM_PROMPT_TEMPLATE,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const {id: templateId} = created.data.addPromptTemplate.template
  const selected = await selectTemplate({cookie: attacker.cookie}, attacker.teamId, templateId)
  expect(selected.error.message).toBe('Template is scoped to organization')
  const {meeting} = await startStandup({cookie: attacker.cookie}, attacker.teamId)
  expect(meeting.template.id).toBe(ENTERPRISE_TEMPLATE_ID)
})

test('startTeamPrompt records the template on a recurring series', async () => {
  const {teamId, cookie} = await signUp()
  const {meeting, meetingSeries} = await startStandup({cookie}, teamId, immediateRrule())
  expect(meeting.template.id).toBe(ENTERPRISE_TEMPLATE_ID)
  const series = await getKysely()
    .selectFrom('MeetingSeries')
    .select('templateId')
    .where('id', '=', MeetingSeriesId.split(meetingSeries.id))
    .executeTakeFirstOrThrow()
  expect(series.templateId).toBe(ENTERPRISE_TEMPLATE_ID)
})

test('a recurring standup inherits the series template and skips an inactive one', async () => {
  const pg = getKysely()
  const {userId, teamId, cookie} = await signUp()
  const created = await sendPublic({
    query: ADD_TEAM_PROMPT_TEMPLATE,
    variables: {teamId, parentTemplateId: ENTERPRISE_TEMPLATE_ID},
    cookie
  })
  const {id: customTemplateId} = created.data.addPromptTemplate.template

  const series = await pg
    .insertInto('MeetingSeries')
    .values({
      meetingType: 'teamPrompt',
      title: 'Daily Standup',
      recurrenceRule: RRULE,
      duration: 24 * 60,
      teamId,
      facilitatorId: userId,
      templateId: customTemplateId
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  const first = await sendPublic({
    query: START_SERIES_NOW,
    variables: {meetingSeriesId: MeetingSeriesId.join(series.id)},
    cookie
  })
  expect(first.errors).toBeUndefined()
  expect(first.data.startMeetingSeriesNow.meeting.template.id).toBe(customTemplateId)
  expect(first.data.startMeetingSeriesNow.meeting.prompts).toHaveLength(3)

  await sendPublic({
    query: END_TEAM_PROMPT,
    variables: {meetingId: first.data.startMeetingSeriesNow.meeting.id},
    cookie
  })
  await pg
    .updateTable('MeetingTemplate')
    .set({isActive: false})
    .where('id', '=', customTemplateId)
    .execute()

  const second = await sendPublic({
    query: START_SERIES_NOW,
    variables: {meetingSeriesId: MeetingSeriesId.join(series.id)},
    cookie
  })
  expect(second.errors).toBeUndefined()
  expect(second.data.startMeetingSeriesNow.meeting.template.id).toBe(ENTERPRISE_TEMPLATE_ID)
})

test('an answer is a private draft until shared', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn] = meeting.prompts
  const teammate = await addTeammate(owner.teamId)
  await joinMeeting({bearerToken: teammate.bearerToken}, meeting.id)

  const draft = await sendPublic({
    query: UPSERT,
    variables: {
      meetingId: meeting.id,
      promptId: workingOn.id,
      content: paragraph('Shipped the billing fix')
    },
    cookie: owner.cookie
  })
  expect(draft.errors).toBeUndefined()
  expect(draft.data.upsertTeamPromptResponse.teamPromptResponse).toMatchObject({
    promptId: workingOn.id,
    sharedAt: null,
    plaintextContent: 'Shipped the billing fix'
  })

  const asTeammate = await sendPublic({
    query: MEETING_RESPONSES,
    variables: {meetingId: meeting.id},
    bearerToken: teammate.bearerToken
  })
  expect(asTeammate.data.viewer.meeting.responses).toEqual([])
  expect(asTeammate.data.viewer.meeting.responseCount).toBe(0)

  const ownerTeamMemberId = TeamMemberId.join(owner.teamId, owner.userId)
  const responsesPhase = asTeammate.data.viewer.meeting.phases.find((phase: any) => phase.stages)
  const ownerStage = responsesPhase.stages.find(
    (stage: any) => stage.teamMemberId === ownerTeamMemberId
  )
  expect(ownerStage.responses).toEqual([])

  const asOwner = await sendPublic({
    query: MEETING_RESPONSES,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  expect(asOwner.data.viewer.meeting.responses).toEqual([
    expect.objectContaining({
      userId: owner.userId,
      promptId: workingOn.id,
      sharedAt: null,
      plaintextContent: 'Shipped the billing fix'
    })
  ])
})

test('sharing publishes every non-empty answer once', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn, , next] = meeting.prompts
  await sendPublic({
    query: UPSERT,
    variables: {
      meetingId: meeting.id,
      promptId: workingOn.id,
      content: paragraph('Closed 3 tickets')
    },
    cookie: owner.cookie
  })
  await sendPublic({
    query: UPSERT,
    variables: {meetingId: meeting.id, promptId: next.id, content: paragraph('Start the audit')},
    cookie: owner.cookie
  })

  const shared = await sendPublic({
    query: SHARE,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  expect(shared.errors).toBeUndefined()
  const {responses} = shared.data.shareTeamPromptResponses
  expect(responses).toHaveLength(2)
  const sharedAt = responses[0].sharedAt
  expect(sharedAt).not.toBeNull()
  expect(responses.every((response: any) => response.sharedAt === sharedAt)).toBe(true)

  const reshared = await sendPublic({
    query: SHARE,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  expect(reshared.errors).toBeUndefined()
  expect(reshared.data.shareTeamPromptResponses.responses).toEqual(responses)
})

test('editing a shared answer stays shared', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn] = meeting.prompts
  const teammate = await addTeammate(owner.teamId)
  await joinMeeting({bearerToken: teammate.bearerToken}, meeting.id)

  await sendPublic({
    query: UPSERT,
    variables: {
      meetingId: meeting.id,
      promptId: workingOn.id,
      content: paragraph('Shipped the parser')
    },
    cookie: owner.cookie
  })
  const shared = await sendPublic({
    query: SHARE,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  const sharedAt = shared.data.shareTeamPromptResponses.responses[0].sharedAt

  const edited = await sendPublic({
    query: UPSERT,
    variables: {
      meetingId: meeting.id,
      promptId: workingOn.id,
      content: paragraph('Shipped the parser and the lexer')
    },
    cookie: owner.cookie
  })
  expect(edited.errors).toBeUndefined()
  expect(edited.data.upsertTeamPromptResponse.teamPromptResponse.sharedAt).toBe(sharedAt)

  const asTeammate = await sendPublic({
    query: MEETING_RESPONSES,
    variables: {meetingId: meeting.id},
    bearerToken: teammate.bearerToken
  })
  const ownerResponse = asTeammate.data.viewer.meeting.responses.find(
    (response: any) => response.userId === owner.userId
  )
  expect(ownerResponse.plaintextContent).toBe('Shipped the parser and the lexer')
})

test('an empty document clears and unshares the answer without deleting the row', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn, stuck] = meeting.prompts
  const draft = await sendPublic({
    query: UPSERT,
    variables: {
      meetingId: meeting.id,
      promptId: workingOn.id,
      content: paragraph('Done with onboarding')
    },
    cookie: owner.cookie
  })
  const responseId = draft.data.upsertTeamPromptResponse.teamPromptResponse.id
  await sendPublic({
    query: UPSERT,
    variables: {meetingId: meeting.id, promptId: stuck.id, content: paragraph('Waiting on review')},
    cookie: owner.cookie
  })
  await sendPublic({query: SHARE, variables: {meetingId: meeting.id}, cookie: owner.cookie})

  const cleared = await sendPublic({
    query: UPSERT,
    variables: {meetingId: meeting.id, promptId: workingOn.id, content: EMPTY_DOC},
    cookie: owner.cookie
  })
  expect(cleared.errors).toBeUndefined()
  const {teamPromptResponse} = cleared.data.upsertTeamPromptResponse
  expect(teamPromptResponse.id).toBe(responseId)
  expect(teamPromptResponse.sharedAt).toBeNull()
  expect(JSON.parse(teamPromptResponse.content)).toEqual({type: 'doc', content: []})

  const rows = await getKysely()
    .selectFrom('TeamPromptResponse')
    .selectAll()
    .where('meetingId', '=', meeting.id)
    .where('userId', '=', owner.userId)
    .execute()
  expect(rows).toHaveLength(2)
})

test('rejects a prompt that is not part of the meeting, an ended meeting, a non-member', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn] = meeting.prompts

  const foreign = await sendPublic({
    query: UPSERT,
    variables: {
      meetingId: meeting.id,
      promptId: 'teamPromptTemplate:workingOnPrompt',
      content: paragraph('nope')
    },
    cookie: owner.cookie
  })
  expect(foreign.errors).toEqual([
    expect.objectContaining({message: 'Prompt is not part of this meeting'})
  ])

  const outsider = await signUp()
  const intruder = await sendPublic({
    query: UPSERT,
    variables: {meetingId: meeting.id, promptId: workingOn.id, content: paragraph('intruder')},
    cookie: outsider.cookie
  })
  expect(intruder.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('Viewer is not meeting member')})
  ])

  await sendPublic({
    query: END_TEAM_PROMPT,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  const ended = await sendPublic({
    query: UPSERT,
    variables: {meetingId: meeting.id, promptId: workingOn.id, content: paragraph('late')},
    cookie: owner.cookie
  })
  expect(ended.errors).toEqual([expect.objectContaining({message: 'Meeting already ended'})])
})

test('sharing with nothing written is rejected', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const res = await sendPublic({
    query: SHARE,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  expect(res.errors).toEqual([
    expect.objectContaining({message: 'Answer at least one prompt to share'})
  ])
})

test('mentions notify when an answer becomes visible, never from a draft', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn] = meeting.prompts
  const teammate = await addTeammate(owner.teamId)
  await joinMeeting({bearerToken: teammate.bearerToken}, meeting.id)
  const otherTeammate = await addTeammate(owner.teamId)
  await joinMeeting({bearerToken: otherTeammate.bearerToken}, meeting.id)

  await sendPublic({
    query: UPSERT,
    variables: {
      meetingId: meeting.id,
      promptId: workingOn.id,
      content: paragraphWithMention('Shipped the parser with ', teammate.userId, 'Teammate')
    },
    cookie: owner.cookie
  })
  const draftNotifications = await getKysely()
    .selectFrom('Notification')
    .select(['type', 'userId'])
    .where('meetingId', '=', meeting.id)
    .execute()
  expect(draftNotifications).toEqual([])

  const shared = await sendPublic({
    query: SHARE,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  expect(shared.errors).toBeUndefined()
  const afterShare = await getKysely()
    .selectFrom('Notification')
    .select(['type', 'userId'])
    .where('meetingId', '=', meeting.id)
    .execute()
  expect(afterShare).toEqual([{type: 'RESPONSE_MENTIONED', userId: teammate.userId}])

  const reshared = await sendPublic({
    query: UPSERT,
    variables: {
      meetingId: meeting.id,
      promptId: workingOn.id,
      content: paragraphWithMentions('Shipped the parser with ', [
        {userId: teammate.userId, label: 'Teammate'},
        {userId: otherTeammate.userId, label: 'Other'}
      ])
    },
    cookie: owner.cookie
  })
  expect(reshared.errors).toBeUndefined()
  const afterEdit = await getKysely()
    .selectFrom('Notification')
    .select(['type', 'userId'])
    .where('meetingId', '=', meeting.id)
    .execute()
  expect(afterEdit).toEqual(
    expect.arrayContaining([
      {type: 'RESPONSE_MENTIONED', userId: teammate.userId},
      {type: 'RESPONSE_MENTIONED', userId: otherTeammate.userId}
    ])
  )
  expect(afterEdit).toHaveLength(2)
})

test('a draft never leaves the meeting: the count and the summary page only see shared answers', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn, stuckOn] = meeting.prompts
  const teammate = await addTeammate(owner.teamId)
  await joinMeeting({bearerToken: teammate.bearerToken}, meeting.id)

  const ownerAnswers = [
    {promptId: stuckOn.id, content: paragraph('Waiting on the vendor sandbox')},
    {promptId: workingOn.id, content: paragraph('Shipped the billing fix')}
  ]
  for (const {promptId, content} of ownerAnswers) {
    const saved = await sendPublic({
      query: UPSERT,
      variables: {meetingId: meeting.id, promptId, content},
      cookie: owner.cookie
    })
    expect(saved.errors).toBeUndefined()
  }
  const shared = await sendPublic({
    query: SHARE,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  expect(shared.errors).toBeUndefined()

  const draft = await sendPublic({
    query: UPSERT,
    variables: {
      meetingId: meeting.id,
      promptId: workingOn.id,
      content: paragraph('Unshared secret draft')
    },
    bearerToken: teammate.bearerToken
  })
  expect(draft.errors).toBeUndefined()

  const counted = await sendPublic({
    query: MEETING_RESPONSES,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  expect(counted.data.viewer.meeting.responseCount).toBe(1)

  const ended = await sendPublic({
    query: END_TEAM_PROMPT,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  expect(ended.errors).toBeUndefined()
  expect(ended.data.endTeamPrompt.error).toBeUndefined()

  const summaryText = await waitForSummaryText(meeting.id, 'Waiting on the vendor sandbox')
  expect(summaryText).toContain('Shipped the billing fix')
  expect(summaryText).toContain('Waiting on the vendor sandbox')
  expect(summaryText).not.toContain('Unshared secret draft')
  expect(summaryText.indexOf('Shipped the billing fix')).toBeLessThan(
    summaryText.indexOf('Waiting on the vendor sandbox')
  )
}, 30000)

test('a draft cannot be reacted to until it is shared', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn] = meeting.prompts
  const teammate = await addTeammate(owner.teamId)
  await joinMeeting({bearerToken: teammate.bearerToken}, meeting.id)

  const draft = await sendPublic({
    query: UPSERT,
    variables: {
      meetingId: meeting.id,
      promptId: workingOn.id,
      content: paragraph('Shipped the billing fix')
    },
    cookie: owner.cookie
  })
  const reactableId = draft.data.upsertTeamPromptResponse.teamPromptResponse.id
  const react = () =>
    sendPublic({
      query: ADD_REACTJI,
      variables: {meetingId: meeting.id, reactableId},
      bearerToken: teammate.bearerToken
    })

  const onDraft = await react()
  expect(onDraft.data.addReactjiToReactable.error.message).toBe('Item does not exist')

  await sendPublic({query: SHARE, variables: {meetingId: meeting.id}, cookie: owner.cookie})
  const onShared = await react()
  expect(onShared.errors).toBeUndefined()
  expect(onShared.data.addReactjiToReactable.error).toBeUndefined()
})

test('updateMeetingTemplate rejects a stand-up instead of throwing', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const res = await sendPublic({
    query: `mutation U($meetingId: ID!, $templateId: ID!) {
      updateMeetingTemplate(meetingId: $meetingId, templateId: $templateId) {
        ... on ErrorPayload { error { message } }
      }
    }`,
    variables: {meetingId: meeting.id, templateId: ENTERPRISE_TEMPLATE_ID},
    cookie: owner.cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.updateMeetingTemplate.error.message).toBe('Meeting has no template')
})

test('a template downscoped to another team cannot be selected or started', async () => {
  const [owner, outsider] = await Promise.all([signUp(), signUp()])
  const created = await sendPublic({
    query: ADD_TEAM_PROMPT_TEMPLATE,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const {id: templateId} = created.data.addPromptTemplate.template
  const downscoped = await sendPublic({
    query: UPDATE_TEMPLATE_SCOPE,
    variables: {templateId, scope: 'TEAM'},
    cookie: owner.cookie
  })
  expect(downscoped.data.updateTemplateScope.template.scope).toBe('TEAM')

  const selected = await selectTemplate({cookie: outsider.cookie}, outsider.teamId, templateId)
  expect(selected.error.message).toBe('Template is scoped to team')
  const {meeting} = await startStandup({cookie: outsider.cookie}, outsider.teamId)
  expect(meeting.template.id).toBe(ENTERPRISE_TEMPLATE_ID)
})

test('a block-node answer round-trips through upsertTeamPromptResponse unchanged', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [completed] = meeting.prompts
  const blockDoc = {
    type: 'doc',
    content: [
      {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Release Notes'}]},
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{type: 'paragraph', content: [{type: 'text', text: 'Bullet one'}]}]
          }
        ]
      },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: {checked: false},
            content: [{type: 'paragraph', content: [{type: 'text', text: 'Task one'}]}]
          }
        ]
      },
      {
        type: 'blockquote',
        content: [{type: 'paragraph', content: [{type: 'text', text: 'Quoted text'}]}]
      },
      {type: 'codeBlock', content: [{type: 'text', text: 'const x = 1'}]},
      {type: 'horizontalRule'},
      {
        type: 'details',
        attrs: {open: false},
        content: [
          {type: 'detailsSummary', content: [{type: 'text', text: 'Sum'}]},
          {
            type: 'detailsContent',
            content: [{type: 'paragraph', content: [{type: 'text', text: 'Body'}]}]
          }
        ]
      },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableHeader',
                content: [{type: 'paragraph', content: [{type: 'text', text: 'Header A'}]}]
              },
              {
                type: 'tableHeader',
                content: [{type: 'paragraph', content: [{type: 'text', text: 'Header B'}]}]
              }
            ]
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{type: 'paragraph', content: [{type: 'text', text: 'Cell A'}]}]
              },
              {
                type: 'tableCell',
                content: [{type: 'paragraph', content: [{type: 'text', text: 'Cell B'}]}]
              }
            ]
          }
        ]
      }
    ]
  }
  const blockNodeTypes = blockDoc.content.map(({type}) => type)

  const res = await sendPublic({
    query: UPSERT,
    variables: {
      meetingId: meeting.id,
      promptId: completed.id,
      content: JSON.stringify(blockDoc)
    },
    cookie: owner.cookie
  })
  expect(res.errors).toBeUndefined()
  const {teamPromptResponse: response} = res.data.upsertTeamPromptResponse
  expect(response.promptId).toBe(completed.id)
  for (const text of [
    'Release Notes',
    'Bullet one',
    'Task one',
    'Quoted text',
    'const x = 1',
    'Sum',
    'Body',
    'Header A',
    'Header B',
    'Cell A',
    'Cell B'
  ]) {
    expect(response.plaintextContent).toContain(text)
  }

  const answerContent = JSON.parse(response.content)
  expect(answerContent.content.map(({type}: {type: string}) => type)).toEqual(blockNodeTypes)
})

test('an empty-table-only answer is cleared and blocks sharing', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [completed] = meeting.prompts
  const emptyTableDoc = JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {type: 'tableHeader', content: [{type: 'paragraph'}]},
              {type: 'tableHeader', content: [{type: 'paragraph'}]}
            ]
          },
          {
            type: 'tableRow',
            content: [
              {type: 'tableCell', content: [{type: 'paragraph'}]},
              {type: 'tableCell', content: [{type: 'paragraph'}]}
            ]
          }
        ]
      }
    ]
  })

  const cleared = await sendPublic({
    query: UPSERT,
    variables: {meetingId: meeting.id, promptId: completed.id, content: emptyTableDoc},
    cookie: owner.cookie
  })
  expect(cleared.errors).toBeUndefined()
  const {teamPromptResponse} = cleared.data.upsertTeamPromptResponse
  expect(teamPromptResponse.plaintextContent).toBe('')
  expect(teamPromptResponse.sharedAt).toBeNull()

  const shared = await sendPublic({
    query: SHARE,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  expect(shared.errors).toEqual([
    expect.objectContaining({message: 'Answer at least one prompt to share'})
  ])
})

test('starting recurrence in-meeting carries the template onto the new series', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const res = await sendPublic({
    query: UPDATE_RECURRENCE_SETTINGS,
    variables: {meetingId: meeting.id, rrule: immediateRrule()},
    cookie: owner.cookie
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.updateRecurrenceSettings.error).toBeUndefined()
  const {nextMeetingDate} = res.data.updateRecurrenceSettings.meeting.meetingSeries
  expect(typeof nextMeetingDate).toBe('string')
  const templateId = await seriesTemplateIdForMeeting(meeting.id)
  expect(templateId).toBe(ENTERPRISE_TEMPLATE_ID)
})
