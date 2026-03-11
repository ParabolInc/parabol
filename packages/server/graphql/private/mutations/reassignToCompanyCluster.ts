import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const reassignToCompanyCluster: MutationResolvers['reassignToCompanyCluster'] = async (
  _source,
  {orgIds, domains, targetClusterId}
) => {
  // VALIDATION
  if (!orgIds?.length && !domains?.length) {
    throw new GraphQLError('At least one of orgIds or domains must be provided')
  }

  const pg = getKysely()

  return pg.transaction().execute(async (trx) => {
    // RESOLUTION: resolve or create the target cluster
    let targetId: number
    if (targetClusterId != null) {
      const cluster = await trx
        .selectFrom('CompanyCluster')
        .select('id')
        .where('id', '=', Number(targetClusterId))
        .executeTakeFirst()
      if (!cluster) {
        throw new GraphQLError('Target company cluster not found')
      }
      targetId = cluster.id
    } else {
      const newCluster = await trx
        .insertInto('CompanyCluster')
        .values({maxTeamLimitAt: null})
        .returning('id')
        .executeTakeFirstOrThrow()
      targetId = newCluster.id
    }

    const modifiedClusterIdSet = new Set<number>()

    if (orgIds?.length) {
      const existing = await trx
        .selectFrom('CompanyClusterOrganization')
        .select(['companyClusterId', 'orgId'])
        .where('orgId', 'in', orgIds)
        .execute()

      for (const row of existing) {
        if (row.companyClusterId !== targetId) modifiedClusterIdSet.add(row.companyClusterId)
      }

      const orgIdsToMove = existing.map((r) => r.orgId)
      if (orgIdsToMove.length) {
        await trx
          .deleteFrom('CompanyClusterOrganization')
          .where('orgId', 'in', orgIdsToMove)
          .execute()

        await trx
          .insertInto('CompanyClusterOrganization')
          .values(
            orgIdsToMove.map((orgId) => ({companyClusterId: targetId, orgId, isPrimary: false}))
          )
          .onConflict((oc) => oc.doNothing())
          .execute()
      }
    }

    if (domains?.length) {
      const existing = await trx
        .selectFrom('CompanyClusterDomain')
        .select(['companyClusterId', 'domain'])
        .where('domain', 'in', domains)
        .execute()

      for (const row of existing) {
        if (row.companyClusterId !== targetId) modifiedClusterIdSet.add(row.companyClusterId)
      }

      const domainsToMove = existing.map((r) => r.domain)
      if (domainsToMove.length) {
        await trx.deleteFrom('CompanyClusterDomain').where('domain', 'in', domainsToMove).execute()

        await trx
          .insertInto('CompanyClusterDomain')
          .values(domainsToMove.map((domain) => ({companyClusterId: targetId, domain})))
          .onConflict((oc) => oc.doNothing())
          .execute()
      }
    }

    return {
      targetClusterId: targetId,
      modifiedClusterIds: [...modifiedClusterIdSet]
    }
  })
}

export default reassignToCompanyCluster
