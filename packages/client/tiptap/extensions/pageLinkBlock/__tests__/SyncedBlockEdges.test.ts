import '../../__tests__/installHappyDom'
import {NodeSelection} from '@tiptap/pm/state'
import {SlashCommand} from '../../slashCommand/SlashCommand'
import {
  findLinkPositions,
  hostLinkCount,
  mountHost,
  mountNested,
  press,
  syncedLink
} from './syncedBlockTestHarness'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../renderSuggestion', () => ({
  __esModule: true,
  default: () => () => ({onKeyDown: () => false})
}))

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

  describe('a block holding only its name', () => {
    test('gets an empty line to type in', () => {
      const {nested} = setup([])
      nested.view.dispatch(nested.state.tr.setMeta('anything', true))
      expect(nested.state.doc.childCount).toBe(2)
      expect(nested.state.doc.child(1).type.name).toBe('paragraph')
    })

    test('stays as it is for a viewer, and Mod-a does not throw', () => {
      const {nested} = setup([])
      nested.setEditable(false)
      nested.view.dispatch(nested.state.tr.setMeta('anything', true))
      expect(nested.state.doc.childCount).toBe(1)
      expect(() => press(nested, 'a', {ctrlKey: true})).not.toThrow()
    })
  })

  describe('with the slash menu open', () => {
    const openSlashMenu = (line: 'first' | 'last') => {
      const host = mountHost([
        {type: 'paragraph', content: [{type: 'text', text: 'Above'}]},
        syncedLink,
        {type: 'paragraph', content: [{type: 'text', text: 'Below'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'End'}]}
      ])
      const [linkPos] = findLinkPositions(host)
      const lines = line === 'first' ? ['', 'Sev 2'] : ['Sev 1', '']
      const nested = mountNested(host, linkPos!, lines, [SlashCommand])
      const {doc} = nested.state
      nested.commands.setTextSelection(
        line === 'first' ? doc.firstChild!.nodeSize + 1 : doc.content.size - 1
      )
      nested.commands.insertContent('/')
      const rect = {left: 0, right: 0, top: 0, bottom: 0}
      nested.view.endOfTextblock = () => true
      nested.view.coordsAtPos = () => rect
      host.view.coordsAtPos = () => rect
      host.view.posAtCoords = () => null
      host.commands.setTextSelection(host.state.doc.content.size - 1)
      return {host, nested, hostSelection: host.state.selection}
    }

    test.each([
      ['ArrowDown', 'last'],
      ['ArrowUp', 'first']
    ] as const)('%s on the %s line stays in the block', (key, line) => {
      const {host, nested, hostSelection} = openSlashMenu(line)
      press(nested, key)
      expect(host.state.selection.eq(hostSelection)).toBe(true)
    })

    test('ArrowDown leaves the block once the menu is gone', () => {
      const {host, nested, hostSelection} = openSlashMenu('last')
      const {from} = nested.state.selection
      nested.commands.deleteRange({from: from - 1, to: from})
      press(nested, 'ArrowDown')
      expect(host.state.selection.eq(hostSelection)).toBe(false)
    })

    test('Escape closes the menu and leaves the host selection alone', () => {
      const {host, nested} = openSlashMenu('last')
      press(nested, 'Escape')
      expect(host.state.selection).not.toBeInstanceOf(NodeSelection)
    })
  })
})
