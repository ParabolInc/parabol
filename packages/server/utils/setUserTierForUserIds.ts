import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'
import OrganizationUser from '../database/types/OrganizationUser'
import {TierEnum} from '../postgres/queries/generated/updateUserQuery'
import {getUsersByIds} from '../postgres/queries/getUsersByIds'
import updateUserTiers from '../postgres/queries/updateUserTiers'
import segmentIo from './segmentIo'

const setUserTierForUserIds = async (userIds: string[]) => {
  const r = await getRethink()
  const userTiers = (await r
    .table('OrganizationUser')
    .getAll(r.args(userIds), {index: 'userId'})
    .filter({removedAt: null})
    .merge((orgUser: RDatum<OrganizationUser>) => ({
      tier: r.table('Organization').get(orgUser('orgId'))('tier').default('starter')
    }))
    .group('userId')('tier')
    .ungroup()
    .map((row) => ({
      id: row('group'),
      tier: r.branch(
        row('reduction').contains('enterprise'),
        'enterprise',
        row('reduction').contains('team'),
        'team',
        'starter'
      )
    }))
    .run()) as {id: string; tier: TierEnum}[]
  const newUserTiers = userIds.map((userId) => {
    const userTier = userTiers.find((userTier) => userTier.id === userId)
    return {
      id: userId,
      tier: userTier ? userTier.tier : 'starter'
    }
  })
  await updateUserTiers({users: newUserTiers})

  const users = await getUsersByIds(userIds)
  users.forEach((user) => {
    user &&
      segmentIo.identify({
        userId: user.id,
        traits: {
          email: user.email,
          highestTier: user.tier
        }
      })
  })
}

export default setUserTierForUserIds
