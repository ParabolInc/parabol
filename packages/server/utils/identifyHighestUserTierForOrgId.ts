import {DataLoaderInstance} from '../dataloader/RootDataLoader'
import {analytics} from './analytics/analytics'

/*
 * Update the highest tier for all users in the organization in analytics
 */
export const identifyHighestUserTierForOrgId = async (
  orgId: string,
  dataLoader: DataLoaderInstance
) => {
  const orgUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
  const userIds = orgUsers.map(({userId}) => userId)
  await Promise.all(
    userIds.map(async (userId) => {
      const [user, highestTier] = await Promise.all([
        dataLoader.get('users').load(userId),
        dataLoader.get('highestTierForUserId').load(userId)
      ])
      if (!user) return
      analytics.identify({
        userId,
        email: user.email,
        highestTier
      })
    })
  )
}
