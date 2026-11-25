import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import getKysely from '../postgres/getKysely'
import getRedis from '../utils/getRedis'
import {
  addTeammate,
  callTool,
  callToolForData,
  createPersonalAccessToken,
  expectToolErrorCode,
  getChargedCost,
  isSpectating,
  signUpWithoutAI,
  waitForSummaryText
} from './mcpClient'

afterAll(async () => {
  await getRedis().quit()
})

const POKER_SCOPES = ['USERS_READ', 'MEETINGS_READ', 'MEETINGS_WRITE', 'TASKS_READ', 'TASKS_WRITE']
const FIBONACCI_LABELS = ['1', '2', '3', '5', '8', '13', '21', '34', '?', 'Pass']

const COPY_SCALE = `
  mutation CopyScale($parentScaleId: ID!, $teamId: ID!) {
    addPokerTemplateScale(parentScaleId: $parentScaleId, teamId: $teamId) {
      scale {
        id
        values {
          label
          color
        }
      }
    }
  }
`

const UPDATE_SCALE_VALUE = `
  mutation UpdateScaleValue(
    $scaleId: ID!
    $oldScaleValue: TemplateScaleInput!
    $newScaleValue: TemplateScaleInput!
  ) {
    updatePokerTemplateScaleValue(
      scaleId: $scaleId
      oldScaleValue: $oldScaleValue
      newScaleValue: $newScaleValue
    ) {
      scale {
        values {
          label
          color
        }
      }
    }
  }
`

type NewStage = {
  id: string
  taskId: string
  discussionId: string
  dimensionRef: {name: string; scale: {values: {label: string}[]}}
}

const getStages = <Stage>(meeting: {phases: {stages?: Stage[]}[]}) =>
  meeting.phases.flatMap(({stages}) => stages ?? [])

const getPreferredName = async (userId: string) => {
  const {preferredName} = await getKysely()
    .selectFrom('User')
    .select('preferredName')
    .where('id', '=', userId)
    .executeTakeFirstOrThrow()
  return preferredName
}

const createTasks = async (token: string, teamId: string, contents: string[]) => {
  const taskIds: string[] = []
  for (const content of contents) {
    const created = await callToolForData(token, 'create_task', {teamId, content})
    taskIds.push(created.createTask.task.id)
  }
  return taskIds
}

const startPoker = async (scopes = POKER_SCOPES) => {
  const owner = await signUpWithoutAI()
  const token = await createPersonalAccessToken(scopes, {cookie: owner.cookie})
  const started = await callToolForData(token, 'start_sprint_poker', {teamId: owner.teamId})
  return {...owner, token, meetingId: started.startSprintPoker.meeting.id as string}
}

const startPokerWithStory = async () => {
  const owner = await startPoker()
  const taskIds = await createTasks(owner.token, owner.teamId, ['Build the login page'])
  const added = await callToolForData(owner.token, 'add_poker_stories', {
    meetingId: owner.meetingId,
    taskIds
  })
  const [stage]: NewStage[] = added.updatePokerScope.newStages
  return {...owner, taskId: taskIds[0]!, stageId: stage!.id}
}

test('a value on a copy of a built-in scale can be renamed and keep its colour, but not take another colour off the palette', async () => {
  const {cookie, teamId} = await signUpWithoutAI()
  const token = await createPersonalAccessToken(['TEMPLATES_WRITE'], {cookie})
  const copied = await callToolForData(token, 'graphql_mutate', {
    query: COPY_SCALE,
    variables: {parentScaleId: 'tshirtSizeScale', teamId}
  })
  const {id: scaleId, values} = copied.addPokerTemplateScale.scale
  const extraSmall = values.find(({label}: {label: string}) => label === 'XS')
  expect(extraSmall).toEqual({label: 'XS', color: '#5CA0E5'})

  const renamed = await callToolForData(token, 'graphql_mutate', {
    query: UPDATE_SCALE_VALUE,
    variables: {
      scaleId,
      oldScaleValue: extraSmall,
      newScaleValue: {label: 'XXS', color: '#5ca0e5'}
    }
  })
  expect(renamed.updatePokerTemplateScaleValue.scale.values[0]).toEqual({
    label: 'XXS',
    color: '#5CA0E5'
  })

  const recoloured = await callTool(token, 'graphql_mutate', {
    query: UPDATE_SCALE_VALUE,
    variables: {
      scaleId,
      oldScaleValue: {label: 'XXS', color: '#5CA0E5'},
      newScaleValue: {label: 'XXS', color: '#45E595'}
    }
  })
  expect(expectToolErrorCode(recoloured, 'BAD_USER_INPUT')).toBe(
    'Invalid scale color. Use one of the hex values the pokerScaleColors query returns'
  )
})

test('two teammates vote on stories an agent added, the facilitator reveals and scores one, and the summary counts both stories', async () => {
  const {token, teamId, userId, meetingId} = await startPoker()
  const teammate = await addTeammate(teamId, POKER_SCOPES)
  const taskIds = await createTasks(token, teamId, ['Build the login page', 'Add password reset'])

  const added = await callToolForData(token, 'add_poker_stories', {meetingId, taskIds})
  expect(added).toEqual({
    updatePokerScope: {
      newStages: taskIds.map((taskId) => ({
        id: expect.any(String),
        taskId,
        discussionId: expect.any(String),
        dimensionRef: {
          name: 'Story Points',
          scale: {values: FIBONACCI_LABELS.map((label) => ({label}))}
        }
      }))
    }
  })
  const [loginStage, resetStage]: NewStage[] = added.updatePokerScope.newStages
  const stageId = loginStage!.id

  const voted = await callToolForData(token, 'vote_poker_story', {meetingId, stageId, label: '5'})
  expect(voted).toEqual({voteForPokerStory: {stage: {id: stageId}}})
  await callToolForData(teammate.token, 'vote_poker_story', {meetingId, stageId, label: '8'})

  const notFacilitator = await callTool(teammate.token, 'reveal_poker_votes', {meetingId, stageId})
  expectToolErrorCode(notFacilitator, 'FORBIDDEN')
  const revealed = await callToolForData(token, 'reveal_poker_votes', {meetingId, stageId})
  expect(revealed).toEqual({
    pokerRevealVotes: {
      stage: {
        id: stageId,
        isVoting: false,
        scores: [
          {userId, label: '5'},
          {userId: teammate.userId, label: '8'}
        ]
      }
    }
  })
  await callToolForData(teammate.token, 'vote_poker_story', {meetingId, stageId, label: '13'})

  const scored = await callToolForData(token, 'set_poker_final_score', {
    meetingId,
    taskId: loginStage!.taskId,
    dimensionName: 'Story Points',
    finalScore: '8'
  })
  expect(scored).toEqual({setTaskEstimate: {stage: {id: stageId, finalScore: '8'}}})

  const {viewer} = await callToolForData(token, 'get_poker_meeting', {meetingId, showVotes: true})
  expect(getStages(viewer.meeting)).toEqual([
    {
      id: stageId,
      discussionId: loginStage!.discussionId,
      isVoting: false,
      finalScore: '8',
      dimensionRef: {name: 'Story Points'},
      taskId: taskIds[0],
      task: {plaintextContent: 'Build the login page'},
      scores: [
        {userId, label: '5', user: {preferredName: await getPreferredName(userId)}},
        {
          userId: teammate.userId,
          label: '13',
          user: {preferredName: await getPreferredName(teammate.userId)}
        }
      ]
    },
    {
      id: resetStage!.id,
      discussionId: resetStage!.discussionId,
      isVoting: true,
      finalScore: null,
      dimensionRef: {name: 'Story Points'},
      taskId: taskIds[1],
      task: {plaintextContent: 'Add password reset'},
      scores: []
    }
  ])

  await callToolForData(token, 'end_meeting', {meetingId})
  expect(await waitForSummaryText(meetingId, '2 Stories')).toContain('2 Stories - 2 Participants')
})

test('vote_poker_story opts in a teammate who sits votes out, refuses a label the scale lacks by naming the labels it takes, and takes a vote back', async () => {
  const {teamId, meetingId, stageId} = await startPokerWithStory()
  const teammate = await addTeammate(teamId, POKER_SCOPES)
  await getKysely()
    .updateTable('TeamMember')
    .set({isSpectatingPoker: true})
    .where('id', '=', TeamMemberId.join(teamId, teammate.userId))
    .execute()

  const refused = await callTool(teammate.token, 'vote_poker_story', {
    meetingId,
    stageId,
    label: 'XL'
  })
  expect(expectToolErrorCode(refused, 'BAD_USER_INPUT')).toBe(
    'Score does not exist in scale. Vote one of: 1, 2, 3, 5, 8, 13, 21, 34, ?, Pass'
  )

  await callToolForData(teammate.token, 'vote_poker_story', {meetingId, stageId, label: '3'})
  expect(await isSpectating(meetingId, teammate.userId)).toBe(false)
  const teamMember = await getKysely()
    .selectFrom('TeamMember')
    .select('isSpectatingPoker')
    .where('id', '=', TeamMemberId.join(teamId, teammate.userId))
    .executeTakeFirstOrThrow()
  expect(teamMember.isSpectatingPoker).toBe(false)
  const voted = await callToolForData(teammate.token, 'get_poker_meeting', {meetingId})
  expect(getStages<{scores: {userId: string}[]}>(voted.viewer.meeting)[0]!.scores).toEqual([
    {userId: teammate.userId}
  ])

  await callToolForData(teammate.token, 'vote_poker_story', {meetingId, stageId, label: null})
  const unvoted = await callToolForData(teammate.token, 'get_poker_meeting', {meetingId})
  expect(getStages<{scores: {userId: string}[]}>(unvoted.viewer.meeting)[0]!.scores).toEqual([])
})

test('add_poker_stories skips a task already in the meeting or on another team, and refuses tasks all on another team', async () => {
  const {token, teamId, meetingId, taskId} = await startPokerWithStory()
  const outsider = await signUpWithoutAI()
  const outsiderToken = await createPersonalAccessToken(POKER_SCOPES, {cookie: outsider.cookie})
  const [otherTeamTaskId] = await createTasks(outsiderToken, outsider.teamId, ['Not ours'])
  const [newTaskId] = await createTasks(token, teamId, ['Add password reset'])

  const added = await callToolForData(token, 'add_poker_stories', {
    meetingId,
    taskIds: [taskId, otherTeamTaskId, newTaskId]
  })
  expect(added.updatePokerScope.newStages.map((stage: NewStage) => stage.taskId)).toEqual([
    newTaskId
  ])
  expect(added.skippedTaskIds).toEqual([taskId, otherTeamTaskId])

  const refused = await callTool(token, 'add_poker_stories', {
    meetingId,
    taskIds: [otherTeamTaskId]
  })
  expect(expectToolErrorCode(refused, 'BAD_USER_INPUT')).toBe(
    "None of those tasks is on the meeting's team"
  )
})

test('set_poker_final_score refuses a dimension the meeting does not estimate and a score over 4 characters', async () => {
  const {token, meetingId, taskId} = await startPokerWithStory()
  const noDimension = await callTool(token, 'set_poker_final_score', {
    meetingId,
    taskId,
    dimensionName: 'Business Value',
    finalScore: '8'
  })
  expectToolErrorCode(noDimension, 'BAD_USER_INPUT')
  const tooLong = await callTool(token, 'set_poker_final_score', {
    meetingId,
    taskId,
    dimensionName: 'Story Points',
    finalScore: '12345'
  })
  expect(expectToolErrorCode(tooLong, 'BAD_USER_INPUT')).toBe('Estimate score is too long')
})

test("a sprint poker meeting an agent runs, and a teammate voting in it, fit a starter user's query budget", async () => {
  const owner = await signUpWithoutAI()
  const scopes = [...POKER_SCOPES, 'TEAMS_READ']
  const token = await createPersonalAccessToken(scopes, {cookie: owner.cookie})
  const teammate = await addTeammate(owner.teamId, scopes)
  const [ownerBefore, teammateBefore] = await Promise.all([
    getChargedCost(owner.userId),
    getChargedCost(teammate.userId)
  ])

  await callToolForData(token, 'get_me', {})
  const started = await callToolForData(token, 'start_sprint_poker', {teamId: owner.teamId})
  const meetingId = started.startSprintPoker.meeting.id as string
  const taskIds = await createTasks(token, owner.teamId, [
    'Build the login page',
    'Add password reset'
  ])
  const added = await callToolForData(token, 'add_poker_stories', {meetingId, taskIds})
  const [stage]: NewStage[] = added.updatePokerScope.newStages
  const stageId = stage!.id
  await callToolForData(token, 'vote_poker_story', {meetingId, stageId, label: '5'})

  await callToolForData(teammate.token, 'get_me', {})
  await callToolForData(teammate.token, 'list_meetings', {
    teamIds: [owner.teamId],
    before: new Date().toISOString()
  })
  await callToolForData(teammate.token, 'get_poker_meeting', {meetingId})
  await callToolForData(teammate.token, 'vote_poker_story', {meetingId, stageId, label: '8'})

  await callToolForData(token, 'reveal_poker_votes', {meetingId, stageId})
  await callToolForData(teammate.token, 'get_poker_meeting', {meetingId, showVotes: true})
  await callToolForData(token, 'set_poker_final_score', {
    meetingId,
    taskId: stage!.taskId,
    dimensionName: stage!.dimensionRef.name,
    finalScore: '8'
  })
  await callToolForData(token, 'get_poker_meeting', {meetingId, showVotes: true})
  await callToolForData(token, 'end_meeting', {meetingId})

  const [ownerCost, teammateCost] = await Promise.all([
    getChargedCost(owner.userId),
    getChargedCost(teammate.userId)
  ])
  expect(ownerCost - ownerBefore).toBeLessThanOrEqual(500)
  expect(teammateCost - teammateBefore).toBeLessThanOrEqual(500)
})
