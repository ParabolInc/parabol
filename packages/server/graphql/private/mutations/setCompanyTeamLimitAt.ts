import {GraphQLError} from 'graphql'
import ms from 'ms'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

const setCompanyTeamLimitAt: MutationResolvers['setCompanyTeamLimitAt'] = async (
  _source,
  {orgId, maxTeamLimitAt}
) => {
  // VALIDATION
  const now = new Date()
  if (maxTeamLimitAt <= now) {
    throw new GraphQLError('maxTeamLimitAt must be in the future')
  }
  const maxAllowed = new Date(now.getTime() + ms('60d'))
  if (maxTeamLimitAt > maxAllowed) {
    throw new GraphQLError('maxTeamLimitAt cannot be more than 60 days in the future')
  }

  // RESOLUTION
  const pg = getKysely()
  const row = await pg
    .updateTable('CompanyCluster')
    .set({maxTeamLimitAt})
    .where(
      'id',
      '=',
      pg
        .selectFrom('CompanyClusterOrganization')
        .select('companyClusterId')
        .where('orgId', '=', orgId)
        .limit(1)
    )
    .returning('id')
    .executeTakeFirst()

  if (!row) {
    throw new GraphQLError('No company cluster found for the given orgId')
  }

  return {companyClusterId: row.id}
}

export default setCompanyTeamLimitAt
