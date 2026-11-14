import {HocuspocusProvider, HocuspocusProviderWebsocket} from '@hocuspocus/provider'
import {IndexeddbPersistence} from 'y-indexeddb'
import * as Y from 'yjs'
import Atmosphere from '../Atmosphere'
import getTabSessionId from '../utils/getTabSessionId'

class ProviderManager {
  socket: HocuspocusProviderWebsocket | undefined = undefined
  providers: Record<
    string,
    {
      count: number
      provider: HocuspocusProvider
      persistence?: IndexeddbPersistence
      isNestedOnly: boolean
    }
  > = {}
  authenticationFailures = new Map<string, string>()
  getAuthenticationFailure(documentName: string) {
    return this.authenticationFailures.get(documentName)
  }
  getSocket() {
    if (!this.socket) {
      const wsProtocol = window.location.protocol.replace('http', 'ws')
      const url = `${wsProtocol}//${window.location.host}/yjs?sessionId=${getTabSessionId()}`
      this.socket = new HocuspocusProviderWebsocket({
        url
      })
    }
    return this.socket
  }
  get(documentName: string, options: {nested?: boolean} = {}) {
    const isNested = !!options.nested
    const existing = this.providers[documentName]
    if (existing) {
      if (!isNested) existing.isNestedOnly = false
      return existing.provider
    }
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
        this.authenticationFailures.set(documentName, reason)
        if (reason === 'Unauthorized') {
          const entry = this.providers[documentName]
          if (entry) {
            entry.persistence?.destroy()
            entry.persistence = undefined
          }
          // A denied meeting would retry on every reconnect, and Hocuspocus queues its awareness renewals until the socket resets
          if (documentName.startsWith('meeting:')) provider.detach()
        }
        if (reason === 'InvalidDocument') {
          // The documentName they passed in cannot exist (DBID out of bounds)
          window.indexedDB.deleteDatabase(documentName)
          if (!this.providers[documentName]?.isNestedOnly) window.location.href = '/'
        }
        if (reason === 'Unauthenticated') {
          Atmosphere.current?.invalidateSession(reason)
        }
      }
    })
    provider.attach()
    this.providers[documentName] = {count: 0, provider, isNestedOnly: isNested}
    // a render React throws away never registers, so collect the provider unless something does
    setTimeout(() => {
      this.destroy(documentName)
    }, 10000)
    if (documentName.startsWith('page:')) {
      provider.on('authenticated', ({scope}: {scope: string}) => {
        this.authenticationFailures.delete(documentName)
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
  register(documentName: string, options: {nested?: boolean} = {}) {
    const provider = this.get(documentName, options)
    this.providers[documentName]!.count++
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
    const stopWaiting = () => {
      provider.off('synced', callAndComplete)
      provider.off('authenticationFailed', giveUp)
    }
    // synced fires again after every reconnect
    const callAndComplete = async () => {
      stopWaiting()
      try {
        await callbackFn(provider)
      } finally {
        this.unregister(documentName)
      }
    }
    const giveUp = () => {
      stopWaiting()
      this.unregister(documentName)
    }
    if (provider.synced) {
      callAndComplete()
    } else {
      provider.on('synced', callAndComplete)
      provider.on('authenticationFailed', giveUp)
    }
  }

  destroy(documentName: string) {
    const prevProviderEntry = this.providers[documentName!]
    if (!prevProviderEntry) return
    if (prevProviderEntry.count === 0) {
      prevProviderEntry.provider.destroy()
      delete this.providers[documentName!]
      this.authenticationFailures.delete(documentName)
    }
  }

  close() {
    const entries = Object.values(this.providers)
    this.providers = {}
    this.authenticationFailures.clear()
    entries.forEach((e) => e.provider.destroy())
    return Promise.all(entries.map((e) => e.persistence?.clearData()))
  }
}

export const providerManager = new ProviderManager()
Atmosphere.closeHandlers.add(() => providerManager.close())
