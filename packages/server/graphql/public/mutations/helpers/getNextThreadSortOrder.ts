import {SORT_STEP} from 'parabol-client/utils/constants'
import getKysely from '../../../../postgres/getKysely'

const getNextThreadSortOrder = async (
  discussionId: string,
  threadParentId: string | null | undefined
) => {
  const pg = getKysely()
  const siblings = await pg
    .selectFrom('Task')
    .select('threadSortOrder')
    .where('discussionId', '=', discussionId)
    .where('threadParentId', threadParentId ? '=' : 'is', threadParentId ?? null)
    .unionAll(
      pg
        .selectFrom('Comment')
        .select('threadSortOrder')
        .where('discussionId', '=', discussionId)
        .where('threadParentId', threadParentId ? '=' : 'is', threadParentId ?? null)
    )
    .execute()
  return Math.max(0, ...siblings.map(({threadSortOrder}) => threadSortOrder ?? 0)) + SORT_STEP
}

export default getNextThreadSortOrder
