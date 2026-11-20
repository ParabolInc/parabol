import {Outlet, RouterProvider, useLocation, useNavigate} from '@tanstack/react-router'
import EventEmitter from 'eventemitter3'
import {Window} from 'happy-dom'
import {act, useState} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {TeamInvitationDialog_verifiedInvitation$key} from '../../__generated__/TeamInvitationDialog_verifiedInvitation.graphql'
import type Atmosphere from '../../Atmosphere'
import type AcceptTeamInvitationMutation from '../../mutations/AcceptTeamInvitationMutation'
import handleAuthenticationRedirect from '../../mutations/handlers/handleAuthenticationRedirect'
import redirectAfterSignIn from '../../mutations/handlers/redirectAfterSignIn'
import {createTestRouter, destroyTestRouters} from '../../routing/__tests__/testRouter'
import type {NavigateFn} from '../../types/relayMutations'
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

let authFormNavigate: NavigateFn = async () => {}
const MockAuthForm = () => {
  authFormNavigate = useNavigate()
  return <form />
}

const happyWindow = new Window({url: 'https://parabol.test/'})

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
  meetingId: null,
  team: {id: 'team-1', activeMeetings: activeMeetingIds.map((id) => ({id}))}
})

// what AcceptTeamInvitationMutation does with the server's reply, which is the same for an invitation accepted before
const answerAcceptTeamInvitationRequests = (activeMeetingIds: string[]) => {
  mockAcceptTeamInvitation.mock.calls.forEach(([, , {navigate}]) => {
    handleAuthenticationRedirect(replyFor(activeMeetingIds), {
      atmosphere: mockAtmosphere as unknown as Atmosphere,
      navigate
    })
  })
}

let replaceInvitation: (verifiedInvitation: TeamInvitationDialog_verifiedInvitation$key) => void =
  () => {}
const ReplaceableTeamInvitationDialog = (props: {
  verifiedInvitation: TeamInvitationDialog_verifiedInvitation$key
}) => {
  const [verifiedInvitation, setVerifiedInvitation] = useState(props.verifiedInvitation)
  replaceInvitation = setVerifiedInvitation
  return <TeamInvitationDialog verifiedInvitation={verifiedInvitation} />
}

const SpiedLayout = () => (
  <>
    <LocationSpy />
    <Outlet />
  </>
)

let mountedRoot: Root | undefined
const renderInvitation = async (
  verifiedInvitation: TeamInvitationDialog_verifiedInvitation$key
) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  mountedRoot = root
  const router = createTestRouter({
    rootComponent: SpiedLayout,
    routes: {
      '/team-invitation/$token': (
        <ReplaceableTeamInvitationDialog verifiedInvitation={verifiedInvitation} />
      ),
      '/team/$teamId': <main>Team</main>,
      '/meet/$meetingId': <main>Meeting</main>
    }
  })
  await act(async () =>
    root.render(
      <IsAuthenticatedProvider>
        <RouterProvider router={router} />
      </IsAuthenticatedProvider>
    )
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
  Object.assign(globalThis, {
    window: happyWindow,
    document: happyWindow.document,
    self: happyWindow,
    IS_REACT_ACT_ENVIRONMENT: true
  })
})

beforeEach(() => {
  happyWindow.history.replaceState(null, '', '/team-invitation/token-1')
})

afterEach(async () => {
  jest.restoreAllMocks()
  mockAcceptTeamInvitation.mockClear()
  await act(async () => mountedRoot?.unmount())
  mountedRoot = undefined
  destroyTestRouters()
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
      await renderInvitation(invitationFor(user))
      const navigations = recordNavigations()

      // the auth cookie lands before the login mutation calls back and accepts the invitation
      await act(async () => {
        mockAtmosphere.authObj = {sub: 'invitee'}
        mockAtmosphere.eventEmitter.emit('authChanged')
      })
      await act(async () => {
        redirectAfterSignIn(mockAtmosphere as unknown as Atmosphere, 'token-1', authFormNavigate)
        answerAcceptTeamInvitationRequests(activeMeetingIds)
      })

      expect(currentPathname).toBe(nextPath)
      expect(navigations).toEqual([`replaceState ${nextPath}`])
      expect(mockAcceptTeamInvitation).toHaveBeenCalledTimes(1)
    }
  )

  it('accepts once for a viewer who opens the invitation signed in', async () => {
    mockAtmosphere.authObj = {sub: 'invitee'}
    await renderInvitation(invitationFor({preferredName: 'Invitee'}))
    // a store update re-renders the dialog the same way
    await act(async () => replaceInvitation(invitationFor({preferredName: 'Invitee'})))
    const navigations = recordNavigations()
    await act(async () => answerAcceptTeamInvitationRequests(['meeting-1']))

    expect(currentPathname).toBe('/meet/meeting-1')
    expect(navigations).toEqual(['replaceState /meet/meeting-1'])
    expect(mockAcceptTeamInvitation).toHaveBeenCalledTimes(1)
    expect(mockAcceptTeamInvitation).toHaveBeenCalledWith(
      mockAtmosphere,
      {invitationToken: 'token-1'},
      expect.anything()
    )
  })
})
