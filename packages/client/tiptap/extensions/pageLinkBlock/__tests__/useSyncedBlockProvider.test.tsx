import '../../__tests__/installHappyDom'
import type {HocuspocusProvider} from '@hocuspocus/provider'
import type {Editor} from '@tiptap/core'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {
  lookupPageViewerAccess,
  subscribeToPageViewerAccess
} from '../../../../hooks/usePageViewerAccess'
import {providerManager} from '../../../providerManager'
import {SyncedBlockContent} from '../SyncedBlockContent'
import {SyncedBlockState} from '../SyncedBlockState'
import {SYNCED_BLOCK_LOAD_TIMEOUT_MS, useSyncedBlockProvider} from '../useSyncedBlockProvider'

jest.mock('@hocuspocus/provider', () => {
  type Listener = (payload?: unknown) => void
  class HocuspocusProvider {
    synced = false
    awareness = null
    document: unknown
    onAuthenticationFailed: (payload: {reason: string}) => void
    listeners: Record<string, Set<Listener>> = {}
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
  return {HocuspocusProvider, HocuspocusProviderWebsocket}
})
jest.mock('../../../../Atmosphere', () => ({
  __esModule: true,
  default: {closeHandlers: new Set(), current: null}
}))

jest.mock('../../../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({authObj: {sub: 'user'}, eventEmitter: {emit: jest.fn()}})
}))
jest.mock('../../../../mutations/useRequestPageAccessMutation', () => ({
  useRequestPageAccessMutation: () => [jest.fn(), false]
}))
jest.mock('../SyncedBlockEditor', () => ({SyncedBlockEditor: () => null}))
jest.mock('../../../../hooks/usePageViewerAccess', () => ({
  subscribeToPageViewerAccess: jest.fn(),
  lookupPageViewerAccess: jest.fn()
}))

type EmittingProvider = HocuspocusProvider & {
  emit: (eventName: string, payload?: unknown) => void
  failAuthentication: (reason: string) => void
}

const SECRET_TEXT = 'Sev 1'

const Harness = ({pageCode}: {pageCode: number}) => {
  const {status, retry} = useSyncedBlockProvider(pageCode)
  if (status === 'ready') return <p data-status={status}>{SECRET_TEXT}</p>
  return (
    <div data-status={status}>
      <SyncedBlockState status={status} pageCode={pageCode} onRetry={retry} />
    </div>
  )
}

let root: Root
let container: HTMLElement
const providerFor = (pageCode: number) =>
  providerManager.providers[`page:${pageCode}`]!.provider as EmittingProvider
const screenText = () => container.textContent ?? ''
const statusOf = () => container.querySelector('[data-status]')?.getAttribute('data-status')
const getCount = (pageCode: number) => providerManager.providers[`page:${pageCode}`]?.count ?? 0
const advance = (ms: number) =>
  act(() => {
    jest.advanceTimersByTime(ms)
  })

beforeEach(() => {
  jest.useFakeTimers()
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  Object.values(providerManager.providers).forEach((entry) => {
    entry.count = 0
  })
  Object.keys(providerManager.providers).forEach((documentName) => {
    providerManager.destroy(documentName)
  })
  jest.useRealTimers()
})

const render = (pageCode: number) => act(() => root.render(<Harness pageCode={pageCode} />))

test('starts loading and becomes ready when the provider syncs', () => {
  render(1)
  expect(statusOf()).toBe('loading')
  expect(container.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe(
    'Loading synced block'
  )
  expect(screenText()).not.toContain(SECRET_TEXT)
  act(() => providerFor(1).emit('synced'))
  expect(statusOf()).toBe('ready')
  expect(screenText()).toContain(SECRET_TEXT)
})

test('an authentication failure shows the locked panel', () => {
  render(2)
  act(() => providerFor(2).emit('authenticationFailed', {reason: 'Unauthorized'}))
  expect(statusOf()).toBe('locked')
  expect(screenText()).toContain("You don't have access to this synced block.")
  expect(screenText()).not.toContain(SECRET_TEXT)
  expect(container.querySelector('button')!.textContent).toBe('Request access')
})

test('no sync within 15 seconds shows the error with Try again', () => {
  render(3)
  advance(SYNCED_BLOCK_LOAD_TIMEOUT_MS)
  expect(statusOf()).toBe('error')
  expect(screenText()).toContain("This synced block didn't load.")
  expect(screenText()).not.toContain(SECRET_TEXT)
  const button = container.querySelector('button')!
  expect(button.textContent).toBe('Try again')
  act(() => {
    button.click()
  })
  expect(statusOf()).toBe('loading')
  advance(SYNCED_BLOCK_LOAD_TIMEOUT_MS)
  expect(statusOf()).toBe('error')
})

test('retry after the provider was destroyed re-acquires it and can sync', () => {
  render(4)
  advance(SYNCED_BLOCK_LOAD_TIMEOUT_MS)
  providerManager.providers['page:4']!.count = 0
  providerManager.destroy('page:4')
  expect(providerManager.providers['page:4']).toBeUndefined()
  act(() => {
    container.querySelector('button')!.click()
  })
  expect(statusOf()).toBe('loading')
  act(() => providerFor(4).emit('synced'))
  expect(statusOf()).toBe('ready')
})

test('an already synced provider is ready without waiting', () => {
  providerManager.get('page:5').synced = true
  render(5)
  expect(statusOf()).toBe('ready')
})

test('unregisters the provider on unmount', () => {
  render(6)
  expect(getCount(6)).toBe(1)
  act(() => root.unmount())
  expect(getCount(6)).toBe(0)
  root = createRoot(container)
})

test('a block mounting after the page was already denied shows the locked panel at once', () => {
  providerManager.register('page:7')
  act(() => providerFor(7).failAuthentication('Unauthorized'))
  render(7)
  expect(statusOf()).toBe('locked')
  expect(screenText()).toContain("You don't have access to this synced block.")
})

test('a non-Unauthorized failure shows the error at once', () => {
  render(8)
  act(() => providerFor(8).failAuthentication('Forbidden'))
  expect(statusOf()).toBe('error')
  expect(screenText()).toContain("This synced block didn't load.")
})

test('a stored non-Unauthorized failure shows the error at once on mount', () => {
  providerManager.register('page:9')
  act(() => providerFor(9).failAuthentication('Forbidden'))
  render(9)
  expect(statusOf()).toBe('error')
})

test('a successful authentication clears the stored failure', () => {
  providerManager.register('page:10')
  providerFor(10).failAuthentication('Unauthorized')
  expect(providerManager.getAuthenticationFailure('page:10')).toBe('Unauthorized')
  providerFor(10).emit('authenticated', {scope: 'readonly'})
  expect(providerManager.getAuthenticationFailure('page:10')).toBeUndefined()
})

describe('an invalid document', () => {
  let hrefSetter: jest.SpyInstance
  beforeEach(() => {
    hrefSetter = jest.spyOn(window.location, 'href', 'set').mockImplementation(() => {})
    Object.defineProperty(window, 'indexedDB', {
      value: {deleteDatabase: jest.fn()},
      configurable: true
    })
  })
  afterEach(() => {
    hrefSetter.mockRestore()
  })

  test('shows the error in a synced block and stays on the page', () => {
    render(12)
    act(() => providerFor(12).failAuthentication('InvalidDocument'))
    expect(statusOf()).toBe('error')
    expect(hrefSetter).not.toHaveBeenCalled()
  })

  test('still sends the routed page home', () => {
    providerManager.register('page:13')
    providerFor(13).failAuthentication('InvalidDocument')
    expect(hrefSetter).toHaveBeenCalledWith('/')
  })

  test('sends the routed page home when a block opened its document first', () => {
    render(14)
    providerManager.register('page:14')
    act(() => providerFor(14).failAuthentication('InvalidDocument'))
    expect(hrefSetter).toHaveBeenCalledWith('/')
  })
})

test('destroying the provider clears the stored failure', () => {
  providerManager.register('page:11')
  providerFor(11).failAuthentication('Unauthorized')
  providerManager.providers['page:11']!.count = 0
  providerManager.destroy('page:11')
  expect(providerManager.getAuthenticationFailure('page:11')).toBeUndefined()
})

test('a locked block shows its text once it syncs again', () => {
  render(15)
  act(() => providerFor(15).emit('authenticationFailed', {reason: 'Unauthorized'}))
  expect(statusOf()).toBe('locked')
  act(() => providerFor(15).emit('synced'))
  expect(statusOf()).toBe('ready')
  expect(screenText()).toContain(SECRET_TEXT)
})

test('a block that starts ready does not time out', () => {
  providerManager.get('page:16').synced = true
  render(16)
  advance(SYNCED_BLOCK_LOAD_TIMEOUT_MS)
  expect(statusOf()).toBe('ready')
})

test('a block that mounted ready locks when access is revoked', () => {
  providerManager.get('page:17').synced = true
  render(17)
  expect(statusOf()).toBe('ready')
  act(() => providerFor(17).emit('authenticationFailed', {reason: 'Unauthorized'}))
  expect(statusOf()).toBe('locked')
  expect(screenText()).not.toContain(SECRET_TEXT)
})

test('the block hears when its placements change', () => {
  const onPlacementsChange = jest.fn()
  act(() =>
    root.render(
      <SyncedBlockContent
        pageCode={18}
        hostEditor={{} as unknown as Editor}
        getPos={() => 0}
        getSize={() => 0}
        onChromeChange={() => {}}
        onStatusChange={() => {}}
        onPlacementsChange={onPlacementsChange}
      />
    )
  )
  const stateless = (payload: string) => act(() => providerFor(18).emit('stateless', {payload}))
  stateless('not json')
  stateless(JSON.stringify({type: 'assetNotHosted', src: 'https://example.com/a.png'}))
  expect(onPlacementsChange).not.toHaveBeenCalled()
  stateless(JSON.stringify({type: 'syncedBlockPlacementsChanged'}))
  expect(onPlacementsChange).toHaveBeenCalledTimes(1)
})

describe('watching access while locked', () => {
  let onChange: (() => void) | undefined
  let access: string | null | undefined
  let reauthenticate: jest.SpyInstance
  beforeEach(() => {
    onChange = undefined
    access = null
    jest.mocked(subscribeToPageViewerAccess).mockReset()
    jest.mocked(subscribeToPageViewerAccess).mockImplementation((_environment, _pageCode, cb) => {
      onChange = cb
      return () => {}
    })
    jest.mocked(lookupPageViewerAccess).mockImplementation(() => access as never)
    reauthenticate = jest.spyOn(providerManager, 'reauthenticate').mockImplementation(() => {})
  })
  afterEach(() => reauthenticate.mockRestore())

  test('re-authenticates once when the viewer gains access', () => {
    render(11)
    act(() => providerFor(11).emit('authenticationFailed', {reason: 'Unauthorized'}))
    expect(statusOf()).toBe('locked')
    act(() => onChange!())
    expect(reauthenticate).not.toHaveBeenCalled()
    access = 'viewer'
    act(() => onChange!())
    act(() => onChange!())
    expect(reauthenticate).toHaveBeenCalledTimes(1)
    expect(reauthenticate).toHaveBeenCalledWith('page:11')
  })

  test('a block that loads never watches access', () => {
    render(18)
    act(() => providerFor(18).emit('synced'))
    expect(statusOf()).toBe('ready')
    expect(subscribeToPageViewerAccess).not.toHaveBeenCalled()
  })
})
