import getKysely from '../../../postgres/getKysely'
import isValid from '../../isValid'
import type {CompanyClusterResolvers} from '../resolverTypes'

export type CompanyClusterSource = {
  id: number
}

const CompanyCluster: CompanyClusterResolvers = {
  id: ({id}) => String(id),
  organizations: async ({id}, _args, {dataLoader}) => {
    const pg = getKysely()
    const rows = await pg
      .selectFrom('CompanyClusterOrganization')
      .select('orgId')
      .where('companyClusterId', '=', id)
      .execute()
    const orgIds = rows.map((r) => r.orgId)
    return (await dataLoader.get('organizations').loadMany(orgIds)).filter(isValid)
  },
  domains: async ({id}) => {
    const pg = getKysely()
    const rows = await pg
      .selectFrom('CompanyClusterDomain')
      .select('domain')
      .where('companyClusterId', '=', id)
      .execute()
    return rows.map((r) => r.domain)
  },
  maxTeamLimitAt: async ({id}) => {
    const pg = getKysely()
    const row = await pg
      .selectFrom('CompanyCluster')
      .select('maxTeamLimitAt')
      .where('id', '=', id)
      .executeTakeFirst()
    return row?.maxTeamLimitAt ?? null
  }
}

export default CompanyCluster
