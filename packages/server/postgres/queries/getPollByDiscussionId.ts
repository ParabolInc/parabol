import {getPollsByDiscussionIdQuery} from './generated/getPollsByDiscussionIdQuery'
import getPg from '../getPg'

const getPollByDiscussionId = async (discussionIds: readonly string[]) => {
  return getPollsByDiscussionIdQuery.run({discussionIds}, getPg())
}

export default getPollByDiscussionId
