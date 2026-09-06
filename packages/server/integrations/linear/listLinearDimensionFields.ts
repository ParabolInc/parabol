import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {ServiceFieldListing} from '../platform/ServerIntegrationDefinition'

const LINEAR_DIMENSION_FIELDS: ServiceFieldListing = {
  options: [
    {
      fieldId: SprintPokerDefaults.LINEAR_FIELD_ESTIMATE,
      label: SprintPokerDefaults.LINEAR_FIELD_ESTIMATE_LABEL,
      type: 'string'
    },
    {
      fieldId: SprintPokerDefaults.LINEAR_FIELD_PRIORITY,
      label: SprintPokerDefaults.LINEAR_FIELD_PRIORITY_LABEL,
      type: 'string'
    }
  ]
}

const listLinearDimensionFields = async () => LINEAR_DIMENSION_FIELDS

export default listLinearDimensionFields
