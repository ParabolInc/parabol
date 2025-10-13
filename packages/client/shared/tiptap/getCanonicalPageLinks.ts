import {type Doc, XmlElement} from 'yjs'
import type {PageLinkBlockAttributes} from './extensions/PageLinkBlockBase'

export const getCanonicalPageLinks = (doc: Doc) => {
  const frag = doc.getXmlFragment('default')
  const walker = frag.createTreeWalker((yxml) => {
    if (!(yxml instanceof XmlElement)) return false
    if (yxml.nodeName !== 'pageLinkBlock') return false
    return !!yxml.getAttribute('canonical')
  })
  return Array.from(walker) as XmlElement<PageLinkBlockAttributes>[]
}
