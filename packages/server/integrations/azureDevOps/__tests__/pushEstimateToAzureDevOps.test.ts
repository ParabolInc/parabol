jest.mock('../getAzureDevOpsManager', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../../platform/loadDimensionField', () => ({__esModule: true, default: jest.fn()}))

import loadDimensionField from '../../platform/loadDimensionField'
import type {EstimatePushCtx} from '../../platform/ServerIntegrationDefinition'
import getAzureDevOpsManager from '../getAzureDevOpsManager'
import pushEstimateToAzureDevOps from '../pushEstimateToAzureDevOps'

const mockedGetManager = jest.mocked(getAzureDevOpsManager)
const mockedLoadDimensionField = jest.mocked(loadDimensionField)

const INSTANCE_ID = 'dev.azure.com/acme'
const PROJECT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
const STORY_POINTS = 'Microsoft.VSTS.Scheduling.StoryPoints'
const DISCUSSION_URL = 'https://action.parabol.co/meet/meeting1/estimate/1'

const manager = {addScoreComment: jest.fn(), setField: jest.fn()}
const loadWorkItem = jest.fn()

const azureDevOpsIntegration = {
  service: 'azureDevOps',
  accessUserId: 'user1',
  instanceId: INSTANCE_ID,
  projectKey: 'stale-project-key',
  issueKey: '42'
}

const buildCtx = (value: string, integration: Record<string, unknown> = azureDevOpsIntegration) =>
  ({
    task: {id: 'task1', teamId: 'team1', integration},
    taskEstimate: {dimensionName: 'Story Points', value},
    dataLoader: {get: () => ({load: loadWorkItem})},
    context: {},
    info: {},
    stageId: 'stage1',
    viewerId: 'viewer1',
    meetingName: 'Sprint Poker #3',
    discussionURL: DISCUSSION_URL
  }) as unknown as EstimatePushCtx

type DimensionFieldLookup = Awaited<ReturnType<typeof loadDimensionField>>

const mapDimensionTo = (field: {fieldId: string; fieldName: string | null; fieldType: string}) => {
  mockedLoadDimensionField.mockResolvedValue({
    key: {repoId: `${INSTANCE_ID}:${PROJECT_ID}`, issueType: 'User Story'},
    field
  } as unknown as DimensionFieldLookup)
}

describe('pushEstimateToAzureDevOps', () => {
  beforeEach(() => {
    mockedGetManager.mockResolvedValue(
      manager as unknown as Awaited<ReturnType<typeof getAzureDevOpsManager>>
    )
    mockedLoadDimensionField.mockResolvedValue(null)
    loadWorkItem.mockResolvedValue({id: '42', teamProject: PROJECT_ID, type: 'User Story'})
    manager.addScoreComment.mockResolvedValue('https://dev.azure.com/acme/comment/9')
    manager.setField.mockResolvedValue({id: 42})
  })

  it('comments on the work item when the dimension has no mapping', async () => {
    await expect(pushEstimateToAzureDevOps(buildCtx('5'))).resolves.toBeNull()
    expect(manager.addScoreComment).toHaveBeenCalledWith({
      instanceId: INSTANCE_ID,
      projectId: PROJECT_ID,
      workItemId: '42',
      dimensionName: 'Story Points',
      finalScore: '5',
      meetingName: 'Sprint Poker #3',
      discussionURL: DISCUSSION_URL
    })
    expect(manager.setField).not.toHaveBeenCalled()
    expect(loadWorkItem).toHaveBeenCalledWith({
      teamId: 'team1',
      userId: 'user1',
      instanceId: INSTANCE_ID,
      workItemId: '42'
    })
  })

  it('comments when the dimension is mapped to the comment sentinel', async () => {
    mapDimensionTo({fieldId: '__comment', fieldName: null, fieldType: 'string'})
    await expect(pushEstimateToAzureDevOps(buildCtx('5'))).resolves.toBeNull()
    expect(manager.addScoreComment).toHaveBeenCalledTimes(1)
    expect(manager.setField).not.toHaveBeenCalled()
  })

  it('returns the Error of a comment that could not be posted', async () => {
    const commentError = new Error('TF401232: Work item 42 does not exist')
    manager.addScoreComment.mockResolvedValue(commentError)
    await expect(pushEstimateToAzureDevOps(buildCtx('5'))).resolves.toBe(commentError)
  })

  it('pushes nothing when the dimension is mapped to the empty field id', async () => {
    mapDimensionTo({fieldId: '', fieldName: null, fieldType: 'string'})
    await expect(pushEstimateToAzureDevOps(buildCtx('5'))).resolves.toBeNull()
    expect(manager.addScoreComment).not.toHaveBeenCalled()
    expect(manager.setField).not.toHaveBeenCalled()
  })

  it('pushes a number to a numeric field of the work item’s own project', async () => {
    mapDimensionTo({fieldId: STORY_POINTS, fieldName: 'Story Points', fieldType: 'number'})
    await expect(pushEstimateToAzureDevOps(buildCtx('5'))).resolves.toEqual({
      service: 'azureDevOps',
      target: 'field',
      targetId: STORY_POINTS
    })
    expect(manager.setField).toHaveBeenCalledWith(INSTANCE_ID, PROJECT_ID, '42', STORY_POINTS, 5)
    expect(manager.addScoreComment).not.toHaveBeenCalled()
  })

  it('pushes the value as text to a string field', async () => {
    mapDimensionTo({fieldId: 'Custom.TShirtSize', fieldName: 'T-Shirt Size', fieldType: 'string'})
    await expect(pushEstimateToAzureDevOps(buildCtx('XL'))).resolves.toEqual({
      service: 'azureDevOps',
      target: 'field',
      targetId: 'Custom.TShirtSize'
    })
    expect(manager.setField).toHaveBeenCalledWith(
      INSTANCE_ID,
      PROJECT_ID,
      '42',
      'Custom.TShirtSize',
      'XL'
    )
  })

  it('pushes a legacy __storyPoints mapping to the Story Points field', async () => {
    mapDimensionTo({
      fieldId: '__storyPoints',
      fieldName: 'Story point estimate',
      fieldType: 'number'
    })
    await expect(pushEstimateToAzureDevOps(buildCtx('8'))).resolves.toEqual({
      service: 'azureDevOps',
      target: 'field',
      targetId: STORY_POINTS
    })
    expect(manager.setField).toHaveBeenCalledWith(INSTANCE_ID, PROJECT_ID, '42', STORY_POINTS, 8)
  })

  it.each(['?', 'XL', 'Infinity'])(
    'refuses to push %j to a number field, without calling Azure DevOps',
    async (value) => {
      mapDimensionTo({fieldId: STORY_POINTS, fieldName: 'Story Points', fieldType: 'number'})
      const res = await pushEstimateToAzureDevOps(buildCtx(value))
      expect(res).toBeInstanceOf(Error)
      expect(res).toHaveProperty(
        'message',
        `Story Points only takes numbers, so "${value}" was not saved`
      )
      expect(manager.setField).not.toHaveBeenCalled()
    }
  )

  it('returns the Error of a field that could not be set', async () => {
    mapDimensionTo({fieldId: STORY_POINTS, fieldName: 'Story Points', fieldType: 'number'})
    const fieldError = new Error('TF401320: Rule Error for field Story Points')
    manager.setField.mockResolvedValue(fieldError)
    await expect(pushEstimateToAzureDevOps(buildCtx('5'))).resolves.toBe(fieldError)
  })

  it('fails when the work item is gone or its project is no longer shared', async () => {
    loadWorkItem.mockResolvedValue(null)
    const res = await pushEstimateToAzureDevOps(buildCtx('5'))
    expect(res).toBeInstanceOf(Error)
    expect(res).toHaveProperty(
      'message',
      'Cannot find the work item. Its project may no longer be shared with this team'
    )
    expect(manager.addScoreComment).not.toHaveBeenCalled()
    expect(manager.setField).not.toHaveBeenCalled()
  })

  it('fails when the connection that reaches the work item is gone', async () => {
    mockedGetManager.mockResolvedValue(null)
    await expect(pushEstimateToAzureDevOps(buildCtx('5'))).resolves.toBeInstanceOf(Error)
    expect(manager.addScoreComment).not.toHaveBeenCalled()
  })

  it('refuses a task linked to another service', async () => {
    const res = await pushEstimateToAzureDevOps(buildCtx('5', {service: 'jira'}))
    expect(res).toBeInstanceOf(Error)
    expect(mockedGetManager).not.toHaveBeenCalled()
  })
})
