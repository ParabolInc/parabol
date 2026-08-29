import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {DimensionFieldCtx} from '../../platform/ServerIntegrationDefinition'
import listAzureDevOpsDimensionFields from '../listAzureDevOpsDimensionFields'

const load = jest.fn()
const buildCtx = () =>
  ({
    dataLoader: {get: () => ({load})},
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
  }) as unknown as DimensionFieldCtx

describe('listAzureDevOpsDimensionFields', () => {
  beforeEach(() => jest.clearAllMocks())

  it.each([
    [
      'Agile:User Story',
      SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD,
      SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD_LABEL
    ],
    [
      'Agile:Task',
      SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD,
      SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD_LABEL
    ],
    [
      'Scrum:Task',
      SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_FIELD,
      SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_LABEL
    ],
    [
      'Scrum:Bug',
      SprintPokerDefaults.AZURE_DEVOPS_EFFORT_FIELD,
      SprintPokerDefaults.AZURE_DEVOPS_EFFORT_LABEL
    ],
    [
      'CMMI:Requirement',
      SprintPokerDefaults.AZURE_DEVOPS_SIZE_FIELD,
      SprintPokerDefaults.AZURE_DEVOPS_SIZE_LABEL
    ]
  ])('offers the one field the push path writes for %s', async (type, fieldId, label) => {
    load.mockResolvedValue({type})
    await expect(listAzureDevOpsDimensionFields(buildCtx())).resolves.toEqual({
      options: [{fieldId, label}]
    })
    expect(load).toHaveBeenCalledWith({
      teamId: 'team1',
      userId: 'user1',
      instanceId: 'dev.azure.com/acme',
      projectId: 'WebApp',
      viewerId: 'user1',
      workItemId: '42'
    })
  })

  it('offers nothing for a work item type the push path cannot write', async () => {
    load.mockResolvedValue({type: 'Custom:Widget'})
    await expect(listAzureDevOpsDimensionFields(buildCtx())).resolves.toEqual({options: []})
  })

  it('offers nothing when the work item cannot be loaded', async () => {
    load.mockResolvedValue(null)
    await expect(listAzureDevOpsDimensionFields(buildCtx())).resolves.toEqual({options: []})
  })
})
