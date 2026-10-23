import type {UpdatePageCommentSuccessResolvers} from '../resolverTypes'

export type UpdatePageCommentSuccessSource = {
  commentId: number
}

const UpdatePageCommentSuccess: UpdatePageCommentSuccessResolvers = {
  comment: ({commentId}, _args, {dataLoader}) => {
    return dataLoader.get('pageComments').loadNonNull(commentId)
  }
}

export default UpdatePageCommentSuccess
