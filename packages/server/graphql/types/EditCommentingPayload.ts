import {GraphQLBoolean, GraphQLObjectType, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import ThreadSourceEnum from './ThreadSourceEnum'

const EditCommentingPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'EditCommentingPayload',
  fields: () => ({
    isAnonymous: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the person commenting should be anonymous'
    },
    isCommenting: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is commenting, false if the user has stopped commenting'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    preferredName: {
      type: GraphQLNonNull(GraphQLString),
      description: 'the preferred name of the user that is commenting or has stopped commenting'
    },
    threadId: {
      type: GraphQLNonNull(GraphQLID)
    }
  })
})

export default EditCommentingPayload
