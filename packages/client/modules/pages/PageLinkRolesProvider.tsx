import areEqual from 'fbjs/lib/areEqual'
import {type ReactNode, useEffect, useState} from 'react'
import type * as Y from 'yjs'
import type {PageRoleEnum} from '../../__generated__/PageLinkRolesQuery.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {getPageLinks} from '../../shared/tiptap/getPageLinks'
import {PageLinkRolesContext} from './PageLinkRolesContext'
import {PageLinkRolesRoot} from './PageLinkRolesRoot'

const MAX_LINKED_PAGES = 500

interface Props {
  document: Y.Doc
  children: ReactNode
}

export const PageLinkRolesProvider = (props: Props) => {
  const {document, children} = props
  const atmosphere = useAtmosphere()
  const [pageIds, setPageIds] = useState<string[]>([])
  const [roles, setRoles] = useState<ReadonlyMap<number, PageRoleEnum | null>>(new Map())

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
    <PageLinkRolesContext.Provider value={roles}>
      {children}
      {atmosphere.authObj && pageIds.length > 0 && (
        <PageLinkRolesRoot pageIds={pageIds} onRoles={setRoles} />
      )}
    </PageLinkRolesContext.Provider>
  )
}
