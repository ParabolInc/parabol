import '../../__tests__/installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import {NodeSelection} from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import * as Y from 'yjs'
import {PageLinkBlock} from '../PageLinkBlock'
import {findLinkPositions, hostLinkCount, press, syncedLink} from './syncedBlockTestHarness'

jest.mock('../PageLinkNodeView', () => ({__esModule: true, PageLinkNodeView: () => null}))

const paragraph = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{type: 'text', text}]
})

const syncedCopy = {...syncedLink, attrs: {...syncedLink.attrs, canonical: false}}

const mountPage = (content: JSONContent[]) =>
  new Editor({
    element: document.createElement('div'),
    extensions: [
      StarterKit,
      PageLinkBlock.extend({addNodeView: null}).configure({yDoc: new Y.Doc()})
    ],
    content: {type: 'doc', content}
  })

const caretAfterLink = (page: Editor) => {
  const [linkPos] = findLinkPositions(page)
  page.commands.setTextSelection(linkPos! + page.state.doc.nodeAt(linkPos!)!.nodeSize + 1)
  return linkPos!
}

const caretBeforeLink = (page: Editor) => {
  const [linkPos] = findLinkPositions(page)
  page.commands.setTextSelection(linkPos! - 1)
  return linkPos!
}

const isLinkSelected = (page: Editor, linkPos: number) => {
  const {selection} = page.state
  return selection instanceof NodeSelection && selection.from === linkPos
}

describe('a synced original beside the caret', () => {
  test('the first Backspace selects it and the second deletes it', () => {
    const page = mountPage([paragraph('Above'), syncedLink, paragraph('Below')])
    const linkPos = caretAfterLink(page)
    expect(press(page, 'Backspace')).toBe(true)
    expect(hostLinkCount(page)).toBe(1)
    expect(isLinkSelected(page, linkPos)).toBe(true)
    press(page, 'Backspace')
    expect(hostLinkCount(page)).toBe(0)
    expect(page.state.doc.textContent).toBe('AboveBelow')
  })

  test('the first Delete selects it and the second deletes it', () => {
    const page = mountPage([paragraph('Above'), syncedLink, paragraph('Below')])
    const linkPos = caretBeforeLink(page)
    expect(press(page, 'Delete')).toBe(true)
    expect(hostLinkCount(page)).toBe(1)
    expect(isLinkSelected(page, linkPos)).toBe(true)
    press(page, 'Delete')
    expect(hostLinkCount(page)).toBe(0)
  })

  test('a typed key does not replace it once it is selected', () => {
    const page = mountPage([paragraph('Above'), syncedLink, paragraph('Below')])
    const [linkPos] = findLinkPositions(page)
    page.view.dispatch(page.state.tr.setSelection(NodeSelection.create(page.state.doc, linkPos!)))
    const handled = page.view.someProp('handleTextInput', (handler) =>
      handler(page.view, linkPos!, linkPos! + 1, 'x', () => page.state.tr.insertText('x'))
    )
    expect(handled).toBe(true)
    expect(hostLinkCount(page)).toBe(1)
  })

  test('a copy still goes with one Backspace', () => {
    const page = mountPage([paragraph('Above'), syncedCopy, paragraph('Below')])
    caretAfterLink(page)
    press(page, 'Backspace')
    expect(hostLinkCount(page)).toBe(0)
  })
})
