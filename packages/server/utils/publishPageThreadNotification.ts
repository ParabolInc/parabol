import {hasMinPageRole} from '../../client/shared/hasMinPageRole'
import {SubscriptionChannel} from '../../client/types/constEnums'
import type {DataLoaderInstance} from '../dataloader/RootDataLoader'
import type {ResolversTypes} from '../graphql/public/resolverTypes'
import publish, {type SubOptions} from './publish'

// Threads are hidden from viewers, so they can't go out with publishPageNotification,
// which reaches everyone who can open the page
export const publishPageThreadNotification = async <T extends keyof ResolversTypes>(
  pageId: number,
  type: T,
  data: Record<string, unknown>,
  subOptions: SubOptions,
  dataLoader: DataLoaderInstance
) => {
  const access = await dataLoader.get('pageAccessByPageId').load(pageId)
  access
    .filter(({role}) => hasMinPageRole('commenter', role))
    .forEach(({userId}) => {
      publish(SubscriptionChannel.NOTIFICATION, userId, type, data, subOptions)
    })
}
