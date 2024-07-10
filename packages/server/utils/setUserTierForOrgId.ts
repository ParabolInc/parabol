import getRethink from '../database/rethinkDriver'
import getKysely from '../postgres/getKysely'
import setUserTierForUserIds from './setUserTierForUserIds'

const setUserTierForOrgId = async (orgId: string) => {
  const r = await getRethink()
  const pg = getKysely()
  const _userIds = await pg
    .selectFrom('OrganizationUser')
    .select('userId')
    .where('orgId', '=', orgId)
    .where('removedAt', 'is', null)
    .execute()
  console.log({_userIds})
  const userIds = await r
    .table('OrganizationUser')
    .getAll(orgId, {index: 'orgId'})
    .filter({removedAt: null})('userId')
    .run()
  await setUserTierForUserIds(userIds)
}

export default setUserTierForOrgId
