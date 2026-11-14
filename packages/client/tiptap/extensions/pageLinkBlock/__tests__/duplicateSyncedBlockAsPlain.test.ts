import '../../__tests__/installHappyDom'
import type {Editor, JSONContent} from '@tiptap/core'
import {PageLinkBlockBase} from '../../../../shared/tiptap/extensions/PageLinkBlockBase'
import {getSelectedBlockRange} from '../../../blockSelection/blockSelectionState'
import {duplicateSyncedBlockAsPlain} from '../duplicateSyncedBlockAsPlain'
import {findLinkPositions, mountHost, mountNested, syncedLink} from './syncedBlockTestHarness'

const paragraph = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{type: 'text', text}]
})

const mountBlock = () => {
  const host = mountHost([paragraph('Above'), syncedLink, paragraph('Below')])
  const linkPos = findLinkPositions(host)[0]!
  return {host, linkPos, blockEnd: linkPos + host.state.doc.nodeAt(linkPos)!.nodeSize}
}

const children = (editor: Editor) => {
  const all: string[] = []
  editor.state.doc.forEach((node) => {
    all.push(node.type.name === 'paragraph' ? node.textContent : node.type.name)
  })
  return all
}

test('inserts the block content after it as ordinary blocks', () => {
  const {host, linkPos, blockEnd} = mountBlock()
  mountNested(host, linkPos, ['Sev 1: page the on-call lead.', 'Sev 2: open a ticket.'])
  expect(duplicateSyncedBlockAsPlain(host, linkPos)).toBe(true)
  expect(children(host)).toEqual([
    'Above',
    'pageLinkBlock',
    'Sev 1: page the on-call lead.',
    'Sev 2: open a ticket.',
    'Below'
  ])
  const selected = getSelectedBlockRange(host.state)!
  expect(selected.from).toBe(blockEnd)
  expect(host.state.doc.textBetween(selected.from, selected.to, '|')).toBe(
    'Sev 1: page the on-call lead.|Sev 2: open a ticket.'
  )
})

test('duplicate turns canonical links into copies', () => {
  const {host, linkPos} = mountBlock()
  const nested = mountNested(host, linkPos, ['Sev 1'], [PageLinkBlockBase])
  nested.commands.insertContentAt(nested.state.doc.content.size, {
    type: 'pageLinkBlock',
    attrs: {pageCode: 9, title: 'Child page', canonical: true, synced: false}
  })
  expect(duplicateSyncedBlockAsPlain(host, linkPos)).toBe(true)
  const links = findLinkPositions(host).map((pos) => host.state.doc.nodeAt(pos)!.attrs)
  expect(links).toEqual([
    expect.objectContaining({pageCode: 7, canonical: true, synced: true}),
    expect.objectContaining({pageCode: 9, canonical: false, synced: false})
  ])
})

test('a block that holds only its name duplicates as one empty paragraph', () => {
  const {host, linkPos, blockEnd} = mountBlock()
  mountNested(host, linkPos, [])
  expect(duplicateSyncedBlockAsPlain(host, linkPos)).toBe(true)
  expect(children(host)).toEqual(['Above', 'pageLinkBlock', '', 'Below'])
  expect(getSelectedBlockRange(host.state)?.from).toBe(blockEnd)
})

test('returns false when the block is not mounted', () => {
  const {host, linkPos} = mountBlock()
  const before = host.state.doc
  expect(duplicateSyncedBlockAsPlain(host, linkPos)).toBe(false)
  expect(host.state.doc.eq(before)).toBe(true)
})
