import getRethink from '../database/rethinkDriver'
import setUserTierForUserIds from './setUserTierForUserIds'

const setUserTierForOrgId = async (orgId: string) => {
  const r = await getRethink()
  const userIds = await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})('userId')
    .run()
  await setUserTierForUserIds(userIds)
}

export default setUserTierForOrgId
