import dayjs from 'dayjs'
import {toDateTime} from 'parabol-client/shared/rruleUtil'
import getRedis from '../utils/getRedis'
import {sendPublic, signUp} from './common'
import {callTool, callToolForData, createPersonalAccessToken} from './mcpClient'

afterAll(async () => {
  await getRedis().quit()
})

const READ_SCOPES = ['USERS_READ', 'MEETINGS_READ', 'TASKS_READ']
const MEETING_SCOPES = [...READ_SCOPES, 'MEETINGS_WRITE']

const WEEKDAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
const immediateRrule = () => {
  const start = dayjs().utc().add(5, 'second')
  return `DTSTART;TZID=UTC:${toDateTime(start, 'UTC')}
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=${WEEKDAY_CODES[start.day()]}`
}

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
