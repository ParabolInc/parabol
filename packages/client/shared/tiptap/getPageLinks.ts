import {type Doc, XmlElement} from 'yjs'
import type {PageLinkBlockAttributes} from './extensions/PageLinkBlockBase'
import {isPageLink} from './isPageLink'

export const getPageLinks = (doc: Doc, canonical?: boolean) => {
  const frag = doc.getXmlFragment('default')
  const walker = frag.createTreeWalker((yxml) => {
    if (!isPageLink(yxml)) return false
    if (canonical === undefined) return true
    return yxml.getAttribute('canonical') === canonical
  })
  return Array.from(walker) as XmlElement<PageLinkBlockAttributes>[]
}
