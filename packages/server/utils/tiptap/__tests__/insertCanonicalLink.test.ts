import * as Y from 'yjs'
import {createPageLinkElement} from '../../../../client/shared/tiptap/createPageLinkElement'
import {isPageLink} from '../../../../client/shared/tiptap/isPageLink'
import {insertCanonicalLink} from '../insertCanonicalLink'

const block = (nodeName: string) => new Y.XmlElement(nodeName)
const link = (pageCode: number) => createPageLinkElement(pageCode, 'Title', false) as Y.XmlElement

const fragOf = (children: Y.XmlElement[]) => {
  const doc = new Y.Doc()
  const frag = doc.getXmlFragment('default')
  frag.insert(0, children)
  return frag
}

const codes = (frag: Y.XmlFragment) =>
  frag.toArray().flatMap((node) => (isPageLink(node) ? [node.getAttribute('pageCode')] : []))

const indexOfCode = (frag: Y.XmlFragment, pageCode: number) =>
  frag.toArray().findIndex((node) => isPageLink(node) && node.getAttribute('pageCode') === pageCode)

test('inserts after the matching canonical link', () => {
  const frag = fragOf([block('heading'), link(5), block('paragraph')])
  insertCanonicalLink(frag, link(9), {afterPageCode: 5})
  expect(codes(frag)).toEqual([5, 9])
  expect(indexOfCode(frag, 9)).toBe(2)
})

test('appends when the anchor link is missing', () => {
  const frag = fragOf([block('heading'), block('paragraph')])
  insertCanonicalLink(frag, link(9), {afterPageCode: 5})
  expect(indexOfCode(frag, 9)).toBe(2)
})

test('ignores a non-canonical link with the anchor code', () => {
  const nonCanonical = createPageLinkElement(5, 'Title', false)
  nonCanonical.setAttribute('canonical', false)
  const frag = fragOf([block('heading'), nonCanonical as Y.XmlElement, block('paragraph')])
  insertCanonicalLink(frag, link(9), {afterPageCode: 5})
  expect(indexOfCode(frag, 9)).toBe(3)
})

test('keeps today’s default of index 1', () => {
  const frag = fragOf([block('heading'), block('paragraph')])
  insertCanonicalLink(frag, link(9), {})
  expect(indexOfCode(frag, 9)).toBe(1)
})

test('appends when asked to', () => {
  const frag = fragOf([block('heading'), block('paragraph'), block('paragraph')])
  insertCanonicalLink(frag, link(9), {append: true})
  expect(indexOfCode(frag, 9)).toBe(3)
})
