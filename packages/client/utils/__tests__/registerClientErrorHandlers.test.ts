const sentBeacon = jest.fn((_url: string, _body: Blob) => true)
const consoleError = console.error
const loggedToConsole = jest.fn()

// the handlers and the reporter read browser globals when they load, so each test needs fresh copies
const loadHandlers = async () => {
  jest.resetModules()
  Object.assign(globalThis, {__APP_VERSION__: '15.16.0', __PRODUCTION__: true})
  Object.defineProperty(globalThis, 'window', {
    value: {location: {pathname: '/meetings'}, addEventListener: jest.fn()},
    configurable: true
  })
  Object.defineProperty(globalThis, 'document', {
    value: {addEventListener: jest.fn()},
    configurable: true
  })
  Object.defineProperty(globalThis, 'navigator', {
    value: {userAgent: 'Mozilla/5.0', sendBeacon: sentBeacon},
    configurable: true
  })
  console.error = loggedToConsole
  const {default: registerClientErrorHandlers} = await import('../registerClientErrorHandlers')
  const reporter = await import('../reportClientError')
  registerClientErrorHandlers()
  return reporter
}

const readBeaconReports = async () => {
  const batches = await Promise.all(
    sentBeacon.mock.calls.map(async ([, body]) => JSON.parse(await body.text()))
  )
  return batches.flatMap(({reports}) => reports)
}

beforeEach(() => {
  sentBeacon.mockClear()
  loggedToConsole.mockClear()
})
afterEach(() => {
  console.error = consoleError
})

test('a console error is still printed and is reported too', async () => {
  const {flushClientErrors} = await loadHandlers()
  console.error('No base meeting object found in Relay')
  await Promise.resolve()
  flushClientErrors()
  expect(loggedToConsole).toHaveBeenCalledWith('No base meeting object found in Relay')
  expect(await readBeaconReports()).toEqual([
    expect.objectContaining({
      level: 'error',
      name: 'ConsoleError',
      message: 'No base meeting object found in Relay'
    })
  ])
})

test('a console error logged with an error keeps its name and stack and joins the messages', async () => {
  const {flushClientErrors} = await loadHandlers()
  const cause = new TypeError('Unexpected token')
  console.error('Failed to import records', cause)
  await Promise.resolve()
  flushClientErrors()
  expect(await readBeaconReports()).toEqual([
    expect.objectContaining({
      name: 'TypeError',
      message: 'Failed to import records Unexpected token',
      stack: cause.stack
    })
  ])
})

test('an error a boundary reports right after React logs it is sent once, with what the boundary adds', async () => {
  const {default: reportClientError, flushClientErrors} = await loadHandlers()
  const error = new Error('Cannot read properties of undefined')
  console.error(error)
  reportClientError(error, {eventId: 'event-1'})
  await Promise.resolve()
  flushClientErrors()
  expect(await readBeaconReports()).toEqual([
    expect.objectContaining({eventId: 'event-1', count: 1})
  ])
})

test('a failed service worker update is not reported', async () => {
  const {flushClientErrors} = await loadHandlers()
  console.error(
    'Error updating service worker:',
    new TypeError("Failed to update a ServiceWorker for scope ('https://action.parabol.co/')")
  )
  await Promise.resolve()
  flushClientErrors()
  expect(sentBeacon).not.toHaveBeenCalled()
})
