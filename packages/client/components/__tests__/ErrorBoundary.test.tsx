import {Window} from 'happy-dom'
import type {ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'

const mockAtmosphere = {invalidateSession: jest.fn()}
jest.mock('../../hooks/useAtmosphere', () => ({__esModule: true, default: () => mockAtmosphere}))
jest.mock('../ReportErrorFeedback', () => ({__esModule: true, default: () => null}))

const sendBeacon = jest.fn((_url: string, _body: Blob) => true)
const happyWindow = new Window({url: 'https://parabol.test/me/profile'})
const tick = () => new Promise((resolve) => setTimeout(resolve, 10))
// React logs every error a boundary catches
const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

const readSentReports = async () => {
  const batches = await Promise.all(
    sendBeacon.mock.calls.map(async ([, body]) => JSON.parse(await body.text()))
  )
  return batches.flatMap(({reports}) => reports)
}

let renderInBoundary: (children: ReactNode) => void
let flushClientErrors: () => void
let mountedRoot: Root | undefined

beforeAll(async () => {
  Object.assign(globalThis, {
    __APP_VERSION__: '15.11.0',
    __PRODUCTION__: false,
    window: happyWindow,
    document: happyWindow.document
  })
  Object.defineProperty(globalThis, 'navigator', {
    value: {userAgent: 'Mozilla/5.0', sendBeacon},
    configurable: true
  })
  ;({flushClientErrors} = await import('../../utils/reportClientError'))
  const {default: ErrorBoundary} = await import('../ErrorBoundary')
  renderInBoundary = (children) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    mountedRoot = createRoot(container)
    mountedRoot.render(<ErrorBoundary>{children}</ErrorBoundary>)
  }
})

beforeEach(() => {
  mockAtmosphere.invalidateSession.mockClear()
  sendBeacon.mockClear()
})

afterEach(() => {
  mountedRoot?.unmount()
  mountedRoot = undefined
})

afterAll(async () => {
  consoleError.mockRestore()
  await happyWindow.happyDOM.close()
})

const Throws = ({error}: {error: Error}): ReactNode => {
  throw error
}

test('a query that fails because the session ended still signs out, and goes out as a warning', async () => {
  const error = new Error(
    'No data returned for operation `ProfileQuery`, got error(s):\nNot signed in'
  )
  error.name = 'RelayNetwork'
  renderInBoundary(<Throws error={error} />)
  await tick()
  flushClientErrors()
  expect(mockAtmosphere.invalidateSession).toHaveBeenCalledTimes(1)
  expect(mockAtmosphere.invalidateSession).toHaveBeenCalledWith('Not signed in')
  expect(await readSentReports()).toEqual([
    expect.objectContaining({level: 'warn', name: 'RelayNetwork', message: error.message})
  ])
})

test('any other error a boundary catches still goes out as an error, without signing out', async () => {
  renderInBoundary(<Throws error={new TypeError('broken render')} />)
  await tick()
  flushClientErrors()
  expect(mockAtmosphere.invalidateSession).not.toHaveBeenCalled()
  expect(await readSentReports()).toEqual([
    expect.objectContaining({level: 'error', name: 'TypeError', message: 'broken render'})
  ])
})
