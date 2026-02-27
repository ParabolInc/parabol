import PollId from 'parabol-client/shared/gqlIds/PollId'
import PollOptionId from '../../../../client/shared/gqlIds/PollOptionId'
import type {PollOptionResolvers} from '../resolverTypes'

const PollOption: PollOptionResolvers = {
  id: ({id}) => PollOptionId.join(id),
  poll: ({pollId}, _args, {dataLoader}) => {
    return dataLoader.get('polls').loadNonNull(pollId)
  },
  pollId: ({pollId}) => PollId.join(pollId)
}

export default PollOption
