import {
  commitLocalUpdate,
  commitMutation,
  createOperationDescriptor,
  createReaderSelector,
  Environment,
  Network,
  RecordSource,
  Store
} from 'relay-runtime'
import NavigateMeetingMutationRequest, {
  type NavigateMeetingMutation as NavigateMeetingMutationType
} from '../../__generated__/NavigateMeetingMutation.graphql'
import NewMeetingCheckInFragment, {
  type NewMeetingCheckIn_meeting$data
} from '../../__generated__/NewMeetingCheckIn_meeting.graphql'
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

  it('sends a teammate check-in stage the viewer never received with what the check-in reads', async () => {
    const teamId = 'team1'
    const phaseId = 'checkInPhase1'
    const receivedStageId = 'checkInStage1'
    const unreceivedStageId = 'checkInStage2'
    const makeTeamMember = (userId: string) => ({
      id: `${userId}::${teamId}`,
      userId,
      user: {id: userId, picture: `https://example.com/${userId}.png`, preferredName: userId}
    })
    const makeCheckInStage = (id: string, userId: string, isComplete: boolean) => ({
      __typename: 'CheckInStage',
      __isNewMeetingTeamMemberStage: 'CheckInStage',
      id,
      isComplete,
      teamMemberId: `${userId}::${teamId}`,
      teamMember: makeTeamMember(userId)
    })
    const environment = new Environment({
      network: Network.create(async () => ({
        data: {
          navigateMeeting: {
            error: null,
            meeting: {
              id: meetingId,
              __typename: 'RetrospectiveMeeting',
              name: 'Retro',
              meetingType: 'retrospective',
              facilitatorStageId: unreceivedStageId,
              phases: [
                {
                  id: phaseId,
                  __typename: 'CheckInPhase',
                  phaseType: 'checkin',
                  stages: [
                    makeCheckInStage(receivedStageId, 'user1', true),
                    makeCheckInStage(unreceivedStageId, 'user2', false)
                  ]
                }
              ],
              team: {id: teamId, name: 'Team'}
            },
            oldFacilitatorStage: {
              __typename: 'CheckInStage',
              id: receivedStageId,
              isComplete: true
            },
            phaseComplete: null,
            unlockedStages: null
          }
        }
      })),
      store: new Store(new RecordSource())
    })
    commitLocalUpdate(environment, (store) => {
      const user = store.create('user1', 'User').setValue('user1', 'id')
      const teamMember = store
        .create(`user1::${teamId}`, 'TeamMember')
        .setValue(`user1::${teamId}`, 'id')
        .setLinkedRecord(user, 'user')
      const stage = store
        .create(receivedStageId, 'CheckInStage')
        .setValue(receivedStageId, 'id')
        .setLinkedRecord(teamMember, 'teamMember')
      const phase = store
        .create(phaseId, 'CheckInPhase')
        .setValue(phaseId, 'id')
        .setValue('checkin', 'phaseType')
        .setLinkedRecords([stage], 'stages')
      store
        .create(meetingId, 'RetrospectiveMeeting')
        .setValue(meetingId, 'id')
        .setValue(receivedStageId, 'facilitatorStageId')
        .setLinkedRecords([phase], 'phases')
        .setLinkedRecord(stage, 'localStage')
        .setLinkedRecord(phase, 'localPhase')
    })

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

    const {request} = createOperationDescriptor(NavigateMeetingMutationRequest, {meetingId})
    const {data} = environment.lookup(
      createReaderSelector(NewMeetingCheckInFragment, meetingId, {}, request)
    )
    const {localStage} = data as NewMeetingCheckIn_meeting$data
    expect(localStage.id).toBe(unreceivedStageId)
    expect(localStage.NewMeetingCheckInLocalStage?.teamMember?.user.id).toBe('user2')
  })
})
