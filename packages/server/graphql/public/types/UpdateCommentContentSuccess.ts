import {UpdateCommentContentSuccessResolvers} from '../resolverTypes'

export type UpdateCommentContentSuccessSource = {
  commentId: string
}

const UpdateCommentContentSuccess: UpdateCommentContentSuccessResolvers = {
  comment: async ({commentId}, _args, {dataLoader}) => {
    return dataLoader.get('comments').load(commentId)
  }
}

export default UpdateCommentContentSuccess
