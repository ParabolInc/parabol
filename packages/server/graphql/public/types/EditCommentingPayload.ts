import type {EditCommentingPayloadResolvers} from '../resolverTypes'

export type EditCommentingPayloadSource = {
  discussionId: string
}

const EditCommentingPayload: EditCommentingPayloadResolvers = {
  discussion: ({discussionId}, _args, {dataLoader}) => {
    return dataLoader.get('discussions').loadNonNull(discussionId)
  }
}

export default EditCommentingPayload
