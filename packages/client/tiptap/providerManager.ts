import {HocuspocusProvider, HocuspocusProviderWebsocket} from '@hocuspocus/provider'
import {IndexeddbPersistence} from 'y-indexeddb'
import * as Y from 'yjs'
import type Atmosphere from '../Atmosphere'

class ProviderManager {
  authToken: string | null = null
  socket: HocuspocusProviderWebsocket | undefined = undefined
  providers: Record<string, {count: number; provider: HocuspocusProvider}> = {}
  atmosphere?: Atmosphere
  setAuthToken(authToken: string, atmosphere: Atmosphere) {
    this.atmosphere = atmosphere
    this.authToken = authToken
  }
  getSocket() {
    if (!this.socket) {
      const wsProtocol = window.location.protocol.replace('http', 'ws')
      const host = `${window.location.host}/hocuspocus`
      const baseUrl = `${wsProtocol}//${host}?token=${this.authToken || ''}`
      this.socket = new HocuspocusProviderWebsocket({
        url: baseUrl
      })
    }
    return this.socket
  }
  use(pageId: string) {
    const existing = this.providers[pageId]
    if (existing) {
      existing.count++
      return existing.provider
    }
    return null
  }
  register(pageId: string) {
    const existing = this.use(pageId)
    if (existing) return existing
    const doc = new Y.Doc()
    // this adds support for offline editing
    new IndexeddbPersistence(pageId, doc)
    // update the URL to match the title
    const provider = new HocuspocusProvider({
      websocketProvider: this.getSocket(),
      name: pageId,
      document: doc,
      onAuthenticationFailed: ({reason}) => {
        if (reason === 'Unauthenticated') {
          this.atmosphere?.invalidateSession(reason)
        }
      }
    })
    provider.attach()
    this.providers[pageId] = {count: 1, provider}
    return provider
  }
  unregister(pageId: string | undefined, delay = 10000) {
    const prevProviderEntry = this.providers[pageId!]
    if (!prevProviderEntry) return
    if (--prevProviderEntry.count === 0) {
      setTimeout(() => {
        this.destroy(pageId!)
      }, delay)
    }
  }

  async withDoc(pageId: string, callbackFn: (document: Y.Doc) => void | Promise<void>) {
    const provider = this.register(pageId)
    const callAndComplete = async () => {
      const {document} = provider
      await callbackFn(document)
      this.unregister(pageId)
    }
    if (provider.synced) {
      callAndComplete()
    } else {
      provider.on('synced', callAndComplete)
    }
  }

  destroy(pageId: string) {
    const prevProviderEntry = this.providers[pageId!]
    if (!prevProviderEntry) return
    if (prevProviderEntry.count === 0) {
      prevProviderEntry.provider.destroy()
      delete this.providers[pageId!]
    }
  }

  close() {
    Object.values(this.providers).forEach((p) => p.provider.destroy())
    this.providers = {}
  }
}

export const providerManager = new ProviderManager()
