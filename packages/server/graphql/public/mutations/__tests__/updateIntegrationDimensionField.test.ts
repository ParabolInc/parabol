import type {GraphQLResolveInfo} from 'graphql'
import upsertIntegrationDimensionFieldMap from '../../../../postgres/queries/upsertIntegrationDimensionFieldMap'
import publish from '../../../../utils/publish'
import type {GQLContext} from '../../../graphql'
import updateIntegrationDimensionField from '../updateIntegrationDimensionField'

const resolveDimensionFieldKey = jest.fn()
const describeDimensionField = jest.fn()

jest.mock('../../../../integrations/platform/registry', () => ({
  getServerIntegration: () => ({
    capabilities: {estimatePush: {resolveDimensionFieldKey, describeDimensionField}}
  })
}))
jest.mock('../../../../postgres/queries/upsertIntegrationDimensionFieldMap', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))

const upsert = jest.mocked(upsertIntegrationDimensionFieldMap)
const clear = jest.fn()

const buildContext = (taskTeamId: string) => {
  const loaders: Record<string, unknown> = {
    newMeetings: {
      load: async () => ({meetingType: 'poker', teamId: 'team1', templateRefId: 'ref1'})
    },
    templateRefs: {loadNonNull: async () => ({dimensions: [{name: 'Story Points'}]})},
    tasks: {
      load: async () => ({
        teamId: taskTeamId,
        integration: {service: 'jira', accessUserId: 'accessUser'}
      })
    },
    integrationDimensionFieldMaps: {clear}
  }
  return {
    authToken: {sub: 'viewer1'},
    socketId: 'socket1',
    dataLoader: {get: (name: string) => loaders[name], share: () => 'op'}
  } as unknown as GQLContext
}

const info = {} as GraphQLResolveInfo
const resolve = updateIntegrationDimensionField
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const run = (fieldId: string, taskTeamId = 'team1') =>
  resolve(
    {},
    {meetingId: 'meeting1', taskId: 'task1', dimensionName: 'Story Points', fieldId},
    buildContext(taskTeamId),
    info
  )

describe('updateIntegrationDimensionField', () => {
  beforeEach(() => {
    resolveDimensionFieldKey.mockResolvedValue({repoId: 'r', workItemType: 'Story'})
    describeDimensionField.mockResolvedValue({
      fieldId: 'f1',
      fieldName: 'Field',
      fieldType: 'number'
    })
  })

  it('stores the __comment sentinel without asking the service to describe it', async () => {
    const res = await run('__comment')
    expect(describeDimensionField).not.toHaveBeenCalled()
    expect(upsert).toHaveBeenCalledWith({
      teamId: 'team1',
      service: 'jira',
      repoId: 'r',
      workItemType: 'Story',
      dimensionName: 'Story Points',
      fieldId: '__comment',
      fieldName: '__comment',
      fieldType: 'string'
    })
    expect(clear).toHaveBeenCalledWith({
      teamId: 'team1',
      service: 'jira',
      repoId: 'r',
      dimensionName: 'Story Points'
    })
    expect(publish).toHaveBeenCalled()
    expect(res).toEqual({teamId: 'team1', meetingId: 'meeting1'})
  })

  it('stores the empty-string sentinel without asking the service to describe it', async () => {
    const res = await run('')
    expect(describeDimensionField).not.toHaveBeenCalled()
    expect(upsert).toHaveBeenCalledWith({
      teamId: 'team1',
      service: 'jira',
      repoId: 'r',
      workItemType: 'Story',
      dimensionName: 'Story Points',
      fieldId: '',
      fieldName: '',
      fieldType: 'string'
    })
    expect(clear).toHaveBeenCalledWith({
      teamId: 'team1',
      service: 'jira',
      repoId: 'r',
      dimensionName: 'Story Points'
    })
    expect(publish).toHaveBeenCalled()
    expect(res).toEqual({teamId: 'team1', meetingId: 'meeting1'})
  })

  it('stores the target the service describes for a real field id', async () => {
    const res = await run('anything')
    expect(describeDimensionField).toHaveBeenCalledWith(
      expect.objectContaining({teamId: 'team1', userId: 'accessUser', viewerId: 'viewer1'}),
      {repoId: 'r', workItemType: 'Story'},
      'anything'
    )
    expect(upsert).toHaveBeenCalledWith({
      teamId: 'team1',
      service: 'jira',
      repoId: 'r',
      workItemType: 'Story',
      dimensionName: 'Story Points',
      fieldId: 'f1',
      fieldName: 'Field',
      fieldType: 'number'
    })
    expect(res).toEqual({teamId: 'team1', meetingId: 'meeting1'})
  })

  it('rejects a task that belongs to another team', async () => {
    const res = await run('anything', 'team2')
    expect(res).toEqual({error: {message: 'Task not found'}})
    expect(upsert).not.toHaveBeenCalled()
  })

  it('returns the describe error and stores nothing', async () => {
    describeDimensionField.mockResolvedValue(new Error('Unknown field'))
    const res = await run('anything')
    expect(res).toEqual({error: {message: 'Unknown field'}})
    expect(upsert).not.toHaveBeenCalled()
    expect(publish).not.toHaveBeenCalled()
  })
})
