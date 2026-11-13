import '../../__tests__/installHappyDom'
import {NodeSelection} from '@tiptap/pm/state'
import {
  findLinkPositions,
  hostLinkCount,
  mountHost,
  mountNested,
  press,
  syncedLink
} from './syncedBlockTestHarness'

const setup = (contentLines: string[]) => {
  const host = mountHost([{type: 'paragraph'}, syncedLink, {type: 'paragraph'}])
  const [linkPos] = findLinkPositions(host)
  const nested = mountNested(host, linkPos!, contentLines)
  return {host, nested}
}

describe('SyncedBlockEdges', () => {
  test('Mod-a selects the block content and never the hidden name', () => {
    const {nested} = setup(['Sev 1', 'Sev 2'])
    press(nested, 'a', {ctrlKey: true})
    const {from, to} = nested.state.selection
    expect(nested.state.doc.textBetween(from, to, '\n')).toBe('Sev 1\nSev 2')
  })

  test('a cursor placed in the name heading moves to the first content line', () => {
    const {nested} = setup(['Sev 1', 'Sev 2'])
    nested.commands.setTextSelection(2)
    expect(nested.state.selection.from).toBe(nested.state.doc.firstChild!.nodeSize + 1)
  })

  test('Backspace at the start of an empty block removes the block from the host', () => {
    const {host, nested} = setup([''])
    nested.commands.setTextSelection(nested.state.doc.firstChild!.nodeSize + 1)
    nested.commands.keyboardShortcut('Backspace')
    expect(hostLinkCount(host)).toBe(0)
  })

  test('Backspace at the start of a block with content keeps the block', () => {
    const {host, nested} = setup(['Sev 1', 'Sev 2'])
    nested.commands.setTextSelection(nested.state.doc.firstChild!.nodeSize + 1)
    nested.commands.keyboardShortcut('Backspace')
    expect(hostLinkCount(host)).toBe(1)
  })

  test('Escape selects the block node in the host', () => {
    const {host, nested} = setup(['Sev 1', 'Sev 2'])
    nested.commands.keyboardShortcut('Escape')
    expect(host.state.selection).toBeInstanceOf(NodeSelection)
  })
})
