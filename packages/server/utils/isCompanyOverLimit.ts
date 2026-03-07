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
  if (process.env.IS_ENTERPRISE) return false
  const pg = getKysely()
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const organization = await dataLoader.get('organizations').loadNonNull(team.orgId)
  if (organization.tier !== 'starter') return false
  const MIN_MEETING_MEMBERS = 3
  const {id: orgId} = organization
  const result = await pg
    // Recursive transitive closure with depth limit: starting from the seed org,
    // expand to orgs reachable through shared admin memberships.
    // Only traversing through admins (BILLING_LEADER / ORG_ADMIN) means:
    //   - abusers who create new orgs are caught (they own every org they create)
    //   - consultants who are plain members in client orgs don't bridge unrelated companies
    // UNION ALL with depth < 3 bounds the traversal to 3 hops.
    .withRecursive('UserConnectedOrgIds', (qb) =>
      qb
        .selectNoFrom((eb) => [eb.val(orgId).as('orgId'), eb.val(1).as('depth')])
        .unionAll(
          qb
            .selectFrom('UserConnectedOrgIds')
            .innerJoin('OrganizationUser as Ou1', 'Ou1.orgId', 'UserConnectedOrgIds.orgId')
            .innerJoin('OrganizationUser as Ou2', 'Ou2.userId', 'Ou1.userId')
            .select(({eb, ref}) => [
              eb('UserConnectedOrgIds.depth', '+', 1).as('depth'),
              ref('Ou2.orgId').as('orgId')
            ])
            .where('Ou1.removedAt', 'is', null)
            .where('Ou1.role', 'is not', null)
            .where('Ou2.removedAt', 'is', null)
            .where('UserConnectedOrgIds.depth', '<', 3)
        )
    )
    // .with('SeedOrg', (qb) => qb.selectFrom('Team').select('orgId').where('id', '=', teamId))
    .with('UserConnectedOrgs', (qb) =>
      qb
        .selectFrom('Organization')
        .select(['id', 'tier', 'activeDomain'])
        .where('id', 'in', (eb) => eb.selectFrom('UserConnectedOrgIds').select('orgId'))
    )
    .with('UserAndDomainConnectedOrgs', (qb) =>
      qb
        .selectFrom('UserConnectedOrgs')
        .select(['id', 'tier'])
        .union(
          qb
            .selectFrom('Organization')
            .select(['id', 'tier'])
            .where('activeDomain', 'in', (eb) =>
              eb
                .selectFrom('UserConnectedOrgs')
                .select('activeDomain')
                .where('activeDomain', 'is not', null)
            )
            .where('activeDomain', 'is not', null)
        )
    )
    .with('CompanyTeams', (qb) =>
      qb
        .selectFrom('Team')
        .select(['id', 'orgId'])
        .where('orgId', 'in', (eb) =>
          eb.selectFrom('UserAndDomainConnectedOrgs').select('id').where('tier', '=', 'starter')
        )
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
              .having(({fn}) => fn.countAll<number>(), '>=', MIN_MEETING_MEMBERS)
              .as('mm'),
          (join) => join.onTrue()
        )
        .select(['mm.meetingId', 'CompanyTeams.id as teamId', 'CompanyTeams.orgId'])
    )
    .selectFrom('QualifyingMeetings')
    .select(['teamId', 'orgId'])
    .distinct()
    .execute()

  const teamIdSet = new Set([teamId, ...result.map((r) => r.teamId)])
  if (teamIdSet.size < 3) return false
  const orgIds = [...new Set(result.map((r) => r.orgId))]
  const companyClusters = await pg
    .selectFrom('CompanyCluster')
    .innerJoin(
      'CompanyClusterOrganization',
      'CompanyCluster.id',
      'CompanyClusterOrganization.companyClusterId'
    )
    .selectAll('CompanyCluster')
    .where('orgId', 'in', orgIds)
    .execute()
  console.log(companyClusters)
  return true
}

export default isCompanyOverLimit
