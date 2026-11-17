import type {AddCommentPayloadResolvers} from '../resolverTypes'

export type AddCommentPayloadSource = {
  commentId: string
  meetingId: string
}

const AddCommentPayload: AddCommentPayloadResolvers = {
  comment: async ({commentId}, _args, {dataLoader}) => {
    return dataLoader.get('comments').loadNonNull(commentId)
  }
}

export default AddCommentPayload
