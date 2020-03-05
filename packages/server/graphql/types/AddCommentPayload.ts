import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import Comment from './Comment'
import makeMutationPayload from './makeMutationPayload'

export const AddCommentPayloadSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddCommentPayloadSuccess',
  fields: () => ({
    comment: {
      type: GraphQLNonNull(Comment),
      description: 'the comment just created',
      resolve: async ({commentId}, _args, {dataLoader}) => {
        return dataLoader.get('comments').load(commentId)
      }
    }
  })
})

const AddCommentPayloadPayload = makeMutationPayload(
  'AddCommentPayloadPayload',
  AddCommentPayloadSuccess
)

export default AddCommentPayloadPayload
