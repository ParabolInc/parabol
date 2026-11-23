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

type Setup = {userId: string; orgA: string; teams: {teamA: string; teamB: string}}
type TeamName = keyof Setup['teams']
type Grants = {grantedOrgIds: string[] | null; grantedTeamIds: string[] | null}

let setup: Setup

beforeAll(async () => {
  const {userId, orgId: orgA, cookie} = await createOrgAdmin(getTestEmail())
  const [{id: teamA}] = await getUserTeams(userId)
  const added = await sendPublic({
    query: ADD_ORG,
    variables: {newTeam: {name: 'Team B', orgId: '', isPublic: false}, orgName: 'Org B'},
    cookie
  })
  expect(added.errors).toBeUndefined()
  setup = {userId, orgA, teams: {teamA, teamB: added.data.addOrg.team.id as string}}
})

test.each<{grant: string; grants: (setup: Setup) => Grants; reaches: TeamName[]}>([
  {
    grant: 'every org and team',
    grants: () => ({grantedOrgIds: null, grantedTeamIds: null}),
    reaches: ['teamA', 'teamB']
  },
  {
    grant: 'every org and no listed team',
    grants: () => ({grantedOrgIds: null, grantedTeamIds: []}),
    reaches: ['teamA', 'teamB']
  },
  {
    grant: 'every org and team B',
    grants: ({teams}) => ({grantedOrgIds: null, grantedTeamIds: [teams.teamB]}),
    reaches: ['teamA', 'teamB']
  },
  {
    grant: 'every team and no listed org',
    grants: () => ({grantedOrgIds: [], grantedTeamIds: null}),
    reaches: ['teamA', 'teamB']
  },
  {
    grant: 'nothing',
    grants: () => ({grantedOrgIds: [], grantedTeamIds: []}),
    reaches: []
  },
  {
    grant: 'only team B',
    grants: ({teams}) => ({grantedOrgIds: [], grantedTeamIds: [teams.teamB]}),
    reaches: ['teamB']
  },
  {
    grant: 'org A and every team',
    grants: ({orgA}) => ({grantedOrgIds: [orgA], grantedTeamIds: null}),
    reaches: ['teamA', 'teamB']
  },
  {
    grant: 'only org A',
    grants: ({orgA}) => ({grantedOrgIds: [orgA], grantedTeamIds: []}),
    reaches: ['teamA']
  },
  {
    grant: 'org A and team B',
    grants: ({orgA, teams}) => ({grantedOrgIds: [orgA], grantedTeamIds: [teams.teamB]}),
    reaches: ['teamA', 'teamB']
  }
])(
  'a token granted $grant reaches the same teams in SQL as in hasTeam',
  async ({grants, reaches}) => {
    const {grantedOrgIds, grantedTeamIds} = grants(setup)
    const resourceGrants = new ResourceGrants(
      setup.userId,
      grantedOrgIds,
      grantedTeamIds,
      null,
      dataLoader
    )
    const teamNames = Object.keys(setup.teams) as TeamName[]

    const reachedByHasTeam: TeamName[] = []
    for (const name of teamNames) {
      if (await resourceGrants.hasTeam(setup.teams[name])) reachedByHasTeam.push(name)
    }
    const grantedRows = await getKysely()
      .selectFrom('TeamMember')
      .select('teamId')
      .where('userId', '=', setup.userId)
      .where('isNotRemoved', '=', true)
      .where(({ref}) => resourceGrants.grantsTeam(ref('TeamMember.teamId')))
      .execute()
    const grantedTeamIdsInSql = grantedRows.map(({teamId}) => teamId)

    expect(reachedByHasTeam).toEqual(reaches)
    expect(grantedTeamIdsInSql.toSorted()).toEqual(
      reaches.map((name) => setup.teams[name]).toSorted()
    )
  }
)
