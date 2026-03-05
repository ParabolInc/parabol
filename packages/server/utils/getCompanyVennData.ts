import {writeFileSync} from 'node:fs'
import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'

interface VennData {
  orgs: {
    orgId: string
    teams: {id: string; name: string}[]
  }[]
  users: {
    userId: string
    email: string
    orgIds: string[]
  }[]
}

/**
 * Returns Venn diagram data for a company's active teams:
 * - orgs: each org that has an active team, with its active team ids/names
 * - users: each org member, with the list of orgs they belong to
 *
 * Users appearing in multiple orgs are the intersections of the Venn diagram.
 */
const getCompanyVennData = async (teamId: string): Promise<VennData> => {
  const pg = getKysely()

  const rows = await pg
    .withRecursive('ConnectedOrgByUsers', (qb) =>
      qb
        .selectFrom('Team')
        .select(['orgId', sql<number>`1`.as('depth')])
        .where('id', '=', teamId)
        .unionAll(
          qb
            .selectFrom('ConnectedOrgByUsers')
            .innerJoin('OrganizationUser as Ou1', 'Ou1.orgId', 'ConnectedOrgByUsers.orgId')
            .innerJoin('OrganizationUser as Ou2', 'Ou2.userId', 'Ou1.userId')
            .select(['Ou2.orgId', sql<number>`"ConnectedOrgByUsers".depth + 1`.as('depth')])
            .where('Ou1.removedAt', 'is', null)
            .where('Ou1.role', 'is not', null)
            .where('Ou2.removedAt', 'is', null)
            .where(sql<boolean>`"ConnectedOrgByUsers".depth < 3`)
        )
    )
    .with('ConnectedOrgsByDomain', (qb) =>
      qb
        .selectFrom('Organization')
        .select(['id', 'tier', 'activeDomain'])
        .where('id', 'in', (eb) => eb.selectFrom('ConnectedOrgByUsers').select('orgId'))
    )
    .with('AllCompanyOrgs', (qb) =>
      qb
        .selectFrom('ConnectedOrgsByDomain')
        .select(['id', 'tier'])
        .union(
          qb
            .selectFrom('Organization')
            .select(['id', 'tier'])
            .where('activeDomain', 'is not', null)
            .where('activeDomain', 'in', (eb) =>
              eb
                .selectFrom('ConnectedOrgsByDomain')
                .select('activeDomain')
                .where('activeDomain', 'is not', null)
            )
        )
    )
    .with('CompanyTeams', (qb) =>
      qb
        .selectFrom('Team')
        .select('id')
        .where('orgId', 'in', (eb) => eb.selectFrom('AllCompanyOrgs').select('id'))
    )
    .with('QualifyingMeetings', (qb) =>
      qb
        .selectFrom('CompanyTeams')
        .innerJoinLateral(
          (eb) =>
            eb
              .selectFrom('MeetingMember')
              .select('MeetingMember.meetingId')
              .whereRef('MeetingMember.teamId', '=', 'CompanyTeams.id')
              .where('MeetingMember.updatedAt', '>=', sql<Date>`NOW() - INTERVAL '30 days'`)
              .groupBy('MeetingMember.meetingId')
              .having(({fn}) => fn.countAll<number>(), '>=', 3)
              .as('mm'),
          (join) => join.onTrue()
        )
        .select(['mm.meetingId', 'CompanyTeams.id as teamId'])
    )
    .with('ActiveTeams', (qb) => qb.selectFrom('QualifyingMeetings').select('teamId').distinct())
    // Join active teams with their org, then fan out to all members of those orgs
    .selectFrom('ActiveTeams')
    .innerJoin('Team', 'Team.id', 'ActiveTeams.teamId')
    .innerJoin('OrganizationUser as Ou', 'Ou.orgId', 'Team.orgId')
    .innerJoin('User', 'User.id', 'Ou.userId')
    .select([
      'ActiveTeams.teamId',
      'Team.name as teamName',
      'Team.orgId',
      'User.id as userId',
      'User.email'
    ])
    .where('Ou.removedAt', 'is', null)
    .distinct()
    .$call((qb) => {
      console.log(qb.compile().sql, qb.compile().parameters)
      return qb
    })
    .execute()

  // Shape flat rows into Venn structure
  const orgMap = new Map<string, {orgId: string; teams: Map<string, string>}>()
  const userMap = new Map<string, {userId: string; email: string; orgIds: Set<string>}>()

  for (const row of rows) {
    // Build org → teams
    let org = orgMap.get(row.orgId)
    if (!org) {
      org = {orgId: row.orgId, teams: new Map()}
      orgMap.set(row.orgId, org)
    }
    org.teams.set(row.teamId, row.teamName)

    // Build user → orgIds
    let user = userMap.get(row.userId)
    if (!user) {
      user = {userId: row.userId, email: row.email, orgIds: new Set()}
      userMap.set(row.userId, user)
    }
    user.orgIds.add(row.orgId)
  }

  writeFileSync('raw.json', JSON.stringify(rows))
  return {
    orgs: [...orgMap.values()].map(({orgId, teams}) => ({
      orgId,
      teams: [...teams.entries()].map(([id, name]) => ({id, name}))
    })),
    users: [...userMap.values()].map(({userId, email, orgIds}) => ({
      userId,
      email,
      orgIds: [...orgIds]
    }))
  }
}

export default getCompanyVennData
