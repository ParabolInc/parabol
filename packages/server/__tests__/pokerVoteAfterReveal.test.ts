import {sendPublic, signUp} from './common'

const START_SPRINT_POKER = `
  mutation StartSprintPoker($teamId: ID!) {
    startSprintPoker(teamId: $teamId) {
      meetingId
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
        dimensionRef {
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

const RESET = `
  mutation PokerResetDimension($meetingId: ID!, $stageId: ID!) {
    pokerResetDimension(meetingId: $meetingId, stageId: $stageId) {
      stage {
        id
      }
    }
  }
`

const SCORES = `
  query StageScores($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        phases {
          ... on EstimatePhase {
            stages {
              scores {
                label
              }
            }
          }
        }
      }
    }
  }
`

const startPokerWithStory = async () => {
  const {teamId, userId, cookie} = await signUp()
  const [started, created] = await Promise.all([
    sendPublic({query: START_SPRINT_POKER, variables: {teamId}, cookie}),
    sendPublic({
      query: CREATE_TASK,
      variables: {newTask: {status: 'active', teamId, userId}},
      cookie
    })
  ])
  const meetingId: string = started.data.startSprintPoker.meetingId
  const scoped = await sendPublic({
    query: UPDATE_POKER_SCOPE,
    variables: {
      meetingId,
      updates: [{service: 'PARABOL', serviceTaskId: created.data.createTask.task.id, action: 'ADD'}]
    },
    cookie
  })
  const [stage] = scoped.data.updatePokerScope.newStages
  const [firstValue, secondValue] = stage.dimensionRef.scale.values as {label: string}[]
  return {
    cookie,
    meetingId,
    stageId: stage.id as string,
    firstLabel: firstValue!.label,
    secondLabel: secondValue!.label
  }
}

const readLabels = async (meetingId: string, cookie: string) => {
  const res = await sendPublic({query: SCORES, variables: {meetingId}, cookie})
  const phases: {stages?: {scores: {label: string}[]}[]}[] = res.data.viewer.meeting.phases
  return phases.find((phase) => phase.stages)!.stages![0]!.scores.map(({label}) => label)
}

test('a vote after the votes are revealed replaces the revealed score', async () => {
  const {cookie, meetingId, stageId, firstLabel, secondLabel} = await startPokerWithStory()
  await sendPublic({
    query: VOTE,
    variables: {meetingId, stageId, score: firstLabel},
    cookie
  })
  await sendPublic({query: REVEAL, variables: {meetingId, stageId}, cookie})
  expect(await readLabels(meetingId, cookie)).toEqual([firstLabel])

  const changed = await sendPublic({
    query: VOTE,
    variables: {meetingId, stageId, score: secondLabel},
    cookie
  })

  expect(changed.errors).toBeUndefined()
  expect(await readLabels(meetingId, cookie)).toEqual([secondLabel])
})

test('resetting the dimension clears the revealed votes and voting starts over', async () => {
  const {cookie, meetingId, stageId, firstLabel, secondLabel} = await startPokerWithStory()
  await sendPublic({
    query: VOTE,
    variables: {meetingId, stageId, score: firstLabel},
    cookie
  })
  await sendPublic({query: REVEAL, variables: {meetingId, stageId}, cookie})
  await sendPublic({query: RESET, variables: {meetingId, stageId}, cookie})
  expect(await readLabels(meetingId, cookie)).toEqual([])

  const res = await sendPublic({
    query: VOTE,
    variables: {meetingId, stageId, score: secondLabel},
    cookie
  })

  expect(res.errors).toBeUndefined()
  expect(await readLabels(meetingId, cookie)).toEqual([secondLabel])
})
