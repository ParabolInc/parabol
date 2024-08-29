import {DeleteCommentSuccessResolvers} from '../resolverTypes'

export type DeleteCommentSuccessSource = {
  commentId: string
}

const DeleteCommentSuccess: DeleteCommentSuccessResolvers = {
  comment: async ({commentId}, _args, {dataLoader}) => {
    return dataLoader.get('comments').load(commentId)
  }
}

export default DeleteCommentSuccess
