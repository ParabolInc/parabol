import {Outlet, RouterProvider, useLocation, useNavigate} from '@tanstack/react-router'
import {Window} from 'happy-dom'
import {Suspense} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type Atmosphere from '../../Atmosphere'
import handleAuthenticationRedirect from '../../mutations/handlers/handleAuthenticationRedirect'
import {createTestRouter, destroyTestRouters} from '../../routing/__tests__/testRouter'
import type {NavigateFn} from '../../types/relayMutations'
import AuthenticationPage from '../AuthenticationPage'

const mockAtmosphere: {authObj: {sub: string} | null} = {authObj: null}
jest.mock('../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => mockAtmosphere
}))
jest.mock('../GenericAuthentication', () => ({__esModule: true, default: () => null}))
jest.mock('../TeamInvitationWrapper', () => ({__esModule: true, default: () => null}))

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

let signInFormNavigate: NavigateFn = async () => {}
const SignInFormNavigate = () => {
  signInFormNavigate = useNavigate()
  return null
}

let resolveSiblingData = () => {}
let isSiblingDataReady = false
const siblingData = new Promise<void>((resolve) => {
  resolveSiblingData = () => {
    isSiblingDataReady = true
    resolve()
  }
})
const SuspendingSibling = () => {
  if (!isSiblingDataReady) throw siblingData
  return null
}

let mountedRoot: Root | undefined
const renderInContainer = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  mountedRoot = createRoot(container)
  return {container, root: mountedRoot}
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
    self: happyWindow
  })
})

afterEach(() => {
  jest.restoreAllMocks()
  mountedRoot?.unmount()
  destroyTestRouters()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

describe('AuthenticationPage', () => {
  it('redirects a signed-in viewer when a sibling suspends the first render', async () => {
    mockAtmosphere.authObj = {sub: 'signed-in-user'}
    const {container, root} = renderInContainer()
    const SuspendingLayout = () => (
      <Suspense fallback={null}>
        <LocationSpy />
        <Outlet />
        <SuspendingSibling />
      </Suspense>
    )
    const router = createTestRouter({
      initialEntry: '/',
      rootComponent: SuspendingLayout,
      routes: {'/': <AuthenticationPage page='signin' />, '/meetings': <main>Meetings</main>}
    })
    root.render(<RouterProvider router={router} />)
    await tick()
    resolveSiblingData()
    await waitUntil(() => container.textContent !== '')
    expect(currentPathname).toBe('/meetings')
    expect(container.textContent).toBe('Meetings')
  })

  it.each([
    ['/?redirectTo=%2Fpages%2Fpage-1', '/pages/page-1'],
    ['/', '/meetings']
  ])(
    'navigates once from %s to %s when the auth cookie lands before the login mutation completes',
    async (signInUrl, nextPath) => {
      mockAtmosphere.authObj = null
      happyWindow.history.replaceState(null, '', signInUrl)
      const {root} = renderInContainer()
      const SpiedLayout = () => (
        <>
          <LocationSpy />
          <SignInFormNavigate />
          <Outlet />
        </>
      )
      const router = createTestRouter({
        rootComponent: SpiedLayout,
        routes: {
          '/': <AuthenticationPage page='signin' />,
          '/pages/$pageSlug': <main>Page</main>,
          '/meetings': <main>Meetings</main>
        }
      })
      const renderApp = () => root.render(<RouterProvider router={router} />)
      renderApp()
      await tick()
      const navigations = recordNavigations()

      // the cookie listener sets authObj, which re-renders the routes, before the login mutation calls back
      mockAtmosphere.authObj = {sub: 'signed-in-user'}
      renderApp()
      await tick()
      handleAuthenticationRedirect(undefined, {
        atmosphere: mockAtmosphere as unknown as Atmosphere,
        navigate: signInFormNavigate
      })
      await waitUntil(() => currentPathname === nextPath)

      expect(navigations).toEqual([`pushState ${nextPath}`])
      expect(currentPathname).toBe(nextPath)
    }
  )
})
