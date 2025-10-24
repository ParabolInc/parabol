import {useEffect, useState} from 'react'
import type {PageLinkBlockAttributes} from '../shared/tiptap/extensions/PageLinkBlockBase'
import {getPageLinks} from '../shared/tiptap/getPageLinks'
import {usePageProvider} from './usePageProvider'

export const usePageChildren = (pageId: string) => {
  const {provider} = usePageProvider(pageId)
  const [children, setChildren] = useState<PageLinkBlockAttributes[] | null>(null)

  useEffect(() => {
    const root = provider.document.getXmlFragment('default')
    const update = () => {
      const items = getPageLinks(provider.document, true).map(
        (item) => item.getAttributes() as PageLinkBlockAttributes
      )
      setChildren(items)
    }
    update()
    root.observeDeep(update)
    return () => {
      root.unobserveDeep(update)
    }
  }, [provider.document])
  return children
}
