jest.mock('react-dom/client', () => ({createRoot: () => ({render: jest.fn()})}))
jest.mock('../Root', () => () => null)
jest.mock('../routing/appRouter', () => ({load: () => Promise.resolve()}))
jest.mock('../scrollIntoViewIfNeeded', () => ({}))
jest.mock('../utils/registerClientErrorHandlers', () => jest.fn())
jest.mock('../utils/retryChunkLoadErrorOnce', () => jest.fn())

const register = jest.fn()
const loggedToConsole = jest.spyOn(console, 'error').mockImplementation(() => {})

const loadPage = async () => {
  jest.resetModules()
  await import('../client')
  const addEventListener = window.addEventListener as jest.Mock
  const loadListener = addEventListener.mock.calls.find(([type]) => type === 'load')
  await loadListener?.[1]()
  await new Promise(setImmediate)
}

beforeEach(() => {
  Object.assign(globalThis, {__PRODUCTION__: true})
  Object.defineProperty(globalThis, 'window', {
    value: {
      location: {protocol: 'https:', origin: 'https://action.parabol.co'},
      addEventListener: jest.fn()
    },
    configurable: true
  })
  Object.defineProperty(globalThis, 'document', {
    value: {getElementById: () => ({}), baseURI: 'https://action.parabol.co/'},
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
  expect(register).toHaveBeenCalled()
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

test("a SecurityError registering on the page's own origin is still logged", async () => {
  const failure = new DOMException(
    "Failed to register a ServiceWorker for scope ('https://action.parabol.co/') with script ('https://action.parabol.co/sw.js'): The script has an unsupported MIME type ('text/html').",
    'SecurityError'
  )
  register.mockRejectedValue(failure)
  await loadPage()
  expect(loggedToConsole).toHaveBeenCalledWith(failure)
})

test('a copy of the page a translation proxy serves from its own origin does not register the worker', async () => {
  Object.assign(window.location, {origin: 'https://action-parabol-co.translate.goog'})
  register.mockRejectedValue(
    new DOMException(
      "Failed to register a ServiceWorker: The origin of the provided scriptURL ('https://action.parabol.co') does not match the current origin ('https://action-parabol-co.translate.goog').",
      'SecurityError'
    )
  )
  await loadPage()
  expect(register).not.toHaveBeenCalled()
  expect(loggedToConsole).not.toHaveBeenCalled()
})
