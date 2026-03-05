import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'

interface CompanyLimitDetails {
  activeTeams: {id: string; name: string}[]
  bridgingUsers: {email: string}[]
}

/**
 * Returns diagnostic details for a company's two-team limit check:
 * - activeTeams: teams that ran meetings with 3+ members in the last 30 days
 * - bridgingUsers: admin users whose memberships span 2+ company orgs,
 *   causing those orgs to be treated as the same company
 */
const getCompanyLimitDetails = async (teamId: string): Promise<CompanyLimitDetails> => {
  const pg = getKysely()

  const activeTeamsRows = await pg
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
    .selectFrom('ActiveTeams')
    .innerJoin('Team', 'Team.id', 'ActiveTeams.teamId')
    .select(['ActiveTeams.teamId as id', 'Team.name'])
    .$call((qb) => {
      // console.log(qb.compile().sql)
      return qb
    })
    .execute()

  // Bridging users: admins who are non-removed members of 2+ company orgs.
  // These are the users whose shared memberships cause separate orgs to be
  // treated as the same company in the recursive CTE above.
  const bridgingUsersRows = await pg
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
    .selectFrom('OrganizationUser')
    .innerJoin('User', 'User.id', 'OrganizationUser.userId')
    .select('User.email')
    .where('OrganizationUser.orgId', 'in', (eb) => eb.selectFrom('AllCompanyOrgs').select('id'))
    .where('OrganizationUser.removedAt', 'is', null)
    .where('OrganizationUser.role', 'is not', null)
    .groupBy(['OrganizationUser.userId', 'User.email'])
    .having(({fn}) => fn.count('OrganizationUser.orgId').distinct(), '>=', 2)
    .$call((qb) => {
      console.log(qb.compile().sql)
      return qb
    })
    .execute()

  return {
    activeTeams: activeTeamsRows,
    bridgingUsers: bridgingUsersRows
  }
}

export default getCompanyLimitDetails
