import {sql} from 'kysely'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import {ResourceGrants} from '../graphql/public/ResourceGrants'
import getKysely from '../postgres/getKysely'
import {createOrgAdmin, getTestEmail, getUserTeams, sendPublic} from './common'

const dataLoader = getNewDataLoader('teamGrantsTest')

afterAll(async () => {
  dataLoader.dispose()
  await getKysely().destroy()
})

const ADD_ORG = `
  mutation AddOrg($newTeam: NewTeamInput!, $orgName: String!) {
    addOrg(newTeam: $newTeam, orgName: $orgName) {
      team {
        id
      }
    }
  }
`

const grantsTeamInSql = async (resourceGrants: ResourceGrants, teamId: string) => {
  const {rows} = await sql<{
    granted: boolean
  }>`select ${resourceGrants.grantsTeam(sql.val(teamId))} as granted`.execute(getKysely())
  return rows[0]!.granted
}

test('grantsTeam agrees with hasTeam on every team the user is on, for every grant', async () => {
  const {userId, orgId: orgA, cookie} = await createOrgAdmin(getTestEmail())
  const [{id: teamA}] = await getUserTeams(userId)
  const added = await sendPublic({
    query: ADD_ORG,
    variables: {newTeam: {name: 'Team B', orgId: '', isPublic: false}, orgName: 'Org B'},
    cookie
  })
  expect(added.errors).toBeUndefined()
  const teamB = added.data.addOrg.team.id as string

  const disagreements: unknown[] = []
  const answers = new Set<boolean>()
  for (const grantedOrgIds of [null, [], [orgA]]) {
    for (const grantedTeamIds of [null, [], [teamB]]) {
      const resourceGrants = new ResourceGrants(
        userId,
        grantedOrgIds,
        grantedTeamIds,
        null,
        dataLoader
      )
      for (const teamId of [teamA, teamB]) {
        const hasTeam = await resourceGrants.hasTeam(teamId)
        const grantsTeam = await grantsTeamInSql(resourceGrants, teamId)
        answers.add(hasTeam)
        if (hasTeam !== grantsTeam) {
          disagreements.push({grantedOrgIds, grantedTeamIds, teamId, hasTeam, grantsTeam})
        }
      }
    }
  }

  expect(disagreements).toEqual([])
  expect(answers).toEqual(new Set([true, false]))
})
