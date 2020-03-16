import {GraphQLNonNull, GraphQLObjectType, GraphQLID} from 'graphql'
import {GQLContext} from '../graphql'
import Comment from './Comment'
import makeMutationPayload from './makeMutationPayload'

export const DeleteCommentSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'DeleteCommentSuccess',
  fields: () => ({
    commentId: {
      type: GraphQLNonNull(GraphQLID)
    },
    comment: {
      type: GraphQLNonNull(Comment),
      description: 'the comment just deleted',
      resolve: async ({commentId}, _args, {dataLoader}) => {
        return dataLoader.get('comments').load(commentId)
      }
    }
  })
})

const DeleteCommentPayload = makeMutationPayload('DeleteCommentPayload', DeleteCommentSuccess)

export default DeleteCommentPayload
