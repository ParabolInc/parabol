import {getDiscussionsByIdsQuery} from './generated/getDiscussionsByIdsQuery'
import getPg from '../getPg'

export const getDiscussionsByIds = async (ids: readonly string[]) => {
  const discussions = await getDiscussionsByIdsQuery.run({ids}, getPg())
  return discussions
}
