import {ExternalLinks} from 'parabol-client/types/constEnums'
import type {DimensionFieldCtx} from '../../platform/ServerIntegrationDefinition'
import listJiraDimensionFields from '../listJiraDimensionFields'

const load = jest.fn()
const buildCtx = (integration: unknown) =>
  ({
    dataLoader: {get: () => ({load})},
    teamId: 'team1',
    viewerId: 'viewer1',
    task: {id: 'task1', integration}
  }) as unknown as DimensionFieldCtx

const jiraIntegration = {
  service: 'jira',
  cloudId: 'cloud1',
  issueKey: 'WEB-1',
  accessUserId: 'user1'
}

describe('listJiraDimensionFields', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns no options for a non-Jira task', async () => {
    await expect(listJiraDimensionFields(buildCtx({service: 'github'}))).resolves.toEqual({
      options: []
    })
    expect(load).not.toHaveBeenCalled()
  })

  it('maps possibleEstimationFields to options with the fieldName as label', async () => {
    load.mockResolvedValue({
      possibleEstimationFields: [
        {fieldId: 'customfield_1', fieldName: 'Story Points', fieldType: 'number'},
        {fieldId: 'customfield_2', fieldName: 'Effort', fieldType: 'number'}
      ]
    })
    await expect(listJiraDimensionFields(buildCtx(jiraIntegration))).resolves.toEqual({
      options: [
        {fieldId: 'customfield_1', label: 'Story Points'},
        {fieldId: 'customfield_2', label: 'Effort'}
      ]
    })
    expect(load).toHaveBeenCalledWith({
      teamId: 'team1',
      userId: 'user1',
      cloudId: 'cloud1',
      issueKey: 'WEB-1',
      taskId: 'task1',
      viewerId: 'viewer1'
    })
  })

  it('surfaces the missing-field support doc', async () => {
    load.mockResolvedValue({
      possibleEstimationFields: [],
      missingEstimationFieldHint: 'teamManagedStoryPoints'
    })
    await expect(listJiraDimensionFields(buildCtx(jiraIntegration))).resolves.toEqual({
      options: [],
      helpUrl: ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_MISSING_FIELD_TEAM_MANAGED
    })
  })

  it('returns no options when the issue cannot be loaded', async () => {
    load.mockResolvedValue(null)
    await expect(listJiraDimensionFields(buildCtx(jiraIntegration))).resolves.toEqual({
      options: []
    })
  })
})
