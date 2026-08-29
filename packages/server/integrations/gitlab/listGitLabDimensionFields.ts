import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {DimensionFieldListing} from '../platform/ServerIntegrationDefinition'

const GITLAB_DIMENSION_FIELDS: DimensionFieldListing = {
  options: [
    {
      fieldId: SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE,
      label: SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE_LABEL
    },
    {
      fieldId: SprintPokerDefaults.GITLAB_FIELD_WEIGHT,
      label: SprintPokerDefaults.GITLAB_FIELD_WEIGHT_LABEL
    }
  ]
}

const listGitLabDimensionFields = async () => GITLAB_DIMENSION_FIELDS

export default listGitLabDimensionFields
