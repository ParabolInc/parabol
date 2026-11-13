import {sendPublic, signUp} from './common'

const START_SPRINT_POKER = `
  mutation StartSprintPoker($teamId: ID!) {
    startSprintPoker(teamId: $teamId) {
      ... on StartSprintPokerSuccess {
        meetingId
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
        dimensionRef {
          name
        }
      }
    }
  }
`

const SET_TASK_ESTIMATE = `
  mutation SetTaskEstimate($taskEstimate: TaskEstimateInput!) {
    setTaskEstimate(taskEstimate: $taskEstimate) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on SetTaskEstimateSuccess {
        stage {
          id
          finalScore
        }
      }
    }
  }
`

type Viewer = {teamId: string; userId: string; cookie: string}

const createTask = async ({teamId, userId, cookie}: Viewer) => {
  const res = await sendPublic({
    query: CREATE_TASK,
    variables: {newTask: {status: 'active', teamId, userId}},
    cookie
  })
  return res.data.createTask.task.id as string
}

const startPokerWithTask = async (viewer: Viewer) => {
  const {teamId, cookie} = viewer
  const [started, taskId] = await Promise.all([
    sendPublic({query: START_SPRINT_POKER, variables: {teamId}, cookie}),
    createTask(viewer)
  ])
  const meetingId: string = started.data.startSprintPoker.meetingId
  const scoped = await sendPublic({
    query: UPDATE_POKER_SCOPE,
    variables: {meetingId, updates: [{service: 'PARABOL', serviceTaskId: taskId, action: 'ADD'}]},
    cookie
  })
  const [stage] = scoped.data.updatePokerScope.newStages
  return {
    meetingId,
    taskId,
    stageId: stage.id as string,
    dimensionName: stage.dimensionRef.name as string
  }
}

const setTaskEstimate = (
  taskEstimate: {taskId: string; meetingId: string; dimensionName: string},
  cookie: string
) =>
  sendPublic({
    query: SET_TASK_ESTIMATE,
    variables: {taskEstimate: {...taskEstimate, value: '3'}},
    cookie
  })

test('an estimate cannot be set in another team’s poker meeting', async () => {
  const [outsider, owner] = await Promise.all([signUp(), signUp()])
  const [{meetingId, dimensionName}, taskId] = await Promise.all([
    startPokerWithTask(owner),
    createTask(outsider)
  ])

  const res = await setTaskEstimate({taskId, meetingId, dimensionName}, outsider.cookie)

  expect(res.errors).toEqual([expect.objectContaining({message: 'Viewer is not on team'})])
})

test('a team member sets an estimate in their own poker meeting', async () => {
  const owner = await signUp()
  const {meetingId, taskId, stageId, dimensionName} = await startPokerWithTask(owner)

  const res = await setTaskEstimate({taskId, meetingId, dimensionName}, owner.cookie)

  expect(res).toEqual({data: {setTaskEstimate: {stage: {id: stageId, finalScore: '3'}}}})
})
