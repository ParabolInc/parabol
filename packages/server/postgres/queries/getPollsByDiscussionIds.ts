import getPg from '../getPg'
import {getPollsByDiscussionIdsQuery} from './generated/getPollsByDiscussionIdsQuery'

const getPollsByDiscussionIds = async (discussionIds: readonly string[]) =>
  getPollsByDiscussionIdsQuery.run({discussionIds}, getPg())

export default getPollsByDiscussionIds
