import {SubscriptionChannel} from '../client/types/constEnums'
import {getTeamMemberUserIds} from './utils/getTeamMemberUserIds'
import publish from './utils/publish'
import recordUserActivity from './utils/recordUserActivity'

export const handleFirstConnection = async (
  user: {id: string; email: string; inactive: boolean; lastSeenAt: Date},
  teamIds: string[]
) => {
  const userIds = await getTeamMemberUserIds(teamIds)
  userIds.forEach(({userId}) => {
    publish(SubscriptionChannel.NOTIFICATION, userId, 'User', user)
  })
  await recordUserActivity(user)
}
