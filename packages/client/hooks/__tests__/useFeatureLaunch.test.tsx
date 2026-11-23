import {Window} from 'happy-dom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import useFeatureLaunch from '../useFeatureLaunch'

const happyWindow = new Window({url: 'https://parabol.test/'})
let root: Root
let container: HTMLElement
let dismissReports = () => {}

const Probe = (props: {name: string; isEligible?: boolean}) => {
  const [status, dismiss] = useFeatureLaunch('reports', props.isEligible)
  dismissReports = dismiss
  return <span data-name={props.name} data-status={status} />
}

const render = (ui: React.ReactNode) =>
  act(() => {
    root.render(ui)
  })

const statusOf = (name: string) =>
  container.querySelector<HTMLElement>(`[data-name="${name}"]`)?.dataset.status

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
  container.remove()
  jest.useRealTimers()
})

test('a click retires the launch everywhere it shows, then remembers it', () => {
  render(
    <>
      <Probe name='sidebar' />
      <Probe name='menu' />
    </>
  )
  expect(statusOf('sidebar')).toBe('new')
  expect(statusOf('menu')).toBe('new')
  act(() => dismissReports())
  expect(statusOf('sidebar')).toBe('retiring')
  expect(statusOf('menu')).toBe('retiring')
  act(() => {
    jest.advanceTimersByTime(800)
  })
  expect(statusOf('sidebar')).toBe('off')
  expect(window.localStorage.getItem('reportsLaunchSeen')).toBe('1')
})

test('stays off once seen, including under the key Reports used before', () => {
  window.localStorage.setItem('reportsLaunchSeen', '1')
  render(<Probe name='sidebar' />)
  expect(statusOf('sidebar')).toBe('off')
})

test('stays off for someone it does not apply to', () => {
  render(<Probe name='sidebar' isEligible={false} />)
  expect(statusOf('sidebar')).toBe('off')
})

test('ends on its date', () => {
  jest.setSystemTime(new Date(2027, 0, 1, 0, 0, 0))
  render(<Probe name='sidebar' />)
  expect(statusOf('sidebar')).toBe('off')
})
