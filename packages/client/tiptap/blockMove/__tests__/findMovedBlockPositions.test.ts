import '../../extensions/__tests__/installHappyDom'
import {Editor} from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import {appendBlocksToFragment} from '../appendBlocksToFragment'
import {findMovedBlockPositions} from '../findMovedBlockPositions'
import {extensions, p, schema} from './blockMoveTestHelpers'

const makeCollabEditor = (doc: Y.Doc) =>
  new Editor({
    element: document.createElement('div'),
    extensions: [
      ...extensions.map((extension) =>
        extension.name === 'starterKit'
          ? extension.configure({
              document: false,
              trailingNode: {node: 'paragraph'},
              undoRedo: false
            })
          : extension
      ),
      Collaboration.configure({document: doc})
    ]
  })

test('maps moved Yjs items to their top-level positions', () => {
  const doc = new Y.Doc()
  const frag = doc.getXmlFragment('default')
  const editor = makeCollabEditor(doc)
  const moved = appendBlocksToFragment(frag, [p('first'), p('second')], schema)
  const positions = findMovedBlockPositions(editor, moved)
  const texts = positions.map((pos) => editor.state.doc.nodeAt(pos)?.textContent)
  expect(texts).toEqual(['first', 'second'])
  editor.destroy()
})

test('ignores moved blocks that are not on the page', () => {
  const doc = new Y.Doc()
  const editor = makeCollabEditor(doc)
  expect(findMovedBlockPositions(editor, [{client: 1, clock: 1, snapshot: ''}])).toEqual([])
  editor.destroy()
})

test('a mismatched ID returns nothing while other blocks exist', () => {
  const doc = new Y.Doc()
  const frag = doc.getXmlFragment('default')
  const editor = makeCollabEditor(doc)
  const moved = appendBlocksToFragment(frag, [p('first')], schema)
  const other = {client: moved[0]!.client + 1, clock: moved[0]!.clock, snapshot: ''}
  expect(findMovedBlockPositions(editor, [other])).toEqual([])
  editor.destroy()
})

test('finds the right block after the document is reordered', () => {
  const doc = new Y.Doc()
  const frag = doc.getXmlFragment('default')
  const editor = makeCollabEditor(doc)
  appendBlocksToFragment(frag, [p('first')], schema)
  const moved = appendBlocksToFragment(frag, [p('second')], schema)
  frag.insert(1, [new Y.XmlElement('paragraph')])
  const [pos] = findMovedBlockPositions(editor, moved)
  expect(editor.state.doc.nodeAt(pos!)?.textContent).toBe('second')
  editor.destroy()
})
