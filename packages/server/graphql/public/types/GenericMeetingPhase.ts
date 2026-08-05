import type {GenericMeetingPhaseResolvers} from '../resolverTypes'

const GenericMeetingPhase: GenericMeetingPhaseResolvers = {
  __isTypeOf: ({phaseType}) =>
    [
      'group',
      'vote',
      'firstcall',
      'lastcall',
      'SCOPE',
      'TEAM_HEALTH_INTRO',
      'TEAM_HEALTH_SUBMITTED',
      'TEAM_HEALTH_RESULT'
    ].includes(phaseType)
}

export default GenericMeetingPhase
