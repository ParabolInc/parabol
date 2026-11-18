import type {UpdateCommentContentPayloadResolvers} from '../resolverTypes'

export type UpdateCommentContentPayloadSource = {
  commentId: string
}

const UpdateCommentContentPayload: UpdateCommentContentPayloadResolvers = {
  comment: async ({commentId}, _args, {dataLoader}) => {
    return dataLoader.get('comments').loadNonNull(commentId)
  }
}

export default UpdateCommentContentPayload
