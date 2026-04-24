import type {HocuspocusProvider} from '@hocuspocus/provider'
import {generateJSON, generateText} from '@tiptap/react'
import {useEffect, useMemo, useRef, useState} from 'react'
import {type NavigateFunction, useNavigate} from 'react-router'
import {commitLocalUpdate} from 'relay-runtime'
import type * as Y from 'yjs'
import type Atmosphere from '../Atmosphere'
import {getTitleFromPageText} from '../shared/tiptap/getTitleFromPageText'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {getPageSlug} from '../tiptap/getPageSlug'
import {providerManager} from '../tiptap/providerManager'
import useAtmosphere from './useAtmosphere'

function observeFirstInnerXmlText(
  frag: Y.XmlFragment,
  onChange: (headerBlock: Y.XmlText) => void,
  currentHeaderBlockRef: React.MutableRefObject<Y.XmlElement | null>,
  headerBlockObserverRef: React.MutableRefObject<(() => void) | null>
) {
  const newHeaderBlock = frag.firstChild as Y.XmlElement
  if (newHeaderBlock === currentHeaderBlockRef.current) return

  if (currentHeaderBlockRef.current && headerBlockObserverRef.current) {
    currentHeaderBlockRef.current.unobserveDeep(headerBlockObserverRef.current)
    headerBlockObserverRef.current = null
  }

  if (newHeaderBlock) {
    headerBlockObserverRef.current = () => {
      const newHeaderText = newHeaderBlock.firstChild as Y.XmlText | null
      if (newHeaderText) {
        onChange(newHeaderText)
      }
    }
    headerBlockObserverRef.current()
    newHeaderBlock.observeDeep(headerBlockObserverRef.current)
  }
  currentHeaderBlockRef.current = newHeaderBlock
}

const updateUrlWithSlug = (
  headerBlock: Y.XmlText,
  pageCode: number,
  navigate: NavigateFunction,
  atmosphere: Atmosphere
) => {
  const plaintext = generateText(
    generateJSON(headerBlock.toJSON(), serverTipTapExtensions),
    serverTipTapExtensions
  )
  const {title} = getTitleFromPageText(plaintext)
  commitLocalUpdate(atmosphere, (store) => {
    const title = plaintext.slice(0, 255)
    store.get(`page:${pageCode}`)?.setValue(title, 'title')
  })
  const pageSlug = getPageSlug(pageCode, title)
  const {pathname} = location
  if (pathname.endsWith(pageSlug)) return
  const sluggedPageCodeIdx = pathname.lastIndexOf('-')
  const pageCodeIdx = sluggedPageCodeIdx === -1 ? pathname.lastIndexOf('/') : sluggedPageCodeIdx
  const currentRoutePageCode = Number(pathname.slice(pageCodeIdx + 1))
  if (currentRoutePageCode === pageCode) {
    navigate(`/pages/${pageSlug}`, {replace: true})
  }
}

export const usePageProvider = (pageId: string) => {
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const pageCode = Number(pageId.split(':')[1])
  const prevPageIdRef = useRef<string | undefined>()
  const [syncedProvider, setSyncedProvider] = useState<HocuspocusProvider | null>(null)
  const headerBlockObserverRef = useRef<(() => void) | null>(null)
  const currentHeaderBlockRef = useRef<Y.XmlElement | null>(null)
  // Connect to your Collaboration server
  const provider = useMemo(() => {
    providerManager.unregister(prevPageIdRef.current)
    prevPageIdRef.current = pageId
    const existing = providerManager.use(pageId)
    return existing ?? providerManager.register(pageId)
  }, [pageId])

  // Gate the editor on the provider's actual sync state, not on cache presence:
  // a cached-but-pre-sync provider lets the editor mount on an empty Y.Doc and
  // commit its schema-default content as a local CRDT write, which the server's
  // later state then merges behind rather than replaces.
  useEffect(() => {
    if (provider.synced) {
      setSyncedProvider(provider)
      return
    }
    const handler = () => setSyncedProvider(provider)
    provider.on('synced', handler)
    return () => {
      provider.off('synced', handler)
    }
  }, [provider])

  const isSynced = syncedProvider === provider

  // Register the fragment observer in useEffect so it gets cleaned up properly
  useEffect(() => {
    const frag = provider.document.getXmlFragment('default')
    const onSlugChange = (headerBlock: Y.XmlText) => {
      updateUrlWithSlug(headerBlock, pageCode, navigate, atmosphere)
    }

    // Set up the initial header block observer for already-synced documents
    observeFirstInnerXmlText(frag, onSlugChange, currentHeaderBlockRef, headerBlockObserverRef)

    const fragObserver = (event: Y.YXmlEvent) => {
      if (event.changes.added.size > 0 || event.changes.deleted.size > 0) {
        observeFirstInnerXmlText(frag, onSlugChange, currentHeaderBlockRef, headerBlockObserverRef)
      }
    }
    frag.observe(fragObserver)
    return () => {
      frag.unobserve(fragObserver)
      if (currentHeaderBlockRef.current && headerBlockObserverRef.current) {
        currentHeaderBlockRef.current.unobserveDeep(headerBlockObserverRef.current)
        headerBlockObserverRef.current = null
        currentHeaderBlockRef.current = null
      }
    }
  }, [provider])

  useEffect(() => {
    return () => {
      providerManager.unregister(prevPageIdRef.current)
    }
  }, [])
  return {provider, synced: isSynced}
}
