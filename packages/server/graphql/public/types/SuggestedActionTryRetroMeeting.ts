import {SuggestedActionTryRetroMeetingResolvers} from '../resolverTypes'

const SuggestedActionTryRetroMeeting: SuggestedActionTryRetroMeetingResolvers = {
  __isTypeOf: ({type}) => type === 'tryRetroMeeting',
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default SuggestedActionTryRetroMeeting
