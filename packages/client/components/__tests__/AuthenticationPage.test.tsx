import {Window} from 'happy-dom'
import {Suspense} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {MemoryRouter, Route, Routes, useLocation} from 'react-router'
import AuthenticationPage from '../AuthenticationPage'

jest.mock('../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({authObj: {sub: 'signed-in-user'}})
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

let root: Root

beforeAll(() => {
  Object.assign(globalThis, {window: happyWindow, document: happyWindow.document})
})

afterAll(async () => {
  root.unmount()
  await happyWindow.happyDOM.close()
})

describe('AuthenticationPage', () => {
  it('redirects a signed-in viewer when a sibling suspends the first render', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
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
})
