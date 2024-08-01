import {CheckInStageResolvers} from '../resolverTypes'

const CheckInStage: CheckInStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'checkin'
}

export default CheckInStage
