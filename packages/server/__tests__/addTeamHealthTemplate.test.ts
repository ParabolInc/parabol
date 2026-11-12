import {sendPublic, signUp} from './common'

const ADD_TEAM_HEALTH_TEMPLATE = `
  mutation AddTeamHealthTemplate($teamId: ID!) {
    addTeamHealthTemplate(teamId: $teamId) {
      teamHealthTemplate {
        id
      }
    }
  }
`

test('Only a team member can add a team health template to a team', async () => {
  const member = await signUp()
  const outsider = await signUp()

  const refused = await sendPublic({
    query: ADD_TEAM_HEALTH_TEMPLATE,
    variables: {teamId: member.teamId},
    cookie: outsider.cookie
  })
  expect(refused.data).toBeNull()
  expect(refused.errors).toHaveLength(1)

  const added = await sendPublic({
    query: ADD_TEAM_HEALTH_TEMPLATE,
    variables: {teamId: member.teamId},
    cookie: member.cookie
  })
  expect(added.data.addTeamHealthTemplate.teamHealthTemplate.id).toEqual(expect.any(String))
})
