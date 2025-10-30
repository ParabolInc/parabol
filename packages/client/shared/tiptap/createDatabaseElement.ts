import * as Y from 'yjs'
import type {DatabaseBlockAttributes} from './extensions/DatabaseBlockBase'
export const createDatabaseElement = (pageCode: number, title: string) => {
  const el = new Y.XmlElement<DatabaseBlockAttributes>()
  el.nodeName = 'pageLinkBlock'
  el.setAttribute('pageCode', pageCode)
  el.setAttribute('title', title)
  el.setAttribute('canonical', true)
  return el
}
