import {DiscussPhaseResolvers} from '../resolverTypes'

const DiscussPhase: DiscussPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'discuss'
}

export default DiscussPhase
