import {CheckInPhaseResolvers} from '../resolverTypes'

const CheckInPhase: CheckInPhaseResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'checkin'
}

export default CheckInPhase
