import {makeEditor, p} from '../../../blockMove/__tests__/blockMoveTestHelpers'
import {findSyncedBlockPositions} from '../findSyncedBlockPositions'

const syncedLink = (pageCode: number, canonical: boolean) => ({
  type: 'pageLinkBlock',
  attrs: {pageCode, title: 'Block', canonical, synced: true}
})

test('finds every placement of the block, canonical first', () => {
  const editor = makeEditor(
    syncedLink(9, false),
    p('between'),
    {
      type: 'bulletList',
      content: [{type: 'listItem', content: [p('item'), syncedLink(9, true)]}]
    },
    syncedLink(10, true)
  )
  const {doc} = editor.state
  const positions = findSyncedBlockPositions(doc, 9)
  expect(positions).toHaveLength(2)
  expect(doc.nodeAt(positions[0]!)?.attrs.canonical).toBe(true)
  expect(doc.nodeAt(positions[1]!)?.attrs.canonical).toBe(false)
  expect(findSyncedBlockPositions(doc, 11)).toEqual([])
})
