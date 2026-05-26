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

const navigateToPhase = async (meetingId: string, stageId: string, cookie: string) => {
  return sendPublic({
    query: `
      mutation Navigate($meetingId: ID!, $stageId: ID!) {
        navigateToMeetingStage(meetingId: $meetingId, stageId: $stageId, facilitatorStageId: $stageId) {
          ... on NavigateToMeetingStagePayload {
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
    variables: {meetingId, stageId},
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

test('resetRetroMeetingToGroupStage succeeds when retro has updates phase', async () => {
  const {userId, cookie} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]

  await enableUpdatesPhase(teamId, cookie)

  const meeting = await startRetro(teamId, cookie)
  expect(meeting.phases.map((p: {phaseType: string}) => p.phaseType)).toContain('updates')

  const phases = meeting.phases as {
    phaseType: string
    stages: {id: string; isNavigableByFacilitator: boolean}[]
  }[]
  const votePhase = phases.find((p) => p.phaseType === 'vote')!
  const discussPhase = phases.find((p) => p.phaseType === 'discuss')!

  // navigate to vote (completes group)
  await navigateToPhase(meeting.id, votePhase.stages[0]!.id, cookie)
  // navigate to discuss (completes vote)
  await navigateToPhase(meeting.id, discussPhase.stages[0]!.id, cookie)

  // reset — this should NOT throw "Unhandled phaseType: updates"
  const resetRes = await resetRetroMeeting(meeting.id, cookie)

  expect(resetRes.data.resetRetroMeetingToGroupStage.meeting).toBeTruthy()
  expect(
    resetRes.data.resetRetroMeetingToGroupStage.meeting.phases.map(
      (p: {phaseType: string}) => p.phaseType
    )
  ).toContain('updates')
})
