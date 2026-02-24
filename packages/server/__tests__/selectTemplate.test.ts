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
                selectedTemplateId
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

test('selectTemplate blocks selecting a template for a team the viewer is not a member of', async () => {
  const [attacker, victim] = await Promise.all([signUp(), signUp()])

  const before = await getRetroSettings(victim.teamId, victim.cookie)

  const selectTemplateRes = await sendPublic({
    query: `
      mutation SelectTemplate($selectedTemplateId: ID!, $teamId: ID!) {
        selectTemplate(selectedTemplateId: $selectedTemplateId, teamId: $teamId) {
          meetingTemplate {
            id
          }
        }
      }
    `,
    variables: {
      selectedTemplateId: before.selectedTemplateId,
      teamId: victim.teamId
    },
    cookie: attacker.cookie
  })

  expect(selectTemplateRes).toEqual({
    data: {
      selectTemplate: null
    },
    errors: [
      expect.objectContaining({
        message: expect.stringMatching('Viewer is not on team')
      })
    ]
  })

  const after = await getRetroSettings(victim.teamId, victim.cookie)
  expect(after.selectedTemplateId).toBe(before.selectedTemplateId)
})
