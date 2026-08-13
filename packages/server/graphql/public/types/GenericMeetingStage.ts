import type {GenericMeetingStageResolvers} from '../resolverTypes'

const GenericMeetingStage: GenericMeetingStageResolvers = {
  __isTypeOf: ({phaseType}) =>
    [
      'reflect',
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

export default GenericMeetingStage
