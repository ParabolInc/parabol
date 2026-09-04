import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {DimensionFieldListing} from '../platform/ServerIntegrationDefinition'

const LINEAR_DIMENSION_FIELDS: DimensionFieldListing = {
  options: [
    {
      fieldId: SprintPokerDefaults.LINEAR_FIELD_ESTIMATE,
      label: SprintPokerDefaults.LINEAR_FIELD_ESTIMATE_LABEL
    },
    {
      fieldId: SprintPokerDefaults.LINEAR_FIELD_PRIORITY,
      label: SprintPokerDefaults.LINEAR_FIELD_PRIORITY_LABEL
    }
  ]
}

const listLinearDimensionFields = async () => LINEAR_DIMENSION_FIELDS

export default listLinearDimensionFields
