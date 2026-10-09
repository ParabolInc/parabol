import type {AddPageCommentSuccessResolvers} from '../resolverTypes'

export type AddPageCommentSuccessSource = {
  commentId: number
  threadId: number
}

const AddPageCommentSuccess: AddPageCommentSuccessResolvers = {
  comment: ({commentId}, _args, {dataLoader}) => {
    return dataLoader.get('pageComments').loadNonNull(commentId)
  },
  thread: ({threadId}, _args, {dataLoader}) => {
    return dataLoader.get('pageThreads').loadNonNull(threadId)
  }
}

export default AddPageCommentSuccess
