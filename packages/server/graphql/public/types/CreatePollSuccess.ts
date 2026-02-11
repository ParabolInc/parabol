import PollId from 'parabol-client/shared/gqlIds/PollId'
import type {CreatePollSuccessResolvers} from '../resolverTypes'

export type CreatePollSuccessSource = {
  pollId: number
}

const CreatePollSuccess: CreatePollSuccessResolvers = {
  pollId: ({pollId}) => PollId.join(pollId),
  poll: ({pollId}, _args, {dataLoader}) => {
    return dataLoader.get('polls').loadNonNull(pollId)
  }
}

export default CreatePollSuccess
