import {Outlet, RouterProvider, useNavigate} from '@tanstack/react-router'
import {Window} from 'happy-dom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {REPORTS_LAUNCH_SEEN_KEY} from '../../components/Dashboard/reportsLaunchSeen'
import {createTestRouter, destroyTestRouters} from '../../routing/__tests__/testRouter'
import type {NavigateFn} from '../../types/relayMutations'
import useReportsLaunchGlow from '../useReportsLaunchGlow'

const happyWindow = new Window({url: 'https://parabol.test/'})
let root: Root
let container: HTMLElement
let navigate: NavigateFn

const MET_AT = '2026-11-02T15:00:00.000Z'

const Probe = (props: {lastMetAt: string | null}) => {
  const state = useReportsLaunchGlow(props.lastMetAt)
  navigate = useNavigate()
  return <span data-state={state} />
}

const renderAt = async (path: string, lastMetAt: string | null = MET_AT) => {
  const DashboardLayout = () => (
    <>
      <Probe lastMetAt={lastMetAt} />
      <Outlet />
    </>
  )
  const router = createTestRouter({
    initialEntry: path,
    rootComponent: DashboardLayout,
    routes: {'/meetings': <main>Meetings</main>, '/reports/$': <main>Reports</main>}
  })
  await router.load()
  act(() => {
    root.render(<RouterProvider router={router} />)
  })
}

const navigateTo = (href: string) =>
  act(async () => {
    navigate({href})
    await new Promise((resolve) => setImmediate(resolve))
  })

const glowState = () => container.querySelector('span')?.dataset.state
const seenFlag = () => window.localStorage.getItem(REPORTS_LAUNCH_SEEN_KEY)

beforeAll(() => {
  Object.assign(globalThis, {
    window: happyWindow,
    document: happyWindow.document,
    self: happyWindow,
    IS_REACT_ACT_ENVIRONMENT: true
  })
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

beforeEach(() => {
  jest.useFakeTimers({
    now: new Date(2026, 10, 11, 9, 0, 0),
    doNotFake: ['setImmediate', 'queueMicrotask', 'nextTick']
  })
  window.localStorage.clear()
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  destroyTestRouters()
  container.remove()
  jest.useRealTimers()
})

test('glows away from Reports, retires on the first visit, then switches off', async () => {
  await renderAt('/meetings')
  expect(glowState()).toBe('glowing')
  await navigateTo('/reports/org1')
  expect(glowState()).toBe('retiring')
  expect(seenFlag()).toBe('1')
  act(() => {
    jest.advanceTimersByTime(800)
  })
  expect(glowState()).toBe('off')
})

test('never glows when the app opens on a report, and remembers the visit', async () => {
  await renderAt('/reports/org1/report')
  expect(glowState()).toBe('off')
  expect(seenFlag()).toBe('1')
})

test('never glows for someone who has never been in a meeting, but still remembers a visit', async () => {
  await renderAt('/meetings', null)
  expect(glowState()).toBe('off')
  await navigateTo('/reports/org1')
  expect(glowState()).toBe('off')
  expect(seenFlag()).toBe('1')
})

test('stays off for someone who has already visited Reports', async () => {
  window.localStorage.setItem(REPORTS_LAUNCH_SEEN_KEY, '1')
  await renderAt('/meetings')
  expect(glowState()).toBe('off')
})

test('switches off at the Jan 1, 2027 sunset in a tab left open', async () => {
  jest.setSystemTime(new Date(2026, 11, 31, 23, 30, 0))
  await renderAt('/meetings')
  expect(glowState()).toBe('glowing')
  act(() => {
    jest.advanceTimersByTime(60 * 60 * 1000)
  })
  expect(glowState()).toBe('off')
  expect(seenFlag()).toBe(null)
})
