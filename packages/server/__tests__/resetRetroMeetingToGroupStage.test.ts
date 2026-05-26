import {getUserTeams, sendPublic, signUp} from './common'

const enableUpdatesPhase = async (teamId: string, cookie: string) => {
  const settingsRes = await sendPublic({
    query: `
      query MeetingSettingsQuery($teamId: ID!) {
        viewer {
          team(teamId: $teamId) {
            meetingSettings(meetingType: retrospective) {
              id
              phaseTypes
            }
          }
        }
      }
    `,
    variables: {teamId},
    cookie
  })
  const settingsId = settingsRes.data.viewer.team.meetingSettings.id
  await sendPublic({
    query: `
      mutation EnableUpdates($id: ID!) {
        setMeetingSettings(settingsId: $id, reviewPastTasksEnabled: true) {
          ... on SetMeetingSettingsPayload { settingsId }
        }
      }
    `,
    variables: {id: settingsId},
    cookie
  })
}

const startRetro = async (teamId: string, cookie: string) => {
  const res = await sendPublic({
    query: `
      mutation StartRetro($teamId: ID!) {
        startRetrospective(teamId: $teamId) {
          ... on StartRetrospectiveSuccess {
            meeting {
              id
              phases {
                phaseType
                stages {
                  id
                  isNavigableByFacilitator
                }
                ... on ReflectPhase {
                  reflectPrompts {
                    id
                  }
                }
              }
            }
          }
          ... on ErrorPayload {
            error { message }
          }
        }
      }
    `,
    variables: {teamId},
    cookie
  })
  return res.data.startRetrospective.meeting
}

interface Phase {
  phaseType: string
  stages: {id: string; isNavigableByFacilitator: boolean}[]
  reflectPrompts?: {id: string}[]
}

const navigate = async (
  meetingId: string,
  completedStageId: string,
  facilitatorStageId: string,
  cookie: string
) => {
  return sendPublic({
    query: `
      mutation Nav($meetingId: ID!, $completedStageId: ID, $facilitatorStageId: ID) {
        navigateMeeting(
          meetingId: $meetingId,
          completedStageId: $completedStageId,
          facilitatorStageId: $facilitatorStageId
        ) {
          ... on NavigateMeetingPayload {
            meeting { id }
          }
          ... on ErrorPayload {
            error { message }
          }
        }
      }
    `,
    variables: {meetingId, completedStageId, facilitatorStageId},
    cookie
  })
}

const createReflection = async (meetingId: string, promptId: string, cookie: string) => {
  return sendPublic({
    query: `
      mutation CreateReflection($input: CreateReflectionInput!) {
        createReflection(input: $input) {
          ... on CreateReflectionPayload {
            reflectionId
          }
          ... on ErrorPayload {
            error { message }
          }
        }
      }
    `,
    variables: {
      input: {
        meetingId,
        promptId,
        content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"test reflection"}]}]}'
      }
    },
    cookie
  })
}

const resetRetroMeeting = async (meetingId: string, cookie: string) => {
  return sendPublic({
    query: `
      mutation ResetRetro($meetingId: ID!) {
        resetRetroMeetingToGroupStage(meetingId: $meetingId) {
          ... on ResetRetroMeetingToGroupStagePayload {
            meeting {
              id
              phases {
                phaseType
                stages {
                  id
                  isComplete
                  isNavigableByFacilitator
                }
              }
            }
          }
          ... on ErrorPayload {
            error { message }
          }
        }
      }
    `,
    variables: {meetingId},
    cookie
  })
}

const getStageId = (phases: Phase[], phaseType: string) => {
  const phase = phases.find((p) => p.phaseType === phaseType)!
  return phase.stages[0]!.id
}

test('resetRetroMeetingToGroupStage succeeds when retro has updates phase', async () => {
  const {userId, cookie} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]

  await enableUpdatesPhase(teamId, cookie)

  const meeting = await startRetro(teamId, cookie)
  const phases = meeting.phases as Phase[]
  expect(phases.map((p) => p.phaseType)).toContain('updates')

  const meetingId = meeting.id
  const reflectPhase = phases.find((p) => p.phaseType === 'reflect')!
  const promptId = reflectPhase.reflectPrompts![0]!.id

  // Walk through each phase sequentially: checkin → TEAM_HEALTH → updates → reflect
  await navigate(meetingId, getStageId(phases, 'checkin'), getStageId(phases, 'TEAM_HEALTH'), cookie)
  await navigate(meetingId, getStageId(phases, 'TEAM_HEALTH'), getStageId(phases, 'updates'), cookie)
  await navigate(meetingId, getStageId(phases, 'updates'), getStageId(phases, 'reflect'), cookie)

  // Create a reflection to unlock the GROUP phase
  await createReflection(meetingId, promptId, cookie)

  // Continue: reflect → group → vote → discuss
  await navigate(meetingId, getStageId(phases, 'reflect'), getStageId(phases, 'group'), cookie)
  await navigate(meetingId, getStageId(phases, 'group'), getStageId(phases, 'vote'), cookie)
  await navigate(meetingId, getStageId(phases, 'vote'), getStageId(phases, 'discuss'), cookie)

  // Reset — this should NOT throw "Unhandled phaseType: updates"
  const resetRes = await resetRetroMeeting(meetingId, cookie)

  expect(resetRes.data.resetRetroMeetingToGroupStage.meeting).toBeTruthy()
  expect(
    resetRes.data.resetRetroMeetingToGroupStage.meeting.phases.map(
      (p: {phaseType: string}) => p.phaseType
    )
  ).toContain('updates')
})
