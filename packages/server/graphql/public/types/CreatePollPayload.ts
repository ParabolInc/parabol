import PollId from 'parabol-client/shared/gqlIds/PollId'
import type {CreatePollPayloadResolvers} from '../resolverTypes'

export type CreatePollPayloadSource = {
  pollId: number
}

const CreatePollPayload: CreatePollPayloadResolvers = {
  pollId: ({pollId}) => PollId.join(pollId),
  poll: ({pollId}, _args, {dataLoader}) => {
    return dataLoader.get('polls').loadNonNull(pollId)
  }
}

export default CreatePollPayload
