import {generateJSON, generateText} from '@tiptap/react'
import type {History} from 'history'
import {useEffect, useMemo, useRef, useState} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import * as Y from 'yjs'
import type Atmosphere from '../Atmosphere'
import {getTitleFromPageText} from '../shared/tiptap/getTitleFromPageText'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {getPageSlug} from '../tiptap/getPageSlug'
import {providerManager} from '../tiptap/providerManager'
import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'

let headerBlockObserver: null | (() => void) = null
let currentHeaderBlock: Y.XmlElement | null = null

function observeFirstInnerXmlText(frag: Y.XmlFragment, onChange: (headerBlock: Y.XmlText) => void) {
  const newHeaderBlock = frag.firstChild as Y.XmlElement
  if (newHeaderBlock === currentHeaderBlock) return

  if (currentHeaderBlock && headerBlockObserver) {
    currentHeaderBlock.unobserveDeep(headerBlockObserver)
    headerBlockObserver = null
  }

  if (newHeaderBlock) {
    headerBlockObserver = () => {
      const newHeaderText = newHeaderBlock.firstChild as Y.XmlText | null
      if (newHeaderText) {
        onChange(newHeaderText)
      }
    }
    headerBlockObserver()
    newHeaderBlock.observeDeep(headerBlockObserver)
  }
  currentHeaderBlock = newHeaderBlock
}

const updateUrlWithSlug = (
  headerBlock: Y.XmlText,
  pageCode: number,
  history: History,
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
    history.replace(`/pages/${pageSlug}`)
  }
}

export const usePageProvider = (pageId: string) => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter<{meetingId: string}>()
  const pageCode = Number(pageId.split(':')[1])
  const prevPageIdRef = useRef<string | undefined>()
  const [isSynced, setIsSynced] = useState(false)
  // Connect to your Collaboration server
  const provider = useMemo(() => {
    providerManager.unregister(prevPageIdRef.current)
    setIsSynced(false)
    prevPageIdRef.current = pageId

    // if we've already opened a provider, use that
    const existingProvider = providerManager.use(pageId)
    if (existingProvider) {
      setIsSynced(true)
      return existingProvider
    }

    const nextProvider = providerManager.register(pageId)
    nextProvider.on('synced', () => {
      setIsSynced(true)
    })
    const frag = nextProvider.document.getXmlFragment('default')
    frag.observe((event) => {
      if (event.changes.added.size > 0 || event.changes.deleted.size > 0) {
        observeFirstInnerXmlText(frag, (headerBlock) => {
          updateUrlWithSlug(headerBlock, pageCode, history, atmosphere)
        })
      }
    })
    return nextProvider
  }, [pageId])

  useEffect(() => {
    return () => {
      providerManager.unregister(prevPageIdRef.current)
    }
  }, [])
  return {provider, synced: isSynced}
}
