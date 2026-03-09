import {pack} from 'msgpackr'
import {SubscriptionChannel} from '../../client/types/constEnums'
import type {DataLoaderInstance} from '../dataloader/RootDataLoader'
import type {ResolversTypes} from '../graphql/public/resolverTypes'
import getRedis from './getRedis'
import publish from './publish'

export type PublicPageNotificationPayload<T extends keyof ResolversTypes = 'CreatePagePayload'> = {
  type: T
  data: ResolversTypes[T]
  subOptions: {mutatorId?: string; operationId?: string}
  userIdsToIgnore: string[]
}

export const publishPageNotification = async (
  pageId: number,
  type: string,
  data: Record<string, any>,
  subOptions: {mutatorId?: string; operationId?: string},
  dataLoader: DataLoaderInstance
) => {
  const access = await dataLoader.get('pageAccessByPageId').load(pageId)
  const userIds = access.map((a) => a.userId).filter((userId) => userId !== '*')
  const isPubliclyAccessible = userIds.length < access.length
  userIds.forEach((userId) => {
    publish(SubscriptionChannel.NOTIFICATION, userId, type, data, subOptions)
  })
  if (isPubliclyAccessible) {
    const payload = {
      type,
      data,
      subOptions,
      userIdsToIgnore: userIds
    } as PublicPageNotificationPayload
    const redis = getRedis()
    await redis.publish(`publicPage:${pageId}`, pack(payload))
  }
}
