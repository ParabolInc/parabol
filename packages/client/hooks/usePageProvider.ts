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
import type {FirstParam} from '../types/generics'
import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'

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
  const pageSlug = getPageSlug(pageCode, title)
  const {pathname} = location
  if (pathname.endsWith(pageSlug)) return
  const sluggedPageCodeIdx = pathname.lastIndexOf('-')
  const pageCodeIdx = sluggedPageCodeIdx === -1 ? pathname.lastIndexOf('/') : sluggedPageCodeIdx
  const currentRoutePageCode = Number(pathname.slice(pageCodeIdx + 1))
  if (currentRoutePageCode === pageCode) {
    history.replace(`/pages/${pageSlug}`)
  }
  commitLocalUpdate(atmosphere, (store) => {
    const title = plaintext.slice(0, 255)
    store.get(`page:${pageCode}`)?.setValue(title, 'title')
  })
}

export const usePageProvider = (pageId: string) => {
  const atmosphere = useAtmosphere()
  const [isLoaded, setIsLoaded] = useState(false)
  const {history} = useRouter<{meetingId: string}>()
  const pageCode = Number(pageId.split(':')[1])
  const prevPageIdRef = useRef<string | undefined>()
  // Connect to your Collaboration server
  const provider = useMemo(() => {
    providerManager.unregister(prevPageIdRef.current)
    prevPageIdRef.current = pageId

    // if we've already opened a provider, use that
    const existingProvider = providerManager.use(pageId)
    if (existingProvider) {
      if (!isLoaded) {
        setIsLoaded(true)
      }
      return existingProvider
    }
    setIsLoaded(false)

    const nextProvider = providerManager.register(pageId)
    const frag = nextProvider.document.getXmlFragment('default')

    const observeHeader = (headerBlock: Y.XmlText) => {
      updateUrlWithSlug(headerBlock, pageCode, history, atmosphere)
      headerBlock.observe(() => {
        updateUrlWithSlug(headerBlock, pageCode, history, atmosphere)
      })
    }
    const observeFragForHeader: FirstParam<Y.AbstractType<Y.YXmlEvent>['observeDeep']> = () => {
      const headerElement = frag.get(0) as Y.XmlElement | null
      const headerText = headerElement?.get(0) as Y.XmlText
      if (headerText) {
        observeHeader(headerText)
        frag.unobserveDeep(observeFragForHeader)
      }
    }
    nextProvider.on('synced', () => {
      setIsLoaded(true)
      const headerElement = frag.get(0) as Y.XmlElement | null
      const headerText = headerElement?.get(0) as Y.XmlText
      if (headerText) {
        observeHeader(headerText)
      } else {
        // header doesn't exist yet, observe the whole doc
        frag.observeDeep(observeFragForHeader)
      }
    })
    return nextProvider
  }, [pageId])

  useEffect(() => {
    return () => {
      providerManager.unregister(prevPageIdRef.current)
    }
  }, [])
  return {provider, isLoaded}
}
