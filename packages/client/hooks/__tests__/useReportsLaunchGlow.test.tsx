import {Window} from 'happy-dom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {MemoryRouter, type NavigateFunction, useNavigate} from 'react-router'
import {REPORTS_LAUNCH_SEEN_KEY} from '../../components/Dashboard/reportsLaunchSeen'
import useReportsLaunchGlow from '../useReportsLaunchGlow'

const happyWindow = new Window({url: 'https://parabol.test/'})
let root: Root
let container: HTMLElement
let navigate: NavigateFunction

const Probe = () => {
  const state = useReportsLaunchGlow()
  navigate = useNavigate()
  return <span data-state={state} />
}

const renderAt = (path: string) => {
  act(() => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Probe />
      </MemoryRouter>
    )
  })
}

const glowState = () => container.querySelector('span')?.dataset.state
const seenFlag = () => window.localStorage.getItem(REPORTS_LAUNCH_SEEN_KEY)

beforeAll(() => {
  Object.assign(globalThis, {
    window: happyWindow,
    document: happyWindow.document,
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
  container.remove()
  jest.useRealTimers()
})

test('glows away from Reports, retires on the first visit, then switches off', () => {
  renderAt('/meetings')
  expect(glowState()).toBe('glowing')
  act(() => {
    navigate('/reports/org1')
  })
  expect(glowState()).toBe('retiring')
  expect(seenFlag()).toBe('1')
  act(() => {
    jest.advanceTimersByTime(800)
  })
  expect(glowState()).toBe('off')
})

test('never glows when the app opens on a report, and remembers the visit', () => {
  renderAt('/reports/org1/report')
  expect(glowState()).toBe('off')
  expect(seenFlag()).toBe('1')
})

test('stays off for someone who has already visited Reports', () => {
  window.localStorage.setItem(REPORTS_LAUNCH_SEEN_KEY, '1')
  renderAt('/meetings')
  expect(glowState()).toBe('off')
})

test('switches off at the Jan 1, 2027 sunset in a tab left open', () => {
  jest.setSystemTime(new Date(2026, 11, 31, 23, 30, 0))
  renderAt('/meetings')
  expect(glowState()).toBe('glowing')
  act(() => {
    jest.advanceTimersByTime(60 * 60 * 1000)
  })
  expect(glowState()).toBe('off')
  expect(seenFlag()).toBe(null)
})
