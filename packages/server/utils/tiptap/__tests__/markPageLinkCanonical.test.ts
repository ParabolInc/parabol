import * as Y from 'yjs'
import {createPageLinkElement} from '../../../../client/shared/tiptap/createPageLinkElement'
import {getPageLinks} from '../../../../client/shared/tiptap/getPageLinks'
import {markPageLinkCanonical} from '../hocusPocusCustomEvents'

let mockDoc: Y.Doc

jest.mock('../../../hocusPocus', () => ({
  hocuspocus: {
    openDirectConnection: async () => ({
      transact: async (fn: (doc: Y.Doc) => void) => fn(mockDoc),
      disconnect: async () => {}
    })
  }
}))

const docWith = (links: {pageCode: number; synced: boolean}[]) => {
  const doc = new Y.Doc()
  doc.getXmlFragment('default').insert(
    0,
    links.map(({pageCode, synced}) => {
      const link = createPageLinkElement(pageCode, 'Block', false, synced)
      link.setAttribute('canonical', false)
      return link as Y.XmlElement
    })
  )
  return doc
}

const canonicalFlags = (doc: Y.Doc) =>
  getPageLinks(doc).map((link) => link.getAttribute('canonical'))

test('marks one copy canonical when a host holds two', async () => {
  mockDoc = docWith([
    {pageCode: 7, synced: true},
    {pageCode: 7, synced: true}
  ])
  expect(await markPageLinkCanonical('page:1', {pageCode: 7})).toBe(true)
  expect(canonicalFlags(mockDoc)).toEqual([true, false])
})

test('skips links to the page that are not synced', async () => {
  mockDoc = docWith([
    {pageCode: 7, synced: false},
    {pageCode: 7, synced: true}
  ])
  expect(await markPageLinkCanonical('page:1', {pageCode: 7})).toBe(true)
  expect(canonicalFlags(mockDoc)).toEqual([false, true])
})

test('leaves links to other pages alone', async () => {
  mockDoc = docWith([{pageCode: 8, synced: true}])
  expect(await markPageLinkCanonical('page:1', {pageCode: 7})).toBe(false)
  expect(canonicalFlags(mockDoc)).toEqual([false])
})

test('reports no mark when the only link to the page is not synced', async () => {
  mockDoc = docWith([{pageCode: 7, synced: false}])
  expect(await markPageLinkCanonical('page:1', {pageCode: 7})).toBe(false)
  expect(canonicalFlags(mockDoc)).toEqual([false])
})
