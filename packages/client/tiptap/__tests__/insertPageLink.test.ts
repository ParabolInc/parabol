import type * as Y from 'yjs'
import {createPageLinkElement} from '../../shared/tiptap/createPageLinkElement'
import {getPageLinks} from '../../shared/tiptap/getPageLinks'
import {
  h,
  link,
  normalize,
  p,
  read,
  seed,
  toggle
} from '../blockMove/__tests__/blockMoveTestHelpers'
import {insertPageLink} from '../insertPageLink'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

const dropped = () => createPageLinkElement(9, 'Dropped', false) as Y.XmlElement

test('a drop into a page with no child pages lands at the bottom', () => {
  const frag = seed(h(1, 'Q3'), p('notes'), p('more notes'))
  insertPageLink(frag.doc!, dropped(), null)
  expect(read(frag)).toEqual(
    normalize([h(1, 'Q3'), p('notes'), p('more notes'), link(9, 'Dropped', true)])
  )
})

test('a drop into a page lands below everything, not after its last child page', () => {
  const frag = seed(h(1, 'Q3'), link(1, 'One', true), p('notes'))
  insertPageLink(frag.doc!, dropped(), null)
  expect(read(frag)).toEqual(
    normalize([h(1, 'Q3'), link(1, 'One', true), p('notes'), link(9, 'Dropped', true)])
  )
})

test('a drop into a page goes above a trailing empty paragraph', () => {
  const frag = seed(h(1, 'Q3'), p('notes'), {type: 'paragraph'})
  insertPageLink(frag.doc!, dropped(), null)
  expect(read(frag)).toEqual(
    normalize([h(1, 'Q3'), p('notes'), link(9, 'Dropped', true), {type: 'paragraph'}])
  )
})

test('a drop on the top bar goes before the first child page, even from another parent', () => {
  const frag = seed(
    h(1, 'Q3'),
    p('intro'),
    toggle('More', link(1, 'One', true)),
    link(2, 'Two', true)
  )
  insertPageLink(frag.doc!, dropped(), -1)
  expect(read(frag)).toEqual(
    normalize([
      h(1, 'Q3'),
      p('intro'),
      toggle('More', link(9, 'Dropped', true), link(1, 'One', true)),
      link(2, 'Two', true)
    ])
  )
})

test('a drop on the top bar of a page with no child pages goes just below the title', () => {
  const frag = seed(h(1, 'Q3'), p('notes'))
  insertPageLink(frag.doc!, dropped(), -1)
  expect(read(frag)).toEqual(normalize([h(1, 'Q3'), link(9, 'Dropped', true), p('notes')]))
})

test('a drop below a child page goes right after it, ignoring non-canonical links', () => {
  const frag = seed(
    h(1, 'Q3'),
    link(1, 'One', true),
    link(5, 'Mention', false),
    p('notes'),
    link(2, 'Two', true)
  )
  insertPageLink(frag.doc!, dropped(), 0)
  expect(read(frag)).toEqual(
    normalize([
      h(1, 'Q3'),
      link(1, 'One', true),
      link(9, 'Dropped', true),
      link(5, 'Mention', false),
      p('notes'),
      link(2, 'Two', true)
    ])
  )
})

test('a reorder within a page uses the child list from before the move', () => {
  const frag = seed(h(1, 'Q3'), link(1, 'One', true), link(2, 'Two', true), link(3, 'Three', true))
  const children = getPageLinks(frag.doc!, true)
  frag.delete(1)
  insertPageLink(frag.doc!, createPageLinkElement(1, 'One', false) as Y.XmlElement, 1, children)
  expect(read(frag)).toEqual(
    normalize([h(1, 'Q3'), link(2, 'Two', true), link(1, 'One', true), link(3, 'Three', true)])
  )
})
