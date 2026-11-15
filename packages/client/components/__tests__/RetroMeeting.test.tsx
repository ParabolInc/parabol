import {Window} from 'happy-dom'
import {Component, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {RelayEnvironmentProvider} from 'react-relay'
import {BrowserRouter} from 'react-router'
import {
  createOperationDescriptor,
  Environment,
  getRequest,
  Network,
  Observable,
  RecordSource,
  Store
} from 'relay-runtime'
import type {RetroMeeting_meeting$key} from '../../__generated__/RetroMeeting_meeting.graphql'
import handlerProvider from '../../utils/relay/handlerProvider'
import reportClientError from '../../utils/reportClientError'
import RetroMeeting from '../RetroMeeting'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: (strings: TemplateStringsArray) => {
    const [, name] = strings.join('').match(/(?:fragment|query|mutation|subscription)\s+(\w+)/)!
    return jest.requireActual(`../../__generated__/${name}.graphql`).default
  }
}))
jest.mock('../../utils/reportClientError', () => ({__esModule: true, default: jest.fn()}))
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
jest.mock('../RetroInspirationDrawer', () => ({__esModule: true, default: () => null}))
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

const retroPayload = (meetingId: string) => ({
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
        }
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

const loadMeeting = (meetingId: string) => {
  const operation = createOperationDescriptor(meetingQuery, {meetingId})
  atmosphere.commitPayload(operation, retroPayload(meetingId))
  atmosphere.retain(operation)
  const {viewer} = atmosphere.lookup(operation.fragment).data as {
    viewer: {meeting: {RetroMeeting_meeting: RetroMeeting_meeting$key}}
  }
  return viewer.meeting.RetroMeeting_meeting
}

class CrashBoundary extends Component<{children: ReactNode}, {error?: Error}> {
  state: {error?: Error} = {}
  static getDerivedStateFromError(error: Error) {
    return {error}
  }
  render() {
    return this.state.error ? `crashed: ${this.state.error.message}` : this.props.children
  }
}

const happyWindow = new Window({url: 'https://parabol.test/'})
const tick = () => new Promise((resolve) => setTimeout(resolve, 10))
let root: Root
let container: HTMLElement

const renderMeeting = (meetingRef: RetroMeeting_meeting$key) => {
  root.render(
    <RelayEnvironmentProvider environment={atmosphere}>
      <BrowserRouter>
        <CrashBoundary>
          <RetroMeeting meeting={meetingRef} />
        </CrashBoundary>
      </BrowserRouter>
    </RelayEnvironmentProvider>
  )
}

const waitForRender = async () => {
  const isSettled = () => /phase|crashed/.test(container.textContent ?? '')
  for (let i = 0; i < 100 && !isSettled(); i++) await tick()
  return container.textContent
}

beforeAll(() => {
  Object.assign(globalThis, {
    window: happyWindow,
    document: happyWindow.document,
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
  root.unmount()
  container.remove()
  jest.restoreAllMocks()
})

test('a retro that has no phase to show reports its local stage and stages', async () => {
  happyWindow.history.replaceState(null, '', '/meet/meeting1/checkin/1')
  renderMeeting(loadMeeting('meeting1'))
  expect(await waitForRender()).toBe('checkin phase')
  expect(reportClientError).not.toHaveBeenCalled()

  // a second meeting given to the same RetroMeeting never had its local stage set
  renderMeeting(loadMeeting('meeting2'))
  await tick()
  expect(reportClientError).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'MissingMeetingPhase',
      message:
        'RetroMeeting found no phase for meeting meeting2: localPhase unset of type unset, localStage unset, ' +
        'facilitatorStage meeting2:checkin:1 (in the phases), 2 phases, 2 stages'
    })
  )
})
