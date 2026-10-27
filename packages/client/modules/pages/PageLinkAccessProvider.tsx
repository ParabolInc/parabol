import areEqual from 'fbjs/lib/areEqual'
import {type ReactNode, useEffect, useState} from 'react'
import type * as Y from 'yjs'
import useAtmosphere from '../../hooks/useAtmosphere'
import {getPageLinks} from '../../shared/tiptap/getPageLinks'
import {PageLinkAccessContext} from './PageLinkAccessContext'
import {PageLinkAccessRoot} from './PageLinkAccessRoot'

const MAX_LINKED_PAGES = 500

interface Props {
  document: Y.Doc
  children: ReactNode
}

export const PageLinkAccessProvider = (props: Props) => {
  const {document, children} = props
  const atmosphere = useAtmosphere()
  const [pageIds, setPageIds] = useState<string[]>([])
  const [canOpenByPageCode, setCanOpenByPageCode] = useState<ReadonlyMap<number, boolean>>(
    new Map()
  )

  useEffect(() => {
    const frag = document.getXmlFragment('default')
    const update = () => {
      const pageCodes = new Set(getPageLinks(document).map((link) => link.getAttribute('pageCode')))
      const nextPageIds = [...pageCodes]
        .filter((pageCode): pageCode is number => typeof pageCode === 'number' && pageCode > 0)
        .sort((a, b) => a - b)
        .slice(0, MAX_LINKED_PAGES)
        .map((pageCode) => `page:${pageCode}`)
      setPageIds((prev) => (areEqual(prev, nextPageIds) ? prev : nextPageIds))
    }
    update()
    frag.observeDeep(update)
    return () => frag.unobserveDeep(update)
  }, [document])

  return (
    <PageLinkAccessContext.Provider value={canOpenByPageCode}>
      {children}
      {atmosphere.authObj && pageIds.length > 0 && (
        <PageLinkAccessRoot pageIds={pageIds} onAccess={setCanOpenByPageCode} />
      )}
    </PageLinkAccessContext.Provider>
  )
}
