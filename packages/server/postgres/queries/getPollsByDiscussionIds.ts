import {getPollsByDiscussionIdsQuery} from './generated/getPollsByDiscussionIdsQuery'
import getPg from '../getPg'

const getPollsByDiscussionIds = async (discussionIds: readonly string[]) =>
  getPollsByDiscussionIdsQuery.run({discussionIds}, getPg())

export default getPollsByDiscussionIds
