import type {DimensionFieldCtx, DimensionFieldKey} from '../../platform/ServerIntegrationDefinition'
import describeAzureDevOpsDimensionField from '../describeAzureDevOpsDimensionField'

const loaders: Record<string, {load: jest.Mock}> = {
  azureDevOpsWorkItem: {load: jest.fn()},
  azureDevOpsEstimateFields: {load: jest.fn()}
}

const ctx = {
  dataLoader: {get: (name: string) => loaders[name]},
  teamId: 'team1',
  viewerId: 'viewer1',
  task: {
    id: 'task1',
    integration: {
      service: 'azureDevOps',
      accessUserId: 'user1',
      instanceId: 'dev.azure.com/acme',
      projectKey: 'WebApp',
      issueKey: '42'
    }
  }
} as unknown as DimensionFieldCtx

const key: DimensionFieldKey = {repoId: 'dev.azure.com/acme:WebApp', issueType: 'User Story'}

describe('describeAzureDevOpsDimensionField', () => {
  beforeEach(() => {
    loaders.azureDevOpsWorkItem!.load.mockResolvedValue({teamProject: 'WebApp', type: 'User Story'})
    loaders.azureDevOpsEstimateFields!.load.mockResolvedValue([
      {fieldId: 'Microsoft.VSTS.Scheduling.StoryPoints', label: 'Story Points', type: 'number'},
      {fieldId: 'Custom.TShirtSize', label: 'T-Shirt Size', type: 'string'}
    ])
  })

  it.each([
    ['Microsoft.VSTS.Scheduling.StoryPoints', 'Story Points', 'number'],
    ['Custom.TShirtSize', 'T-Shirt Size', 'string']
  ])('stores the label and type Azure DevOps reports for %s', async (fieldId, label, type) => {
    await expect(describeAzureDevOpsDimensionField(ctx, key, fieldId)).resolves.toEqual({
      fieldId,
      fieldName: label,
      fieldType: type
    })
  })

  it.each([
    ['a field of another work item type', 'Microsoft.VSTS.Scheduling.RemainingWork'],
    ['a legacy sentinel id', '__storyPoints'],
    ['an empty id', '']
  ])('rejects %s', async (_label, fieldId) => {
    const res = await describeAzureDevOpsDimensionField(ctx, key, fieldId)
    expect(res).toBeInstanceOf(Error)
    expect(res).toHaveProperty('message', 'That field is not on this work item type')
  })

  it('rejects every field when the work item cannot be loaded', async () => {
    loaders.azureDevOpsWorkItem!.load.mockResolvedValue(null)
    await expect(
      describeAzureDevOpsDimensionField(ctx, key, 'Microsoft.VSTS.Scheduling.StoryPoints')
    ).resolves.toBeInstanceOf(Error)
  })
})
