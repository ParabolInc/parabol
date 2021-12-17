import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import {GQLContext} from '../graphql'
import Discussion from './Discussion'

export const discussionThreadStageFields = () => ({
  discussionId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The ID to find the discussion that goes in the stage',
    // fix for the dummy stage
    resolve: ({discussionId}: {discussionId: string}) => discussionId || ''
  },
  discussion: {
    type: new GraphQLNonNull(Discussion),
    description: 'The discussion about the stage',
    resolve: async (
      {discussionId}: {discussionId: string},
      _args: unknown,
      {dataLoader}: GQLContext
    ) => {
      return dataLoader.get('discussions').load(discussionId)
    }
  }
})

const DiscussionThreadStage = new GraphQLInterfaceType({
  name: 'DiscussionThreadStage',
  description: 'A meeting stage that includes a discussion thread',
  fields: discussionThreadStageFields
})

export default DiscussionThreadStage
