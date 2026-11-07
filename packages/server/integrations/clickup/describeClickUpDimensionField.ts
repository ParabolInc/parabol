import type {EstimatePushCapability} from '../platform/ServerIntegrationDefinition'

const describeClickUpDimensionField: EstimatePushCapability['describeDimensionField'] = async () =>
  new Error('ClickUp: mapping a dimension to a field is not implemented')

export default describeClickUpDimensionField
