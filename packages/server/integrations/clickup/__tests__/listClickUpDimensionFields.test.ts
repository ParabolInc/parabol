import type {DimensionFieldCtx} from '../../platform/ServerIntegrationDefinition'
import type {ClickUpApiCustomField, ClickUpApiSpace} from '../ClickUpApiTypes'
import listClickUpDimensionFields from '../listClickUpDimensionFields'
import type {ClickUpTaskSource} from '../mapClickUpTask'
import resolveClickUpDimensionFieldKey from '../resolveClickUpDimensionFieldKey'

const SPRINT_POINTS_HELP_URL =
  'https://help.clickup.com/hc/en-us/articles/6303883602327-Use-Sprint-Points'

const loaders = {
  clickUpTask: {load: jest.fn()},
  clickUpSpace: {load: jest.fn()}
}

const clickUpIntegration = {
  service: 'clickup',
  accessUserId: 'user1',
  workspaceId: '9012345',
  taskId: '86abc'
}

const buildCtx = (integration: Record<string, unknown> | null = clickUpIntegration) =>
  ({
    dataLoader: {get: (name: keyof typeof loaders) => loaders[name]},
    teamId: 'team1',
    userId: 'user1',
    viewerId: 'viewer1',
    task: {id: 'task1', teamId: 'team1', integration}
  }) as unknown as DimensionFieldCtx

const customFields: ClickUpApiCustomField[] = [
  {id: 'size-field', name: 'Size', type: 'number'},
  {
    id: 'tshirt-field',
    name: 'T-shirt',
    type: 'drop_down',
    type_config: {options: [{id: 'xl-option', name: 'XL'}]}
  },
  {id: 'note-field', name: 'Note', type: 'short_text'},
  {id: 'labels-field', name: 'L', type: 'labels'},
  {id: 'formula-field', name: 'F', type: 'formula'}
]

const clickUpTask = (customItemId: number | null = 0): ClickUpTaskSource => ({
  service: 'clickup',
  id: '9012345::86abc',
  title: 'Fix the build',
  taskId: '86abc',
  customId: null,
  url: 'https://app.clickup.com/t/86abc',
  description: '',
  status: {name: 'to do', color: '#d3d3d3', type: 'open'},
  listId: '1000',
  listName: 'Sprint 1',
  folderName: 'Q4',
  spaceId: '10',
  customItemId,
  customFields,
  updatedAt: new Date(0),
  workspaceId: '9012345'
})

const space = (features?: ClickUpApiSpace['features']): ClickUpApiSpace => ({
  id: '10',
  name: 'Engineering',
  features
})

const sprintPoints = {fieldId: '__sprintPoints', label: 'Sprint Points', type: 'number'}
const customFieldOptions = [
  {fieldId: 'size-field', label: 'Size', type: 'number'},
  {fieldId: 'tshirt-field', label: 'T-shirt', type: 'drop_down'},
  {fieldId: 'note-field', label: 'Note', type: 'string'}
]

beforeEach(() => {
  loaders.clickUpTask.load.mockReset().mockResolvedValue(clickUpTask())
  loaders.clickUpSpace.load.mockReset().mockResolvedValue(space({points: {enabled: true}}))
})

describe('listClickUpDimensionFields', () => {
  it('offers Sprint Points ahead of the task’s fields when the Space has Sprint Points on', async () => {
    await expect(listClickUpDimensionFields(buildCtx())).resolves.toEqual({
      options: [sprintPoints, ...customFieldOptions]
    })
    expect(loaders.clickUpTask.load).toHaveBeenCalledWith({
      teamId: 'team1',
      userId: 'user1',
      taskId: '86abc'
    })
    expect(loaders.clickUpSpace.load).toHaveBeenCalledWith({
      teamId: 'team1',
      userId: 'user1',
      spaceId: '10'
    })
  })

  it.each([
    ['it is off', space({points: {enabled: false}})],
    ['the Space does not say', space({})],
    ['the Space cannot be read', null]
  ])('leaves out Sprint Points and links its help article when %s', async (_label, taskSpace) => {
    loaders.clickUpSpace.load.mockResolvedValue(taskSpace)
    await expect(listClickUpDimensionFields(buildCtx())).resolves.toEqual({
      options: customFieldOptions,
      helpUrl: SPRINT_POINTS_HELP_URL
    })
  })

  it('lists only the number, dropdown and text fields of the task', async () => {
    const {options} = await listClickUpDimensionFields(buildCtx())
    expect(options.filter(({fieldId}) => fieldId !== '__sprintPoints')).toEqual([
      {fieldId: 'size-field', label: 'Size', type: 'number'},
      {fieldId: 'tshirt-field', label: 'T-shirt', type: 'drop_down'},
      {fieldId: 'note-field', label: 'Note', type: 'string'}
    ])
  })

  it('offers nothing, without reading the Space, when the task cannot be read', async () => {
    loaders.clickUpTask.load.mockResolvedValue(null)
    await expect(listClickUpDimensionFields(buildCtx())).resolves.toEqual({options: []})
    expect(loaders.clickUpSpace.load).not.toHaveBeenCalled()
  })

  it('offers nothing for a task linked to another service', async () => {
    await expect(
      listClickUpDimensionFields(buildCtx({service: 'linear', accessUserId: 'user1'}))
    ).resolves.toEqual({options: []})
    expect(loaders.clickUpTask.load).not.toHaveBeenCalled()
  })
})

describe('resolveClickUpDimensionFieldKey', () => {
  it.each([
    [0, null],
    [null, null],
    [1001, '1001']
  ])('keys the mapping by List, with custom_item_id %p as issue type %p', async (id, type) => {
    loaders.clickUpTask.load.mockResolvedValue(clickUpTask(id))
    await expect(resolveClickUpDimensionFieldKey(buildCtx())).resolves.toMatchObject({
      repoId: '1000',
      issueType: type
    })
  })

  it('can use Sprint Points and the task’s fields when Sprint Points is on', async () => {
    const key = await resolveClickUpDimensionFieldKey(buildCtx())
    expect(key?.usableFieldIds).toEqual([
      '__sprintPoints',
      'size-field',
      'tshirt-field',
      'note-field'
    ])
  })

  it('can use only the task’s fields when Sprint Points is off', async () => {
    loaders.clickUpSpace.load.mockResolvedValue(space({points: {enabled: false}}))
    const key = await resolveClickUpDimensionFieldKey(buildCtx())
    expect(key?.usableFieldIds).toEqual(['size-field', 'tshirt-field', 'note-field'])
  })

  it('has no key when the task cannot be read', async () => {
    loaders.clickUpTask.load.mockResolvedValue(null)
    await expect(resolveClickUpDimensionFieldKey(buildCtx())).resolves.toBeNull()
  })
})
