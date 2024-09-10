import {SuggestedActionTryActionMeetingResolvers} from '../resolverTypes'

const SuggestedActionTryActionMeeting: SuggestedActionTryActionMeetingResolvers = {
  __isTypeOf: ({type}) => type === 'tryActionMeeting',
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default SuggestedActionTryActionMeeting
