import {renderToStaticMarkup} from 'react-dom/server'
import {RelayEnvironmentProvider} from 'react-relay'
import {
  commitLocalUpdate,
  createOperationDescriptor,
  Environment,
  getRequest,
  Network,
  Observable,
  RecordSource,
  type RecordSourceProxy,
  Store
} from 'relay-runtime'
import type {EstimatePhaseArea_meeting$key} from '../../__generated__/EstimatePhaseArea_meeting.graphql'
import type Atmosphere from '../../Atmosphere'
import TeamSubscription from '../../subscriptions/TeamSubscription'
import {setLocalStageAndPhase} from '../../utils/relay/updateLocalStage'
import EstimatePhaseArea from '../EstimatePhaseArea'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: (strings: TemplateStringsArray) => {
    const [, name] = strings.join('').match(/(?:fragment|query|mutation|subscription)\s+(\w+)/)!
    return jest.requireActual(`../../__generated__/${name}.graphql`).default
  }
}))
jest.mock('../../hooks/useBreakpoint', () => ({__esModule: true, default: () => true}))
jest.mock('../SwipeablePanel', () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => children
}))
jest.mock('../PokerCardDeck', () => ({__esModule: true, default: () => null}))
jest.mock('../PokerActiveVoting', () => ({__esModule: true, default: () => null}))
jest.mock('../PokerDiscussVoting', () => ({__esModule: true, default: () => null}))
jest.mock('../DeckActivityAvatars', () => ({__esModule: true, default: () => null}))

const meetingId = 'meeting1'
const phaseId = 'phase1'
const dimensionNames = ['Effort', 'Risk']

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
    viewerId: 'viewer1',
    registerSubscription: () => 'teamSubscription',
    unregisterSub: () => {}
  }) as unknown as Atmosphere
}

const writeStages = (store: RecordSourceProxy, taskId: string, stageIds: string[]) =>
  stageIds.map((stageId, idx) => {
    const stage = store.get(stageId) ?? store.create(stageId, 'EstimateStage')
    const dimensionRefId = `dimensionRef:${meetingId}:${idx}`
    const dimensionRef =
      store.get(dimensionRefId) ?? store.create(dimensionRefId, 'TemplateDimensionRef')
    dimensionRef.setValue(dimensionRefId, 'id').setValue(dimensionNames[idx], 'name')
    return stage
      .setValue(stageId, 'id')
      .setValue(taskId, 'taskId')
      .setValue(false, 'isVoting')
      .setLinkedRecord(dimensionRef, 'dimensionRef')
  })

const startMeeting = (atmosphere: Atmosphere) => {
  commitLocalUpdate(atmosphere, (store) => {
    const meeting = store.create(meetingId, 'PokerMeeting')
    const phase = store.create(phaseId, 'EstimatePhase')
    phase
      .setValue(phaseId, 'id')
      .setValue('ESTIMATE', 'phaseType')
      .setLinkedRecords(writeStages(store, 'task1', ['stage1', 'stage2']), 'stages')
    meeting
      .setValue(meetingId, 'id')
      .setValue('facilitator1', 'facilitatorUserId')
      .setValue('stage1', 'facilitatorStageId')
      .setValue(null, 'endedAt')
      .setValue(null, 'viewerMeetingMember')
      .setLinkedRecords([phase], 'phases')
    setLocalStageAndPhase(store, meetingId, 'stage1')
  })
}

const facilitatorNavigatesToNewStory = () => ({
  teamSubscription: {
    fieldName: 'NavigateMeetingPayload',
    NavigateMeetingPayload: {
      error: null,
      meeting: {
        __typename: 'PokerMeeting',
        id: meetingId,
        name: 'Sprint Poker',
        meetingType: 'poker',
        facilitatorStageId: 'stage3',
        team: null,
        phases: [
          {
            __typename: 'EstimatePhase',
            id: phaseId,
            phaseType: 'ESTIMATE',
            stages: ['stage1', 'stage2', 'stage3', 'stage4'].map((id) => ({
              __typename: 'EstimateStage',
              id,
              isComplete: false
            }))
          }
        ]
      },
      oldFacilitatorStage: {__typename: 'EstimateStage', id: 'stage1', isComplete: false},
      phaseComplete: null,
      unlockedStages: null
    }
  }
})

const renderArea = (atmosphere: Atmosphere) => {
  const {request} = createOperationDescriptor(
    getRequest(jest.requireActual('../../__generated__/TeamSubscription.graphql').default),
    {}
  )
  const meetingRef = {
    __id: meetingId,
    __fragments: {EstimatePhaseArea_meeting: {}},
    __fragmentOwner: request
  } as unknown as EstimatePhaseArea_meeting$key
  return renderToStaticMarkup(
    <RelayEnvironmentProvider environment={atmosphere}>
      <EstimatePhaseArea gotoStageId={jest.fn()} meeting={meetingRef} />
    </RelayEnvironmentProvider>
  )
}

describe('EstimatePhaseArea', () => {
  let errorSpy: jest.SpyInstance
  let warnSpy: jest.SpyInstance
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('waits for the story the facilitator moved to before showing its dimensions', () => {
    const atmosphere = createTestAtmosphere(facilitatorNavigatesToNewStory())
    startMeeting(atmosphere)
    expect(renderArea(atmosphere)).toContain(dimensionNames[0])

    // the team subscription can arrive before the meeting subscription that adds the story
    TeamSubscription(atmosphere, {}, {navigate: jest.fn()})
    const meetingRecord = atmosphere.getStore().getSource().get(meetingId)
    expect(meetingRecord?.localStage).toEqual({__ref: 'stage3'})
    const html = renderArea(atmosphere)
    expect(html).not.toContain(dimensionNames[0])
    expect(html).not.toContain(dimensionNames[1])

    commitLocalUpdate(atmosphere, (store) => {
      writeStages(store, 'task2', ['stage3', 'stage4'])
    })
    const htmlWithStory = renderArea(atmosphere)
    expect(htmlWithStory).toContain(dimensionNames[0])
    expect(htmlWithStory).toContain(dimensionNames[1])
  })
})
