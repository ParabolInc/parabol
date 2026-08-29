import type {DimensionFieldCtx} from '../../platform/ServerIntegrationDefinition'
import listJiraServerDimensionFields from '../listJiraServerDimensionFields'

const loaders: Record<string, {load: jest.Mock}> = {
  jiraServerIssue: {load: jest.fn()},
  jiraServerFieldTypes: {load: jest.fn()}
}
const buildCtx = () =>
  ({
    dataLoader: {get: (name: string) => loaders[name]},
    teamId: 'team1',
    viewerId: 'viewer1',
    task: {
      id: 'task1',
      integration: {
        service: 'jiraServer',
        providerId: 9,
        repositoryId: '10001',
        issueId: '10042',
        accessUserId: 'user1'
      }
    }
  }) as unknown as DimensionFieldCtx

describe('listJiraServerDimensionFields', () => {
  beforeEach(() => jest.clearAllMocks())

  it('lists settable numeric/string fields by name, excluding the vote blacklist', async () => {
    loaders.jiraServerIssue!.load.mockResolvedValue({issueType: '10001', projectId: '10001'})
    loaders.jiraServerFieldTypes!.load.mockResolvedValue([
      {
        fieldId: 'customfield_1',
        name: 'Story Points',
        operations: ['set'],
        schema: {type: 'number'}
      },
      {fieldId: 'customfield_2', name: 'Read Only', operations: [], schema: {type: 'number'}},
      {fieldId: 'customfield_3', name: 'Sprint', operations: ['set'], schema: {type: 'array'}}
    ])
    await expect(listJiraServerDimensionFields(buildCtx())).resolves.toEqual({
      options: [{fieldId: 'Story Points', label: 'Story Points'}]
    })
    expect(loaders.jiraServerFieldTypes!.load).toHaveBeenCalledWith({
      teamId: 'team1',
      userId: 'user1',
      projectId: '10001',
      issueType: '10001',
      providerId: 9
    })
  })

  it('returns no options when the issue is missing', async () => {
    loaders.jiraServerIssue!.load.mockResolvedValue(null)
    await expect(listJiraServerDimensionFields(buildCtx())).resolves.toEqual({options: []})
  })
})
