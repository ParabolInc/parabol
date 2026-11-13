jest.mock('react-dom/client', () => ({createRoot: () => ({render: jest.fn()})}))
jest.mock('../Root', () => () => null)
jest.mock('../scrollIntoViewIfNeeded', () => ({}))
jest.mock('../utils/registerClientErrorHandlers', () => jest.fn())
jest.mock('../utils/retryChunkLoadErrorOnce', () => jest.fn())

const register = jest.fn()
const loggedToConsole = jest.spyOn(console, 'error').mockImplementation(() => {})

const loadPage = async () => {
  jest.resetModules()
  await import('../client')
  const addEventListener = window.addEventListener as jest.Mock
  const [, onLoad] = addEventListener.mock.calls.find(([type]) => type === 'load')!
  await onLoad()
  await new Promise(setImmediate)
}

beforeEach(() => {
  Object.assign(globalThis, {__PRODUCTION__: true})
  Object.defineProperty(globalThis, 'window', {
    value: {location: {protocol: 'https:'}, addEventListener: jest.fn()},
    configurable: true
  })
  Object.defineProperty(globalThis, 'document', {
    value: {getElementById: () => ({})},
    configurable: true
  })
  Object.defineProperty(globalThis, 'navigator', {
    value: {serviceWorker: {register}},
    configurable: true
  })
  register.mockReset()
  loggedToConsole.mockClear()
})

afterAll(() => {
  loggedToConsole.mockRestore()
})

test('a registration the browser refuses to a document it is discarding is not logged', async () => {
  register.mockRejectedValue(
    new DOMException(
      'Failed to register a ServiceWorker: The document is in an invalid state.',
      'InvalidStateError'
    )
  )
  await loadPage()
  expect(register).toHaveBeenCalledWith('/sw.js', {scope: '/'})
  expect(loggedToConsole).not.toHaveBeenCalled()
})

test('a registration the browser refuses to a site whose data the user blocks is not logged', async () => {
  register.mockRejectedValue(
    new DOMException(
      "Failed to register a ServiceWorker for scope ('https://action.parabol.co/') with script ('https://action.parabol.co/sw.js'): The user denied permission to use Service Worker.",
      'NotSupportedError'
    )
  )
  await loadPage()
  expect(loggedToConsole).not.toHaveBeenCalled()
})

test('a registration the browser refuses to a copy of the page another origin serves is not logged', async () => {
  register.mockRejectedValue(
    new DOMException(
      "Failed to register a ServiceWorker: The origin of the provided scriptURL ('https://app.example.com') does not match the current origin ('https://app-example-com.proxy.example').",
      'SecurityError'
    )
  )
  await loadPage()
  expect(register).toHaveBeenCalledWith('/sw.js', {scope: '/'})
  expect(loggedToConsole).not.toHaveBeenCalled()
})

test('a registration that fails to load the script is still logged', async () => {
  const failure = new TypeError(
    "Failed to register a ServiceWorker for scope ('https://action.parabol.co/') with script ('https://action.parabol.co/sw.js'): A bad HTTP response code (404) was received when fetching the script."
  )
  register.mockRejectedValue(failure)
  await loadPage()
  expect(loggedToConsole).toHaveBeenCalledWith(failure)
})
