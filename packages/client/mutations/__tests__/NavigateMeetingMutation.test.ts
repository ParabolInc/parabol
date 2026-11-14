import {commitMutation, Environment, Network, RecordSource, Store} from 'relay-runtime'
import NavigateMeetingMutationRequest, {
  type NavigateMeetingMutation as NavigateMeetingMutationType
} from '../../__generated__/NavigateMeetingMutation.graphql'
import type Atmosphere from '../../Atmosphere'
import {navigateMeetingTeamUpdater} from '../NavigateMeetingMutation'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

const meetingId = 'meeting1'

const createTestEnvironment = () =>
  new Environment({
    network: Network.create(async () => ({
      data: {
        navigateMeeting: {
          error: null,
          meeting: {
            id: meetingId,
            __typename: 'RetrospectiveMeeting',
            facilitatorStageId: 'stage1'
          },
          oldFacilitatorStage: null,
          phaseComplete: null,
          unlockedStages: null
        }
      }
    })),
    store: new Store(new RecordSource())
  })

describe('navigateMeetingTeamUpdater', () => {
  let errorSpy: jest.SpyInstance
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('does not report an error when the payload is the first time the viewer receives the meeting', async () => {
    const environment = createTestEnvironment()
    await new Promise<void>((resolve, reject) => {
      commitMutation<NavigateMeetingMutationType>(environment, {
        mutation: NavigateMeetingMutationRequest,
        variables: {meetingId},
        updater: (store) => {
          const payload = store.getRootField('navigateMeeting')
          navigateMeetingTeamUpdater(payload, {atmosphere: {} as Atmosphere, store})
        },
        onCompleted: () => resolve(),
        onError: reject
      })
    })
    const messages = errorSpy.mock.calls.map(([message]) => String(message))
    expect(messages.filter((message) => message.includes('No base meeting object'))).toEqual([])
  })
})
