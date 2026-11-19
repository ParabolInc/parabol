import {Environment, Network, Observable, RecordSource, Store} from 'relay-runtime'
import MeetingSubscriptionQuery from '../../__generated__/MeetingSubscription.graphql'
import type Atmosphere from '../../Atmosphere'
import {setConnectedServerVersion} from '../../utils/connectedServerVersion'
import MeetingSubscription from '../MeetingSubscription'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => jest.requireActual('../../__generated__/MeetingSubscription.graphql').default
}))

const meetingId = 'meeting1'
const clientVersion = '2.4.0'
// a payload a newer release publishes under a field this client's subscription never selected
const renamedFieldName = 'PokerAnnounceDeckHoverResult'

// the server resolves every payload field the subscription selects, and only the published one is not null
const selectedPayloadFields = Object.fromEntries(
  MeetingSubscriptionQuery.operation.selections.flatMap((selection) =>
    'selections' in selection && selection.selections
      ? selection.selections.flatMap((field) =>
          field.kind === 'LinkedField' ? [[field.name, null]] : []
        )
      : []
  )
)

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
  let warnSpy: jest.SpyInstance
  beforeAll(() => {
    Object.assign(globalThis, {__APP_VERSION__: clientVersion})
  })
  beforeEach(() => {
    setConnectedServerVersion(clientVersion)
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('selects the field of a DragEstimatingTaskPayload payload', async () => {
    const atmosphere = createTestAtmosphere({
      meetingSubscription: {
        fieldName: 'DragEstimatingTaskPayload',
        DragEstimatingTaskPayload: {
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
      'DragEstimatingTaskPayload'
    )
  })

  it('only warns of a payload a newer server publishes under a field this client never selected', async () => {
    setConnectedServerVersion('3.0.0')
    const atmosphere = createTestAtmosphere({
      meetingSubscription: {...selectedPayloadFields, fieldName: renamedFieldName}
    })
    MeetingSubscription(atmosphere, {meetingId}, {navigate: jest.fn()})
    expect(warnSpy).toHaveBeenCalledWith(
      'Notification Subscription Payload received without field:',
      renamedFieldName
    )
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('still reports a payload without its field as an error when the client is as new as the server', async () => {
    const atmosphere = createTestAtmosphere({
      meetingSubscription: {...selectedPayloadFields, fieldName: 'PokerAnnounceDeckHoverPayload'}
    })
    MeetingSubscription(atmosphere, {meetingId}, {navigate: jest.fn()})
    expect(errorSpy).toHaveBeenCalledWith(
      'Notification Subscription Payload received without field:',
      'PokerAnnounceDeckHoverPayload'
    )
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
