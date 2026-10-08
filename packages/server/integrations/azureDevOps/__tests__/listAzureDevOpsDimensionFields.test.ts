import type {DimensionFieldCtx} from '../../platform/ServerIntegrationDefinition'
import listAzureDevOpsDimensionFields from '../listAzureDevOpsDimensionFields'

const PROJECT_ID = '11111111-1111-4111-8111-111111111111'

const loaders: Record<string, {load: jest.Mock}> = {
  azureDevOpsWorkItem: {load: jest.fn()},
  azureDevOpsEstimateFields: {load: jest.fn()}
}

const azureDevOpsIntegration = {
  service: 'azureDevOps',
  accessUserId: 'user1',
  instanceId: 'dev.azure.com/acme',
  projectKey: 'WebApp',
  issueKey: '42'
}

const buildCtx = (integration: Record<string, unknown> | null = azureDevOpsIntegration) =>
  ({
    dataLoader: {get: (name: string) => loaders[name]},
    teamId: 'team1',
    viewerId: 'viewer1',
    task: {id: 'task1', integration}
  }) as unknown as DimensionFieldCtx

const storyPoints = {
  fieldId: 'Microsoft.VSTS.Scheduling.StoryPoints',
  label: 'Story Points',
  type: 'number'
}
const tShirtSize = {fieldId: 'Custom.TShirtSize', label: 'T-Shirt Size', type: 'string'}

describe('listAzureDevOpsDimensionFields', () => {
  it('lists the estimate fields of the loaded work item’s own project and type', async () => {
    loaders.azureDevOpsWorkItem!.load.mockResolvedValue({
      teamProject: PROJECT_ID,
      type: 'Product Backlog Item'
    })
    loaders.azureDevOpsEstimateFields!.load.mockResolvedValue([storyPoints, tShirtSize])

    await expect(listAzureDevOpsDimensionFields(buildCtx())).resolves.toEqual({
      options: [storyPoints, tShirtSize]
    })
    expect(loaders.azureDevOpsWorkItem!.load).toHaveBeenCalledWith({
      teamId: 'team1',
      userId: 'user1',
      instanceId: 'dev.azure.com/acme',
      workItemId: '42'
    })
    expect(loaders.azureDevOpsEstimateFields!.load).toHaveBeenCalledWith({
      teamId: 'team1',
      userId: 'user1',
      instanceId: 'dev.azure.com/acme',
      projectId: PROJECT_ID,
      workItemType: 'Product Backlog Item'
    })
  })

  it('offers nothing when the work item type has no estimate fields', async () => {
    loaders.azureDevOpsWorkItem!.load.mockResolvedValue({teamProject: PROJECT_ID, type: 'Epic'})
    loaders.azureDevOpsEstimateFields!.load.mockResolvedValue([])
    await expect(listAzureDevOpsDimensionFields(buildCtx())).resolves.toEqual({options: []})
  })

  it('offers nothing, without listing fields, when the work item cannot be loaded', async () => {
    loaders.azureDevOpsWorkItem!.load.mockResolvedValue(null)
    await expect(listAzureDevOpsDimensionFields(buildCtx())).resolves.toEqual({options: []})
    expect(loaders.azureDevOpsEstimateFields!.load).not.toHaveBeenCalled()
  })

  it.each([
    ['another service', {service: 'jira', accessUserId: 'user1'}],
    ['no integration', null]
  ])('offers nothing for a task linked to %s', async (_label, integration) => {
    await expect(listAzureDevOpsDimensionFields(buildCtx(integration))).resolves.toEqual({
      options: []
    })
    expect(loaders.azureDevOpsWorkItem!.load).not.toHaveBeenCalled()
  })
})
