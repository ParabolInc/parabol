import {GraphQLBoolean, GraphQLObjectType, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import ThreadSourceEnum from './ThreadSourceEnum'

const EditCommentingPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'EditCommentingPayload',
  fields: () => ({
    isCommenting: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is commenting, false if the user has stopped commenting'
    },
    commentorId: {
      type: GraphQLNonNull(GraphQLID)
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    threadId: {
      type: GraphQLNonNull(GraphQLID)
    },
    threadSource: {
      type: GraphQLNonNull(ThreadSourceEnum)
    }
  })
})

export default EditCommentingPayload
