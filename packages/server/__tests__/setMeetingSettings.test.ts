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

const getRetroPhaseTypes = async (teamId: string, cookie: string) => {
  const res = await sendPublic({
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
  return res.data.viewer.team.meetingSettings
}

test('setMeetingSettings canonicalizes retro phase order: checkin, TEAM_HEALTH, updates, then rest', async () => {
  const user = await signUp()
  const before = await getRetroPhaseTypes(user.teamId, user.cookie)
  await sendPublic({
    query: `
      mutation Off($id: ID!) {
        setMeetingSettings(
          settingsId: $id
          checkinEnabled: false
          teamHealthEnabled: false
          reviewPastTasksEnabled: false
        ) { ... on SetMeetingSettingsPayload { settingsId } }
      }
    `,
    variables: {id: before.id},
    cookie: user.cookie
  })
  await sendPublic({
    query: `
      mutation On($id: ID!) {
        setMeetingSettings(
          settingsId: $id
          checkinEnabled: true
          teamHealthEnabled: true
          reviewPastTasksEnabled: true
        ) { ... on SetMeetingSettingsPayload { settingsId } }
      }
    `,
    variables: {id: before.id},
    cookie: user.cookie
  })
  const after = await getRetroPhaseTypes(user.teamId, user.cookie)
  expect(after.phaseTypes.slice(0, 3)).toEqual(['checkin', 'TEAM_HEALTH', 'updates'])
  expect(after.phaseTypes.slice(3)).toEqual(['reflect', 'group', 'vote', 'discuss'])
})

test('setMeetingSettings reviewPastTasksEnabled=false removes updates from retro phaseTypes', async () => {
  const user = await signUp()
  const before = await getRetroPhaseTypes(user.teamId, user.cookie)
  await sendPublic({
    query: `
      mutation Off($id: ID!) {
        setMeetingSettings(settingsId: $id, reviewPastTasksEnabled: false) {
          ... on SetMeetingSettingsPayload { settingsId }
        }
      }
    `,
    variables: {id: before.id},
    cookie: user.cookie
  })
  const after = await getRetroPhaseTypes(user.teamId, user.cookie)
  expect(after.phaseTypes).not.toContain('updates')
})

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
