import '../../__tests__/installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import {NodeSelection, TextSelection} from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import {PageLinkBlockBase} from '../../../../shared/tiptap/extensions/PageLinkBlockBase'
import {focusHostNearSyncedBlock} from '../focusHostNearSyncedBlock'
import {findLinkPositions, mountHost, plainLink, syncedLink} from './syncedBlockTestHarness'

const paragraph = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{type: 'text', text}]
})

const mount = (content: JSONContent[]) => {
  const host = mountHost(content)
  host.commands.setTextSelection(1)
  return {host, linkPos: findLinkPositions(host)[0]!}
}

const caretText = (host: Editor) => {
  const {selection} = host.state
  expect(selection).toBeInstanceOf(TextSelection)
  return {parent: selection.$from.parent.textContent, offset: selection.$from.parentOffset}
}

test('puts the caret at the start of the paragraph after the block', () => {
  const {host, linkPos} = mount([paragraph('Above'), syncedLink, paragraph('Below')])
  focusHostNearSyncedBlock(host, linkPos, 7)
  expect(caretText(host)).toEqual({parent: 'Below', offset: 0})
})

test('puts the caret at the end of the text before a trailing block', () => {
  const host = new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit.configure({trailingNode: false}), PageLinkBlockBase],
    content: {type: 'doc', content: [paragraph('Above'), syncedLink]}
  })
  const linkPos = findLinkPositions(host)[0]!
  expect(host.state.doc.lastChild!.type.name).toBe('pageLinkBlock')
  host.commands.setTextSelection(1)
  focusHostNearSyncedBlock(host, linkPos, 7)
  expect(caretText(host)).toEqual({parent: 'Above', offset: 5})
})

test('leaves the selection alone when the node is a different block', () => {
  const {host, linkPos} = mount([paragraph('Above'), syncedLink, paragraph('Below')])
  const before = host.state.selection.from
  focusHostNearSyncedBlock(host, linkPos, 99)
  expect(host.state.selection.from).toBe(before)
})

test('leaves the selection alone when the node is not synced', () => {
  const {host, linkPos} = mount([paragraph('Above'), plainLink, paragraph('Below')])
  const before = host.state.selection.from
  focusHostNearSyncedBlock(host, linkPos, 8)
  expect(host.state.selection.from).toBe(before)
})

test('leaves the selection alone when there is no position', () => {
  const {host} = mount([paragraph('Above'), syncedLink, paragraph('Below')])
  const before = host.state.selection.from
  focusHostNearSyncedBlock(host, undefined, 7)
  expect(host.state.selection.from).toBe(before)
})

test('never selects the block itself', () => {
  const {host, linkPos} = mount([paragraph('Above'), syncedLink, paragraph('Below')])
  focusHostNearSyncedBlock(host, linkPos, 7)
  expect(host.state.selection).not.toBeInstanceOf(NodeSelection)
})

test('falls back without throwing when the position is out of range', () => {
  const {host} = mount([paragraph('Above'), syncedLink, paragraph('Below')])
  const before = host.state.selection.from
  expect(() => focusHostNearSyncedBlock(host, host.state.doc.content.size + 50, 7)).not.toThrow()
  expect(host.state.selection.from).toBe(before)
})
