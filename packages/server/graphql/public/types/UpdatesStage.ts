import {UpdatesStageResolvers} from '../resolverTypes'

const UpdatesStage: UpdatesStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'updates'
}

export default UpdatesStage
