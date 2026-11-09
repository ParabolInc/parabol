import {Environment, Network, Observable, RecordSource, Store} from 'relay-runtime'
import type Atmosphere from '../../Atmosphere'
import {positionAt} from '../../shared/sortOrder'
import MeetingSubscription from '../../subscriptions/MeetingSubscription'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => jest.requireActual('../../__generated__/MeetingSubscription.graphql').default
}))

const joinPayload = (userNumber: number, position: number) => {
  const userId = `user${userNumber}`
  const teamMemberId = `${userId}::team1`
  const user = {id: userId, picture: 'p.png', preferredName: `Joiner ${userNumber}`}
  return {
    meetingSubscription: {
      fieldName: 'JoinMeetingSuccess',
      JoinMeetingSuccess: {
        meeting: {__typename: 'RetrospectiveMeeting', id: 'meeting1'},
        meetingMember: {
          __typename: 'RetrospectiveMeetingMember',
          id: `${userId}::meeting1`,
          userId,
          user: {...user, email: `${userId}@example.test`},
          teamMember: {id: teamMemberId, isSelf: false}
        },
        stages: [
          {
            __typename: 'CheckInStage',
            id: `stage${userNumber}`,
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
            sortOrder: positionAt(position),
            teamMemberId,
            teamMember: {id: teamMemberId, userId, user}
          }
        ]
      }
    }
  }
}

const createTestAtmosphere = (payloads: ReturnType<typeof joinPayload>[]) => {
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
          payloads.forEach((payload) => sink.next({data: payload}))
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
    const atmosphere = createTestAtmosphere([joinPayload(2, 1)])
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
    const atmosphere = createTestAtmosphere([joinPayload(2, 1), joinPayload(2, 1)])
    MeetingSubscription(atmosphere, {meetingId: 'meeting1'}, {navigate: jest.fn()})
    expect(refsOf(atmosphere, 'meeting1', 'meetingMembers')).toHaveLength(2)
    expect(refsOf(atmosphere, 'phase1', 'stages')).toEqual(['stage1', 'stage2'])
  })

  it("puts stages in the server's order when joins arrive out of order", () => {
    const atmosphere = createTestAtmosphere([
      joinPayload(4, 3),
      joinPayload(3, 2),
      joinPayload(2, 1)
    ])
    MeetingSubscription(atmosphere, {meetingId: 'meeting1'}, {navigate: jest.fn()})
    expect(refsOf(atmosphere, 'phase1', 'stages')).toEqual(['stage1', 'stage2', 'stage3', 'stage4'])
  })
})
