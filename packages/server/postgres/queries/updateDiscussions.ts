import getPg from '../getPg'
import {
  IUpdateDiscussionsQueryParams,
  updateDiscussionsQuery
} from './generated/updateDiscussionsQuery'

export type InputDiscussions = Partial<IUpdateDiscussionsQueryParams>

const updateDiscussions = async (
  discussion: InputDiscussions,
  discussionIds: string | string[]
) => {
  const ids = discussionIds instanceof Array ? discussionIds : [discussionIds]
  updateDiscussionsQuery.run({...discussion, ids} as any, getPg())
}

export default updateDiscussions
