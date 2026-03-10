import {sql} from 'kysely'
import type {DataLoaderInstance} from '../dataloader/RootDataLoader'
import getKysely from '../postgres/getKysely'
import {Logger} from './Logger'

export type CompanyLimitStatus = 'MAX_TEAM_UPGRADE_REQUIRED' | 'MAX_TEAM_UPGRADE_SUGGESTED'

/**
 * Determines whether a company has exceeded the free two-team tier.
 *
 * Returns null if the company is allowed to proceed
 * string if action is required:
 *   - MAX_TEAM_UPGRADE_SUGGESTED: trial is active; block meeting creation
 *   - MAX_TEAM_UPGRADE_REQUIRED: trial expired >30 days ago; block meeting creation
 *
 * Company detection uses a recursive transitive closure over OrganizationUser
 * (expanding org → shared users → their other orgs), capped at 3 hops, then
 * unions in any orgs sharing the same activeDomain.
 */
const isCompanyOverLimit = async (teamId: string, dataLoader: DataLoaderInstance) => {
  if (process.env.IS_ENTERPRISE) return null
  const pg = getKysely()
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const organization = await dataLoader.get('organizations').loadNonNull(team.orgId)
  console.log({organization})
  if (organization.tier !== 'starter') return null
  const MIN_MEETING_MEMBERS = 1
  const {id: orgId} = organization
  const teamsInCompany = await pg
    // Recursive transitive closure with depth limit: starting from the seed org,
    // expand to orgs reachable through shared admin memberships.
    // Only traversing through admins (BILLING_LEADER / ORG_ADMIN) means:
    //   - abusers who create new orgs are caught (they own every org they create)
    //   - consultants who are plain members in client orgs don't bridge unrelated companies
    // UNION ALL with depth < 3 bounds the traversal to 3 hops.
    .withRecursive('UserConnectedOrgIds', (qb) =>
      qb
        .selectNoFrom(({lit}) => [lit(1).as('depth'), sql<string>`${orgId}::varchar`.as('orgId')])
        .unionAll(
          qb
            .selectFrom('UserConnectedOrgIds')
            .innerJoin('OrganizationUser as Ou1', 'Ou1.orgId', 'UserConnectedOrgIds.orgId')
            .innerJoin('OrganizationUser as Ou2', 'Ou2.userId', 'Ou1.userId')
            .select(({eb, ref, lit}) => [
              eb('UserConnectedOrgIds.depth', '+', lit(1)).as('depth'),
              ref('Ou2.orgId').as('orgId')
            ])
            .where('Ou1.removedAt', 'is', null)
            .where('Ou1.role', 'is not', null)
            .where('Ou2.removedAt', 'is', null)
            .where(({eb, lit}) => eb('UserConnectedOrgIds.depth', '<', lit(3)))
        )
    )
    .with('CompanyConnectedOrgs', (qb) =>
      // Find all orgs that share the same CompanyCluster as the team's org.
      // Cco1 locates the cluster for this org; Cco2 expands to all sibling orgs.
      // Returns empty set if no cluster exists yet (first-time detection).
      // This is necessary for the case where the user creates a new org & we put that org in a cluster
      // but we'd otherwise miss associating with the other teams
      qb
        .selectFrom('CompanyClusterOrganization as Cco1')
        .innerJoin(
          'CompanyClusterOrganization as Cco2',
          'Cco2.companyClusterId',
          'Cco1.companyClusterId'
        )
        .select('Cco2.orgId')
        .where('Cco1.orgId', '=', orgId)
    )
    .with('ConnectedOrgs', (qb) =>
      qb
        .selectFrom('Organization')
        .select(['id', 'tier', 'activeDomain'])
        .where((eb) =>
          eb.or([
            eb('id', 'in', eb.selectFrom('UserConnectedOrgIds').select('orgId')),
            eb('id', 'in', eb.selectFrom('CompanyConnectedOrgs').select('orgId'))
          ])
        )
    )
    .with('UserAndDomainConnectedOrgs', (qb) =>
      qb
        .selectFrom('ConnectedOrgs')
        .select(['id', 'tier'])
        .union(
          qb
            .selectFrom('Organization')
            .select(['id', 'tier'])
            .where('activeDomain', 'in', (eb) =>
              eb
                .selectFrom('ConnectedOrgs')
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
              .having(({fn}) => fn.countAll<number>(), '>=', eb.lit(MIN_MEETING_MEMBERS))
              .as('mm'),
          (join) => join.onTrue()
        )
        .select(['mm.meetingId', 'CompanyTeams.id as teamId', 'CompanyTeams.orgId'])
    )
    .selectFrom('QualifyingMeetings')
    .select(['teamId', 'orgId'])
    .distinct()
    .execute()

  const uniqueTeamIds = [...new Set([teamId, ...teamsInCompany.map((r) => r.teamId)])]
  console.log({uniqueTeamIds})
  if (uniqueTeamIds.length < 3) return null
  const orgIds = [...new Set(teamsInCompany.map((r) => r.orgId))]
  const companyClusters = await pg
    .selectFrom('CompanyCluster')
    .innerJoin(
      'CompanyClusterOrganization',
      'CompanyCluster.id',
      'CompanyClusterOrganization.companyClusterId'
    )
    .selectAll('CompanyCluster')
    .where('orgId', 'in', orgIds)
    .distinctOn('CompanyCluster.id')
    .execute()

  if (companyClusters.length === 0) {
    // First time we've detected this company is over the limit — bootstrap the cluster.
    const {id: clusterId} = await pg
      .insertInto('CompanyCluster')
      .values({name: organization.name, maxTeamLimitAt: sql<Date>`CURRENT_TIMESTAMP`})
      .returning('id')
      .executeTakeFirstOrThrow()

    // Mark the largest org as primary.
    const orgTeamCounts = await pg
      .selectFrom('OrganizationUser')
      .innerJoin('Organization', 'Organization.id', 'OrganizationUser.orgId')
      .select((eb) => [eb.fn.count('OrganizationUser.id').as('count'), 'orgId', 'activeDomain'])
      .where('orgId', 'in', orgIds)
      .where('OrganizationUser.removedAt', 'is', null)
      .groupBy(['orgId', 'activeDomain'])
      .execute()

    const maxTeamCount = Math.max(...orgTeamCounts.map((o) => Number(o.count)), 0)
    const primaryOrgId = orgTeamCounts.find((o) => Number(o.count) === maxTeamCount)?.orgId ?? orgId

    await pg
      .insertInto('CompanyClusterOrganization')
      .values(
        orgIds.map((id) => ({
          companyClusterId: clusterId,
          orgId: id,
          isPrimary: id === primaryOrgId
        }))
      )
      .execute()

    // Seed active domains, skipping any that already exist.
    const domains = orgTeamCounts
      .filter((o): o is NonNullable<typeof o> => !!o?.activeDomain)
      .map((o) => ({companyClusterId: clusterId, domain: o.activeDomain!}))

    if (domains.length > 0) {
      const inserts = await pg
        .insertInto('CompanyClusterDomain')
        .values(domains)
        .onConflict((oc) => oc.columns(['companyClusterId', 'domain']).doNothing())
        .executeTakeFirstOrThrow()
      const {numInsertedOrUpdatedRows} = inserts
      if (Number(numInsertedOrUpdatedRows) < domains.length) {
        Logger.log(
          `CompanyCluster ${clusterId}: failed seeding domains ${domains.map((d) => d.domain).join(', ')}`
        )
      }
    }
  } else {
    // companies > 0: stamp any clusters that haven't recorded their limit date yet.
    const companyClusterIds = companyClusters.map((c) => c.id)
    await pg
      .updateTable('CompanyCluster')
      .set({maxTeamLimitAt: sql`CURRENT_TIMESTAMP`})
      .where('id', 'in', companyClusterIds)
      .where('maxTeamLimitAt', 'is', null)
      .execute()
  }

  if (!team.maxTeamTrialExpiresAt) {
    await pg
      .updateTable('Team')
      .set({
        maxTeamTrialExpiresAt: sql<Date>`CURRENT_TIMESTAMP + INTERVAL '30 days'`
      })
      .where('id', '=', teamId)
      .where('maxTeamTrialExpiresAt', 'is', null)
      .execute()
  }

  const {maxTeamTrialExpiresAt} = team
  const isTrialExpired = maxTeamTrialExpiresAt && maxTeamTrialExpiresAt < new Date()
  const errorCode = isTrialExpired ? 'MAX_TEAM_UPGRADE_REQUIRED' : 'MAX_TEAM_UPGRADE_SUGGESTED'
  const meetingCount = await pg
    .selectFrom('NewMeeting')
    .select(({fn}) => fn.count('id').as('count'))
    .where('teamId', 'in', uniqueTeamIds)
    .executeTakeFirstOrThrow()
  return {
    errorCode,
    teamCount: uniqueTeamIds.length,
    meetingCount: Number(meetingCount.count)
  } as const
}

export default isCompanyOverLimit
