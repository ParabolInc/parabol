import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {DimensionFieldCtx, DimensionFieldKey} from '../../platform/ServerIntegrationDefinition'
import describeAzureDevOpsDimensionField from '../describeAzureDevOpsDimensionField'

const ctx = {} as DimensionFieldCtx
const key = {} as DimensionFieldKey

describe('describeAzureDevOpsDimensionField', () => {
  it.each([
    [
      SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD,
      SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD_LABEL
    ],
    [
      SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD,
      SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD_LABEL
    ],
    [
      SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_FIELD,
      SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_LABEL
    ],
    [SprintPokerDefaults.AZURE_DEVOPS_EFFORT_FIELD, SprintPokerDefaults.AZURE_DEVOPS_EFFORT_LABEL],
    [SprintPokerDefaults.AZURE_DEVOPS_SIZE_FIELD, SprintPokerDefaults.AZURE_DEVOPS_SIZE_LABEL]
  ])(
    'stores the human label for %s so the dropdown never renders the raw id',
    async (fieldId, label) => {
      await expect(describeAzureDevOpsDimensionField(ctx, key, fieldId)).resolves.toEqual({
        fieldId,
        fieldName: label,
        fieldType: 'string'
      })
    }
  )

  it('leaves fieldName null for an id the option table does not know', async () => {
    await expect(describeAzureDevOpsDimensionField(ctx, key, 'Custom.Points')).resolves.toEqual({
      fieldId: 'Custom.Points',
      fieldName: null,
      fieldType: 'string'
    })
  })

  it('rejects an empty or overlong field id', async () => {
    await expect(describeAzureDevOpsDimensionField(ctx, key, '  ')).resolves.toBeInstanceOf(Error)
    await expect(
      describeAzureDevOpsDimensionField(ctx, key, 'x'.repeat(121))
    ).resolves.toBeInstanceOf(Error)
  })
})
