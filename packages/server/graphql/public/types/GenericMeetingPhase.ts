import {GenericMeetingPhaseResolvers} from '../resolverTypes'

const GenericMeetingPhase: GenericMeetingPhaseResolvers = {
  __isTypeOf: ({phaseType}) =>
    ['group', 'vote', 'firstcall', 'lastcall', 'SCOPE'].includes(phaseType)
}

export default GenericMeetingPhase
