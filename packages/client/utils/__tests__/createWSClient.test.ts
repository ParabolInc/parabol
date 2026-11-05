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
    value: {location: {protocol: 'https:', host: 'example.test'}},
    configurable: true
  })
})
afterEach(() => {
  console.error = consoleError
})

test('a socket that closes before it ever connects rejects without logging a console error', async () => {
  const {createWSClient} = await import('../createWSClient')
  const atmosphere = {authObj: null} as unknown as Atmosphere
  const connecting = createWSClient(atmosphere)
  const closeEvent = {code: 1006, reason: ''}
  clientOptions.on.closed(closeEvent)
  await expect(connecting).rejects.toBe(closeEvent)
  expect(loggedToConsole).not.toHaveBeenCalled()
})
