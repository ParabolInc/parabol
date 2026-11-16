import '../extensions/__tests__/installHappyDom'
import {providerManager} from '../providerManager'

jest.mock('@hocuspocus/provider', () => {
  type Listener = (payload?: unknown) => void
  const WebSocketStatus = {Connected: 'connected', Disconnected: 'disconnected'}
  class HocuspocusProvider {
    synced = false
    awareness = null
    document: unknown
    onAuthenticationFailed: (payload: {reason: string}) => void
    listeners: Record<string, Set<Listener>> = {}
    configuration = {websocketProvider: {status: 'connected'}}
    sendToken = jest.fn(async () => {})
    startSync = jest.fn()
    detach = jest.fn()
    constructor({
      document,
      onAuthenticationFailed
    }: {
      document: unknown
      onAuthenticationFailed: (payload: {reason: string}) => void
    }) {
      this.document = document
      this.onAuthenticationFailed = onAuthenticationFailed
    }
    failAuthentication(reason: string) {
      this.onAuthenticationFailed({reason})
      this.emit('authenticationFailed', {reason})
    }
    on(eventName: string, listener: Listener) {
      this.listeners[eventName] ??= new Set()
      this.listeners[eventName].add(listener)
    }
    off(eventName: string, listener: Listener) {
      this.listeners[eventName]?.delete(listener)
    }
    emit(eventName: string, payload?: unknown) {
      this.listeners[eventName]?.forEach((listener) => listener(payload))
    }
    attach() {}
    destroy() {
      this.listeners = {}
    }
  }
  class HocuspocusProviderWebsocket {}
  return {HocuspocusProvider, HocuspocusProviderWebsocket, WebSocketStatus}
})
jest.mock('../../Atmosphere', () => ({
  __esModule: true,
  default: {closeHandlers: new Set(), current: null}
}))

type FakeProvider = {
  emit: (eventName: string, payload?: unknown) => void
  failAuthentication: (reason: string) => void
  sendToken: jest.Mock
  startSync: jest.Mock
  detach: jest.Mock
  configuration: {websocketProvider: {status: string}}
}

const flushPromises = () => new Promise((resolve) => setImmediate(resolve))
const closeWith = (provider: FakeProvider, reason: string) =>
  provider.emit('close', {event: {code: 1000, reason}})

beforeEach(() => {
  jest.useFakeTimers({doNotFake: ['setImmediate']})
})

afterEach(() => {
  Object.values(providerManager.providers).forEach((entry) => {
    entry.count = 0
  })
  Object.keys(providerManager.providers).forEach((documentName) => {
    providerManager.destroy(documentName)
  })
  jest.useRealTimers()
})

test('signs the document in again when the server closes it for an access change', async () => {
  const provider = providerManager.get('page:7') as unknown as FakeProvider
  closeWith(provider, 'AccessChanged')
  await flushPromises()
  expect(provider.sendToken).toHaveBeenCalledTimes(1)
  expect(provider.startSync).toHaveBeenCalledTimes(1)
  expect(provider.detach).not.toHaveBeenCalled()
})

test('ignores other closes', async () => {
  const provider = providerManager.get('page:7') as unknown as FakeProvider
  closeWith(provider, 'Server closed the connection')
  await flushPromises()
  expect(provider.sendToken).not.toHaveBeenCalled()
  expect(provider.startSync).not.toHaveBeenCalled()
})

test('waits for the socket when it is not connected', async () => {
  const provider = providerManager.get('page:7') as unknown as FakeProvider
  provider.configuration.websocketProvider.status = 'disconnected'
  closeWith(provider, 'AccessChanged')
  await flushPromises()
  expect(provider.sendToken).not.toHaveBeenCalled()
})

test('forgets a stored refusal before signing in again', async () => {
  const provider = providerManager.get('page:7') as unknown as FakeProvider
  provider.failAuthentication('Unauthorized')
  expect(providerManager.getAuthenticationFailure('page:7')).toBe('Unauthorized')
  providerManager.reauthenticate('page:7')
  expect(providerManager.getAuthenticationFailure('page:7')).toBeUndefined()
  await flushPromises()
  expect(provider.sendToken).toHaveBeenCalledTimes(1)
})

test('meetings keep their behavior on an access change', async () => {
  const provider = providerManager.get('meeting:3') as unknown as FakeProvider
  closeWith(provider, 'AccessChanged')
  await flushPromises()
  expect(provider.sendToken).not.toHaveBeenCalled()
})

test('a background write opens the page as nested so a missing page never navigates away', () => {
  providerManager.openSynced('page:7', 1000)
  expect(providerManager.providers['page:7']!.isNestedOnly).toBe(true)
})
