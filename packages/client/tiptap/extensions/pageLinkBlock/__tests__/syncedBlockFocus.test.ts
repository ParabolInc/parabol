import '../../__tests__/installHappyDom'
import {NodeSelection} from '@tiptap/pm/state'
import {
  findLinkPositions,
  mountHost,
  mountNested,
  plainLink,
  press,
  syncedLink
} from './syncedBlockTestHarness'

const selectNode = (host: ReturnType<typeof mountHost>, pos: number) =>
  host.view.dispatch(host.state.tr.setSelection(NodeSelection.create(host.state.doc, pos)))

describe('syncedBlockEntryPlugin', () => {
  test('ArrowDown from a node-selected synced block enters it at the start', () => {
    const host = mountHost([{type: 'paragraph'}, syncedLink, {type: 'paragraph'}])
    const [linkPos] = findLinkPositions(host)
    const nested = mountNested(host, linkPos!, ['Sev 1', 'Sev 2'])
    selectNode(host, linkPos!)
    expect(press(host, 'ArrowDown')).toBe(true)
    expect(nested.state.selection.from).toBe(nested.state.doc.firstChild!.nodeSize + 1)
  })

  test('ArrowUp from a node-selected synced block enters it at the end', () => {
    const host = mountHost([{type: 'paragraph'}, syncedLink, {type: 'paragraph'}])
    const [linkPos] = findLinkPositions(host)
    const nested = mountNested(host, linkPos!, ['Sev 1', 'Sev 2'])
    selectNode(host, linkPos!)
    expect(press(host, 'ArrowUp')).toBe(true)
    expect(nested.state.selection.from).toBe(nested.state.doc.content.size - 1)
  })

  test('ignores a non-synced page link', () => {
    const host = mountHost([{type: 'paragraph'}, plainLink, {type: 'paragraph'}])
    const [plainLinkPos] = findLinkPositions(host)
    selectNode(host, plainLinkPos!)
    expect(press(host, 'ArrowDown')).toBe(false)
  })
})
