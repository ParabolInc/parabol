const sendBeacon = jest.fn((_url: string, _body: Blob) => true)

// the reporter reads the release and browser globals when it loads, so each test needs a fresh copy
const loadReporter = () => {
  jest.resetModules()
  Object.assign(globalThis, {__APP_VERSION__: '15.11.0'})
  Object.defineProperty(globalThis, 'window', {
    value: {location: {pathname: '/reset-password/secret-token'}},
    configurable: true
  })
  Object.defineProperty(globalThis, 'navigator', {
    value: {userAgent: 'Mozilla/5.0', sendBeacon},
    configurable: true
  })
  return import('../reportClientError')
}

const readSentReports = async () => {
  const batches = await Promise.all(
    sendBeacon.mock.calls.map(async ([, body]) => JSON.parse(await body.text()))
  )
  return batches.flatMap(({reports}) => reports)
}

beforeEach(() => {
  jest.useFakeTimers({doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate']})
  sendBeacon.mockClear().mockReturnValue(true)
})
afterEach(() => {
  jest.useRealTimers()
})

test('reports wait a moment, then go out together in one beacon', async () => {
  const {default: reportClientError} = await loadReporter()
  reportClientError(new TypeError('first'))
  reportClientError(new RangeError('second'))
  expect(sendBeacon).not.toHaveBeenCalled()
  jest.advanceTimersByTime(1000)
  expect(sendBeacon).toHaveBeenCalledTimes(1)
  expect(sendBeacon.mock.calls[0]![0]).toBe('/client-errors')
  const reports = await readSentReports()
  expect(reports).toHaveLength(2)
  expect(reports[0]).toMatchObject({
    level: 'error',
    name: 'TypeError',
    message: 'first',
    release: '15.11.0',
    route: '/reset-password/<token>',
    userAgent: 'Mozilla/5.0',
    count: 1
  })
  expect(reports[1].breadcrumbs).toEqual([
    expect.objectContaining({type: 'error', message: 'TypeError: first'})
  ])
})

test('an error that repeats before its batch goes out is counted, not sent again', async () => {
  const {default: reportClientError, flushClientErrors} = await loadReporter()
  const error = new Error('render loop')
  reportClientError(error)
  reportClientError(error)
  reportClientError(error)
  flushClientErrors()
  const reports = await readSentReports()
  expect(reports).toEqual([expect.objectContaining({message: 'render loop', count: 3})])
})

test('a third report sends the batch at once', async () => {
  const {default: reportClientError} = await loadReporter()
  reportClientError(new Error('one'))
  reportClientError(new Error('two'))
  reportClientError(new Error('three'))
  expect(sendBeacon).toHaveBeenCalledTimes(1)
})

test('a tab sends at most 20 reports a minute', async () => {
  const {default: reportClientError, flushClientErrors} = await loadReporter()
  for (let i = 0; i < 25; i++) reportClientError(new Error(`error ${i}`))
  flushClientErrors()
  expect(await readSentReports()).toHaveLength(20)
})

test('when the browser refuses the beacon, the batch goes by fetch', async () => {
  sendBeacon.mockReturnValue(false)
  const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null))
  const {default: reportClientError, flushClientErrors} = await loadReporter()
  reportClientError(new Error('boom'))
  flushClientErrors()
  expect(fetchSpy).toHaveBeenCalledWith(
    '/client-errors',
    expect.objectContaining({method: 'POST', keepalive: true})
  )
  fetchSpy.mockRestore()
})

test('a masked GraphQL error becomes a warning carrying its operation’s trace id', async () => {
  const {reportUnexpectedGraphQLErrors, flushClientErrors} = await loadReporter()
  reportUnexpectedGraphQLErrors([{message: 'Not authorized'}], 'TeamQuery', 'trace-a')
  reportUnexpectedGraphQLErrors(
    [{message: 'Unexpected error.'}],
    'TeamQuery',
    '4bf92f3577b34da6a3ce929d0e0e4736'
  )
  flushClientErrors()
  const reports = await readSentReports()
  expect(reports).toEqual([
    expect.objectContaining({
      level: 'warn',
      name: 'UnexpectedGraphQLError',
      message: 'TeamQuery failed on the server',
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736'
    })
  ])
  expect(reports[0]).not.toHaveProperty('stack')
})
