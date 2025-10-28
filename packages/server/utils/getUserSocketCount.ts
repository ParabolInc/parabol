import {SubscriptionChannel} from '../../client/types/constEnums'
import getRedis, {type RedisPipelineResponse} from './getRedis'

export const getUserSocketCount = async (userId: string) => {
  const redis = getRedis()
  const channelName = `${SubscriptionChannel.NOTIFICATION}.${userId}`
  const [_, subscribers] = (await redis.pubsub(
    'NUMSUB',
    channelName
  )) as RedisPipelineResponse<number>
  return Number(subscribers)
}
