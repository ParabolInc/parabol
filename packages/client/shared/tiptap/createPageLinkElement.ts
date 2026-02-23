import * as Y from 'yjs'
import type {PageLinkBlockAttrs} from './extensions/PageLinkBlockBase'
export const createPageLinkElement = (
  pageCode: number,
  title: string | null | undefined,
  isDatabase: boolean
) => {
  const el = new Y.XmlElement<PageLinkBlockAttrs>('pageLinkBlock')
  el.setAttribute('pageCode', pageCode)
  el.setAttribute('title', title ?? '<Untitled>')
  el.setAttribute('canonical', true)
  if (isDatabase) {
    el.setAttribute('database', true)
  }
  return el
}
