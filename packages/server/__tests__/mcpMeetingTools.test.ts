import dayjs from 'dayjs'
import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {toDateTime} from 'parabol-client/shared/rruleUtil'
import getKysely from '../postgres/getKysely'
import getRedis from '../utils/getRedis'
import {sendPublic} from './common'
import {
  addTeammate,
  callTool,
  callToolForData,
  createPersonalAccessToken,
  expectToolErrorCode,
  getChargedCost,
  isSpectating,
  leaveHourlyQueryBudget,
  signUpWithoutAI,
  waitForSummaryText
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

const DELETE_COMMENT = `
  mutation DeleteComment($commentId: ID!, $meetingId: ID!) {
    deleteComment(commentId: $commentId, meetingId: $meetingId) {
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
  const {cookie, teamId, userId} = await signUpWithoutAI()
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
  const {cookie, teamId, userId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken([...READ_SCOPES, 'COMMENTS_READ'], {cookie})
  const silent = await addTeammate(teamId, READ_SCOPES)
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
  const preferredName = await getPreferredName(cookie)
  const stages = getStages<{discussionId: string; teamMember: {userId: string}}>(viewer.meeting)
  expect(stages).toHaveLength(2)
  expect(stages).toEqual(
    expect.arrayContaining([
      {
        discussionId: expect.any(String),
        teamMember: {userId, user: {preferredName}},
        responses: [{promptId: prompt.id, plaintextContent: 'Shipped the billing fix'}]
      },
      {
        discussionId: expect.any(String),
        teamMember: {
          userId: silent.userId,
          user: {preferredName: await getPreferredName(silent.cookie)}
        },
        responses: []
      }
    ])
  )
  expect(viewer.meeting.tasks).toEqual([
    expect.objectContaining({id: created.createTask.task.id, plaintextContent: 'Write notes'})
  ])

  const {discussionId} = stages.find(({teamMember}) => teamMember.userId === userId)!
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
  const {cookie, teamId} = await signUpWithoutAI()
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
  expect(viewer.meeting).toMatchObject({id: meetingId})
  expect(JSON.stringify(viewer.meeting.phases)).not.toContain('{}')
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
  const {cookie, teamId} = await signUpWithoutAI()
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
      __typename: 'Comment',
      id: commented.addComment.comment.id,
      createdByUser: {preferredName},
      plaintextContent: 'Looks like a 3'
    },
    {
      __typename: 'Task',
      id: created.createTask.task.id,
      createdByUser: {preferredName},
      plaintextContent: 'Split the story',
      status: 'active',
      userId
    }
  ])

  const doomed = await send(
    ADD_COMMENT,
    {comment: {content: paragraph('Wrong story'), discussionId, threadSortOrder: 2}},
    cookie
  )
  const doomedId = doomed.addComment.comment.id as string
  await send(
    ADD_COMMENT,
    {comment: {content: paragraph('Agreed'), discussionId, threadParentId: doomedId}},
    cookie
  )
  await send(DELETE_COMMENT, {commentId: doomedId, meetingId}, cookie)
  const after = await callToolForData(commentsToken, 'get_discussion', {discussionId})
  expect(after.viewer.discussion.thread.edges.at(-1).node).toEqual({
    __typename: 'Comment',
    id: doomedId,
    createdByUser: null,
    plaintextContent: '[deleted]'
  })
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
  const {cookie, teamId} = await signUpWithoutAI()
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
  const {cookie, teamId} = await signUpWithoutAI()
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
  const {cookie, teamId} = await signUpWithoutAI()
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
  const {cookie, teamId, userId} = await signUpWithoutAI()
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
    scope: 'ORGANIZATION',
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
      {
        id: expect.any(String),
        promptId: shipped.id,
        content: 'Two things:\n\n- the **billing** fix\n- the login page',
        sharedAt: expect.any(String)
      },
      {
        id: expect.any(String),
        promptId: blocked.id,
        content: 'Nothing',
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
      teamMember: {userId, user: {preferredName}},
      responses: expect.arrayContaining([
        {promptId: shipped.id, plaintextContent: expect.stringContaining('the billing fix')},
        {promptId: blocked.id, plaintextContent: 'Nothing'}
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
  const {cookie, teamId} = await signUpWithoutAI()
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
  const {cookie, teamId} = await signUpWithoutAI()
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
  const {cookie, teamId, userId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(STANDUP_SCOPES, {cookie})
  const before = await getChargedCost(userId)

  await callToolForData(token, 'get_me', {})
  const {template} = await callToolForData(token, 'create_standup_template', {
    teamId,
    name: 'Agent Standup',
    prompts
  })
  await callToolForData(token, 'select_template', {templateId: template.id, teamId})
  const started = await callToolForData(token, 'start_standup', {teamId})
  const {meeting} = started.startTeamPrompt
  await callToolForData(token, 'answer_standup', {
    meetingId: meeting.id,
    answers: meeting.prompts.map(({id}: {id: string}) => ({
      promptId: id,
      content: 'Shipped:\n\n- the **billing** fix\n- the login page'
    }))
  })
  await callToolForData(token, 'get_standup', {meetingId: meeting.id})
  await callToolForData(token, 'end_meeting', {meetingId: meeting.id})
  expect((await getChargedCost(userId)) - before).toBeLessThanOrEqual(500)
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

const startAristotleCheck = async () => {
  const owner = await signUpWithoutAI()
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
  const owner = await signUpWithoutAI()
  const token = await createPersonalAccessToken(TEAM_HEALTH_SCOPES, {cookie: owner.cookie})
  const {template} = await callToolForData(token, 'create_team_health_template', {
    teamId: owner.teamId,
    name: 'Agent Health',
    questions: TEMPLATE_QUESTIONS
  })
  expect(template).toEqual({
    id: expect.any(String),
    name: 'Agent Health',
    scope: 'ORGANIZATION',
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
    addTeammate(owner.teamId, MEETING_SCOPES),
    addTeammate(owner.teamId, MEETING_SCOPES),
    addTeammate(owner.teamId, MEETING_SCOPES)
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
  const anonymous = await callToolForData(second.token, 'answer_team_health', {
    meetingId,
    answers: [
      {questionId: kept.id, score: 3},
      {questionId: safety.id, score: 3},
      {questionId: rituals.id, score: null, comment: 'We need more time to prepare'}
    ]
  })
  expect(anonymous.setTeamHealthResponse.meeting).toMatchObject({isViewerComplete: true})
  expect(anonymous.note).toContain(`but not the comment on question ${rituals.id}`)
  expect(anonymous.note).toContain('isAnonymous false')
  const storedComments = await getKysely()
    .selectFrom('TeamHealthResponse')
    .select('comment')
    .where('meetingId', '=', meetingId)
    .where('userId', '=', second.userId)
    .execute()
  expect(storedComments).toEqual([{comment: null}, {comment: null}, {comment: null}])
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

test('answer_standup on a team health check refuses and leaves a lead who sits checks out spectating', async () => {
  const {userId, token, meetingId, questions} = await startAristotleCheck()
  const refused = await callTool(token, 'answer_standup', {
    meetingId,
    answers: [{promptId: questions[0]!.id, content: 'Fine'}]
  })
  expect(refused.isError).toBe(true)
  expect(await isSpectating(meetingId, userId)).toBe(true)
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

test('answer_team_health refuses a check that has ended, from a member and from a teammate who never joined', async () => {
  const {teamId, token, meetingId, questions} = await startAristotleCheck()
  const questionId = questions[0]!.id
  await callToolForData(token, 'answer_team_health', {meetingId, answers: [{questionId, score: 4}]})
  const latecomer = await addTeammate(teamId, MEETING_SCOPES)
  await callToolForData(token, 'end_meeting', {meetingId})

  const member = await callTool(token, 'answer_team_health', {
    meetingId,
    answers: [{questionId, score: 1}]
  })
  expect(expectToolErrorCode(member, 'CONFLICT')).toBe('Meeting has ended')
  const neverJoined = await callTool(latecomer.token, 'answer_team_health', {
    meetingId,
    answers: [{questionId, score: 1}]
  })
  expect(expectToolErrorCode(neverJoined, 'CONFLICT')).toBe('Meeting has already ended')
  const scores = await getKysely()
    .selectFrom('TeamHealthResponse')
    .select('score')
    .where('meetingId', '=', meetingId)
    .execute()
  expect(scores).toEqual([{score: 4}])
})

test('create_team_health_template names the questions it could not delete when a step fails part way', async () => {
  const {userId, cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(['TEMPLATES_WRITE'], {cookie})
  const before = await getChargedCost(userId)
  await callToolForData(token, 'create_team_health_template', {
    teamId,
    name: 'First Health',
    questions: [{question: 'Our goals are clear'}]
  })
  const oneQuestionCost = (await getChargedCost(userId)) - before
  await leaveHourlyQueryBudget(userId, oneQuestionCost - 1)

  const result = await callTool(token, 'create_team_health_template', {
    teamId,
    name: 'Second Health',
    questions: [
      {question: 'I know what is expected of me'},
      {question: 'Everyone pulls their weight'}
    ]
  })
  expectToolErrorCode(result, 'TOO_MANY_REQUESTS')
  const [error] = JSON.parse(result.content[0]!.text)
  expect(error).toMatchObject({
    unfinishedTemplateId: expect.any(String),
    unfinishedQuestionIds: [expect.any(String)]
  })
  const questions = await getKysely()
    .selectFrom('TeamHealthQuestion')
    .select('question')
    .where('createdBy', '=', userId)
    .where('removedAt', 'is', null)
    .orderBy('id')
    .execute()
  expect(questions).toEqual([
    {question: 'Our goals are clear'},
    {question: 'I know what is expected of me'}
  ])
})

test('create_team_health_template needs only templates:write and refuses a name another team health template on the team has', async () => {
  const {cookie, teamId, userId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(['TEMPLATES_WRITE'], {cookie})
  const {template} = await callToolForData(token, 'create_team_health_template', {
    teamId,
    name: 'Agent Health',
    questions: [{question: 'I know what is expected of me'}]
  })
  expect(template.scope).toBe('ORGANIZATION')
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

const COMMENT_SCOPES = [...MEETING_SCOPES, 'COMMENTS_READ', 'COMMENTS_WRITE']

const START_RETROSPECTIVE = `
  mutation StartRetrospective($teamId: ID!) {
    startRetrospective(teamId: $teamId) {
      meeting {
        id
        phases {
          ... on ReflectPhase {
            reflectPrompts {
              id
            }
          }
        }
      }
    }
  }
`

const CREATE_REFLECTION = `
  mutation CreateReflection($input: CreateReflectionInput!) {
    createReflection(input: $input) {
      reflection {
        reflectionGroupId
      }
    }
  }
`

const ADD_AGENDA_ITEM = `
  mutation AddAgendaItem($newAgendaItem: CreateAgendaItemInput!) {
    addAgendaItem(newAgendaItem: $newAgendaItem) {
      agendaItem {
        id
      }
    }
  }
`

const openFirstRetroTopic = async (
  meetingId: string,
  teamId: string,
  reflectionGroupId: string
) => {
  const pg = getKysely()
  const meeting = await pg
    .selectFrom('NewMeeting')
    .select('phases')
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()
  const phases = meeting.phases as {phaseType: string; stages: Record<string, unknown>[]}[]
  const discussStage = phases.find(({phaseType}) => phaseType === 'discuss')!.stages[0]!
  discussStage.reflectionGroupId = reflectionGroupId
  const discussionId = discussStage.discussionId as string
  await pg
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(phases)})
    .where('id', '=', meetingId)
    .execute()
  await pg
    .insertInto('Discussion')
    .values({
      id: discussionId,
      meetingId,
      teamId,
      discussionTopicType: 'reflectionGroup',
      discussionTopicId: reflectionGroupId
    })
    .execute()
  return discussionId
}

const startCheckInWithAgendaItem = async () => {
  const owner = await signUpWithoutAI()
  const token = await createPersonalAccessToken(MEETING_SCOPES, {cookie: owner.cookie})
  const started = await callToolForData(token, 'start_check_in', {teamId: owner.teamId})
  const meetingId = started.startCheckIn.meeting.id as string
  await send(
    ADD_AGENDA_ITEM,
    {
      newAgendaItem: {
        content: 'Hiring plan',
        pinned: false,
        teamId: owner.teamId,
        teamMemberId: TeamMemberId.join(owner.teamId, owner.userId),
        meetingId
      }
    },
    owner.cookie
  )
  const {id: discussionId} = await getKysely()
    .selectFrom('Discussion')
    .select('id')
    .where('meetingId', '=', meetingId)
    .executeTakeFirstOrThrow()
  return {...owner, token, meetingId, discussionId}
}

const getDiscussionIds = (meeting: {phases: {stages?: {discussionId: string}[]}[]}) =>
  getStages(meeting).map(({discussionId}) => discussionId)

const getThreadIds = (discussion: {thread: {edges: {node: {id: string}}[]}}) =>
  discussion.thread.edges.map(({node}) => node.id)

const getSavedThread = async (discussionId: string) => {
  const pg = getKysely()
  const [comments, tasks] = await Promise.all([
    pg.selectFrom('Comment').select('id').where('discussionId', '=', discussionId).execute(),
    pg.selectFrom('Task').select('id').where('discussionId', '=', discussionId).execute()
  ])
  return [...comments, ...tasks]
}

test('list_discussions shows a placeholder topic until voting ends, then each retro topic’s discussion and title', async () => {
  const {cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(['USERS_READ', 'MEETINGS_READ'], {cookie})
  const started = await send(START_RETROSPECTIVE, {teamId}, cookie)
  const {id: meetingId, phases} = started.startRetrospective.meeting
  const before = await callToolForData(token, 'list_discussions', {meetingId})
  expect(getStages(before.viewer.meeting)).toEqual([
    {discussionId: expect.any(String), reflectionGroup: {title: 'Unknown'}}
  ])

  const [prompt] = phases.flatMap(
    ({reflectPrompts}: {reflectPrompts?: {id: string}[]}) => reflectPrompts ?? []
  )
  const created = await send(
    CREATE_REFLECTION,
    {input: {content: paragraph('Deploys are slow'), meetingId, promptId: prompt.id, sortOrder: 0}},
    cookie
  )
  const {reflectionGroupId} = created.createReflection.reflection
  const discussionId = await openFirstRetroTopic(meetingId, teamId, reflectionGroupId)
  const {title} = await getKysely()
    .selectFrom('RetroReflectionGroup')
    .select('title')
    .where('id', '=', reflectionGroupId)
    .executeTakeFirstOrThrow()
  expect(title).toEqual(expect.any(String))

  const after = await callToolForData(token, 'list_discussions', {meetingId})
  expect(after.viewer.meeting.id).toBe(meetingId)
  expect(getStages(after.viewer.meeting)).toEqual([{discussionId, reflectionGroup: {title}}])
})

test('add_comment joins a check-in and comments, at the end of the thread or as a reply, on an agenda item’s discussion from list_discussions', async () => {
  const owner = await startCheckInWithAgendaItem()
  const teammate = await addTeammate(owner.teamId, COMMENT_SCOPES)
  const {viewer} = await callToolForData(teammate.token, 'list_discussions', {
    meetingId: owner.meetingId
  })
  expect(getStages(viewer.meeting)).toEqual([
    {discussionId: owner.discussionId, agendaItem: {content: 'Hiring plan'}}
  ])
  const {discussionId} = owner
  const earlier = await send(
    ADD_COMMENT,
    {comment: {content: paragraph('We need a designer'), discussionId, threadSortOrder: 5}},
    owner.cookie
  )
  const earlierId = earlier.addComment.comment.id as string

  const added = await callToolForData(teammate.token, 'add_comment', {
    meetingId: owner.meetingId,
    discussionId,
    content: 'Agreed, **this quarter**'
  })
  expect(added).toEqual({
    addComment: {comment: {id: expect.any(String), content: 'Agreed, **this quarter**'}}
  })
  const reply = await callToolForData(teammate.token, 'add_comment', {
    meetingId: owner.meetingId,
    discussionId,
    content: 'The budget is approved',
    threadParentId: earlierId
  })

  const discussion = await callToolForData(teammate.token, 'get_discussion', {discussionId})
  expect(getThreadIds(discussion.viewer.discussion)).toEqual([
    earlierId,
    added.addComment.comment.id
  ])
  const storedReply = await getKysely()
    .selectFrom('Comment')
    .select(['threadParentId', 'threadSortOrder', 'plaintextContent'])
    .where('id', '=', reply.addComment.comment.id)
    .executeTakeFirstOrThrow()
  expect(storedReply).toEqual({
    threadParentId: earlierId,
    threadSortOrder: 1,
    plaintextContent: 'The budget is approved'
  })
})

test('add_comment puts a comment after a poll in the thread, as the web client does', async () => {
  const owner = await startCheckInWithAgendaItem()
  const {discussionId, meetingId, teamId, userId, cookie} = owner
  const token = await createPersonalAccessToken(['MEETINGS_WRITE', 'COMMENTS_WRITE'], {cookie})
  await getKysely()
    .insertInto('Poll')
    .values({createdById: userId, teamId, meetingId, discussionId, threadSortOrder: 9, title: 'Q?'})
    .execute()
  const added = await callToolForData(token, 'add_comment', {
    meetingId,
    discussionId,
    content: 'After the poll'
  })
  const stored = await getKysely()
    .selectFrom('Comment')
    .select('threadSortOrder')
    .where('id', '=', added.addComment.comment.id)
    .executeTakeFirstOrThrow()
  expect(stored.threadSortOrder).toBe(10)
})

test("finding a check-in discussion and commenting, or reading two meetings and commenting, fit a starter user's query budget", async () => {
  const owner = await startCheckInWithAgendaItem()
  const [finder, reader] = await Promise.all([
    addTeammate(owner.teamId, [...COMMENT_SCOPES, 'TEAMS_READ']),
    addTeammate(owner.teamId, [...COMMENT_SCOPES, 'TEAMS_READ'])
  ])
  const {meetingId} = owner
  const listMeetings = {teamIds: [owner.teamId], before: new Date().toISOString()}
  const [finderBefore, readerBefore] = await Promise.all([
    getChargedCost(finder.userId),
    getChargedCost(reader.userId)
  ])

  await callToolForData(finder.token, 'get_me', {})
  await callToolForData(finder.token, 'list_meetings', listMeetings)
  await callToolForData(finder.token, 'get_meeting', {meetingId})
  const {viewer} = await callToolForData(finder.token, 'list_discussions', {meetingId})
  const [discussionId] = getDiscussionIds(viewer.meeting)
  await callToolForData(finder.token, 'add_comment', {meetingId, discussionId, content: 'On it'})

  await callToolForData(reader.token, 'get_me', {})
  await callToolForData(reader.token, 'list_meetings', listMeetings)
  await callToolForData(reader.token, 'get_meeting', {meetingId})
  await callToolForData(reader.token, 'get_meeting', {meetingId})
  await callToolForData(reader.token, 'add_comment', {meetingId, discussionId, content: 'Me too'})

  expect((await getChargedCost(finder.userId)) - finderBefore).toBeLessThanOrEqual(500)
  expect((await getChargedCost(reader.userId)) - readerBefore).toBeLessThanOrEqual(500)
})

test('add_comment without comments:read saves the comment and returns only its id', async () => {
  const {cookie, meetingId, discussionId} = await startPokerWithStory()
  const writeOnly = await createPersonalAccessToken(['MEETINGS_WRITE', 'COMMENTS_WRITE'], {cookie})

  const added = await callToolForData(writeOnly, 'add_comment', {
    meetingId,
    discussionId,
    content: 'Looks like a 3'
  })
  expect(added).toEqual({addComment: {comment: {id: expect.any(String)}}})
  const stored = await getKysely()
    .selectFrom('Comment')
    .select(['discussionId', 'plaintextContent'])
    .where('id', '=', added.addComment.comment.id)
    .executeTakeFirstOrThrow()
  expect(stored).toEqual({discussionId, plaintextContent: 'Looks like a 3'})
})

test('add_comment and create_task refuse a discussion from another meeting, or a team the caller is not on, and save nothing', async () => {
  const owner = await startCheckInWithAgendaItem()
  const teammate = await addTeammate(owner.teamId, [...COMMENT_SCOPES, 'TASKS_WRITE'])
  const retrospective = await callToolForData(teammate.token, 'start_retrospective', {
    teamId: owner.teamId
  })
  const otherMeetingId = retrospective.startRetrospective.meeting.id as string
  const {discussionId} = owner

  const commented = await callTool(teammate.token, 'add_comment', {
    meetingId: otherMeetingId,
    discussionId,
    content: 'Wrong meeting'
  })
  expectToolErrorCode(commented, 'FORBIDDEN')
  const tasked = await callTool(teammate.token, 'create_task', {
    teamId: owner.teamId,
    meetingId: otherMeetingId,
    discussionId,
    content: 'Wrong meeting'
  })
  expect(expectToolErrorCode(tasked, 'BAD_USER_INPUT')).toContain('Discussion meetingId')
  const outsider = await createPersonalAccessToken([...COMMENT_SCOPES, 'TASKS_WRITE'])
  const offTeam = await callTool(outsider, 'add_comment', {
    meetingId: owner.meetingId,
    discussionId,
    content: 'Not my team'
  })
  expectToolErrorCode(offTeam, 'FORBIDDEN')

  expect(await getSavedThread(discussionId)).toEqual([])
  const joined = await getKysely()
    .selectFrom('MeetingMember')
    .select('id')
    .where('id', '=', MeetingMemberId.join(owner.meetingId, teammate.userId))
    .executeTakeFirst()
  expect(joined).toBeUndefined()
})

test('add_comment and create_task refuse a meeting that ended before the caller joined, and save nothing', async () => {
  const owner = await startCheckInWithAgendaItem()
  await callToolForData(owner.token, 'end_meeting', {meetingId: owner.meetingId})
  const teammate = await addTeammate(owner.teamId, [...COMMENT_SCOPES, 'TASKS_WRITE'])
  const {meetingId, discussionId} = owner

  const commented = await callTool(teammate.token, 'add_comment', {
    meetingId,
    discussionId,
    content: 'Too late'
  })
  expect(expectToolErrorCode(commented, 'CONFLICT')).toBe('Meeting has already ended')
  const tasked = await callTool(teammate.token, 'create_task', {
    teamId: owner.teamId,
    meetingId,
    discussionId,
    content: 'Too late'
  })
  expect(expectToolErrorCode(tasked, 'CONFLICT')).toBe('Meeting has already ended')
  expect(await getSavedThread(discussionId)).toEqual([])
})

test('create_task joins a meeting and puts the task at the end of a discussion and in the summary', async () => {
  const owner = await startCheckInWithAgendaItem()
  const {discussionId} = owner
  const earlier = await send(
    ADD_COMMENT,
    {comment: {content: paragraph('We need a designer'), discussionId, threadSortOrder: 5}},
    owner.cookie
  )
  const teammate = await addTeammate(owner.teamId, [...COMMENT_SCOPES, 'TASKS_WRITE'])
  const withoutMeeting = await callTool(teammate.token, 'create_task', {
    teamId: owner.teamId,
    discussionId,
    content: 'Post the designer role'
  })
  expectToolErrorCode(withoutMeeting, 'BAD_USER_INPUT')

  const created = await callToolForData(teammate.token, 'create_task', {
    teamId: owner.teamId,
    meetingId: owner.meetingId,
    discussionId,
    userId: teammate.userId,
    content: 'Post the **designer** role'
  })
  const taskId = created.createTask.task.id as string
  expect(created.createTask.task).toMatchObject({content: 'Post the **designer** role'})

  const discussion = await callToolForData(teammate.token, 'get_discussion', {discussionId})
  expect(getThreadIds(discussion.viewer.discussion)).toEqual([
    earlier.addComment.comment.id,
    taskId
  ])
  await callToolForData(owner.token, 'end_meeting', {meetingId: owner.meetingId})
  expect(await waitForSummaryText(owner.meetingId, 'Post the designer role')).toContain(
    'Post the designer role'
  )
}, 60000)
