import getRethink from '../database/rethinkDriver'
import {TierEnum} from 'parabol-client/types/graphql'

const setTierForOrgUsers = async (orgId: string) => {
  const r = await getRethink()
  await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .update(
      {
        tier: (r
          .table('Organization')
          .get(orgId)
          .getField('tier') as unknown) as TierEnum
      },
      {nonAtomic: true}
    )
    .run()
}

export default setTierForOrgUsers
