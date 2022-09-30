import getPg from '../getPg'
import {getDiscussionsByIdsQuery} from './generated/getDiscussionsByIdsQuery'

export const getDiscussionsByIds = async (ids: readonly string[]) => {
  const discussions = await getDiscussionsByIdsQuery.run({ids}, getPg())
  return discussions
}
