import {useEffect, useState} from 'react'
import * as Y from 'yjs'
import type {PageLinkBlockAttributes} from '../shared/tiptap/extensions/PageLinkBlockBase'
import {usePageProvider} from './usePageProvider'

export const usePageChildren = (pageId: string) => {
  const {provider} = usePageProvider(pageId)
  const [children, setChildren] = useState<PageLinkBlockAttributes[] | null>(null)

  useEffect(() => {
    const root = provider.document.getXmlFragment('default')
    const update = () => {
      const items = root
        .toArray()
        .filter(
          (n): n is Y.XmlElement => n instanceof Y.XmlElement && n.nodeName === 'pageLinkBlock'
        )
        .map((item) => item.getAttributes() as any as PageLinkBlockAttributes)
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
