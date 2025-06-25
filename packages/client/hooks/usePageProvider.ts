import {TiptapCollabProvider, TiptapCollabProviderWebsocket} from '@hocuspocus/provider'
import {generateJSON, generateText} from '@tiptap/react'
import type {History} from 'history'
import {useEffect, useMemo, useRef, useState} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import * as Y from 'yjs'
import type Atmosphere from '../Atmosphere'
import {getTitleFromPageText} from '../shared/tiptap/getTitleFromPageText'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {getPageSlug} from '../tiptap/getPageSlug'
import type {FirstParam} from '../types/generics'
import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'

let currentSlug: string | undefined = undefined
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
  if (pageSlug === currentSlug) return
  currentSlug = pageSlug
  history.replace(`/pages/${pageSlug}`)
  commitLocalUpdate(atmosphere, (store) => {
    const title = plaintext.slice(0, 255)
    store.get(`page:${pageCode}`)?.setValue(title, 'title')
  })
}
let socket: TiptapCollabProviderWebsocket
const makeHocusPocusSocket = (authToken: string | null) => {
  if (!socket) {
    const wsProtocol = window.location.protocol.replace('http', 'ws')
    const host = __PRODUCTION__
      ? `${window.location.host}/hocuspocus`
      : `${window.location.hostname}:${__HOCUS_POCUS_PORT__}`
    const baseUrl = `${wsProtocol}//${host}?token=${authToken}`
    socket = new TiptapCollabProviderWebsocket({
      baseUrl
    })
  }
  return socket
}

export const usePageProvider = (pageId: string) => {
  const atmosphere = useAtmosphere()
  const [isLoaded, setIsLoaded] = useState(false)
  const {history} = useRouter<{meetingId: string}>()
  const pageCode = Number(pageId.split(':')[1])
  const providerRef = useRef<TiptapCollabProvider>()
  // Connect to your Collaboration server
  providerRef.current = useMemo(() => {
    if (!pageId) return undefined
    if (providerRef.current) {
      providerRef.current.destroy()
      setIsLoaded(false)
    }
    const doc = new Y.Doc()
    const frag = doc.getXmlFragment('default')
    // update the URL to match the title
    const nextProvider = new TiptapCollabProvider({
      websocketProvider: makeHocusPocusSocket(atmosphere.authToken),
      name: pageId,
      document: doc
    })

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
  }, [pageId, atmosphere.authToken])

  useEffect(() => {
    return () => {
      providerRef.current?.destroy()
    }
  }, [])
  return {provider: providerRef.current!, isLoaded}
}
