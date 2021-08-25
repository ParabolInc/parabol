import {getPollsByDiscussionIdQuery} from './generated/getPollsByDiscussionIdQuery'
import getPg from '../getPg'

const getPollByDiscussionId = async (discussionIds: readonly string[]) =>
  getPollsByDiscussionIdQuery.run({discussionIds}, getPg())

export default getPollByDiscussionId
