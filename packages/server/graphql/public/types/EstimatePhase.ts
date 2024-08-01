import {EstimatePhaseResolvers} from '../resolverTypes'

const EstimatePhase: EstimatePhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'ESTIMATE'
}

export default EstimatePhase
