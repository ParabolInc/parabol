import {DiscussionThreadStageResolvers} from '../resolverTypes'

const DiscussionThreadStage: DiscussionThreadStageResolvers = {
  discussion: async ({discussionId}, _args, {dataLoader}) => {
    return dataLoader.get('discussions').loadNonNull(discussionId)
  }
}

export default DiscussionThreadStage
