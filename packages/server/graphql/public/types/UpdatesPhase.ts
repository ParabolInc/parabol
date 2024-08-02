import {UpdatesPhaseResolvers} from '../resolverTypes'

const UpdatesPhase: UpdatesPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'updates'
}

export default UpdatesPhase
