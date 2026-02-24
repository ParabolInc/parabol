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

const SELECT_TEMPLATE_MUTATION = `
  mutation SelectTemplate($selectedTemplateId: ID!, $teamId: ID!) {
    selectTemplate(selectedTemplateId: $selectedTemplateId, teamId: $teamId) {
      meetingSettings {
        selectedTemplateId
      }
      error {
        message
      }
    }
  }
`

test('selectTemplate blocks selecting a template for a team the viewer is not a member of', async () => {
  const [attacker, victim] = await Promise.all([signUp(), signUp()])

  const before = await getRetroSettings(victim.teamId, victim.cookie)

  const selectTemplateRes = await sendPublic({
    query: SELECT_TEMPLATE_MUTATION,
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

test('select a public template', async () => {
  const {cookie, teamId} = await signUp()

  const selectTemplateRes = await sendPublic({
    query: SELECT_TEMPLATE_MUTATION,
    variables: {
      selectedTemplateId: '360ReviewFeedbackOnDevelopmentTemplate',
      teamId
    },
    cookie
  })

  expect(selectTemplateRes).toEqual({
    data: {
      selectTemplate: {
        error: null,
        meetingSettings: {
          selectedTemplateId: '360ReviewFeedbackOnDevelopmentTemplate'
        }
      }
    }
  })

  const after = await getRetroSettings(teamId, cookie)
  expect(after.selectedTemplateId).toBe('360ReviewFeedbackOnDevelopmentTemplate')
})
