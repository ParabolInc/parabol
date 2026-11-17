import {Environment, Network, Observable, RecordSource, Store} from 'relay-runtime'
import type Atmosphere from '../../Atmosphere'
import MeetingSubscription from '../MeetingSubscription'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => jest.requireActual('../../__generated__/MeetingSubscription.graphql').default
}))

const meetingId = 'meeting1'

const createTestAtmosphere = (data: Record<string, unknown>) => {
  const environment = new Environment({
    network: Network.create(
      () => Observable.create(() => {}),
      () =>
        Observable.create((sink) => {
          sink.next({data})
          sink.complete()
        })
    ),
    store: new Store(new RecordSource())
  })
  return Object.assign(environment, {
    registerSubscription: () => 'meetingSubscription',
    unregisterSub: () => {}
  }) as unknown as Atmosphere
}

describe('MeetingSubscription', () => {
  let errorSpy: jest.SpyInstance
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('selects the field of a DragEstimatingTaskSuccess payload', async () => {
    const atmosphere = createTestAtmosphere({
      meetingSubscription: {
        fieldName: 'DragEstimatingTaskSuccess',
        DragEstimatingTaskSuccess: {
          meeting: {
            id: meetingId,
            __typename: 'PokerMeeting',
            phases: [
              {
                id: 'phase1',
                __typename: 'EstimatePhase',
                stages: [{id: 'stage1', __typename: 'EstimateStage'}]
              }
            ]
          }
        }
      }
    })
    MeetingSubscription(atmosphere, {meetingId}, {navigate: jest.fn()})
    expect(errorSpy).not.toHaveBeenCalledWith(
      'Notification Subscription Payload received without field:',
      'DragEstimatingTaskSuccess'
    )
  })
})
