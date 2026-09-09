import dayjs from 'dayjs'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {toDateTime} from 'parabol-client/shared/rruleUtil'
import AuthToken from '../database/types/AuthToken'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'
import {sendPublic, signUp} from './common'

const CANONICAL_TEMPLATE_ID = 'teamPrompt'
const ENTERPRISE_TEMPLATE_ID = 'enterpriseDailyStandupTemplate'
const DEFAULT_PROMPT = 'What are you working on today? Stuck on anything?'
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
const EMPTY_DOC = JSON.stringify({type: 'doc', content: []})

const START_TEAM_PROMPT = `
  mutation StartTeamPrompt($teamId: ID!, $templateId: ID, $rrule: RRule) {
    startTeamPrompt(teamId: $teamId, templateId: $templateId, rrule: $rrule) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on StartTeamPromptSuccess {
        meeting {
          id
          templateId
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

const UPSERT_ANSWERS = `
  mutation UpsertTeamPromptAnswers($meetingId: ID!, $answers: [TeamPromptAnswerInput!]!, $share: Boolean!) {
    upsertTeamPromptAnswers(meetingId: $meetingId, answers: $answers, share: $share) {
      response {
        id
        isShared
        sharedAt
        answeredPromptIds
        answers {
          id
          promptId
          prompt {
            id
          }
          content
          plaintextContent
        }
        content
        plaintextContent
      }
      meeting {
        id
        responseCount
      }
    }
  }
`

const UPSERT_LEGACY_RESPONSE = `
  mutation UpsertTeamPromptResponse($meetingId: ID!, $content: String!) {
    upsertTeamPromptResponse(meetingId: $meetingId, content: $content) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on UpsertTeamPromptResponseSuccess {
        teamPromptResponse {
          id
          isShared
          plaintextContent
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
            isShared
            sharedAt
            answeredPromptIds
            answers {
              promptId
            }
            content
            plaintextContent
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
          templateId
          prompts {
            id
          }
        }
      }
    }
  }
`

const ADD_TEAM_PROMPT_TEMPLATE = `
  mutation AddTeamPromptTemplate($teamId: ID!, $parentTemplateId: ID) {
    addTeamPromptTemplate(teamId: $teamId, parentTemplateId: $parentTemplateId) {
      teamPromptTemplate {
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

const UPDATE_MEETING_PROMPT = `
  mutation UpdateMeetingPrompt($meetingId: ID!, $newPrompt: String!) {
    updateMeetingPrompt(meetingId: $meetingId, newPrompt: $newPrompt) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on UpdateMeetingPromptSuccess {
        meeting {
          id
          meetingPrompt
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
  templateId?: string,
  rrule?: string
) => {
  const res = await sendPublic({
    query: START_TEAM_PROMPT,
    variables: {teamId, templateId, rrule},
    ...auth
  })
  expect(res.errors).toBeUndefined()
  return res.data.startTeamPrompt
}

const joinMeeting = async (auth: {cookie?: string; bearerToken?: string}, meetingId: string) => {
  const res = await sendPublic({query: JOIN_MEETING, variables: {meetingId}, ...auth})
  expect(res.data.joinMeeting.error).toBeUndefined()
}

const startTemplatedStandup = async (templateId = ENTERPRISE_TEMPLATE_ID) => {
  const owner = await signUp()
  const {meeting} = await startStandup({cookie: owner.cookie}, owner.teamId, templateId)
  await joinMeeting({cookie: owner.cookie}, meeting.id)
  return {owner, meeting}
}

test('startTeamPrompt uses the requested template and freezes its prompts', async () => {
  const {meeting} = await startTemplatedStandup()
  expect(meeting.templateId).toBe(ENTERPRISE_TEMPLATE_ID)
  expect(meeting.template.id).toBe(ENTERPRISE_TEMPLATE_ID)
  expect(meeting.prompts.map((prompt: any) => prompt.question)).toEqual([
    'What are you working on? What has been completed recently?',
    "What are you stuck on, what's holding you back?",
    'What are you planning to work on next?'
  ])
  expect(meeting.meetingPrompt).toBe('What are you working on? What has been completed recently?')
})

test('startTeamPrompt without templateId uses the canonical template by default', async () => {
  const {teamId, cookie} = await signUp()
  const {meeting} = await startStandup({cookie}, teamId)
  expect(meeting.templateId).toBe(CANONICAL_TEMPLATE_ID)
  expect(meeting.prompts).toHaveLength(1)
  expect(meeting.meetingPrompt).toBe(DEFAULT_PROMPT)
})

test('startTeamPrompt rejects a template scoped to another org', async () => {
  const [owner, attacker] = await Promise.all([signUp(), signUp()])
  const created = await sendPublic({
    query: ADD_TEAM_PROMPT_TEMPLATE,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const {id: templateId} = created.data.addTeamPromptTemplate.teamPromptTemplate
  const res = await sendPublic({
    query: START_TEAM_PROMPT,
    variables: {teamId: attacker.teamId, templateId},
    cookie: attacker.cookie
  })
  expect(res.data.startTeamPrompt.error.message).toBe('Template is scoped to organization')
})

test('startTeamPrompt records the template on a recurring series', async () => {
  const {teamId, cookie} = await signUp()
  const {meeting, meetingSeries} = await startStandup(
    {cookie},
    teamId,
    ENTERPRISE_TEMPLATE_ID,
    immediateRrule()
  )
  expect(meeting.templateId).toBe(ENTERPRISE_TEMPLATE_ID)
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
  const {id: customTemplateId} = created.data.addTeamPromptTemplate.teamPromptTemplate

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
  expect(first.data.startMeetingSeriesNow.meeting.templateId).toBe(customTemplateId)
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
  expect(second.data.startMeetingSeriesNow.meeting.templateId).toBe(CANONICAL_TEMPLATE_ID)
})

test('answers are saved as a private draft and masked for teammates', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn, , next] = meeting.prompts
  const teammate = await addTeammate(owner.teamId)
  await joinMeeting({bearerToken: teammate.bearerToken}, meeting.id)

  const draft = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: workingOn.id, content: paragraph('Shipped the billing fix')}],
      share: false
    },
    cookie: owner.cookie
  })
  expect(draft.errors).toBeUndefined()
  expect(draft.data.upsertTeamPromptAnswers.response).toMatchObject({
    isShared: false,
    sharedAt: null,
    answeredPromptIds: [workingOn.id],
    answers: [
      {
        promptId: workingOn.id,
        prompt: {id: workingOn.id},
        plaintextContent: 'Shipped the billing fix'
      }
    ],
    plaintextContent:
      'What are you working on? What has been completed recently?\nShipped the billing fix'
  })
  expect(JSON.parse(draft.data.upsertTeamPromptAnswers.response.content)).toEqual({
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: {level: 3},
        content: [
          {type: 'text', text: 'What are you working on? What has been completed recently?'}
        ]
      },
      {type: 'paragraph', content: [{type: 'text', text: 'Shipped the billing fix'}]}
    ]
  })
  expect(draft.data.upsertTeamPromptAnswers.meeting.responseCount).toBe(0)

  const asTeammate = await sendPublic({
    query: MEETING_RESPONSES,
    variables: {meetingId: meeting.id},
    bearerToken: teammate.bearerToken
  })
  const ownerResponse = asTeammate.data.viewer.meeting.responses.find(
    (response: any) => response.userId === owner.userId
  )
  expect(ownerResponse).toEqual({
    userId: owner.userId,
    isShared: false,
    sharedAt: null,
    answeredPromptIds: [workingOn.id],
    answers: [],
    content: EMPTY_DOC,
    plaintextContent: ''
  })
  expect(asTeammate.data.viewer.meeting.responseCount).toBe(0)

  const asOwner = await sendPublic({
    query: MEETING_RESPONSES,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  const ownResponse = asOwner.data.viewer.meeting.responses.find(
    (response: any) => response.userId === owner.userId
  )
  expect(ownResponse.answers).toEqual([{promptId: workingOn.id}])
  expect(ownResponse.plaintextContent).toContain('Shipped the billing fix')
  expect(next.id).toBeTruthy()
})

test('sharing reveals answers, sets sharedAt once and keeps the response shared', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn, , next] = meeting.prompts
  const teammate = await addTeammate(owner.teamId)
  await joinMeeting({bearerToken: teammate.bearerToken}, meeting.id)

  const shared = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [
        {promptId: workingOn.id, content: paragraph('Closed 3 tickets')},
        {promptId: next.id, content: paragraph('Start the audit')}
      ],
      share: true
    },
    cookie: owner.cookie
  })
  expect(shared.errors).toBeUndefined()
  const {response: sharedResponse, meeting: sharedMeeting} = shared.data.upsertTeamPromptAnswers
  expect(sharedResponse.isShared).toBe(true)
  expect(sharedResponse.sharedAt).not.toBeNull()
  expect(sharedResponse.answeredPromptIds).toEqual([workingOn.id, next.id])
  expect(sharedMeeting.responseCount).toBe(1)

  const asTeammate = await sendPublic({
    query: MEETING_RESPONSES,
    variables: {meetingId: meeting.id},
    bearerToken: teammate.bearerToken
  })
  const ownerResponse = asTeammate.data.viewer.meeting.responses.find(
    (response: any) => response.userId === owner.userId
  )
  expect(ownerResponse.isShared).toBe(true)
  expect(ownerResponse.answers).toEqual([{promptId: workingOn.id}, {promptId: next.id}])
  expect(ownerResponse.plaintextContent).toBe(
    'What are you working on? What has been completed recently?\nClosed 3 tickets\n\nWhat are you planning to work on next?\nStart the audit'
  )

  const edited = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: next.id, content: paragraph('Start the audit tomorrow')}],
      share: true
    },
    cookie: owner.cookie
  })
  expect(edited.errors).toBeUndefined()
  expect(edited.data.upsertTeamPromptAnswers.response).toMatchObject({
    isShared: true,
    sharedAt: sharedResponse.sharedAt,
    plaintextContent:
      'What are you working on? What has been completed recently?\nClosed 3 tickets\n\nWhat are you planning to work on next?\nStart the audit tomorrow'
  })

  const reshared = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {meetingId: meeting.id, answers: [], share: true},
    cookie: owner.cookie
  })
  expect(reshared.data.upsertTeamPromptAnswers.response.sharedAt).toBe(sharedResponse.sharedAt)
})

test('an empty document removes an answer and the derived content follows template order', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn, stuck, next] = meeting.prompts

  await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [
        {promptId: stuck.id, content: paragraph('Waiting on review')},
        {promptId: workingOn.id, content: paragraph('Done with onboarding')}
      ],
      share: false
    },
    cookie: owner.cookie
  })
  const removed = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [
        {promptId: workingOn.id, content: EMPTY_DOC},
        {promptId: next.id, content: paragraph('Plan the release')}
      ],
      share: false
    },
    cookie: owner.cookie
  })
  expect(removed.errors).toBeUndefined()
  const {response} = removed.data.upsertTeamPromptAnswers
  expect(response.answeredPromptIds.sort()).toEqual([next.id, stuck.id].sort())
  expect(response.plaintextContent).toBe(
    "What are you stuck on, what's holding you back?\nWaiting on review\n\nWhat are you planning to work on next?\nPlan the release"
  )
})

test('upsertTeamPromptAnswers rejects foreign prompts, duplicates, ended and legacy meetings', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn] = meeting.prompts

  const foreign = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: 'teamPromptTemplate:workingOnPrompt', content: paragraph('nope')}],
      share: false
    },
    cookie: owner.cookie
  })
  expect(foreign.errors).toEqual([
    expect.objectContaining({message: 'Prompt is not part of this meeting'})
  ])

  const duplicate = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [
        {promptId: workingOn.id, content: paragraph('a')},
        {promptId: workingOn.id, content: paragraph('b')}
      ],
      share: false
    },
    cookie: owner.cookie
  })
  expect(duplicate.errors).toEqual([
    expect.objectContaining({message: 'Prompt was answered more than once'})
  ])

  const legacyOnTemplated = await sendPublic({
    query: UPSERT_LEGACY_RESPONSE,
    variables: {meetingId: meeting.id, content: paragraph('legacy')},
    cookie: owner.cookie
  })
  expect(legacyOnTemplated.data.upsertTeamPromptResponse.error.message).toBe(
    'Meeting uses a template'
  )

  await sendPublic({
    query: END_TEAM_PROMPT,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  const ended = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: workingOn.id, content: paragraph('late')}],
      share: true
    },
    cookie: owner.cookie
  })
  expect(ended.errors).toEqual([expect.objectContaining({message: 'Meeting already ended'})])

  const legacy = await signUp()
  const {meeting: legacyMeeting} = await startStandup({cookie: legacy.cookie}, legacy.teamId)
  await joinMeeting({cookie: legacy.cookie}, legacyMeeting.id)
  const structuredOnLegacy = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: legacyMeeting.id,
      answers: [{promptId: 'teamPromptTemplate:workingOnPrompt', content: paragraph('x')}],
      share: false
    },
    cookie: legacy.cookie
  })
  expect(structuredOnLegacy.errors).toEqual([
    expect.objectContaining({message: 'Meeting does not use a template'})
  ])
})

test('legacy standups still accept upsertTeamPromptResponse and count as shared', async () => {
  const {teamId, cookie} = await signUp()
  const {meeting} = await startStandup({cookie}, teamId)
  await joinMeeting({cookie}, meeting.id)
  const res = await sendPublic({
    query: UPSERT_LEGACY_RESPONSE,
    variables: {meetingId: meeting.id, content: paragraph('Working on the migration')},
    cookie
  })
  expect(res.data.upsertTeamPromptResponse.teamPromptResponse).toMatchObject({
    isShared: true,
    plaintextContent: 'Working on the migration'
  })
  const responses = await sendPublic({
    query: MEETING_RESPONSES,
    variables: {meetingId: meeting.id},
    cookie
  })
  expect(responses.data.viewer.meeting.responseCount).toBe(1)
  expect(responses.data.viewer.meeting.responses[0]).toMatchObject({
    isShared: true,
    answers: [],
    answeredPromptIds: []
  })
})

test('a teammate cannot write answers for a meeting they have not joined', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn] = meeting.prompts
  const outsider = await signUp()
  const res = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: workingOn.id, content: paragraph('intruder')}],
      share: true
    },
    cookie: outsider.cookie
  })
  expect(res.errors).toEqual([
    expect.objectContaining({message: expect.stringMatching('Viewer is not meeting member')})
  ])
  expect(owner.userId).toBeTruthy()
})

test('sharing a fresh response with no answers is rejected and creates no row', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const res = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {meetingId: meeting.id, answers: [], share: true},
    cookie: owner.cookie
  })
  expect(res.errors).toEqual([
    expect.objectContaining({message: 'Answer at least one prompt to share'})
  ])
  const rows = await getKysely()
    .selectFrom('TeamPromptResponse')
    .selectAll()
    .where('meetingId', '=', meeting.id)
    .where('userId', '=', owner.userId)
    .execute()
  expect(rows).toHaveLength(0)
})

test('saving a fresh draft with nothing to save is rejected and creates no row', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const res = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {meetingId: meeting.id, answers: [], share: false},
    cookie: owner.cookie
  })
  expect(res.errors).toEqual([expect.objectContaining({message: 'Nothing to save'})])
  const rows = await getKysely()
    .selectFrom('TeamPromptResponse')
    .selectAll()
    .where('meetingId', '=', meeting.id)
    .where('userId', '=', owner.userId)
    .execute()
  expect(rows).toHaveLength(0)

  const [workingOn] = meeting.prompts
  await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: workingOn.id, content: paragraph('Getting started')}],
      share: false
    },
    cookie: owner.cookie
  })
  const cleared = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: workingOn.id, content: EMPTY_DOC}],
      share: false
    },
    cookie: owner.cookie
  })
  expect(cleared.errors).toBeUndefined()
  expect(cleared.data.upsertTeamPromptAnswers.response.answeredPromptIds).toEqual([])
  const remainingRows = await getKysely()
    .selectFrom('TeamPromptResponse')
    .selectAll()
    .where('meetingId', '=', meeting.id)
    .where('userId', '=', owner.userId)
    .execute()
  expect(remainingRows).toHaveLength(1)
})

test('an attachment-only answer counts as answered with empty plaintext', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn] = meeting.prompts
  const attachmentDoc = JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'fileBlock',
        attrs: {
          src: 'https://example.com/file.pdf',
          name: 'file.pdf',
          size: 1024,
          fileType: 'application/pdf'
        }
      }
    ]
  })
  const draft = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: workingOn.id, content: attachmentDoc}],
      share: false
    },
    cookie: owner.cookie
  })
  expect(draft.errors).toBeUndefined()
  expect(draft.data.upsertTeamPromptAnswers.response.answeredPromptIds).toEqual([workingOn.id])
  expect(draft.data.upsertTeamPromptAnswers.response.answers[0]).toMatchObject({
    promptId: workingOn.id,
    plaintextContent: ''
  })

  const shared = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {meetingId: meeting.id, answers: [], share: true},
    cookie: owner.cookie
  })
  expect(shared.errors).toBeUndefined()
  expect(shared.data.upsertTeamPromptAnswers.meeting.responseCount).toBe(1)
})

test('responseCount only counts shared responses with non-empty documents', async () => {
  const legacy = await signUp()
  const {meeting: legacyMeeting} = await startStandup({cookie: legacy.cookie}, legacy.teamId)
  await joinMeeting({cookie: legacy.cookie}, legacyMeeting.id)
  await sendPublic({
    query: UPSERT_LEGACY_RESPONSE,
    variables: {meetingId: legacyMeeting.id, content: paragraph('Working on the launch')},
    cookie: legacy.cookie
  })
  const legacyBlanked = await sendPublic({
    query: UPSERT_LEGACY_RESPONSE,
    variables: {
      meetingId: legacyMeeting.id,
      content: JSON.stringify({type: 'doc', content: [{type: 'paragraph'}]})
    },
    cookie: legacy.cookie
  })
  expect(legacyBlanked.errors).toBeUndefined()
  const legacyResponses = await sendPublic({
    query: MEETING_RESPONSES,
    variables: {meetingId: legacyMeeting.id},
    cookie: legacy.cookie
  })
  expect(legacyResponses.data.viewer.meeting.responseCount).toBe(0)

  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn] = meeting.prompts
  const draft = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: workingOn.id, content: paragraph('Writing tests')}],
      share: false
    },
    cookie: owner.cookie
  })
  expect(draft.data.upsertTeamPromptAnswers.meeting.responseCount).toBe(0)
  const shared = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {meetingId: meeting.id, answers: [], share: true},
    cookie: owner.cookie
  })
  expect(shared.data.upsertTeamPromptAnswers.meeting.responseCount).toBe(1)
})

test('updateMeetingPrompt succeeds on a legacy meeting and is blocked on a templated one', async () => {
  const {teamId, cookie} = await signUp()
  const {meeting: legacyMeeting} = await startStandup({cookie}, teamId)
  const updated = await sendPublic({
    query: UPDATE_MEETING_PROMPT,
    variables: {meetingId: legacyMeeting.id, newPrompt: 'What did you ship this week?'},
    cookie
  })
  expect(updated.errors).toBeUndefined()
  expect(updated.data.updateMeetingPrompt.meeting.meetingPrompt).toBe(
    'What did you ship this week?'
  )

  const {owner, meeting} = await startTemplatedStandup()
  const blocked = await sendPublic({
    query: UPDATE_MEETING_PROMPT,
    variables: {meetingId: meeting.id, newPrompt: 'What did you ship this week?'},
    cookie: owner.cookie
  })
  expect(blocked.errors).toBeUndefined()
  expect(blocked.data.updateMeetingPrompt.error.message).toBe('Meeting uses a template')
})

test('a shared response rejects a private edit and notifies newly mentioned teammates', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn] = meeting.prompts
  const teammate = await addTeammate(owner.teamId)
  await joinMeeting({bearerToken: teammate.bearerToken}, meeting.id)

  const shared = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: workingOn.id, content: paragraph('Shipped the parser')}],
      share: true
    },
    cookie: owner.cookie
  })
  expect(shared.errors).toBeUndefined()

  const privateEdit = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: workingOn.id, content: paragraph('Shipped the parser and the lexer')}],
      share: false
    },
    cookie: owner.cookie
  })
  expect(privateEdit.errors).toEqual([
    expect.objectContaining({message: 'Response is already shared'})
  ])

  const reshared = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [
        {
          promptId: workingOn.id,
          content: paragraphWithMention('Shipped the parser with ', teammate.userId, 'Teammate')
        }
      ],
      share: true
    },
    cookie: owner.cookie
  })
  expect(reshared.errors).toBeUndefined()

  const notifications = await getKysely()
    .selectFrom('Notification')
    .select(['type', 'userId'])
    .where('meetingId', '=', meeting.id)
    .where('userId', '=', teammate.userId)
    .execute()
  expect(notifications).toEqual([{type: 'RESPONSE_MENTIONED', userId: teammate.userId}])
})

test('startTeamPrompt rejects a template downscoped to another team', async () => {
  const [owner, outsider] = await Promise.all([signUp(), signUp()])
  const created = await sendPublic({
    query: ADD_TEAM_PROMPT_TEMPLATE,
    variables: {teamId: owner.teamId},
    cookie: owner.cookie
  })
  const {id: templateId} = created.data.addTeamPromptTemplate.teamPromptTemplate
  const downscoped = await sendPublic({
    query: UPDATE_TEMPLATE_SCOPE,
    variables: {templateId, scope: 'TEAM'},
    cookie: owner.cookie
  })
  expect(downscoped.data.updateTemplateScope.template.scope).toBe('TEAM')

  const res = await sendPublic({
    query: START_TEAM_PROMPT,
    variables: {teamId: outsider.teamId, templateId},
    cookie: outsider.cookie
  })
  expect(res.data.startTeamPrompt.error.message).toBe('Template is scoped to team')
})

test('two members keep their drafts private from each other until both share', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn] = meeting.prompts
  const teammate = await addTeammate(owner.teamId)
  await joinMeeting({bearerToken: teammate.bearerToken}, meeting.id)

  await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: workingOn.id, content: paragraph('Owner draft')}],
      share: false
    },
    cookie: owner.cookie
  })
  await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {
      meetingId: meeting.id,
      answers: [{promptId: workingOn.id, content: paragraph('Teammate draft')}],
      share: false
    },
    bearerToken: teammate.bearerToken
  })

  const asOwner = await sendPublic({
    query: MEETING_RESPONSES,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  const ownDraft = asOwner.data.viewer.meeting.responses.find(
    (response: any) => response.userId === owner.userId
  )
  const maskedTeammate = asOwner.data.viewer.meeting.responses.find(
    (response: any) => response.userId === teammate.userId
  )
  expect(ownDraft.plaintextContent).toContain('Owner draft')
  expect(maskedTeammate).toMatchObject({
    isShared: false,
    answers: [],
    content: EMPTY_DOC,
    plaintextContent: ''
  })
  expect(asOwner.data.viewer.meeting.responseCount).toBe(0)

  const asTeammate = await sendPublic({
    query: MEETING_RESPONSES,
    variables: {meetingId: meeting.id},
    bearerToken: teammate.bearerToken
  })
  const maskedOwner = asTeammate.data.viewer.meeting.responses.find(
    (response: any) => response.userId === owner.userId
  )
  expect(maskedOwner).toMatchObject({content: EMPTY_DOC, plaintextContent: ''})

  await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {meetingId: meeting.id, answers: [], share: true},
    cookie: owner.cookie
  })
  const bothShared = await sendPublic({
    query: UPSERT_ANSWERS,
    variables: {meetingId: meeting.id, answers: [], share: true},
    bearerToken: teammate.bearerToken
  })
  expect(bothShared.data.upsertTeamPromptAnswers.meeting.responseCount).toBe(2)

  const revealed = await sendPublic({
    query: MEETING_RESPONSES,
    variables: {meetingId: meeting.id},
    cookie: owner.cookie
  })
  const revealedTeammate = revealed.data.viewer.meeting.responses.find(
    (response: any) => response.userId === teammate.userId
  )
  expect(revealedTeammate.plaintextContent).toContain('Teammate draft')
})

test('a heading-only or empty-list document has nothing to save', async () => {
  const {owner, meeting} = await startTemplatedStandup()
  const [workingOn] = meeting.prompts
  const emptyDocs = [
    JSON.stringify({type: 'doc', content: [{type: 'heading', attrs: {level: 3}}]}),
    JSON.stringify({
      type: 'doc',
      content: [{type: 'bulletList', content: [{type: 'listItem', content: [{type: 'paragraph'}]}]}]
    })
  ]
  for (const content of emptyDocs) {
    const res = await sendPublic({
      query: UPSERT_ANSWERS,
      variables: {
        meetingId: meeting.id,
        answers: [{promptId: workingOn.id, content}],
        share: false
      },
      cookie: owner.cookie
    })
    expect(res.errors).toEqual([expect.objectContaining({message: 'Nothing to save'})])
  }
})
