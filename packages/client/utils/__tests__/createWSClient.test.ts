import type Atmosphere from '../../Atmosphere'
import {reportClientWarning} from '../reportClientError'

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
const loggedToConsole = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers()
  mockSockets.length = 0
  console.error = loggedToConsole
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
    value: {
      visibilityState: 'visible',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    },
    configurable: true
  })
})
afterEach(() => {
  console.error = consoleError
  jest.useRealTimers()
})

test('a socket that closes before it ever connects stays disconnected without logging a console error', async () => {
  const {createWSClient} = await import('../createWSClient')
  const atmosphere = {authObj: null} as unknown as Atmosphere
  createWSClient(atmosphere)
  clientOptions.on.closed({code: 1006, reason: ''})
  expect(atmosphere.isSocketConnected).toBe(false)
  expect(loggedToConsole).not.toHaveBeenCalled()
})

test('a socket that drops after the session signs out stops retrying without reporting it', async () => {
  const {createWSClient} = await import('../createWSClient')
  const atmosphere = {authObj: {sub: 'user1'}} as unknown as Atmosphere
  createWSClient(atmosphere)
  atmosphere.authObj = null
  mockSockets.at(-1)!.dropConnection()
  await jest.advanceTimersByTimeAsync(60_000)
  expect(mockSockets).toHaveLength(1)
  expect(loggedToConsole).not.toHaveBeenCalled()
  expect(reportClientWarning).not.toHaveBeenCalled()
})

test.each([
  {code: 4406, reason: 'Subprotocol not acceptable'},
  {code: 4400, reason: 'Bad request'}
])(
  'a signed in socket that closes for good with $code reports why once',
  async ({code, reason}) => {
    const {createWSClient} = await import('../createWSClient')
    const atmosphere = {authObj: {sub: 'user1'}} as unknown as Atmosphere
    createWSClient(atmosphere)
    mockSockets.at(-1)!.onclose?.({code, reason, wasClean: true})
    await jest.advanceTimersByTimeAsync(0)
    expect(reportClientWarning).toHaveBeenCalledTimes(1)
    expect(reportClientWarning).toHaveBeenCalledWith(
      'WebSocketCloseError',
      `closed ${code} ${reason}`
    )
    expect(loggedToConsole).not.toHaveBeenCalled()
  }
)
