import {RouterProvider} from '@tanstack/react-router'
import {Window} from 'happy-dom'
import {type ReactNode, useLayoutEffect} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {RelayEnvironmentProvider} from 'react-relay'
import {
  commitLocalUpdate,
  createOperationDescriptor,
  Environment,
  getRequest,
  Network,
  Observable,
  RecordSource,
  Store
} from 'relay-runtime'
import type {RetroMeeting_meeting$key} from '../../__generated__/RetroMeeting_meeting.graphql'
import {createTestRouter, destroyTestRouters} from '../../routing/__tests__/testRouter'
import handlerProvider from '../../utils/relay/handlerProvider'
import reportClientError from '../../utils/reportClientError'
import ErrorBoundary from '../ErrorBoundary'
import RetroMeeting from '../RetroMeeting'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: (strings: TemplateStringsArray) => {
    const [, name] = strings.join('').match(/(?:fragment|query|mutation|subscription)\s+(\w+)/)!
    return jest.requireActual(`../../__generated__/${name}.graphql`).default
  }
}))
jest.mock('../../utils/reportClientError', () => ({__esModule: true, default: jest.fn()}))
const mockLocalStageWrites = {areLost: false}
jest.mock('../../utils/relay/updateLocalStage', () => {
  const actual = jest.requireActual<typeof import('../../utils/relay/updateLocalStage')>(
    '../../utils/relay/updateLocalStage'
  )
  return {
    ...actual,
    __esModule: true,
    default: (...args: Parameters<typeof actual.default>) => {
      if (!mockLocalStageWrites.areLost) actual.default(...args)
    }
  }
})
jest.mock('../ReportErrorFeedback', () => ({__esModule: true, default: () => null}))
jest.mock('../NewMeetingCheckIn', () => ({__esModule: true, default: () => 'checkin phase'}))
jest.mock('../RetroReflectPhase/RetroReflectPhase', () => ({
  __esModule: true,
  default: () => 'reflect phase'
}))
jest.mock('../TeamHealth', () => ({__esModule: true, default: () => null}))
jest.mock('../RetroMeetingUpdates', () => ({__esModule: true, default: () => null}))
jest.mock('../RetroGroupPhase', () => ({__esModule: true, default: () => null}))
jest.mock('../RetroVotePhase', () => ({__esModule: true, default: () => null}))
jest.mock('../RetroDiscussPhase', () => ({__esModule: true, default: () => null}))
jest.mock('../MeetingControlBar', () => ({__esModule: true, default: () => null}))
jest.mock('../MeetingLockedOverlay', () => ({__esModule: true, default: () => null}))
jest.mock('../ResponsiveDashSidebar', () => ({__esModule: true, default: () => null}))
jest.mock('../RetroMeetingDrawer', () => ({__esModule: true, default: () => null}))
jest.mock('../RetroMeetingSidebar', () => ({__esModule: true, default: () => null}))
jest.mock('../../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../../hooks/useHotkey', () => ({__esModule: true, default: () => {}}))
jest.mock('../../hooks/useBreakpoint', () => ({__esModule: true, default: () => true}))
jest.mock('../../utils/getDemoAvatar', () => ({__esModule: true, default: () => ''}))
jest.mock('../../../../static/images/illustrations/action.png', () => '')
jest.mock('../../../../static/images/illustrations/retrospective.png', () => '')
jest.mock('../../../../static/images/illustrations/sprintPoker.png', () => '')
jest.mock('../../../../static/images/illustrations/teamHealth.png', () => '')
jest.mock('../../../../static/images/illustrations/teamPrompt.png', () => '')

const meetingQuery = getRequest(
  jest.requireActual('../../__generated__/MeetingSelectorQuery.graphql').default
)

const stage = (id: string, typename: string) => ({
  __typename: typename,
  id,
  isComplete: false,
  isNavigable: true,
  isNavigableByFacilitator: true
})

const retroPayload = (meetingId: string, extraPhases: object[] = []) => ({
  viewer: {
    __typename: 'User',
    id: 'viewer1',
    canAccessMeeting: true,
    meeting: {
      __typename: 'RetrospectiveMeeting',
      __isNewMeeting: 'RetrospectiveMeeting',
      id: meetingId,
      meetingType: 'retrospective',
      name: `Retro ${meetingId}`,
      showSidebar: true,
      facilitatorStageId: `${meetingId}:checkin:1`,
      facilitatorUserId: 'facilitator1',
      endedAt: null,
      team: {__typename: 'Team', id: 'team1', name: 'Team'},
      phases: [
        {
          __typename: 'CheckInPhase',
          id: `${meetingId}:checkin`,
          phaseType: 'checkin',
          stages: [stage(`${meetingId}:checkin:1`, 'CheckInStage')]
        },
        {
          __typename: 'ReflectPhase',
          id: `${meetingId}:reflect`,
          phaseType: 'reflect',
          stages: [stage(`${meetingId}:reflect:1`, 'GenericMeetingStage')]
        },
        ...extraPhases
      ]
    }
  }
})

const atmosphere = Object.assign(
  new Environment({
    handlerProvider,
    network: Network.create(() => Observable.create(() => {})),
    store: new Store(new RecordSource())
  }),
  {viewerId: 'viewer1'}
)

const loadMeeting = (meetingId: string, extraPhases?: object[]) => {
  const operation = createOperationDescriptor(meetingQuery, {meetingId})
  atmosphere.commitPayload(operation, retroPayload(meetingId, extraPhases))
  atmosphere.retain(operation)
  const {viewer} = atmosphere.lookup(operation.fragment).data as {
    viewer: {meeting: {RetroMeeting_meeting: RetroMeeting_meeting$key}}
  }
  return viewer.meeting.RetroMeeting_meeting
}

const happyWindow = new Window({url: 'https://parabol.test/'})
const tick = () => new Promise((resolve) => setTimeout(resolve, 10))
let root: Root
let container: HTMLElement

// Another member joining writes their check-in stage once the retro has rendered, before its effects run
const TeammateJoinsBeforeEffects = (props: {meetingId: string}) => {
  const {meetingId} = props
  useLayoutEffect(() => {
    commitLocalUpdate(atmosphere, (store) => {
      const checkInPhase = store.get(`${meetingId}:checkin`)!
      const {__typename, ...fields} = stage(`${meetingId}:checkin:2`, 'CheckInStage')
      const teammateStage = store.create(fields.id, __typename)
      Object.entries(fields).forEach(([key, value]) => teammateStage.setValue(value, key))
      checkInPhase.setLinkedRecords(
        [...checkInPhase.getLinkedRecords('stages')!, teammateStage],
        'stages'
      )
    })
  }, [])
  return null
}

const renderMeeting = (meeting: ReactNode) => {
  const router = createTestRouter({
    routes: {
      '/meet/$meetingId/$': <ErrorBoundary>{meeting}</ErrorBoundary>
    }
  })
  root.render(
    <RelayEnvironmentProvider environment={atmosphere}>
      <RouterProvider router={router} />
    </RelayEnvironmentProvider>
  )
}

const waitForRender = async () => {
  const isSettled = () => /phase|Try refreshing/.test(container.textContent ?? '')
  for (let i = 0; i < 100 && !isSettled(); i++) await tick()
  return container.textContent
}

beforeAll(() => {
  Object.assign(globalThis, {
    __PRODUCTION__: false,
    window: happyWindow,
    document: happyWindow.document,
    self: happyWindow,
    location: happyWindow.location
  })
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  jest.useRealTimers()
  root.unmount()
  destroyTestRouters()
  container.remove()
  jest.restoreAllMocks()
  jest.mocked(reportClientError).mockClear()
  mockLocalStageWrites.areLost = false
})

test('a retro that changes before its effects run still opens on its phase', async () => {
  happyWindow.history.replaceState(null, '', '/meet/meeting1/checkin/1')
  renderMeeting(
    <>
      <RetroMeeting meeting={loadMeeting('meeting1')} />
      <TeammateJoinsBeforeEffects meetingId='meeting1' />
    </>
  )
  expect(await waitForRender()).toBe('checkin phase')
  expect(reportClientError).not.toHaveBeenCalled()
})

test('a retro whose local phase never arrives tells the viewer to refresh and reports why', async () => {
  jest.useFakeTimers({
    doNotFake: ['setImmediate', 'queueMicrotask', 'nextTick'],
    advanceTimers: true
  })
  mockLocalStageWrites.areLost = true
  happyWindow.history.replaceState(null, '', '/meet/meeting3/checkin/1')
  renderMeeting(<RetroMeeting meeting={loadMeeting('meeting3')} />)
  for (let i = 0; i < 10; i++) await tick()
  expect(container.textContent).toBe('')
  expect(reportClientError).not.toHaveBeenCalled()

  jest.advanceTimersByTime(5000)
  expect(await waitForRender()).toContain('Try refreshing the page')
  expect(reportClientError).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'MissingMeetingPhase',
      message:
        'retrospective meeting meeting3 has no phase to show: localPhase unset of type unset, localStage unset, ' +
        'facilitatorStage meeting3:checkin:1 (in the phases), 2 phases, 2 stages'
    }),
    expect.anything()
  )
  expect(reportClientError).toHaveBeenCalledTimes(1)
})

test('a retro on a phase it has no component for tells the viewer to refresh and reports why', async () => {
  happyWindow.history.replaceState(null, '', '/meet/meeting2/firstcall')
  const firstCallPhase = {
    __typename: 'GenericMeetingPhase',
    id: 'meeting2:firstcall',
    phaseType: 'firstcall',
    stages: [stage('meeting2:firstcall:1', 'GenericMeetingStage')]
  }
  renderMeeting(<RetroMeeting meeting={loadMeeting('meeting2', [firstCallPhase])} />)
  expect(await waitForRender()).toContain('Try refreshing the page')
  expect(reportClientError).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'MissingMeetingPhase',
      message:
        'retrospective meeting meeting2 has no phase to show: localPhase meeting2:firstcall of type firstcall, ' +
        'localStage meeting2:firstcall:1 (in the phases), facilitatorStage meeting2:checkin:1 (in the phases), ' +
        '3 phases, 3 stages'
    }),
    expect.anything()
  )
  expect(reportClientError).toHaveBeenCalledTimes(1)
})
