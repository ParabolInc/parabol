import EventEmitter from 'eventemitter3'
import {Window} from 'happy-dom'
import {createRoot, type Root} from 'react-dom/client'
import {
  BrowserRouter,
  type NavigateFunction,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router'
import type {TeamInvitationDialog_verifiedInvitation$key} from '../../__generated__/TeamInvitationDialog_verifiedInvitation.graphql'
import type Atmosphere from '../../Atmosphere'
import type AcceptTeamInvitationMutation from '../../mutations/AcceptTeamInvitationMutation'
import handleAuthenticationRedirect from '../../mutations/handlers/handleAuthenticationRedirect'
import {IsAuthenticatedProvider} from '../IsAuthenticatedProvider'
import TeamInvitationDialog from '../TeamInvitationDialog'

const mockAtmosphere = {
  authObj: null as {sub: string} | null,
  eventEmitter: new EventEmitter()
}
const mockAcceptTeamInvitation = jest.fn<void, Parameters<typeof AcceptTeamInvitationMutation>>()
jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  useFragment: (_fragment: unknown, fragmentRef: unknown) => fragmentRef
}))
jest.mock('../../hooks/useAtmosphere', () => ({__esModule: true, default: () => mockAtmosphere}))
jest.mock('../../mutations/AcceptTeamInvitationMutation', () => ({
  __esModule: true,
  default: (...args: Parameters<typeof AcceptTeamInvitationMutation>) =>
    mockAcceptTeamInvitation(...args)
}))
jest.mock('../TeamInvitationEmailSignin', () => ({
  __esModule: true,
  default: () => <MockAuthForm />
}))
jest.mock('../TeamInvitationEmailCreateAccount', () => ({
  __esModule: true,
  default: () => <MockAuthForm />
}))

let authFormNavigate: NavigateFunction = () => {}
const MockAuthForm = () => {
  authFormNavigate = useNavigate()
  return <form />
}

const happyWindow = new Window({url: 'https://parabol.test/'})
const tick = () => new Promise((resolve) => setTimeout(resolve, 10))
const waitUntil = async (isDone: () => boolean, timeoutMs = 1000) => {
  const deadline = Date.now() + timeoutMs
  while (!isDone() && Date.now() < deadline) await tick()
}

let currentPathname = ''
const LocationSpy = () => {
  currentPathname = useLocation().pathname
  return null
}

const invitationFor = (user: {preferredName: string} | null) =>
  ({
    errorType: null,
    isGoogle: false,
    ssoURL: null,
    user
  }) as unknown as TeamInvitationDialog_verifiedInvitation$key

const replyFor = (activeMeetingIds: string[]) => ({
  error: null,
  meetingId: null,
  team: {id: 'team-1', activeMeetings: activeMeetingIds.map((id) => ({id}))}
})

// what AcceptTeamInvitationMutation does with the server's reply, ALREADY_ACCEPTED included
const answerAcceptTeamInvitationRequests = (activeMeetingIds: string[]) => {
  mockAcceptTeamInvitation.mock.calls.forEach(([, , {navigate}]) => {
    handleAuthenticationRedirect(replyFor(activeMeetingIds), {
      atmosphere: mockAtmosphere as unknown as Atmosphere,
      navigate
    })
  })
}

let mountedRoot: Root | undefined
const renderInvitation = (verifiedInvitation: TeamInvitationDialog_verifiedInvitation$key) => {
  if (!mountedRoot) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    mountedRoot = createRoot(container)
  }
  mountedRoot.render(
    <IsAuthenticatedProvider>
      <BrowserRouter>
        <LocationSpy />
        <Routes>
          <Route
            path='/team-invitation/:token'
            element={<TeamInvitationDialog verifiedInvitation={verifiedInvitation} />}
          />
          <Route path='/team/:teamId' element={<main>Team</main>} />
          <Route path='/meet/:meetingId' element={<main>Meeting</main>} />
        </Routes>
      </BrowserRouter>
    </IsAuthenticatedProvider>
  )
}

const recordNavigations = () => {
  const navigations: string[] = []
  for (const method of ['pushState', 'replaceState'] as const) {
    const historyMethod = happyWindow.history[method].bind(happyWindow.history)
    jest.spyOn(happyWindow.history, method).mockImplementation((state, unused, url?) => {
      navigations.push(`${method} ${url}`)
      historyMethod(state, unused, url)
    })
  }
  return navigations
}

beforeAll(() => {
  Object.assign(globalThis, {window: happyWindow, document: happyWindow.document})
})

beforeEach(() => {
  happyWindow.history.replaceState(null, '', '/team-invitation/token-1')
})

afterEach(() => {
  jest.restoreAllMocks()
  mockAcceptTeamInvitation.mockClear()
  mountedRoot?.unmount()
  mountedRoot = undefined
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

describe('TeamInvitationDialog', () => {
  it.each([
    ['signs in', {preferredName: 'Invitee'}, [], '/team/team-1'],
    ['signs up', null, ['meeting-1'], '/meet/meeting-1']
  ])(
    'navigates once when the invitee %s and the auth cookie lands before the login mutation completes',
    async (_flow, user, activeMeetingIds, nextPath) => {
      mockAtmosphere.authObj = null
      renderInvitation(invitationFor(user))
      await tick()
      const navigations = recordNavigations()

      // the auth cookie lands before the login mutation, which accepts the invitation too, calls back
      mockAtmosphere.authObj = {sub: 'invitee'}
      mockAtmosphere.eventEmitter.emit('authChanged')
      await tick()
      handleAuthenticationRedirect(replyFor(activeMeetingIds), {
        atmosphere: mockAtmosphere as unknown as Atmosphere,
        navigate: authFormNavigate
      })
      answerAcceptTeamInvitationRequests(activeMeetingIds)
      await waitUntil(() => currentPathname === nextPath)

      expect(navigations).toEqual([`replaceState ${nextPath}`])
      expect(mockAcceptTeamInvitation).not.toHaveBeenCalled()
    }
  )

  it('accepts once for a viewer who opens the invitation signed in', async () => {
    mockAtmosphere.authObj = {sub: 'invitee'}
    renderInvitation(invitationFor({preferredName: 'Invitee'}))
    await tick()
    // a store update re-renders the dialog the same way
    renderInvitation(invitationFor({preferredName: 'Invitee'}))
    await tick()
    const navigations = recordNavigations()
    answerAcceptTeamInvitationRequests(['meeting-1'])
    await waitUntil(() => currentPathname === '/meet/meeting-1')

    expect(navigations).toEqual(['replaceState /meet/meeting-1'])
    expect(mockAcceptTeamInvitation).toHaveBeenCalledTimes(1)
    expect(mockAcceptTeamInvitation).toHaveBeenCalledWith(
      mockAtmosphere,
      {invitationToken: 'token-1'},
      expect.anything()
    )
  })
})
