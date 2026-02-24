import {sendPublic, signUp} from './common'

const getRetroSettings = async (teamId: string, cookie: string) => {
  const res = await sendPublic({
    query: `
      query MeetingSettingsQuery($teamId: ID!) {
        viewer {
          team(teamId: $teamId) {
            meetingSettings(meetingType: retrospective) {
              ... on RetrospectiveMeetingSettings {
                id
                disableAnonymity
              }
            }
          }
        }
      }
    `,
    variables: {teamId},
    cookie
  })

  return res.data.viewer.team.meetingSettings
}

test('setMeetingSettings blocks updating settings for a team the viewer is not a member of', async () => {
  const [attacker, victim] = await Promise.all([signUp(), signUp()])

  const before = await getRetroSettings(victim.teamId, victim.cookie)

  const setMeetingSettingsRes = await sendPublic({
    query: `
      mutation SetMeetingSettingsMutation($settingsId: ID!, $disableAnonymity: Boolean) {
        setMeetingSettings(settingsId: $settingsId, disableAnonymity: $disableAnonymity) {
          ... on SetMeetingSettingsPayload {
            settingsId
          }
        }
      }
    `,
    variables: {
      settingsId: before.id,
      disableAnonymity: !before.disableAnonymity
    },
    cookie: attacker.cookie
  })

  expect(setMeetingSettingsRes).toEqual({
    data: null,
    errors: [
      expect.objectContaining({
        message: expect.stringMatching('Viewer is not on team')
      })
    ]
  })

  const after = await getRetroSettings(victim.teamId, victim.cookie)
  expect(after.disableAnonymity).toBe(before.disableAnonymity)
})
