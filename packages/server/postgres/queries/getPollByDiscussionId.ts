import {MaybeReadonly} from 'parabol-client/types/generics'
import {getPollsByDiscussionIdQuery} from './generated/getPollsByDiscussionIdQuery'
import getPg from '../getPg'
import catchAndLog from '../utils/catchAndLog'

const getPollByDiscussionId = async (discussionIds: MaybeReadonly<string[]>) => {
  return await catchAndLog(() =>
    getPollsByDiscussionIdQuery.run({discussionIds: discussionIds as any}, getPg())
  )
}

export default getPollByDiscussionId
