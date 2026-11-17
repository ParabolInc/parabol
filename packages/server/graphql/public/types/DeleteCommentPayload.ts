import type {DeleteCommentPayloadResolvers} from '../resolverTypes'

export type DeleteCommentPayloadSource = {
  commentId: string
}

const DeleteCommentPayload: DeleteCommentPayloadResolvers = {
  comment: async ({commentId}, _args, {dataLoader}) => {
    return dataLoader.get('comments').loadNonNull(commentId)
  }
}

export default DeleteCommentPayload
