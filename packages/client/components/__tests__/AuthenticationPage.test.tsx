import {Window} from 'happy-dom'
import {Suspense} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {
  BrowserRouter,
  MemoryRouter,
  type NavigateFunction,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router'
import type Atmosphere from '../../Atmosphere'
import handleAuthenticationRedirect from '../../mutations/handlers/handleAuthenticationRedirect'
import AuthenticationPage from '../AuthenticationPage'

const mockAtmosphere: {authObj: {sub: string} | null} = {authObj: null}
jest.mock('../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => mockAtmosphere
}))
jest.mock('../../utils/SendClientSideEvent', () => ({__esModule: true, default: () => {}}))
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

let signInFormNavigate: NavigateFunction = () => {}
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
  Object.assign(globalThis, {window: happyWindow, document: happyWindow.document})
})

afterEach(() => {
  jest.restoreAllMocks()
  mountedRoot?.unmount()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

describe('AuthenticationPage', () => {
  it('redirects a signed-in viewer when a sibling suspends the first render', async () => {
    mockAtmosphere.authObj = {sub: 'signed-in-user'}
    const {container, root} = renderInContainer()
    root.render(
      <MemoryRouter initialEntries={['/']}>
        <Suspense fallback={null}>
          <LocationSpy />
          <Routes>
            <Route path='/' element={<AuthenticationPage page='signin' />} />
            <Route path='/meetings' element={<main>Meetings</main>} />
          </Routes>
          <SuspendingSibling />
        </Suspense>
      </MemoryRouter>
    )
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
      const renderApp = () =>
        root.render(
          <BrowserRouter>
            <LocationSpy />
            <SignInFormNavigate />
            <Routes>
              <Route path='/' element={<AuthenticationPage page='signin' />} />
              <Route path='/pages/:pageSlug' element={<main>Page</main>} />
              <Route path='/meetings' element={<main>Meetings</main>} />
            </Routes>
          </BrowserRouter>
        )
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
