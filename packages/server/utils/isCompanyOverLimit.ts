import {sql} from 'kysely'
import type {DataLoaderInstance} from '../dataloader/RootDataLoader'
import getKysely from '../postgres/getKysely'

/**
 * Determines whether a company has exceeded the free two-team tier.
 *
 * Returns true if the company is on the starter tier across all orgs AND has 3+
 * teams that ran meetings with 3+ members in the last 30 days.
 * Returns false if any org in the company is on a paid tier, or the company
 * hasn't hit the activity threshold yet.
 *
 * Company detection uses a recursive transitive closure over OrganizationUser
 * (expanding org → shared users → their other orgs), capped at 3 hops, then
 * unions in any orgs sharing the same activeDomain.
 */
const isCompanyOverLimit = async (
  teamId: string,
  dataLoader: DataLoaderInstance
): Promise<boolean> => {
  const pg = getKysely()
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const organization = await dataLoader.get('organizations').loadNonNull(team.orgId)
  // if (organization.tier !== 'starter') return false

  const result = await pg
    // Recursive transitive closure with depth limit: starting from the seed org,
    // expand to orgs reachable through shared admin memberships.
    // Only traversing through admins (BILLING_LEADER / ORG_ADMIN) means:
    //   - abusers who create new orgs are caught (they own every org they create)
    //   - consultants who are plain members in client orgs don't bridge unrelated companies
    // UNION ALL with depth < 3 bounds the traversal to 3 hops.
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
    .with('SeedOrg', (qb) => qb.selectFrom('Team').select('orgId').where('id', '=', teamId))
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
    .with(
      'CompanyTeams',
      (qb) =>
        qb
          .selectFrom('Team')
          .select('id')
          .where('orgId', 'in', (eb) => eb.selectFrom('AllCompanyOrgs').select('id'))
      // .where('isArchived', '=', false)
    )
    // LATERAL forces a nested loop: for each of the ~N company teams, Postgres executes
    // the subquery using idx_MeetingMember_teamId, then filters updatedAt in-pass.
    // This avoids the seq scan that a regular JOIN or IN-subquery causes.
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
    .selectFrom('SeedOrg')
    .innerJoin('Organization', 'Organization.id', 'SeedOrg.orgId')
    .select(({fn, eb}) => [
      'Organization.tier',
      eb
        .exists(eb.selectFrom('AllCompanyOrgs').select('id').where('tier', '!=', 'starter'))
        .as('anyPaid'),
      eb.selectFrom('ActiveTeams').select(fn.countAll<string>().as('cnt')).as('activeTeamCount')
    ])
    .$call((qb) => {
      console.log(qb.compile().sql)
      return qb
    })
    .executeTakeFirst()

  if (!result) return false
  if (result.tier !== 'starter') return false
  if (result.anyPaid) return false
  return Number(result.activeTeamCount) >= 3
}

export default isCompanyOverLimit
