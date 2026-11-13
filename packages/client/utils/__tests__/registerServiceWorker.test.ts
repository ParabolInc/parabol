import registerServiceWorker from '../registerServiceWorker'

const register = jest.fn()
const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

const droppedFetch = () =>
  new TypeError(
    "Failed to register a ServiceWorker for scope ('https://example.test/') with script ('https://example.test/sw.js'): A bad HTTP response code (503) was received when fetching the script."
  )

beforeAll(() => {
  Object.defineProperty(globalThis, 'navigator', {
    value: {serviceWorker: {register}},
    configurable: true
  })
})

beforeEach(() => {
  register.mockReset()
  consoleError.mockClear()
})

afterAll(() => {
  consoleError.mockRestore()
})

test('registers the worker once when the script loads', async () => {
  register.mockResolvedValue({})
  await registerServiceWorker()
  expect(register).toHaveBeenCalledTimes(1)
  expect(register).toHaveBeenCalledWith('/sw.js', {scope: '/'})
  expect(consoleError).not.toHaveBeenCalled()
})

test('registers again without logging when the load balancer drops the request for the script', async () => {
  register.mockRejectedValueOnce(droppedFetch()).mockResolvedValueOnce({})
  await registerServiceWorker()
  expect(register).toHaveBeenCalledTimes(2)
  expect(register).toHaveBeenLastCalledWith('/sw.js', {scope: '/'})
  expect(consoleError).not.toHaveBeenCalled()
})

test('still logs a registration that fails again, after one more try', async () => {
  const lastFailure = droppedFetch()
  register.mockRejectedValueOnce(droppedFetch()).mockRejectedValueOnce(lastFailure)
  await registerServiceWorker()
  expect(register).toHaveBeenCalledTimes(2)
  expect(consoleError).toHaveBeenCalledTimes(1)
  expect(consoleError).toHaveBeenCalledWith(lastFailure)
})
