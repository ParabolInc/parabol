import * as Y from 'yjs'
import type {PageLinkBlockAttributes} from './extensions/PageLinkBlockBase'
export const createPageLinkElement = (pageCode: number, title: string) => {
  const el = new Y.XmlElement<PageLinkBlockAttributes>()
  el.nodeName = 'pageLinkBlock'
  el.setAttribute('pageCode', pageCode)
  el.setAttribute('title', title)
  el.setAttribute('canonical', true)
  return el
}
