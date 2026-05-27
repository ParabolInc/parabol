import getKysely from '../postgres/getKysely'
import {getUserTeams, sendPublic, signUp} from './common'

const enableUpdatesPhase = async (teamId: string, cookie: string) => {
  const settingsRes = await sendPublic({
    query: `
      query MeetingSettingsQuery($teamId: ID!) {
        viewer {
          team(teamId: $teamId) {
            meetingSettings(meetingType: retrospective) {
              id
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

test('resetRetroMeetingToGroupStage succeeds when retro has updates phase', async () => {
  const {userId, cookie} = await signUp()
  const {id: teamId} = (await getUserTeams(userId))[0]!

  await enableUpdatesPhase(teamId, cookie)

  const meeting = await startRetro(teamId, cookie)
  expect(meeting).toBeTruthy()
  const phaseTypes = meeting.phases.map((p: {phaseType: string}) => p.phaseType)
  expect(phaseTypes).toContain('updates')
  expect(phaseTypes).toContain('group')

  const meetingId = meeting.id as string

  // Directly mark the group stage as complete and navigable in the DB.
  // This avoids the complex multi-step navigation flow and focuses the test
  // on what we're actually fixing: the reset switch statement handling 'updates'.
  const pg = getKysely()
  const meetingRow = await pg
    .selectFrom('NewMeeting')
    .select('phases')
    .where('id', '=', meetingId)
    .executeTakeFirstOrThrow()

  const phases = meetingRow.phases as {stages: Record<string, unknown>[]}[]
  for (const phase of phases) {
    for (const stage of phase.stages) {
      stage.isNavigable = true
      stage.isNavigableByFacilitator = true
      stage.isComplete = true
    }
  }
  await pg
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(phases)})
    .where('id', '=', meetingId)
    .execute()

  const resetRes = await resetRetroMeeting(meetingId, cookie)

  expect(resetRes.data.resetRetroMeetingToGroupStage.meeting).toBeTruthy()
  expect(
    resetRes.data.resetRetroMeetingToGroupStage.meeting.phases.map(
      (p: {phaseType: string}) => p.phaseType
    )
  ).toContain('updates')
})

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
