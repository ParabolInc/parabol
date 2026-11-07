import type {EstimatePushCapability} from '../platform/ServerIntegrationDefinition'

const pushEstimateToClickUp: EstimatePushCapability['pushEstimate'] = async () =>
  new Error('ClickUp: pushing an estimate is not implemented')

export default pushEstimateToClickUp
