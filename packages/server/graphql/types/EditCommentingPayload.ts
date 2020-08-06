import {GraphQLBoolean, GraphQLObjectType, GraphQLID, GraphQLNonNull} from 'graphql'
import {GQLContext} from '../graphql'
import User from './User'

const EditCommentingPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'EditCommentingPayload',
  fields: () => ({
    isCommenting: {
      type: GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user is commenting, false if the user has stopped commenting'
    },
    commenter: {
      type: User,
      description: 'The user that is commenting or has stopped commenting',
      resolve: ({commenterId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(commenterId)
      }
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    threadId: {
      type: GraphQLNonNull(GraphQLID)
    }
  })
})

export default EditCommentingPayload
