import PollId from '../../../../client/shared/gqlIds/PollId'
import type {PollResolvers} from '../resolverTypes'

const Poll: PollResolvers = {
  createdByUser: ({createdById}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(createdById)
  },
  id: ({id}) => PollId.join(id),
  options: ({id: pollId}, _args, {dataLoader}) => {
    return dataLoader.get('pollOptions').load(pollId)
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default Poll
