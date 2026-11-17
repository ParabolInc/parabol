import {getUserTeams, sendPublic, signUp} from './common'

const START_SPRINT_POKER = `
  mutation StartSprintPoker($teamId: ID!) {
    startSprintPoker(teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on StartSprintPokerSuccess {
        meetingId
      }
    }
  }
`

const UPDATE_POKER_SCOPE = `
  mutation UpdatePokerScope($meetingId: ID!, $updates: [UpdatePokerScopeItemInput!]!) {
    updatePokerScope(meetingId: $meetingId, updates: $updates) {
      newStages {
        taskId
      }
    }
  }
`

const DELETE_TASK = `
  mutation DeleteTask($taskId: ID!) {
    deleteTask(taskId: $taskId) {
      error {
        message
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
              serviceTaskId
              task {
                id
              }
            }
          }
        }
      }
    }
  }
`

const getEstimateStages = async (meetingId: string, cookie: string) => {
  const res = await sendPublic({query: ESTIMATE_STAGES, variables: {meetingId}, cookie})
  const phases: {stages?: unknown[]}[] = res.data.viewer.meeting.phases
  return phases.find((phase) => phase.stages)!.stages
}

test('an integrated stage whose task was deleted can be removed by its serviceTaskId', async () => {
  const {userId, cookie} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]
  const started = await sendPublic({query: START_SPRINT_POKER, variables: {teamId}, cookie})
  const {meetingId} = started.data.startSprintPoker
  const integrationHash = 'cloud1:WEB-12'

  const added = await sendPublic({
    query: UPDATE_POKER_SCOPE,
    variables: {
      meetingId,
      updates: [{service: 'jira', serviceTaskId: integrationHash, action: 'ADD'}]
    },
    cookie
  })
  const {taskId} = added.data.updatePokerScope.newStages[0]
  await sendPublic({query: DELETE_TASK, variables: {taskId}, cookie})

  expect(await getEstimateStages(meetingId, cookie)).toEqual([
    {taskId, serviceTaskId: integrationHash, task: null}
  ])

  const removed = await sendPublic({
    query: UPDATE_POKER_SCOPE,
    variables: {
      meetingId,
      updates: [{service: 'PARABOL', serviceTaskId: integrationHash, action: 'DELETE'}]
    },
    cookie
  })
  expect(removed.errors).toBeUndefined()
  expect(await getEstimateStages(meetingId, cookie)).toEqual([])
})
