import {SORT_STEP} from 'parabol-client/utils/constants'
import getKysely from '../../../../postgres/getKysely'

const getNextThreadSortOrder = async (
  discussionId: string,
  threadParentId: string | null | undefined
) => {
  const pg = getKysely()
  const tasksAndComments = pg
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
  const siblings = threadParentId
    ? tasksAndComments
    : tasksAndComments.unionAll(
        pg.selectFrom('Poll').select('threadSortOrder').where('discussionId', '=', discussionId)
      )
  const {maxSortOrder} = await pg
    .selectFrom(siblings.as('sibling'))
    .select(({fn}) => fn.max('threadSortOrder').as('maxSortOrder'))
    .executeTakeFirstOrThrow()
  return Math.max(0, maxSortOrder ?? 0) + SORT_STEP
}

export default getNextThreadSortOrder
