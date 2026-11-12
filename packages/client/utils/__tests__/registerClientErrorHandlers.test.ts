import {runInNewContext} from 'node:vm'

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

test('a failed service worker update is not reported in Chrome', async () => {
  const {flushClientErrors} = await loadHandlers()
  console.error(
    'Error updating service worker:',
    new TypeError("Failed to update a ServiceWorker for scope ('https://action.parabol.co/')")
  )
  await Promise.resolve()
  flushClientErrors()
  expect(sentBeacon).not.toHaveBeenCalled()
})

test('a failed service worker update is not reported in Firefox', async () => {
  const {flushClientErrors} = await loadHandlers()
  console.error(
    'Error updating service worker:',
    new TypeError(
      'ServiceWorker script at https://example.test/sw.js for scope https://example.test/ encountered an error during installation.'
    )
  )
  await Promise.resolve()
  flushClientErrors()
  expect(sentBeacon).not.toHaveBeenCalled()
})

test('a failed service worker registration is still reported', async () => {
  const {flushClientErrors} = await loadHandlers()
  console.error(
    new TypeError(
      'ServiceWorker script at https://example.test/sw.js for scope https://example.test/ encountered an error during installation.'
    )
  )
  await Promise.resolve()
  flushClientErrors()
  expect(sentBeacon).toHaveBeenCalled()
})

const logFrom = (frames: string[], ...args: unknown[]) => {
  const prepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = () => ['Error', ...frames.map((frame) => `    at ${frame}`)].join('\n')
  try {
    console.error(...args)
  } finally {
    Error.prepareStackTrace = prepareStackTrace
  }
}

const OWN_FRAME = 'console.error (https://files.example.test/build/app_0a1b2c.js:4:1200)'

test('a console error an extension logs from its own script is not reported', async () => {
  const {flushClientErrors} = await loadHandlers()
  logFrom(
    [OWN_FRAME, 'chrome-extension://abcdefghijklmnop/build/hook.js:1:500'],
    'Another copy of the extension is enabled.'
  )
  await Promise.resolve()
  flushClientErrors()
  expect(sentBeacon).not.toHaveBeenCalled()
})

test('a console error an extension logs from a script it injects inline is not reported', async () => {
  const {flushClientErrors} = await loadHandlers()
  logFrom([OWN_FRAME, '<anonymous>:1:500'], 'Another copy of the extension is enabled.')
  await Promise.resolve()
  flushClientErrors()
  expect(sentBeacon).not.toHaveBeenCalled()
})

test('a console error the app logs through a console an extension wraps is still reported', async () => {
  const {flushClientErrors} = await loadHandlers()
  logFrom(
    [
      OWN_FRAME,
      'console.error (chrome-extension://abcdefghijklmnop/build/installHook.js:1:900)',
      'commitRoot (https://files.example.test/build/app_0a1b2c.js:2:300)'
    ],
    'No base meeting object found in Relay'
  )
  await Promise.resolve()
  flushClientErrors()
  expect(await readBeaconReports()).toEqual([
    expect.objectContaining({
      name: 'ConsoleError',
      message: 'No base meeting object found in Relay'
    })
  ])
})

// another realm's Error fails instanceof Error, as one from a Safari extension's isolated world does
const makeErrorInAnotherRealm = (message: string, stack: string): Error =>
  runInNewContext('const error = new TypeError(message); error.stack = stack; error', {
    message,
    stack
  })

const rejectUnhandled = (reason: unknown) => {
  const addEventListener = window.addEventListener as jest.Mock
  const [, onUnhandledRejection] = addEventListener.mock.calls.find(
    ([type]) => type === 'unhandledrejection'
  )!
  onUnhandledRejection({reason})
}

test('an unhandled rejection with an error from another realm keeps its name, message and stack', async () => {
  const {flushClientErrors} = await loadHandlers()
  const stack = 'loadTeam@https://example.test/build/app.js:4:1200'
  rejectUnhandled(makeErrorInAnotherRealm('Load failed', stack))
  flushClientErrors()
  expect(await readBeaconReports()).toEqual([
    expect.objectContaining({name: 'TypeError', message: 'Load failed', stack})
  ])
})

test('an unhandled rejection from a Safari extension is not reported', async () => {
  const {flushClientErrors} = await loadHandlers()
  rejectUnhandled(
    makeErrorInAnotherRealm('No listener', 'sendMessage@webkit-masked-url://hidden/:12:3400')
  )
  flushClientErrors()
  expect(sentBeacon).not.toHaveBeenCalled()
})

test('a console error logged with an error from another realm keeps its message', async () => {
  const {flushClientErrors} = await loadHandlers()
  const stack = 'importRecords@https://example.test/build/app.js:4:900'
  console.error('Failed to import records', makeErrorInAnotherRealm('Unexpected token', stack))
  await Promise.resolve()
  flushClientErrors()
  expect(await readBeaconReports()).toEqual([
    expect.objectContaining({
      name: 'TypeError',
      message: 'Failed to import records Unexpected token',
      stack
    })
  ])
})

const dispatchWindowError = (event: {message: string; filename: string; error: Error}) => {
  const addEventListener = window.addEventListener as jest.Mock
  const [, onError] = addEventListener.mock.calls.find(([type]) => type === 'error')!
  onError(event)
}

const makeParseError = (message: string) => {
  const error = new SyntaxError(message)
  error.stack = `SyntaxError: ${message}`
  return error
}

test('a script an extension injects that fails to parse is not reported', async () => {
  const {flushClientErrors} = await loadHandlers()
  const message = "Identifier 'savedAlert' has already been declared"
  dispatchWindowError({
    message: `Uncaught SyntaxError: ${message}`,
    filename: 'chrome-extension://abcdefghijklmnop/assets/override.js',
    error: makeParseError(message)
  })
  flushClientErrors()
  expect(sentBeacon).not.toHaveBeenCalled()
})

test("a script of the app's own that fails to parse is still reported", async () => {
  const {flushClientErrors} = await loadHandlers()
  const message = "Unexpected token '?'"
  dispatchWindowError({
    message: `Uncaught SyntaxError: ${message}`,
    filename: 'https://files.example.test/build/app_0a1b2c.js',
    error: makeParseError(message)
  })
  flushClientErrors()
  expect(await readBeaconReports()).toEqual([
    expect.objectContaining({name: 'SyntaxError', message})
  ])
})
