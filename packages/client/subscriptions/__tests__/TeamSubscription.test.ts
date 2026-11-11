import {
  createOperationDescriptor,
  createReaderSelector,
  Environment,
  Network,
  Observable,
  RecordSource,
  readInlineData,
  Store
} from 'relay-runtime'
import meetingCardFragment from '../../__generated__/MeetingCard_meeting.graphql'
import teamSubscriptionRequest from '../../__generated__/TeamSubscription.graphql'
import meetingMemberAvatarsFragment, {
  type useMeetingMemberAvatars_meeting$key
} from '../../__generated__/useMeetingMemberAvatars_meeting.graphql'
import type Atmosphere from '../../Atmosphere'
import TeamSubscription from '../TeamSubscription'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => jest.requireActual('../../__generated__/TeamSubscription.graphql').default
}))

const orgId = 'org1'
const teamId = 'team1'
const templateId = 'template1'

const createTestAtmosphere = (
  data: Record<string, unknown>,
  records: Record<string, Record<string, unknown>> = {}
) => {
  const environment = new Environment({
    network: Network.create(
      () => Observable.create(() => {}),
      () =>
        Observable.create((sink) => {
          sink.next({data})
          sink.complete()
        })
    ),
    store: new Store(
      new RecordSource({
        [orgId]: {__id: orgId, __typename: 'Organization', id: orgId, tier: 'team'},
        ...records
      })
    )
  })
  return Object.assign(environment, {
    registerSubscription: () => 'teamSubscription',
    unregisterSub: () => {}
  }) as unknown as Atmosphere
}

describe('TeamSubscription', () => {
  let errorSpy: jest.SpyInstance
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })
  // a fixture holds one payload, so relay warns about each of the others it leaves out
  const getUnexpectedErrors = () =>
    errorSpy.mock.calls.filter(
      ([message]) =>
        !String(message).startsWith('Warning: RelayResponseNormalizer: Payload did not contain')
    )

  it('selects the field of a DowngradeToStarterPayload', () => {
    const atmosphere = createTestAtmosphere({
      teamSubscription: {
        fieldName: 'DowngradeToStarterPayload',
        DowngradeToStarterPayload: {
          organization: {
            id: orgId,
            tier: 'starter',
            billingTier: 'starter',
            isPaid: false,
            teams: [{id: teamId, tier: 'starter'}]
          }
        }
      }
    })
    TeamSubscription(atmosphere, {}, {navigate: jest.fn()})
    expect(errorSpy).not.toHaveBeenCalledWith(
      'Notification Subscription Payload received without field:',
      'DowngradeToStarterPayload'
    )
    expect(atmosphere.getStore().getSource().get(orgId)?.tier).toBe('starter')
  })

  it('selects the field of an UpdatePokerTemplateDimensionScalePayload', () => {
    const dimensionId = 'dimension1'
    const scaleId = 'scale1'
    const atmosphere = createTestAtmosphere({
      teamSubscription: {
        fieldName: 'UpdatePokerTemplateDimensionScalePayload',
        UpdatePokerTemplateDimensionScalePayload: {
          dimension: {
            id: dimensionId,
            selectedScale: {id: scaleId, name: 'Shirt sizes'}
          }
        }
      }
    })
    TeamSubscription(atmosphere, {}, {navigate: jest.fn()})
    expect(errorSpy).not.toHaveBeenCalledWith(
      'Notification Subscription Payload received without field:',
      'UpdatePokerTemplateDimensionScalePayload'
    )
    const source = atmosphere.getStore().getSource()
    expect(source.get(dimensionId)?.selectedScale).toEqual({__ref: scaleId})
  })

  it('adds the scale of an AddPokerTemplateScalePayload without opening it for editing', () => {
    const scaleId = 'scale2'
    const atmosphere = createTestAtmosphere({
      teamSubscription: {
        fieldName: 'AddPokerTemplateScalePayload',
        AddPokerTemplateScalePayload: {
          scale: {
            id: scaleId,
            name: 'Shirt sizes Copy',
            isStarter: false,
            teamId,
            values: [{label: '?', color: '#000000'}]
          }
        }
      }
    })
    atmosphere.commitUpdate((store) => {
      store.create(teamId, 'Team').setValue(teamId, 'id')
    })
    TeamSubscription(atmosphere, {}, {navigate: jest.fn()})
    expect(errorSpy).not.toHaveBeenCalledWith(
      'Notification Subscription Payload received without field:',
      'AddPokerTemplateScalePayload'
    )
    const team = atmosphere.getStore().getSource().get(teamId)
    expect(team?.scales).toEqual({__refs: [scaleId]})
    expect(team?.editingScaleId).toBeUndefined()
  })

  it("removes a teammate's removed dimension from its template when the team is not loaded", () => {
    const atmosphere = createTestAtmosphere(
      {
        teamSubscription: {
          fieldName: 'RemovePokerTemplateDimensionPayload',
          RemovePokerTemplateDimensionPayload: {
            dimension: {id: 'dimension1', templateId}
          }
        }
      },
      {
        [templateId]: {
          __id: templateId,
          __typename: 'PokerTemplate',
          id: templateId,
          dimensions: {__refs: ['dimension1', 'dimension2']}
        },
        dimension1: {__id: 'dimension1', __typename: 'TemplateDimension', id: 'dimension1'},
        dimension2: {__id: 'dimension2', __typename: 'TemplateDimension', id: 'dimension2'}
      }
    )
    TeamSubscription(atmosphere, {}, {navigate: jest.fn()})
    expect(getUnexpectedErrors()).toEqual([])
    expect(atmosphere.getStore().getSource().get(templateId)?.dimensions).toEqual({
      __refs: ['dimension2']
    })
  })

  it("gives the dashboard every field of a teammate's meeting that an ended meeting's payload lists", () => {
    const endedMeetingId = 'meeting1'
    const startedMeetingId = 'meeting2'
    const teammateId = 'user2'
    const atmosphere = createTestAtmosphere(
      {
        teamSubscription: {
          fieldName: 'EndRetrospectiveSuccess',
          EndRetrospectiveSuccess: {
            isKill: false,
            updatedTaskIds: [],
            timelineEvent: null,
            meeting: {
              id: endedMeetingId,
              endedAt: '2026-01-01T01:00:00.000Z',
              teamId,
              commentCount: 0,
              reflectionCount: 0,
              taskCount: 0,
              topicCount: 0,
              transcription: null,
              summaryPageId: null
            },
            team: {
              id: teamId,
              activeMeetingSeries: [],
              activeMeetings: [
                {
                  __typename: 'RetrospectiveMeeting',
                  __isNewMeeting: 'RetrospectiveMeeting',
                  id: startedMeetingId,
                  meetingType: 'retrospective',
                  name: 'Retro 2',
                  locked: false,
                  createdAt: '2026-01-01T01:00:00.000Z',
                  endedAt: null,
                  scheduledEndTime: null,
                  teamId,
                  createdBy: teammateId,
                  createdByUser: {id: teammateId, preferredName: 'Teammate'},
                  facilitatorStageId: 'stage2',
                  meetingSeries: null,
                  team: {id: teamId, name: 'Team', orgId},
                  phases: [
                    {
                      __typename: 'CheckInPhase',
                      id: 'phase2',
                      phaseType: 'checkin',
                      stages: [{__typename: 'CheckInStage', id: 'stage2', isComplete: false}]
                    }
                  ],
                  meetingMembers: [
                    {
                      __typename: 'RetrospectiveMeetingMember',
                      id: `${teammateId}::${startedMeetingId}`,
                      user: {id: teammateId, picture: '', preferredName: 'Teammate'}
                    }
                  ]
                }
              ]
            }
          }
        }
      },
      {
        [teamId]: {
          __id: teamId,
          __typename: 'Team',
          id: teamId,
          activeMeetings: {__refs: [endedMeetingId]}
        },
        [endedMeetingId]: {
          __id: endedMeetingId,
          __typename: 'RetrospectiveMeeting',
          id: endedMeetingId
        }
      }
    )
    const originalWindow = globalThis.window
    Object.assign(globalThis, {window: {location: new URL('https://parabol.test/meetings')}})
    TeamSubscription(atmosphere, {}, {navigate: jest.fn()})
    Object.assign(globalThis, {window: originalWindow})
    expect(atmosphere.getStore().getSource().get(teamId)?.activeMeetings).toEqual({
      __refs: [startedMeetingId]
    })
    const {request} = createOperationDescriptor(teamSubscriptionRequest, {})
    const meetingCard = atmosphere.lookup(
      createReaderSelector(meetingCardFragment, startedMeetingId, {}, request)
    )
    expect(meetingCard.isMissingData).toBe(false)
    const {meetingMembers} = readInlineData(
      meetingMemberAvatarsFragment,
      meetingCard.data as useMeetingMemberAvatars_meeting$key
    )
    expect(meetingMembers.map(({user}) => user.id)).toEqual([teammateId])
  })
})
