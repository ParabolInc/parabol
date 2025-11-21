import {HocuspocusProvider, HocuspocusProviderWebsocket} from '@hocuspocus/provider'
import {IndexeddbPersistence} from 'y-indexeddb'
import * as Y from 'yjs'
import type Atmosphere from '../Atmosphere'

class ProviderManager {
  socket: HocuspocusProviderWebsocket | undefined = undefined
  providers: Record<string, {count: number; provider: HocuspocusProvider}> = {}
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
      onAuthenticationFailed: ({reason}) => {
        if (reason === 'Unauthenticated') {
          this.atmosphere?.invalidateSession(reason)
        }
      }
    })
    provider.attach()
    this.providers[documentName] = {count: 1, provider}
    if (documentName.startsWith('page:')) {
      // this adds support for offline editing
      new IndexeddbPersistence(documentName, doc)
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

  async withDoc(documentName: string, callbackFn: (document: Y.Doc) => void | Promise<void>) {
    const provider = this.register(documentName)
    const callAndComplete = async () => {
      const {document} = provider
      await callbackFn(document)
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
    Object.values(this.providers).forEach((p) => p.provider.destroy())
    this.providers = {}
  }
}

export const providerManager = new ProviderManager()
