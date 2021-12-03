import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import Comment from './Comment'
import makeMutationPayload from './makeMutationPayload'

export const UpdateCommentContentSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateCommentContentSuccess',
  fields: () => ({
    comment: {
      type: new GraphQLNonNull(Comment),
      description: 'the comment with updated content',
      resolve: async ({commentId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('comments').load(commentId)
      }
    }
  })
})

const UpdateCommentContentPayload = makeMutationPayload(
  'UpdateCommentContentPayload',
  UpdateCommentContentSuccess
)

export default UpdateCommentContentPayload
