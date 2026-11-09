import {Environment, Network, Observable, RecordSource, Store} from 'relay-runtime'
import type Atmosphere from '../../Atmosphere'
import MeetingSubscription from '../../subscriptions/MeetingSubscription'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => jest.requireActual('../../__generated__/MeetingSubscription.graphql').default
}))

const joinPayload = {
  meetingSubscription: {
    fieldName: 'JoinMeetingSuccess',
    JoinMeetingSuccess: {
      meeting: {__typename: 'RetrospectiveMeeting', id: 'meeting1'},
      meetingMember: {
        __typename: 'RetrospectiveMeetingMember',
        id: 'user2::meeting1',
        userId: 'user2',
        user: {id: 'user2', picture: 'p.png', preferredName: 'Second', email: 'b@example.test'},
        teamMember: {id: 'user2::team1', isSelf: false}
      },
      stages: [
        {
          __typename: 'CheckInStage',
          id: 'stage2',
          isComplete: false,
          isNavigable: true,
          isNavigableByFacilitator: true,
          isViewerReady: false,
          readyUserIds: [],
          phaseType: 'checkin',
          suggestedTimeLimit: null,
          suggestedEndTime: null,
          scheduledEndTime: null,
          isAsync: null,
          timeRemaining: null,
          __isNewMeetingTeamMemberStage: 'CheckInStage',
          teamMemberId: 'user2::team1',
          teamMember: {
            id: 'user2::team1',
            userId: 'user2',
            user: {id: 'user2', picture: 'p.png', preferredName: 'Second'}
          }
        }
      ]
    }
  }
}

const createTestAtmosphere = (timesDelivered: number) => {
  const source = new RecordSource({
    'client:root': {__id: 'client:root', __typename: '__Root'},
    meeting1: {
      __id: 'meeting1',
      __typename: 'RetrospectiveMeeting',
      id: 'meeting1',
      phases: {__refs: ['phase1']},
      meetingMembers: {__refs: ['user1::meeting1']}
    },
    phase1: {
      __id: 'phase1',
      __typename: 'CheckInPhase',
      id: 'phase1',
      phaseType: 'checkin',
      stages: {__refs: ['stage1']}
    },
    stage1: {__id: 'stage1', __typename: 'CheckInStage', id: 'stage1', phaseType: 'checkin'},
    'user1::meeting1': {
      __id: 'user1::meeting1',
      __typename: 'RetrospectiveMeetingMember',
      id: 'user1::meeting1'
    }
  })
  const environment = new Environment({
    network: Network.create(
      () => Observable.create(() => {}),
      () =>
        Observable.create((sink) => {
          for (let delivery = 0; delivery < timesDelivered; delivery++)
            sink.next({data: joinPayload})
        })
    ),
    store: new Store(source)
  })
  return Object.assign(environment, {
    registerSubscription: () => 'meetingSubscription',
    unregisterSub: () => {}
  }) as unknown as Atmosphere
}

const refsOf = (atmosphere: Atmosphere, dataID: string, field: string) =>
  (atmosphere.getStore().getSource().get(dataID)?.[field] as {__refs: string[]}).__refs

describe('JoinMeetingSuccess on the meeting subscription', () => {
  let errorSpy: jest.SpyInstance
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })

  it("appends the joiner's member and check-in stage", () => {
    const atmosphere = createTestAtmosphere(1)
    MeetingSubscription(atmosphere, {meetingId: 'meeting1'}, {navigate: jest.fn()})
    expect(refsOf(atmosphere, 'meeting1', 'meetingMembers')).toEqual([
      'user1::meeting1',
      'user2::meeting1'
    ])
    expect(refsOf(atmosphere, 'phase1', 'stages')).toEqual(['stage1', 'stage2'])
    expect(atmosphere.getStore().getSource().get('stage2')?.teamMember).toEqual({
      __ref: 'user2::team1'
    })
  })

  it('appends once when the same join arrives twice', () => {
    const atmosphere = createTestAtmosphere(2)
    MeetingSubscription(atmosphere, {meetingId: 'meeting1'}, {navigate: jest.fn()})
    expect(refsOf(atmosphere, 'meeting1', 'meetingMembers')).toHaveLength(2)
    expect(refsOf(atmosphere, 'phase1', 'stages')).toEqual(['stage1', 'stage2'])
  })
})
