import {HocuspocusProvider, HocuspocusProviderWebsocket} from '@hocuspocus/provider'
import {IndexeddbPersistence} from 'y-indexeddb'
import * as Y from 'yjs'
import type Atmosphere from '../Atmosphere'

class ProviderManager {
  socket: HocuspocusProviderWebsocket | undefined = undefined
  providers: Record<
    string,
    {count: number; provider: HocuspocusProvider; persistence?: IndexeddbPersistence}
  > = {}
  atmosphere?: Atmosphere
  setAtmosphere(atmosphere: Atmosphere) {
    this.atmosphere = atmosphere
  }
  getSocket() {
    if (!this.socket) {
      const wsProtocol = window.location.protocol.replace('http', 'ws')
      const url = `${wsProtocol}//${window.location.host}/yjs`
      this.socket = new HocuspocusProviderWebsocket({
        url
      })
    }
    return this.socket
  }
  use(documentName: string) {
    const existing = this.providers[documentName]
    if (existing) {
      existing.count++
      return existing.provider
    }
    return null
  }
  register(documentName: string) {
    const existing = this.use(documentName)
    if (existing) return existing
    const doc = new Y.Doc()
    // update the URL to match the title
    const provider = new HocuspocusProvider({
      websocketProvider: this.getSocket(),
      name: documentName,
      document: doc,
      // can remove after debugging server websocket auth on hocuspocus
      token: window.document.cookie,
      onAuthenticationFailed: ({reason}) => {
        console.log('fail', reason)
        if (reason === 'Unauthorized') {
          window.indexedDB.deleteDatabase(documentName)
        }
        if (reason === 'InvalidDocument') {
          // The documentName they passed in cannot exist (DBID out of bounds)
          window.indexedDB.deleteDatabase(documentName)
          window.location.href = '/'
        }
        if (reason === 'Unauthenticated') {
          this.atmosphere?.invalidateSession(reason)
        }
      }
    })
    provider.attach()
    this.providers[documentName] = {count: 1, provider}
    if (documentName.startsWith('page:')) {
      provider.on('authenticated', ({scope}: {scope: string}) => {
        const entry = this.providers[documentName]
        if (!entry) return
        if (scope === 'readonly') {
          entry.persistence?.destroy()
          entry.persistence = undefined
        } else if (!entry.persistence) {
          entry.persistence = new IndexeddbPersistence(documentName, doc)
        }
      })
    }
    return provider
  }
  unregister(documentName: string | undefined, delay = 10000) {
    const prevProviderEntry = this.providers[documentName!]
    if (!prevProviderEntry) return
    if (--prevProviderEntry.count === 0) {
      setTimeout(() => {
        this.destroy(documentName!)
      }, delay)
    }
  }

  async withDoc(
    documentName: string,
    callbackFn: (provider: HocuspocusProvider) => void | Promise<void>
  ) {
    const provider = this.register(documentName)
    const callAndComplete = async () => {
      await callbackFn(provider)
      this.unregister(documentName)
    }
    if (provider.synced) {
      callAndComplete()
    } else {
      provider.on('synced', callAndComplete)
    }
  }

  destroy(documentName: string) {
    const prevProviderEntry = this.providers[documentName!]
    if (!prevProviderEntry) return
    if (prevProviderEntry.count === 0) {
      prevProviderEntry.provider.destroy()
      delete this.providers[documentName!]
    }
  }

  close() {
    const entries = Object.values(this.providers)
    this.providers = {}
    entries.forEach((e) => e.provider.destroy())
    // fire-and-forget: clearData is best-effort before the page redirects
    void Promise.all(entries.map((e) => e.persistence?.clearData())).then(() => {
      void indexedDB.databases().then((dbs) => {
        dbs.forEach(({name}) => {
          if (name?.startsWith('page:')) indexedDB.deleteDatabase(name)
        })
      })
    })
  }
}

export const providerManager = new ProviderManager()
