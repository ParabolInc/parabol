import getKysely from '../postgres/getKysely'
import setUserTierForUserIds from './setUserTierForUserIds'

const setUserTierForOrgId = async (orgId: string) => {
  const pg = getKysely()
  const orgUsers = await pg
    .selectFrom('OrganizationUser')
    .select('userId')
    .where('orgId', '=', orgId)
    .where('removedAt', 'is', null)
    .execute()
  const userIds = orgUsers.map(({userId}) => userId)
  await setUserTierForUserIds(userIds)
}

export default setUserTierForOrgId
