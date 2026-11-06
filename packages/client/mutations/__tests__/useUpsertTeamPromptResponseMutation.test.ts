import {commitMutation, Environment, Network, RecordSource, Store} from 'relay-runtime'
import UpsertTeamPromptResponseMutationRequest from '../../__generated__/useUpsertTeamPromptResponseMutation.graphql'
import useUpsertTeamPromptResponseMutation from '../useUpsertTeamPromptResponseMutation'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

const mockCommit = jest.fn()
jest.mock('react-relay', () => ({
  useMutation: () => [mockCommit, false]
}))

const meetingId = 'meeting1'

const createTestEnvironment = () =>
  new Environment({
    network: Network.create(async () => ({data: {}})),
    store: new Store(new RecordSource())
  })

describe('useUpsertTeamPromptResponseMutation', () => {
  let errorSpy: jest.SpyInstance
  beforeEach(() => {
    mockCommit.mockClear()
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('does not throw in the updater when the mutation returns no payload', async () => {
    const [execute] = useUpsertTeamPromptResponseMutation()
    const variables = {meetingId, promptId: 'prompt1', content: '{}'}
    execute({variables})
    const {updater} = mockCommit.mock.calls[0][0]
    const environment = createTestEnvironment()
    const error = await new Promise<Error | null>((resolve) => {
      commitMutation(environment, {
        mutation: UpsertTeamPromptResponseMutationRequest,
        variables,
        updater,
        onCompleted: () => resolve(null),
        onError: resolve
      })
    })
    expect(error).toBeNull()
  })
})
