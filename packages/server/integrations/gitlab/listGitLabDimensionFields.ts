import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {ServiceFieldListing} from '../platform/ServerIntegrationDefinition'

const GITLAB_DIMENSION_FIELDS: ServiceFieldListing = {
  options: [
    {
      fieldId: SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE,
      label: SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE_LABEL,
      type: 'string'
    },
    {
      fieldId: SprintPokerDefaults.GITLAB_FIELD_WEIGHT,
      label: SprintPokerDefaults.GITLAB_FIELD_WEIGHT_LABEL,
      type: 'string'
    }
  ]
}

const listGitLabDimensionFields = async () => GITLAB_DIMENSION_FIELDS

export default listGitLabDimensionFields
