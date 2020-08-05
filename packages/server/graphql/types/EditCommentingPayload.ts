import {GraphQLBoolean, GraphQLObjectType, GraphQLID, GraphQLNonNull} from 'graphql'
import {GQLContext} from '../graphql'
import User from './User'
import ThreadSourceEnum from './ThreadSourceEnum'

const EditCommentingPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'EditCommentingPayload',
  fields: () => ({
    isCommenting: {
      type: GraphQLBoolean,
      description: 'true if the user is commenting, false if the user has stopped commenting'
    },
    // commenterId: {
    //   type: GraphQLNonNull(GraphQLID)
    // },
    commenter: {
      type: User,
      description: 'The user that is commenting or has stopped commenting',
      resolve: ({commenterId}, _args, {dataLoader}) => {
        return commenterId ? dataLoader.get('users').load(commenterId) : null
      }
    },
    meetingId: {
      type: GraphQLID
    },
    threadId: {
      type: GraphQLID
    },
    threadSource: {
      type: ThreadSourceEnum
    }
  })
})

export default EditCommentingPayload
