import {TiptapCollabProvider, TiptapCollabProviderWebsocket} from '@hocuspocus/provider'
import * as Y from 'yjs'

class ProviderManager {
  socket: TiptapCollabProviderWebsocket | undefined = undefined
  providers: Record<string, {count: number; provider: TiptapCollabProvider}> = {}
  getSocket(authToken: string) {
    if (!this.socket) {
      const wsProtocol = window.location.protocol.replace('http', 'ws')
      const host = __PRODUCTION__
        ? `${window.location.host}/hocuspocus`
        : `${window.location.hostname}:${__HOCUS_POCUS_PORT__}`
      const baseUrl = `${wsProtocol}//${host}?token=${authToken}`
      this.socket = new TiptapCollabProviderWebsocket({
        baseUrl
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
  register(pageId: string, authToken: string) {
    const doc = new Y.Doc()
    // update the URL to match the title
    const provider = new TiptapCollabProvider({
      websocketProvider: this.getSocket(authToken),
      name: pageId,
      document: doc
    })
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

  destroy(pageId: string) {
    const prevProviderEntry = this.providers[pageId!]
    if (!prevProviderEntry) return
    if (prevProviderEntry.count === 0) {
      prevProviderEntry.provider.destroy()
      delete this.providers[pageId!]
    }
  }
}

export const providerManager = new ProviderManager()
