import {GenericMeetingStageResolvers} from '../resolverTypes'

const GenericMeetingStage: GenericMeetingStageResolvers = {
  __isTypeOf: ({phaseType}) =>
    ['reflect', 'group', 'vote', 'firstcall', 'lastcall', 'SCOPE'].includes(phaseType)
}

export default GenericMeetingStage
