import type {EditCommentingSuccessResolvers} from '../resolverTypes'

export type EditCommentingSuccessSource = {
  discussionId: string
}

const EditCommentingSuccess: EditCommentingSuccessResolvers = {
  discussion: ({discussionId}, _args, {dataLoader}) => {
    return dataLoader.get('discussions').loadNonNull(discussionId)
  }
}

export default EditCommentingSuccess
