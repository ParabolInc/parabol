import {sendPublic, signUp} from './common'

const VIEWER_TEAMS_QUERY = `
  query ViewerTeams {
    viewer {
      teams {
        id
        sortOrder
      }
    }
  }
`

const toCookieHeader = (setCookie: string) => {
  const token = setCookie.split('__Host-Http-authToken=')[1]?.split(';')[0]
  return `__Host-Http-authToken=${token}`
}

test('Adding an org over HTTP sets a cookie that is on the new team', async () => {
  const {cookie} = await signUp()

  const added = await sendPublic({
    query: `
      mutation AddOrg($newTeam: NewTeamInput!, $orgName: String!) {
        addOrg(newTeam: $newTeam, orgName: $orgName) {
          error {
            message
          }
          team {
            id
          }
        }
      }
    `,
    variables: {newTeam: {name: 'Second team', orgId: '', isPublic: false}, orgName: 'Second org'},
    cookie
  })
  expect(added.data.addOrg.error).toBeNull()
  const newTeamId = added.data.addOrg.team.id

  const teams = await sendPublic({
    query: VIEWER_TEAMS_QUERY,
    cookie: added.cookie ? toCookieHeader(added.cookie) : cookie
  })
  expect(teams.errors).toBeUndefined()
  expect(teams.data.viewer.teams).toContainEqual(expect.objectContaining({id: newTeamId}))
})
