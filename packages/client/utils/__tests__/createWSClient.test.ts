import type Atmosphere from '../../Atmosphere'

type ClientOptions = {on: {closed: (event: unknown) => void}}

let clientOptions: ClientOptions

jest.mock('graphql-ws', () => ({
  CloseCode: {},
  createClient: (options: ClientOptions) => {
    clientOptions = options
    return {}
  }
}))
jest.mock('relay-runtime', () => ({commitLocalUpdate: jest.fn()}))

const consoleError = console.error
const loggedToConsole = jest.fn()

beforeEach(() => {
  loggedToConsole.mockClear()
  console.error = loggedToConsole
  Object.assign(globalThis, {__APP_VERSION__: '15.16.0'})
  Object.defineProperty(globalThis, 'window', {
    value: {
      location: {protocol: 'https:', host: 'example.test'},
      setTimeout,
      clearTimeout,
      addEventListener: jest.fn()
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
})

test('a socket that closes before it ever connects stays disconnected without logging a console error', async () => {
  const {createWSClient} = await import('../createWSClient')
  const atmosphere = {authObj: null} as unknown as Atmosphere
  createWSClient(atmosphere)
  clientOptions.on.closed({code: 1006, reason: ''})
  expect(atmosphere.isSocketConnected).toBe(false)
  expect(loggedToConsole).not.toHaveBeenCalled()
})
