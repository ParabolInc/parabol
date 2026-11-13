import {Window} from 'happy-dom'
import {Component, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {loadQuery, type PreloadedQuery, RelayEnvironmentProvider} from 'react-relay'
import {BrowserRouter, type NavigateFunction, Route, Routes, useNavigate} from 'react-router'
import {
  createOperationDescriptor,
  Environment,
  getRequest,
  Network,
  Observable,
  RecordSource,
  Store
} from 'relay-runtime'
import type {MeetingSelectorQuery} from '../../__generated__/MeetingSelectorQuery.graphql'
import handlerProvider from '../../utils/relay/handlerProvider'
import MeetingRoot from '../MeetingRoot'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: (strings: TemplateStringsArray) => {
    const [, name] = strings.join('').match(/(?:fragment|query|mutation|subscription)\s+(\w+)/)!
    return jest.requireActual(`../../__generated__/${name}.graphql`).default
  }
}))
const mockLoaded: {queryRef: PreloadedQuery<MeetingSelectorQuery> | null} = {queryRef: null}
jest.mock('../../hooks/useJoinedMeetingQuery', () => ({
  __esModule: true,
  default: () => mockLoaded.queryRef
}))
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
jest.mock('../../hooks/useBreakpoint', () => ({__esModule: true, default: () => true}))
jest.mock('../../hooks/useConnectedMeetingMembers', () => ({useConnectedMeetingMembers: () => {}}))
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

const retroPayload = (meetingId: string, facilitatorStageId: string) => ({
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
      facilitatorStageId,
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

const loadMeeting = (meetingId: string, facilitatorStageId: string) => {
  const variables = {meetingId}
  atmosphere.commitPayload(
    createOperationDescriptor(meetingQuery, variables),
    retroPayload(meetingId, facilitatorStageId)
  )
  mockLoaded.queryRef = loadQuery<MeetingSelectorQuery>(atmosphere, meetingQuery, variables, {
    fetchPolicy: 'store-only'
  })
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

let navigate: NavigateFunction = () => {}
const NavigateSpy = () => {
  navigate = useNavigate()
  return null
}

const happyWindow = new Window({url: 'https://parabol.test/'})
const tick = () => new Promise((resolve) => setTimeout(resolve, 10))
let root: Root
let container: HTMLElement

const renderRoute = () => {
  root.render(
    <RelayEnvironmentProvider environment={atmosphere}>
      <BrowserRouter>
        <NavigateSpy />
        <CrashBoundary>
          <Routes>
            <Route path='/meet/:meetingId/*' element={<MeetingRoot />} />
          </Routes>
        </CrashBoundary>
      </BrowserRouter>
    </RelayEnvironmentProvider>
  )
}

const waitForPhase = async () => {
  const isSettled = () => /phase|crashed/.test(container.textContent ?? '')
  for (let i = 0; i < 100 && !isSettled(); i++) await tick()
  return container.textContent
}

beforeAll(() => {
  Object.assign(globalThis, {
    __APP_VERSION__: '1.0.0',
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

test('opens a retro on its facilitator’s phase', async () => {
  happyWindow.history.replaceState(null, '', '/meet/meeting1')
  loadMeeting('meeting1', 'meeting1:reflect:1')
  renderRoute()
  expect(await waitForPhase()).toBe('reflect phase')
  expect(happyWindow.location.pathname).toBe('/meet/meeting1/reflect')
})

test('going from one retro to another opens the second on its own phase', async () => {
  happyWindow.history.replaceState(null, '', '/meet/meeting2/checkin/1')
  loadMeeting('meeting2', 'meeting2:checkin:1')
  renderRoute()
  expect(await waitForPhase()).toBe('checkin phase')

  navigate('/meet/meeting3')
  await tick()
  loadMeeting('meeting3', 'meeting3:reflect:1')
  renderRoute()
  await tick()
  expect(await waitForPhase()).toBe('reflect phase')
  expect(happyWindow.location.pathname).toBe('/meet/meeting3/reflect')
})
