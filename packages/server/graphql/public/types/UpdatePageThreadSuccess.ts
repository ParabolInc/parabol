import type {UpdatePageThreadSuccessResolvers} from '../resolverTypes'

export type UpdatePageThreadSuccessSource = {
  threadId: number
}

const UpdatePageThreadSuccess: UpdatePageThreadSuccessResolvers = {
  thread: ({threadId}, _args, {dataLoader}) => {
    return dataLoader.get('pageThreads').loadNonNull(threadId)
  }
}

export default UpdatePageThreadSuccess
