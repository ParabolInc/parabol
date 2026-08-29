import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import EstimateStage, {type EstimateStageSource} from '../EstimateStage'

const listDimensionFields = jest.fn()
const targets = ['comment', 'field']

jest.mock('../../../../integrations/platform/registry', () => ({
  getServerIntegration: () => ({
    capabilities: {estimatePush: {listDimensionFields, targets}}
  })
}))

const task: {integration: unknown} = {integration: {service: 'jira', accessUserId: 'user1'}}

const buildContext = () => {
  const loaders: Record<string, unknown> = {
    tasks: {load: async () => task},
    newMeetings: {loadNonNull: async () => ({meetingType: 'poker', templateRefId: 'ref1'})},
    templateRefs: {loadNonNull: async () => ({dimensions: [{name: 'Story Points'}]})}
  }
  return {
    authToken: {sub: 'viewer1'},
    dataLoader: {get: (name: string) => loaders[name]}
  } as unknown as GQLContext
}

const source = {
  dimensionRefIdx: 0,
  meetingId: 'meeting1',
  teamId: 'team1',
  taskId: 'task1',
  phaseType: 'ESTIMATE'
} as unknown as EstimateStageSource
const info = {} as GraphQLResolveInfo

const resolve = EstimateStage.dimensionFieldListing
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

describe('EstimateStage.dimensionFieldListing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    task.integration = {service: 'jira', accessUserId: 'user1'}
    listDimensionFields.mockResolvedValue({
      options: [{fieldId: 'f1', label: 'Story Points'}],
      helpUrl: 'https://docs'
    })
  })

  it('merges the capability targets with the service listing', async () => {
    await expect(resolve(source, {}, buildContext(), info)).resolves.toEqual({
      targets: ['comment', 'field'],
      options: [{fieldId: 'f1', label: 'Story Points'}],
      helpUrl: 'https://docs'
    })
    expect(listDimensionFields).toHaveBeenCalledWith(
      expect.objectContaining({teamId: 'team1', userId: 'user1', viewerId: 'viewer1', task})
    )
  })

  it('is empty for a task without an integration', async () => {
    task.integration = null
    await expect(resolve(source, {}, buildContext(), info)).resolves.toEqual({
      targets: [],
      options: [],
      helpUrl: null
    })
    expect(listDimensionFields).not.toHaveBeenCalled()
  })
})
