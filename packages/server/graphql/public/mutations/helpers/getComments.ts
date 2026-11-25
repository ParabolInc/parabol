import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import getKysely from '../../../../postgres/getKysely'
import {getDiscussionComments} from './getDiscussionComments'

export const getComments = async (reflectionGroupId: string, dataLoader: DataLoaderInstance) => {
  const discussion = await getKysely()
    .selectFrom('Discussion')
    .select('id')
    .where('discussionTopicId', '=', reflectionGroupId)
    .limit(1)
    .executeTakeFirst()
  if (!discussion) return []
  return getDiscussionComments(discussion.id, dataLoader)
}
