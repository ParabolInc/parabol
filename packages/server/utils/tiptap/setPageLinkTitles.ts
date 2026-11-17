import type {XmlFragment} from 'yjs'
import {isPageLink} from '../../../client/shared/tiptap/isPageLink'

export const setPageLinkTitles = (fragment: XmlFragment, pageCode: number, title: string) => {
  const walker = fragment.createTreeWalker((yxml) => {
    if (!isPageLink(yxml)) return false
    return yxml.getAttribute('pageCode') === pageCode
  })
  for (const node of walker) {
    if (isPageLink(node) && node.getAttribute('title') !== title) node.setAttribute('title', title)
  }
}
