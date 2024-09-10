import {AddCommentSuccessResolvers} from '../resolverTypes'

export type AddCommentSuccessSource = {
  commentId: string
  meetingId: string
}

const AddCommentSuccess: AddCommentSuccessResolvers = {
  comment: async ({commentId}, _args, {dataLoader}) => {
    return dataLoader.get('comments').loadNonNull(commentId)
  }
}

export default AddCommentSuccess
