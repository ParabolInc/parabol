import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import listGitLabDimensionFields from '../listGitLabDimensionFields'

describe('listGitLabDimensionFields', () => {
  it('offers the Time Estimate and Weight fields the push path writes', async () => {
    await expect(listGitLabDimensionFields()).resolves.toEqual({
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
    })
  })
})
