import type Atmosphere from '../../Atmosphere'

type ClientOptions = {on: {closed: (event: unknown) => void}}

let clientOptions: ClientOptions
const mockSockets: MockWebSocket[] = []

class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  readyState = MockWebSocket.CONNECTING
  onopen: (() => void) | null = null
  onmessage: ((event: {data: string}) => void) | null = null
  onerror: ((event: unknown) => void) | null = null
  onclose: ((event: unknown) => void) | null = null
  constructor() {
    mockSockets.push(this)
  }
  send() {}
  close() {}
  dropConnection() {
    this.readyState = MockWebSocket.CLOSED
    this.onerror?.({isTrusted: true})
    this.onclose?.({code: 1006, reason: '', wasClean: false})
  }
}

jest.mock('graphql-ws', () => {
  const graphqlWs = jest.requireActual('graphql-ws')
  return {
    ...graphqlWs,
    createClient: (options: ClientOptions) => {
      clientOptions = options
      return graphqlWs.createClient({...options, webSocketImpl: MockWebSocket})
    }
  }
})
jest.mock('relay-runtime', () => ({commitLocalUpdate: jest.fn()}))
jest.mock('../reportClientError', () => ({reportClientWarning: jest.fn()}))

const consoleError = console.error
const consoleWarn = console.warn
const loggedToConsole = jest.fn()

const waitForSocket = async () => {
  await new Promise((resolve) => setTimeout(resolve))
  return mockSockets.at(-1)!
}

beforeEach(() => {
  loggedToConsole.mockClear()
  mockSockets.length = 0
  console.error = loggedToConsole
  console.warn = jest.fn()
  Object.assign(globalThis, {__APP_VERSION__: '15.16.0'})
  Object.defineProperty(globalThis, 'window', {
    value: {
      location: {protocol: 'https:', host: 'example.test'},
      setTimeout,
      clearTimeout,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    },
    configurable: true
  })
  Object.defineProperty(globalThis, 'document', {
    value: {visibilityState: 'visible', addEventListener: jest.fn()},
    configurable: true
  })
})
afterEach(() => {
  console.error = consoleError
  console.warn = consoleWarn
})

test('a socket that closes before it ever connects stays disconnected without logging a console error', async () => {
  const {createWSClient} = await import('../createWSClient')
  const atmosphere = {authObj: null} as unknown as Atmosphere
  createWSClient(atmosphere)
  clientOptions.on.closed({code: 1006, reason: ''})
  expect(atmosphere.isSocketConnected).toBe(false)
  expect(loggedToConsole).not.toHaveBeenCalled()
})

test('a socket that drops after the session signs out stops retrying without logging a console error', async () => {
  const {createWSClient} = await import('../createWSClient')
  const atmosphere = {authObj: {sub: 'user1'}} as unknown as Atmosphere
  createWSClient(atmosphere)
  const socket = await waitForSocket()
  atmosphere.authObj = null
  socket.dropConnection()
  await waitForSocket()
  expect(mockSockets).toHaveLength(1)
  expect(loggedToConsole).not.toHaveBeenCalled()
})

test('a signed in socket that closes for good reports why', async () => {
  const {createWSClient} = await import('../createWSClient')
  const {reportClientWarning} = await import('../reportClientError')
  const atmosphere = {authObj: {sub: 'user1'}} as unknown as Atmosphere
  createWSClient(atmosphere)
  const socket = await waitForSocket()
  socket.onclose?.({code: 4406, reason: 'Subprotocol not acceptable', wasClean: true})
  await waitForSocket()
  expect(reportClientWarning).toHaveBeenCalledWith(
    'WebSocketCloseError',
    'closed 4406 Subprotocol not acceptable'
  )
  expect(loggedToConsole).not.toHaveBeenCalled()
})
