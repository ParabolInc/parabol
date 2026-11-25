import dayjs from 'dayjs'
import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {toDateTime} from 'parabol-client/shared/rruleUtil'
import getKysely from '../postgres/getKysely'
import getRedis from '../utils/getRedis'
import {sendPublic, signUp} from './common'
import {
  callTool,
  callToolForData,
  createPersonalAccessToken,
  expectToolErrorCode
} from './mcpClient'

afterAll(async () => {
  await getRedis().quit()
})

const READ_SCOPES = ['USERS_READ', 'MEETINGS_READ', 'TASKS_READ']
const MEETING_SCOPES = [...READ_SCOPES, 'MEETINGS_WRITE']

const WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
const weeklyRrule = (start: dayjs.Dayjs) =>
  `DTSTART;TZID=UTC:${toDateTime(start, 'UTC')}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=${WEEKDAY_CODES[start.day()]}`
const immediateRrule = () => weeklyRrule(dayjs().utc().add(5, 'second'))

const paragraph = (text: string) =>
  JSON.stringify({type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text}]}]})

const PREFERRED_NAME = `
  query PreferredName {
    viewer {
      preferredName
    }
  }
`

const START_RECURRING_STANDUP = `
  mutation StartRecurringStandup($teamId: ID!, $rrule: RRule) {
    startTeamPrompt(teamId: $teamId, rrule: $rrule) {
      meeting {
        id
        meetingSeriesId
        prompts {
          id
          question
        }
      }
    }
  }
`

const UPSERT_RESPONSE = `
  mutation UpsertResponse($meetingId: ID!, $promptId: ID!, $content: String!) {
    upsertTeamPromptResponse(meetingId: $meetingId, promptId: $promptId, content: $content) {
      teamPromptResponse {
        id
      }
    }
  }
`

const CREATE_TASK = `
  mutation CreateTask($newTask: CreateTaskInput!) {
    createTask(newTask: $newTask) {
      task {
        id
      }
    }
  }
`

const UPDATE_POKER_SCOPE = `
  mutation UpdatePokerScope($meetingId: ID!, $updates: [UpdatePokerScopeItemInput!]!) {
    updatePokerScope(meetingId: $meetingId, updates: $updates) {
      newStages {
        id
        discussionId
        dimensionRef {
          name
          scale {
            values {
              label
            }
          }
        }
      }
    }
  }
`

const VOTE = `
  mutation VoteForPokerStory($meetingId: ID!, $stageId: ID!, $score: String) {
    voteForPokerStory(meetingId: $meetingId, stageId: $stageId, score: $score) {
      stage {
        id
      }
    }
  }
`

const REVEAL = `
  mutation PokerRevealVotes($meetingId: ID!, $stageId: ID!) {
    pokerRevealVotes(meetingId: $meetingId, stageId: $stageId) {
      stage {
        id
      }
    }
  }
`

const SET_TASK_ESTIMATE = `
  mutation SetTaskEstimate($taskEstimate: TaskEstimateInput!) {
    setTaskEstimate(taskEstimate: $taskEstimate) {
      stage {
        id
      }
    }
  }
`

const ADD_COMMENT = `
  mutation AddComment($comment: AddCommentInput!) {
    addComment(comment: $comment) {
      comment {
        id
      }
    }
  }
`

const TEAM_HEALTH_QUESTIONS = `
  query TeamHealthQuestions($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        phases {
          ... on TeamHealthResponsePhase {
            stages {
              id
              question {
                id
                question
              }
            }
          }
        }
      }
    }
  }
`

const SPECTATE = `
  mutation SetTeamHealthSpectate($meetingId: ID!, $isSpectating: Boolean!) {
    setTeamHealthSpectate(meetingId: $meetingId, isSpectating: $isSpectating) {
      meetingMember {
        id
      }
    }
  }
`

const RESPOND = `
  mutation SetTeamHealthResponse($meetingId: ID!, $stageId: ID!, $score: Int, $comment: String) {
    setTeamHealthResponse(
      meetingId: $meetingId
      stageId: $stageId
      score: $score
      comment: $comment
      isAnonymous: false
    ) {
      meeting {
        id
      }
    }
  }
`

const END_TEAM_HEALTH = `
  mutation EndTeamHealth($meetingId: ID!) {
    endTeamHealth(meetingId: $meetingId) {
      meetingId
    }
  }
`

const JOIN_MEETING = `
  mutation JoinMeeting($meetingId: ID!) {
    joinMeeting(meetingId: $meetingId) {
      meetingMember {
        id
      }
    }
  }
`

const send = async (query: string, variables: Record<string, unknown>, cookie: string) => {
  const res = await sendPublic({query, variables, cookie})
  expect(res.errors).toBeUndefined()
  return res.data
}

const getStages = <Stage>(meeting: {phases: {stages?: Stage[]}[]}) =>
  meeting.phases.flatMap(({stages}) => stages ?? [])

const getPreferredName = async (cookie: string) =>
  (await send(PREFERRED_NAME, {}, cookie)).viewer.preferredName as string

const expectMissingScope = (result: Awaited<ReturnType<typeof callTool>>, scope: string) => {
  expect(result.isError).toBe(true)
  const parsed = JSON.parse(result.content[0]!.text)
  const errors = Array.isArray(parsed) ? parsed : parsed.errors
  expect(errors).toContainEqual(
    expect.objectContaining({code: 'FORBIDDEN', message: expect.stringContaining(scope)})
  )
}

const startPokerWithStory = async () => {
  const {cookie, teamId, userId} = await signUp()
  const token = await createPersonalAccessToken(MEETING_SCOPES, {cookie})
  const started = await callToolForData(token, 'start_sprint_poker', {teamId})
  const meetingId = started.startSprintPoker.meeting.id as string
  const created = await send(
    CREATE_TASK,
    {newTask: {status: 'active', teamId, userId, content: paragraph('Build the login page')}},
    cookie
  )
  const taskId = created.createTask.task.id as string
  const scoped = await send(
    UPDATE_POKER_SCOPE,
    {meetingId, updates: [{service: 'PARABOL', serviceTaskId: taskId, action: 'ADD'}]},
    cookie
  )
  const [stage] = scoped.updatePokerScope.newStages
  return {
    cookie,
    teamId,
    userId,
    token,
    meetingId,
    taskId,
    stageId: stage.id as string,
    discussionId: stage.discussionId as string,
    dimensionName: stage.dimensionRef.name as string,
    label: stage.dimensionRef.scale.values[0].label as string
  }
}

test('get_standup shows the prompts, each member’s responses with their discussion, and the tasks', async () => {
  const {cookie, teamId, userId} = await signUp()
  const token = await createPersonalAccessToken([...READ_SCOPES, 'COMMENTS_READ'], {cookie})
  const started = await send(START_RECURRING_STANDUP, {teamId, rrule: immediateRrule()}, cookie)
  const {id: meetingId, meetingSeriesId, prompts} = started.startTeamPrompt.meeting
  const prompt = prompts[0]
  await send(
    UPSERT_RESPONSE,
    {meetingId, promptId: prompt.id, content: paragraph('Shipped the billing fix')},
    cookie
  )
  const created = await send(
    CREATE_TASK,
    {newTask: {status: 'active', teamId, userId, meetingId, content: paragraph('Write notes')}},
    cookie
  )

  const {viewer} = await callToolForData(token, 'get_standup', {meetingId})
  expect(viewer.meeting).toMatchObject({id: meetingId, meetingType: 'teamPrompt', meetingSeriesId})
  expect(meetingSeriesId).toEqual(expect.any(String))
  expect(viewer.meeting.prompts).toEqual(prompts)
  expect(getStages(viewer.meeting)).toEqual([
    {
      discussionId: expect.any(String),
      responses: [
        {
          promptId: prompt.id,
          userId,
          user: {preferredName: await getPreferredName(cookie)},
          plaintextContent: 'Shipped the billing fix'
        }
      ]
    }
  ])
  expect(viewer.meeting.tasks).toEqual([
    expect.objectContaining({id: created.createTask.task.id, plaintextContent: 'Write notes'})
  ])

  const {discussionId} = getStages<{discussionId: string}>(viewer.meeting)[0]!
  const commented = await send(
    ADD_COMMENT,
    {comment: {content: paragraph('Nice fix'), discussionId, threadSortOrder: 0}},
    cookie
  )
  const discussion = await callToolForData(token, 'get_discussion', {discussionId})
  expect(discussion.viewer.discussion.thread.edges).toEqual([
    {
      node: expect.objectContaining({
        id: commented.addComment.comment.id,
        plaintextContent: 'Nice fix'
      })
    }
  ])
})

test('get_meeting says which series a meeting belongs to, if any', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(MEETING_SCOPES, {cookie})
  const recurring = await send(START_RECURRING_STANDUP, {teamId, rrule: immediateRrule()}, cookie)
  const {id: meetingId, meetingSeriesId} = recurring.startTeamPrompt.meeting
  const standup = await callToolForData(token, 'get_meeting', {meetingId})
  expect(standup.viewer.meeting.meetingSeriesId).toBe(meetingSeriesId)

  const started = await callToolForData(token, 'start_check_in', {teamId})
  const checkIn = await callToolForData(token, 'get_meeting', {
    meetingId: started.startCheckIn.meeting.id
  })
  expect(checkIn.viewer.meeting).toHaveProperty('meetingSeriesId', null)
})

test('get_poker_meeting says who has voted but leaves the votes out by default', async () => {
  const {cookie, token, meetingId, taskId, stageId, discussionId, dimensionName, label, userId} =
    await startPokerWithStory()
  await send(VOTE, {meetingId, stageId, score: label}, cookie)

  const {viewer} = await callToolForData(token, 'get_poker_meeting', {meetingId})
  expect(viewer.meeting).toMatchObject({id: meetingId, meetingType: 'poker'})
  expect(getStages(viewer.meeting)).toEqual([
    {
      id: stageId,
      discussionId,
      isVoting: true,
      finalScore: null,
      dimensionRef: {name: dimensionName},
      taskId,
      task: {plaintextContent: 'Build the login page'},
      scores: [{userId}]
    }
  ])
})

test('get_poker_meeting with showVotes shows the revealed votes and the final score', async () => {
  const {cookie, token, meetingId, taskId, stageId, discussionId, dimensionName, label, userId} =
    await startPokerWithStory()
  await send(VOTE, {meetingId, stageId, score: label}, cookie)
  await send(REVEAL, {meetingId, stageId}, cookie)
  await send(
    SET_TASK_ESTIMATE,
    {taskEstimate: {taskId, meetingId, dimensionName, value: label}},
    cookie
  )

  const {viewer} = await callToolForData(token, 'get_poker_meeting', {meetingId, showVotes: true})
  expect(getStages(viewer.meeting)).toEqual([
    {
      id: stageId,
      discussionId,
      isVoting: false,
      finalScore: label,
      dimensionRef: {name: dimensionName},
      taskId,
      task: {plaintextContent: 'Build the login page'},
      scores: [{userId, label, user: {preferredName: await getPreferredName(cookie)}}]
    }
  ])
})

test('get_team_health_meeting shows how many answered when too few did to show a score', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(MEETING_SCOPES, {cookie})
  const started = await callToolForData(token, 'start_team_health', {
    teamId,
    templateId: 'googleProjectAristotleTemplate'
  })
  const meetingId = started.startTeamHealth.meetings[0].id as string
  const questions = await send(TEAM_HEALTH_QUESTIONS, {meetingId}, cookie)
  const responseStages = getStages<{id: string; question: {id: string; question: string}}>(
    questions.viewer.meeting
  )
  const commented = responseStages[0]!
  await send(SPECTATE, {meetingId, isSpectating: false}, cookie)
  for (const stage of responseStages) {
    const comment = stage === commented ? 'Standups run long' : null
    await send(RESPOND, {meetingId, stageId: stage.id, score: 4, comment}, cookie)
  }
  await send(END_TEAM_HEALTH, {meetingId}, cookie)

  const {viewer} = await callToolForData(token, 'get_team_health_meeting', {meetingId})
  expect(viewer.meeting).toMatchObject({
    id: meetingId,
    meetingType: 'teamHealth',
    respondentCount: 1
  })
  const stages = getStages<{question: {id: string}}>(viewer.meeting)
  expect(stages.map(({question}) => question.id).sort()).toEqual(
    responseStages.map(({question}) => question.id).sort()
  )
  expect(stages).toEqual(
    stages.map(() =>
      expect.objectContaining({discussionId: expect.any(String), score: null, respondentCount: 1})
    )
  )
  expect(stages).toContainEqual(
    expect.objectContaining({
      question: commented.question,
      responses: expect.arrayContaining([
        {
          commentParaphrased: 'Standups run long',
          commentAuthor: {preferredName: await getPreferredName(cookie)}
        }
      ])
    })
  )
})

test('get_discussion shows the comments and tasks in a story’s discussion', async () => {
  const {cookie, teamId, userId, meetingId, discussionId} = await startPokerWithStory()
  const commented = await send(
    ADD_COMMENT,
    {comment: {content: paragraph('Looks like a 3'), discussionId, threadSortOrder: 0}},
    cookie
  )
  const created = await send(
    CREATE_TASK,
    {
      newTask: {
        status: 'active',
        teamId,
        userId,
        meetingId,
        discussionId,
        threadSortOrder: 1,
        content: paragraph('Split the story')
      }
    },
    cookie
  )
  const commentsToken = await createPersonalAccessToken([...READ_SCOPES, 'COMMENTS_READ'], {
    cookie
  })

  const {viewer} = await callToolForData(commentsToken, 'get_discussion', {discussionId})
  const preferredName = await getPreferredName(cookie)
  expect(viewer.discussion.thread.edges.map(({node}: {node: unknown}) => node)).toEqual([
    {
      id: commented.addComment.comment.id,
      createdByUser: {preferredName},
      plaintextContent: 'Looks like a 3'
    },
    {
      id: created.createTask.task.id,
      createdByUser: {preferredName},
      plaintextContent: 'Split the story',
      status: 'active',
      userId
    }
  ])
})

test('the meeting reads name the scope a connection lacks', async () => {
  const {cookie, meetingId, discussionId} = await startPokerWithStory()
  const withoutTasks = await createPersonalAccessToken(['USERS_READ', 'MEETINGS_READ'], {cookie})
  expectMissingScope(await callTool(withoutTasks, 'get_poker_meeting', {meetingId}), 'tasks:read')
  expectMissingScope(
    await callTool(withoutTasks, 'get_discussion', {discussionId}),
    'comments:read'
  )
})

test('end_meeting ends a meeting of each type and refuses to end it twice', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(MEETING_SCOPES, {cookie})
  const retrospective = await callToolForData(token, 'start_retrospective', {teamId})
  const checkIn = await callToolForData(token, 'start_check_in', {teamId})
  const poker = await callToolForData(token, 'start_sprint_poker', {teamId})
  const standup = await callToolForData(token, 'start_standup', {teamId})
  const teamHealth = await callToolForData(token, 'start_team_health', {
    teamId,
    templateId: 'googleProjectAristotleTemplate'
  })
  const meetings = [
    retrospective.startRetrospective.meeting,
    checkIn.startCheckIn.meeting,
    poker.startSprintPoker.meeting,
    standup.startTeamPrompt.meeting,
    teamHealth.startTeamHealth.meetings[0]
  ]
  expect(meetings.map(({meetingType}) => meetingType)).toEqual([
    'retrospective',
    'action',
    'poker',
    'teamPrompt',
    'teamHealth'
  ])

  for (const {id, name, meetingType} of meetings) {
    const ended = await callToolForData(token, 'end_meeting', {meetingId: id})
    expect(ended).toEqual({
      endMeeting: {
        meeting: {
          id,
          name,
          meetingType,
          endedAt: expect.any(String),
          summaryPageId: expect.any(String)
        }
      }
    })
    const again = await callTool(token, 'end_meeting', {meetingId: id})
    expect(expectToolErrorCode(again, 'CONFLICT')).toBe('Meeting already ended')
  }
})

test('end_meeting refuses a meeting on a team the caller is not on, and leaves it running', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(MEETING_SCOPES, {cookie})
  const started = await callToolForData(token, 'start_retrospective', {teamId})
  const meetingId = started.startRetrospective.meeting.id as string
  const outsider = await createPersonalAccessToken(MEETING_SCOPES)

  const refused = await callTool(outsider, 'end_meeting', {meetingId})
  expectToolErrorCode(refused, 'FORBIDDEN')
  const {viewer} = await callToolForData(token, 'get_meeting', {meetingId})
  expect(viewer.meeting.endedAt).toBeNull()
})

test('joining a meeting twice, as ensureMeetingMember does before each answer, changes nothing', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(MEETING_SCOPES, {cookie})
  const started = await callToolForData(token, 'start_standup', {teamId})
  const meetingId = started.startTeamPrompt.meeting.id as string
  const join = {query: JOIN_MEETING, variables: {meetingId}}

  const first = await callToolForData(token, 'graphql_mutate', join)
  const second = await callToolForData(token, 'graphql_mutate', join)
  expect(second).toEqual(first)
  const {viewer} = await callToolForData(token, 'get_standup', {meetingId})
  expect(getStages(viewer.meeting)).toHaveLength(1)
})

const STANDUP_SCOPES = [...MEETING_SCOPES, 'TEAMS_READ', 'TEAMS_WRITE', 'TEMPLATES_WRITE']

const STANDUP_PROMPTS = [
  {question: 'What did you ship?'},
  {question: 'What is in your way?', description: 'Anything slowing you down'}
]

const turnOffAI = (orgId: string) =>
  getKysely().updateTable('Organization').set({useAI: false}).where('id', '=', orgId).execute()

const getStoredBlocks = async (meetingId: string, promptId: string) => {
  const {content} = await getKysely()
    .selectFrom('TeamPromptResponse')
    .select('content')
    .where('meetingId', '=', meetingId)
    .where('promptId', '=', promptId)
    .executeTakeFirstOrThrow()
  return (content as {content: {type: string}[]}).content
}

const startStandupWithTemplate = async (prompts: {question: string; description?: string}[]) => {
  const {cookie, teamId, userId, orgId} = await signUp()
  await turnOffAI(orgId)
  const token = await createPersonalAccessToken(STANDUP_SCOPES, {cookie})
  const {template} = await callToolForData(token, 'create_standup_template', {
    teamId,
    name: 'Agent Standup',
    prompts
  })
  await callToolForData(token, 'select_template', {templateId: template.id, teamId})
  const started = await callToolForData(token, 'start_standup', {teamId})
  return {cookie, userId, token, template, meeting: started.startTeamPrompt.meeting}
}

test('an agent builds a standup template, answers a standup made with it in markdown, and ends it', async () => {
  const {cookie, userId, token, template, meeting} = await startStandupWithTemplate(STANDUP_PROMPTS)
  expect(template).toEqual({
    id: expect.any(String),
    name: 'Agent Standup',
    prompts: [
      {id: expect.any(String), question: 'What did you ship?', description: ''},
      {
        id: expect.any(String),
        question: 'What is in your way?',
        description: 'Anything slowing you down'
      }
    ]
  })
  const prompts = template.prompts.map(({id, question}: {id: string; question: string}) => ({
    id,
    question
  }))
  expect(meeting).toMatchObject({meetingType: 'teamPrompt', prompts})
  const [shipped, blocked] = prompts

  const answered = await callToolForData(token, 'answer_standup', {
    meetingId: meeting.id,
    answers: [
      {promptId: shipped.id, content: 'Two things:\n\n- the **billing** fix\n- the login page'},
      {promptId: blocked.id, content: 'Nothing'}
    ]
  })
  expect(answered.shareTeamPromptResponses.responses).toEqual(
    expect.arrayContaining([
      expect.objectContaining({promptId: shipped.id, sharedAt: expect.any(String)}),
      {
        id: expect.any(String),
        promptId: blocked.id,
        plaintextContent: 'Nothing',
        sharedAt: expect.any(String)
      }
    ])
  )
  const stored = await getStoredBlocks(meeting.id, shipped.id)
  expect(stored.map(({type}) => type)).toEqual(['paragraph', 'bulletList'])

  const {viewer} = await callToolForData(token, 'get_standup', {meetingId: meeting.id})
  const preferredName = await getPreferredName(cookie)
  expect(getStages(viewer.meeting)).toEqual([
    {
      discussionId: expect.any(String),
      responses: expect.arrayContaining([
        {
          promptId: shipped.id,
          userId,
          user: {preferredName},
          plaintextContent: expect.stringContaining('the billing fix')
        },
        {promptId: blocked.id, userId, user: {preferredName}, plaintextContent: 'Nothing'}
      ])
    }
  ])

  const ended = await callToolForData(token, 'end_meeting', {meetingId: meeting.id})
  expect(ended.endMeeting.meeting).toMatchObject({id: meeting.id, endedAt: expect.any(String)})
})

test('answer_standup keeps a table, which the standup editor shows, and turns a callout it cannot show into paragraphs', async () => {
  const {token, meeting} = await startStandupWithTemplate(STANDUP_PROMPTS)
  const promptId = meeting.prompts[0].id as string
  await callToolForData(token, 'answer_standup', {
    meetingId: meeting.id,
    answers: [
      {
        promptId,
        content:
          '> [!NOTE] Heads up\n> Deploys are slow\n\n| Who | Did |\n| - | - |\n| Ana | Shipped |'
      }
    ]
  })
  expect(await getStoredBlocks(meeting.id, promptId)).toEqual([
    {type: 'paragraph', content: [{type: 'text', text: 'Heads up'}]},
    {type: 'paragraph', content: [{type: 'text', text: 'Deploys are slow'}]},
    expect.objectContaining({type: 'table'})
  ])
})

test('answer_standup refuses a prompt answered twice, and a meeting on a team the caller is not on', async () => {
  const {token, meeting} = await startStandupWithTemplate(STANDUP_PROMPTS)
  const promptId = meeting.prompts[0].id as string
  const twice = await callTool(token, 'answer_standup', {
    meetingId: meeting.id,
    answers: [
      {promptId, content: 'Shipped it'},
      {promptId, content: 'Shipped it again'}
    ]
  })
  expect(expectToolErrorCode(twice, 'BAD_USER_INPUT')).toContain('Answer each prompt once')

  const outsider = await createPersonalAccessToken(STANDUP_SCOPES)
  const refused = await callTool(outsider, 'answer_standup', {
    meetingId: meeting.id,
    answers: [{promptId, content: 'Not my team'}]
  })
  expectToolErrorCode(refused, 'FORBIDDEN')
  const {viewer} = await callToolForData(token, 'get_standup', {meetingId: meeting.id})
  expect(getStages<{responses: unknown[]}>(viewer.meeting)[0]!.responses).toEqual([])
})

test('create_standup_template refuses a name another standup template on the team has, and a sixth prompt', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(STANDUP_SCOPES, {cookie})
  await callToolForData(token, 'create_standup_template', {
    teamId,
    name: 'Agent Standup',
    prompts: STANDUP_PROMPTS
  })
  const duplicate = await callTool(token, 'create_standup_template', {
    teamId,
    name: 'Agent Standup',
    prompts: STANDUP_PROMPTS
  })
  expect(expectToolErrorCode(duplicate, 'CONFLICT')).toContain(
    'standup template named "Agent Standup"'
  )
  const tooMany = await callTool(token, 'create_standup_template', {
    teamId,
    name: 'Six Prompts',
    prompts: Array.from({length: 6}, (_, idx) => ({question: `Prompt ${idx + 1}`}))
  })
  expectToolErrorCode(tooMany, 'BAD_USER_INPUT')
})

test('start_standup with a first meeting days away only schedules the series', async () => {
  const {cookie, teamId} = await signUp()
  const token = await createPersonalAccessToken(MEETING_SCOPES, {cookie})
  const started = await callToolForData(token, 'start_standup', {
    teamId,
    name: 'Agent Sync',
    rrule: weeklyRrule(dayjs().utc().add(2, 'day').startOf('hour'))
  })
  expect(started.startTeamPrompt).toEqual({
    meeting: null,
    meetingSeries: {id: expect.any(String), title: 'Agent Sync'}
  })
})

test("a standup template with five described prompts, and a standup run with it, fit a starter user's query budget", async () => {
  const prompts = Array.from({length: 5}, (_, idx) => ({
    question: `Prompt ${idx + 1}`,
    description: `What prompt ${idx + 1} is for`
  }))
  const {token, meeting} = await startStandupWithTemplate(prompts)
  await callToolForData(token, 'answer_standup', {
    meetingId: meeting.id,
    answers: meeting.prompts.map(({id}: {id: string}) => ({
      promptId: id,
      content: 'Shipped:\n\n- the **billing** fix\n- the login page'
    }))
  })
  await callToolForData(token, 'get_standup', {meetingId: meeting.id})
  await callToolForData(token, 'end_meeting', {meetingId: meeting.id})
})

const TEAM_HEALTH_SCOPES = [...MEETING_SCOPES, 'TEMPLATES_WRITE']

const TEMPLATE_QUESTIONS = [
  {question: 'When we say we will do something, we do it', category: 'Dependability'},
  {question: 'I can admit a mistake on this team', category: 'Psychological Safety'},
  {question: 'Our retros change how we work', category: 'Agent Rituals'}
]

type TeamHealthResultStage = {
  question: {id: string}
  score: number | null
  respondentCount: number | null
  spreadScores: number[] | null
  responses: {commentParaphrased: string | null; commentAuthor: {preferredName: string} | null}[]
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
  return {
    ...teammate,
    token: await createPersonalAccessToken(MEETING_SCOPES, {cookie: teammate.cookie})
  }
}

const isSpectating = async (meetingId: string, userId: string) => {
  const member = await getKysely()
    .selectFrom('MeetingMember')
    .select('isSpectating')
    .where('id', '=', MeetingMemberId.join(meetingId, userId))
    .executeTakeFirstOrThrow()
  return member.isSpectating
}

const startAristotleCheck = async () => {
  const owner = await signUp()
  await turnOffAI(owner.orgId)
  const token = await createPersonalAccessToken(MEETING_SCOPES, {cookie: owner.cookie})
  const started = await callToolForData(token, 'start_team_health', {
    teamId: owner.teamId,
    templateId: 'googleProjectAristotleTemplate'
  })
  const meeting = started.startTeamHealth.meetings[0]
  const questions = getStages<{question: {id: string; question: string}}>(meeting).map(
    ({question}) => question
  )
  return {...owner, token, meetingId: meeting.id as string, questions}
}

test('an agent builds a team health template, and four teammates answer a check made with it', async () => {
  const owner = await signUp()
  await turnOffAI(owner.orgId)
  const token = await createPersonalAccessToken(TEAM_HEALTH_SCOPES, {cookie: owner.cookie})
  const {template} = await callToolForData(token, 'create_team_health_template', {
    teamId: owner.teamId,
    name: 'Agent Health',
    questions: TEMPLATE_QUESTIONS
  })
  expect(template).toEqual({
    id: expect.any(String),
    name: 'Agent Health',
    questions: TEMPLATE_QUESTIONS.map(({question, category}) => ({
      id: expect.any(String),
      question,
      category
    }))
  })
  const started = await callToolForData(token, 'start_team_health', {
    teamId: owner.teamId,
    templateId: template.id
  })
  const meeting = started.startTeamHealth.meetings[0]
  const meetingId = meeting.id as string
  const questions = template.questions.map(({id, question}: {id: string; question: string}) => ({
    id,
    question
  }))
  expect(getStages(meeting)).toEqual(
    expect.arrayContaining(questions.map((question: unknown) => ({question})))
  )
  expect(getStages(meeting)).toHaveLength(questions.length)
  const [kept, safety, rituals] = questions
  const [first, second, third] = await Promise.all([
    addTeammate(owner.teamId),
    addTeammate(owner.teamId),
    addTeammate(owner.teamId)
  ])

  const answered = await callToolForData(token, 'answer_team_health', {
    meetingId,
    answers: [
      {questionId: kept.id, score: 5},
      {questionId: safety.id, score: 4},
      {questionId: rituals.id, score: 2, comment: 'Retros feel rushed', isAnonymous: false}
    ]
  })
  expect(answered).toEqual({
    setTeamHealthResponse: {meeting: {id: meetingId, respondentCount: 1, isViewerComplete: true}}
  })
  await callToolForData(first.token, 'answer_team_health', {
    meetingId,
    answers: [
      {questionId: kept.id, score: 4},
      {questionId: safety.id, score: 2}
    ]
  })
  await callToolForData(second.token, 'answer_team_health', {
    meetingId,
    answers: [
      {questionId: kept.id, score: 3},
      {questionId: safety.id, score: 3},
      {questionId: rituals.id, score: null, comment: 'We need more time to prepare'}
    ]
  })
  await callToolForData(third.token, 'answer_team_health', {
    meetingId,
    answers: [
      {questionId: kept.id, score: 2},
      {questionId: safety.id, score: null},
      {questionId: rituals.id, score: 4}
    ]
  })

  const inProgress = await callToolForData(first.token, 'get_team_health_meeting', {meetingId})
  expect(inProgress.viewer.meeting.respondentCount).toBe(4)
  expect(getStages(inProgress.viewer.meeting)).toEqual(
    questions.map(() =>
      expect.objectContaining({
        score: null,
        respondentCount: null,
        spreadScores: null,
        responses: []
      })
    )
  )

  await callToolForData(token, 'end_meeting', {meetingId})
  const {viewer} = await callToolForData(second.token, 'get_team_health_meeting', {meetingId})
  const stages = getStages<TeamHealthResultStage>(viewer.meeting)
  const stageFor = (questionId: string) => stages.find(({question}) => question.id === questionId)!
  expect(stageFor(kept.id)).toMatchObject({score: 3.5, respondentCount: 4, summary: null})
  expect(stageFor(kept.id).spreadScores!.sort()).toEqual([2, 3, 4, 5])
  expect(stageFor(safety.id)).toMatchObject({score: 3, respondentCount: 3, spreadScores: null})
  const ritualsStage = stageFor(rituals.id)
  expect(ritualsStage).toMatchObject({score: null, respondentCount: 2, spreadScores: null})
  expect(ritualsStage.responses).toEqual(
    expect.arrayContaining([
      {
        commentParaphrased: 'Retros feel rushed',
        commentAuthor: {preferredName: await getPreferredName(owner.cookie)}
      }
    ])
  )
  expect(JSON.stringify(ritualsStage)).not.toContain('more time')
}, 60000)

test('answer_team_health opts in a team lead who sits checks out, but not on a call it refuses', async () => {
  const {userId, token, meetingId, questions} = await startAristotleCheck()
  expect(await isSpectating(meetingId, userId)).toBe(true)
  const refused = await callTool(token, 'answer_team_health', {
    meetingId,
    answers: [{questionId: 'not-a-question', score: 3}]
  })
  expect(expectToolErrorCode(refused, 'BAD_USER_INPUT')).toContain('not-a-question')
  expect(await isSpectating(meetingId, userId)).toBe(true)

  const answered = await callToolForData(token, 'answer_team_health', {
    meetingId,
    answers: [{questionId: questions[0]!.id, score: 4}]
  })
  expect(answered.setTeamHealthResponse.meeting).toEqual({
    id: meetingId,
    respondentCount: 1,
    isViewerComplete: false
  })
  expect(await isSpectating(meetingId, userId)).toBe(false)
})

test('answer_team_health refuses a meeting that is not a team health check, and one on a team the caller is not on', async () => {
  const {teamId, token, meetingId, questions} = await startAristotleCheck()
  const standup = await callToolForData(token, 'start_standup', {teamId})
  const notTeamHealth = await callTool(token, 'answer_team_health', {
    meetingId: standup.startTeamPrompt.meeting.id,
    answers: [{questionId: questions[0]!.id, score: 4}]
  })
  expectToolErrorCode(notTeamHealth, 'BAD_USER_INPUT')

  const outsider = await createPersonalAccessToken(MEETING_SCOPES)
  const refused = await callTool(outsider, 'answer_team_health', {
    meetingId,
    answers: [{questionId: questions[0]!.id, score: 1}]
  })
  expectToolErrorCode(refused, 'FORBIDDEN')
  const responses = await getKysely()
    .selectFrom('TeamHealthResponse')
    .select('id')
    .where('meetingId', '=', meetingId)
    .execute()
  expect(responses).toEqual([])
})

test('create_team_health_template needs only templates:write and refuses a name another team health template on the team has', async () => {
  const {cookie, teamId, orgId, userId} = await signUp()
  await turnOffAI(orgId)
  const token = await createPersonalAccessToken(['TEMPLATES_WRITE'], {cookie})
  const {template} = await callToolForData(token, 'create_team_health_template', {
    teamId,
    name: 'Agent Health',
    questions: [{question: 'I know what is expected of me'}]
  })
  expect(template.questions).toEqual([
    {
      id: expect.any(String),
      question: 'I know what is expected of me',
      category: 'Psychological Safety'
    }
  ])

  const duplicate = await callTool(token, 'create_team_health_template', {
    teamId,
    name: 'Agent Health',
    questions: [{question: 'Our goals are clear', category: 'Structure & Clarity'}]
  })
  expectToolErrorCode(duplicate, 'CONFLICT')
  const [error] = JSON.parse(duplicate.content[0]!.text)
  expect(error.unfinishedTemplateId).toEqual(expect.any(String))
  expect(error.unfinishedTemplateId).not.toBe(template.id)
  const questions = await getKysely()
    .selectFrom('TeamHealthQuestion')
    .select('question')
    .where('createdBy', '=', userId)
    .where('removedAt', 'is', null)
    .execute()
  expect(questions).toEqual([{question: 'I know what is expected of me'}])
})
