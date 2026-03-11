import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import type {UserResolvers} from '../resolverTypes'

const User: UserResolvers = {
  companyCluster: async (_source, {orgId, domain}) => {
    if (!orgId && !domain) {
      throw new GraphQLError('Either orgId or domain must be provided')
    }

    const pg = getKysely()

    if (orgId) {
      const row = await pg
        .selectFrom('CompanyClusterOrganization')
        .select('companyClusterId')
        .where('orgId', '=', orgId)
        .executeTakeFirst()
      return row ? {id: row.companyClusterId} : null
    }

    const row = await pg
      .selectFrom('CompanyClusterDomain')
      .select('companyClusterId')
      .where('domain', '=', domain!)
      .executeTakeFirst()
    return row ? {id: row.companyClusterId} : null
  }
}

export default User
