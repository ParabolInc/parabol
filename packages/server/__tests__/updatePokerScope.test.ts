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
        task {
          id
        }
      }
    }
  }
`

const ESTIMATE_STAGES = `
  query EstimateStages($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        phases {
          ... on EstimatePhase {
            stages {
              taskId
            }
          }
        }
      }
    }
  }
`

type Viewer = {teamId: string; userId: string; cookie: string}

const startSprintPoker = async ({teamId, cookie}: Viewer) => {
  const res = await sendPublic({query: START_SPRINT_POKER, variables: {teamId}, cookie})
  return res.data.startSprintPoker.meetingId as string
}

const createTask = async ({teamId, userId, cookie}: Viewer) => {
  const res = await sendPublic({
    query: CREATE_TASK,
    variables: {newTask: {status: 'active', teamId, userId}},
    cookie
  })
  return res.data.createTask.task.id as string
}

const addTasksToScope = (meetingId: string, taskIds: string[], cookie: string) =>
  sendPublic({
    query: UPDATE_POKER_SCOPE,
    variables: {
      meetingId,
      updates: taskIds.map((serviceTaskId) => ({service: 'PARABOL', serviceTaskId, action: 'ADD'}))
    },
    cookie
  })

const getEstimateStages = async (meetingId: string, cookie: string) => {
  const res = await sendPublic({query: ESTIMATE_STAGES, variables: {meetingId}, cookie})
  const phases: {stages?: unknown[]}[] = res.data.viewer.meeting.phases
  return phases.find((phase) => phase.stages)!.stages
}

test('another team’s task cannot be added to the poker scope', async () => {
  const [outsider, owner] = await Promise.all([signUp(), signUp()])
  const [meetingId, foreignTaskId] = await Promise.all([
    startSprintPoker(outsider),
    createTask(owner)
  ])

  const res = await addTasksToScope(meetingId, [foreignTaskId], outsider.cookie)

  expect(res.errors).toEqual([expect.objectContaining({message: 'Could not add that issue'})])
  expect(await getEstimateStages(meetingId, outsider.cookie)).toEqual([])
})

test('the team’s own tasks are added while another team’s task is left out', async () => {
  const [viewer, owner] = await Promise.all([signUp(), signUp()])
  const [meetingId, ownTaskId, foreignTaskId] = await Promise.all([
    startSprintPoker(viewer),
    createTask(viewer),
    createTask(owner)
  ])

  const res = await addTasksToScope(meetingId, [foreignTaskId, ownTaskId], viewer.cookie)

  expect(res.errors).toBeUndefined()
  expect(res.data.updatePokerScope.newStages.length).toBeGreaterThan(0)
  for (const stage of res.data.updatePokerScope.newStages) {
    expect(stage).toEqual({task: {id: ownTaskId}})
  }
  const stages = await getEstimateStages(meetingId, viewer.cookie)
  expect(stages).toEqual(res.data.updatePokerScope.newStages.map(() => ({taskId: ownTaskId})))
})
