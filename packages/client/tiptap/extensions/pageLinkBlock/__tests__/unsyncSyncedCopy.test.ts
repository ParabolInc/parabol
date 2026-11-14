import '../../__tests__/installHappyDom'
import type {Editor, JSONContent} from '@tiptap/core'
import {TextSelection} from '@tiptap/pm/state'
import {PageLinkBlockBase} from '../../../../shared/tiptap/extensions/PageLinkBlockBase'
import {unsyncSyncedCopy} from '../unsyncSyncedCopy'
import {findLinkPositions, mountHost, mountNested, syncedLink} from './syncedBlockTestHarness'

const syncedCopy = {...syncedLink, attrs: {...syncedLink.attrs, canonical: false}}

const paragraph = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{type: 'text', text}]
})

const mountBlock = (link: JSONContent = syncedCopy) => {
  const host = mountHost([paragraph('Above'), link, paragraph('Below')])
  return {host, linkPos: findLinkPositions(host)[0]!}
}

const children = (editor: Editor) => {
  const all: string[] = []
  editor.state.doc.forEach((node) => {
    all.push(node.type.name === 'paragraph' ? node.textContent : node.type.name)
  })
  return all
}

test("replaces the copy with the block's content minus its name", () => {
  const {host, linkPos} = mountBlock()
  mountNested(host, linkPos, ['Sev 1: page the on-call lead.', 'Sev 2: open a ticket.'])
  expect(unsyncSyncedCopy(host, linkPos, 7)).toBe(true)
  expect(children(host)).toEqual([
    'Above',
    'Sev 1: page the on-call lead.',
    'Sev 2: open a ticket.',
    'Below'
  ])
})

test("keeps the first node when it isn't a heading", () => {
  const {host, linkPos} = mountBlock()
  mountNested(host, linkPos, ['When to escalate', 'Sev 1'], [], {named: false})
  expect(unsyncSyncedCopy(host, linkPos, 7)).toBe(true)
  expect(children(host)).toEqual(['Above', 'When to escalate', 'Sev 1', 'Below'])
})

test('turns canonical page links inside into copies', () => {
  const {host, linkPos} = mountBlock()
  const nested = mountNested(host, linkPos, ['Sev 1'], [PageLinkBlockBase])
  nested.commands.insertContentAt(nested.state.doc.content.size, {
    type: 'pageLinkBlock',
    attrs: {pageCode: 9, title: 'Child page', canonical: true, synced: false}
  })
  expect(unsyncSyncedCopy(host, linkPos, 7)).toBe(true)
  const links = findLinkPositions(host).map((pos) => host.state.doc.nodeAt(pos)!.attrs)
  expect(links).toEqual([expect.objectContaining({pageCode: 9, canonical: false, synced: false})])
})

test('leaves one empty paragraph when the block holds only its name', () => {
  const {host, linkPos} = mountBlock()
  mountNested(host, linkPos, [])
  expect(unsyncSyncedCopy(host, linkPos, 7)).toBe(true)
  expect(children(host)).toEqual(['Above', '', 'Below'])
})

test('puts the caret at the start of the unsynced content', () => {
  const {host, linkPos} = mountBlock()
  mountNested(host, linkPos, ['Sev 1', 'Sev 2'])
  unsyncSyncedCopy(host, linkPos, 7)
  const {selection} = host.state
  expect(selection).toBeInstanceOf(TextSelection)
  expect(selection.empty).toBe(true)
  expect(selection.from).toBe(linkPos + 1)
  expect(selection.$from.parent.textContent).toBe('Sev 1')
})

test('refuses an original', () => {
  const {host, linkPos} = mountBlock(syncedLink)
  mountNested(host, linkPos, ['Sev 1'])
  const before = host.state.doc
  expect(unsyncSyncedCopy(host, linkPos, 7)).toBe(false)
  expect(host.state.doc.eq(before)).toBe(true)
})

test("returns false and changes nothing when the block isn't mounted", () => {
  const {host, linkPos} = mountBlock()
  const before = host.state
  expect(unsyncSyncedCopy(host, linkPos, 7)).toBe(false)
  expect(host.state).toBe(before)
})

test('refuses another synced block at the position', () => {
  const {host, linkPos} = mountBlock()
  mountNested(host, linkPos, ['Sev 1'])
  const before = host.state
  expect(unsyncSyncedCopy(host, linkPos, 9)).toBe(false)
  expect(host.state).toBe(before)
})
