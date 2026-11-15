import {Window} from 'happy-dom'
import {Suspense} from 'react'
import {createRoot} from 'react-dom/client'
import {MemoryRouter, useLocation} from 'react-router'
import * as Y from 'yjs'
import {providerManager} from '../../tiptap/providerManager'
import {usePageProvider} from '../usePageProvider'

jest.mock('@hocuspocus/provider', () => {
  type Listener = (payload?: unknown) => void
  class HocuspocusProvider {
    synced = false
    awareness = null
    document: unknown
    listeners: Record<string, Set<Listener>> = {}
    constructor({document}: {document: unknown}) {
      this.document = document
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
jest.mock('../../Atmosphere', () => ({
  __esModule: true,
  default: {closeHandlers: new Set(), current: null}
}))
jest.mock('../useAtmosphere', () => ({
  __esModule: true,
  default: () => ({commitUpdate: jest.fn()})
}))

const happyWindow = new Window({url: 'https://parabol.test/'})
const tick = () => new Promise((resolve) => setTimeout(resolve, 10))
const waitUntil = async (isDone: () => boolean, timeoutMs = 1000) => {
  const deadline = Date.now() + timeoutMs
  while (!isDone() && Date.now() < deadline) await tick()
}
const getCount = (documentName: string) => providerManager.providers[documentName]?.count ?? 0
const emitProviderEvent = (documentName: string, eventName: string, payload?: unknown) => {
  const {provider} = providerManager.providers[documentName]!
  ;(provider as unknown as {emit: (eventName: string, payload?: unknown) => void}).emit(
    eventName,
    payload
  )
}

beforeAll(() => {
  Object.assign(globalThis, {window: happyWindow, document: happyWindow.document})
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

afterEach(() => {
  Object.values(providerManager.providers).forEach((entry) => {
    entry.count = 0
  })
  Object.keys(providerManager.providers).forEach((documentName) => {
    providerManager.destroy(documentName)
  })
})

test('a page whose first render is thrown away by a suspending sibling releases its provider on unmount', async () => {
  let resolveSiblingData = () => {}
  let isSiblingDataReady = false
  const siblingData = new Promise<void>((resolve) => {
    resolveSiblingData = () => {
      isSiblingDataReady = true
      resolve()
    }
  })
  const SuspendingSibling = () => {
    if (!isSiblingDataReady) throw siblingData
    return null
  }
  const PageProviderUser = () => {
    usePageProvider('page:1')
    return <main>Page</main>
  }
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    <MemoryRouter>
      <Suspense fallback={null}>
        <PageProviderUser />
        <SuspendingSibling />
      </Suspense>
    </MemoryRouter>
  )
  await tick()
  resolveSiblingData()
  await waitUntil(() => container.textContent === 'Page' && getCount('page:1') > 0)
  expect(getCount('page:1')).toBe(1)
  root.unmount()
  expect(getCount('page:1')).toBe(0)
})

test('withDoc runs once and releases its provider even when the doc syncs again after a reconnect', async () => {
  const callback = jest.fn()
  providerManager.withDoc('page:2', callback)
  emitProviderEvent('page:2', 'synced')
  await tick()
  emitProviderEvent('page:2', 'synced')
  await tick()
  expect(callback).toHaveBeenCalledTimes(1)
  expect(getCount('page:2')).toBe(0)
})

test('withDoc releases its provider when the doc is denied', async () => {
  const callback = jest.fn()
  providerManager.withDoc('page:3', callback)
  emitProviderEvent('page:3', 'authenticationFailed', {reason: 'Unauthorized'})
  await tick()
  expect(callback).not.toHaveBeenCalled()
  expect(getCount('page:3')).toBe(0)
})

const rewriteSlugFrom = async (url: string) => {
  happyWindow.happyDOM.setURL(`https://parabol.test${url}`)
  Object.assign(globalThis, {location: happyWindow.location})
  let routerLocation = {pathname: '', search: '', hash: ''}
  const LocationProbe = () => {
    routerLocation = useLocation()
    return null
  }
  const PageProviderUser = () => {
    usePageProvider('page:7')
    return null
  }
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    <MemoryRouter initialEntries={[url]}>
      <LocationProbe />
      <PageProviderUser />
    </MemoryRouter>
  )
  await waitUntil(() => !!providerManager.providers['page:7'])
  const {provider} = providerManager.providers['page:7']!
  const heading = new Y.XmlElement('heading')
  const headingText = new Y.XmlText()
  heading.insert(0, [headingText])
  provider.document.getXmlFragment('default').insert(0, [heading])
  headingText.insert(0, 'Roadmap')
  await waitUntil(() => routerLocation.pathname !== '/pages/7')
  root.unmount()
  return routerLocation
}

test('the slug rewrite keeps ?share and the hash', async () => {
  const result = await rewriteSlugFrom('/pages/7?share#top')
  expect(result.pathname).toBe('/pages/roadmap-7')
  expect(result.search).toBe('?share')
  expect(result.hash).toBe('#top')
})

test('the slug rewrite drops ?export but keeps ?share', async () => {
  const result = await rewriteSlugFrom('/pages/7?export=confluence&share')
  expect(result.pathname).toBe('/pages/roadmap-7')
  expect(result.search).toBe('?share')
})

test('the slug rewrite leaves an empty search when only ?export was present', async () => {
  const result = await rewriteSlugFrom('/pages/7?export=confluence')
  expect(result.pathname).toBe('/pages/roadmap-7')
  expect(result.search).toBe('')
})
