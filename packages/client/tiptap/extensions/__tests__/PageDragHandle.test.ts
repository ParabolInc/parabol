import './installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import type {DragHandleRule} from '@tiptap/extension-drag-handle'
import {NodeSelection} from '@tiptap/pm/state'
import type Atmosphere from '../../../Atmosphere'
import {serverTipTapExtensions} from '../../../shared/tiptap/serverTipTapExtensions'
import {PageDragHandle} from '../PageDragHandle'
import {happyWindow} from './installHappyDom'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../../hooks/usePageViewerAccess', () => ({
  __esModule: true,
  lookupPageViewerGrant: () => mockPageViewerGrant
}))
jest.mock('../DragHandleMenu', () => ({__esModule: true, default: () => null}))
jest.mock('@tiptap/react', () => ({
  ...jest.requireActual('@tiptap/react'),
  ReactRenderer: class {
    element = document.createElement('div')
    constructor(_component: unknown, {props}: {props: Record<string, unknown>}) {
      mockMenuProps.push(props)
    }
    destroy() {}
  }
}))
let mockPageViewerGrant: string | null = null
const mockMenuProps: Record<string, unknown>[] = []

const p = (text: string): JSONContent => ({type: 'paragraph', content: [{type: 'text', text}]})
const h = (level: number, text: string): JSONContent => ({
  type: 'heading',
  attrs: {level},
  content: [{type: 'text', text}]
})

let editor: Editor | undefined
const makeEditor = (...blocks: JSONContent[]) => makeEditorWith({isNested: false}, ...blocks)
const makeEditorWith = ({isNested}: {isNested: boolean}, ...blocks: JSONContent[]) => {
  const activeEditor = new Editor({
    element: document.createElement('div'),
    extensions: [
      Document.extend({content: 'heading block*'}),
      ...serverTipTapExtensions.map((extension) =>
        extension.name === 'starterKit'
          ? extension.configure({document: false, trailingNode: {node: 'paragraph'}})
          : extension
      ),
      PageDragHandle.configure({atmosphere: {} as Atmosphere, pageId: 'page:1', isNested})
    ],
    content: {type: 'doc', content: [h(1, 'Title'), ...blocks]}
  })
  editor = activeEditor
  return activeEditor
}
const pressDeleteWithNodeSelected = (activeEditor: Editor, pos: number) => {
  const {doc, tr} = activeEditor.state
  activeEditor.view.dispatch(tr.setSelection(NodeSelection.create(doc, pos)))
  activeEditor.commands.keyboardShortcut('Delete')
}

afterEach(() => {
  editor?.destroy()
  editor = undefined
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

describe('the Delete shortcut', () => {
  test.each([
    ['a paragraph', p('word')],
    ['a heading', h(2, 'word')]
  ])('leaves a selected title alone with %s below it', (_name, block) => {
    const activeEditor = makeEditor(block)
    pressDeleteWithNodeSelected(activeEditor, 0)
    const {doc} = activeEditor.state
    expect(doc.child(0).attrs.level).toBe(1)
    expect(doc.child(0).textContent).toBe('Title')
    expect(doc.child(1).textContent).toBe('word')
  })

  test('still removes any other selected block', () => {
    const activeEditor = makeEditor(p('word'), p('after'))
    pressDeleteWithNodeSelected(activeEditor, activeEditor.state.doc.child(0).nodeSize)
    const {doc} = activeEditor.state
    expect(doc.childCount).toBe(2)
    expect(doc.child(1).textContent).toBe('after')
  })
})

describe('the handle', () => {
  test('treats a quote as one block, however deep the pointer is', () => {
    const list = {
      type: 'bulletList',
      content: [{type: 'listItem', content: [p('item')]}]
    }
    const {state, extensionManager} = makeEditor({
      type: 'blockquote',
      content: [p('line'), list]
    })
    const dragHandle = extensionManager.extensions.find(({name}) => name === 'dragHandle')
    const rules: DragHandleRule[] = dragHandle?.options.nested.rules
    const quoteRule = rules.find(({id}) => id === 'quoteStructure')
    let itemPos = -1
    state.doc.descendants((node, pos) => {
      if (node.text === 'item') itemPos = pos
    })
    const $pos = state.doc.resolve(itemPos)
    const scoreAt = (depth: number) =>
      quoteRule?.evaluate({$pos, depth} as Parameters<DragHandleRule['evaluate']>[0])
    expect($pos.node(1).type.name).toBe('blockquote')
    expect(scoreAt(1)).toBe(0)
    expect(scoreAt(2)).toBe(1000)
    expect(scoreAt(3)).toBe(1000)
    expect(scoreAt(4)).toBe(1000)
  })

  test('falls back to the block when its text is not laid out', () => {
    const activeEditor = makeEditor(p('word'))
    const {extensions} = activeEditor.extensionManager
    const dragHandle = extensions.find(({name}) => name === 'dragHandle')
    const pos = activeEditor.state.doc.child(0).nodeSize
    const node = activeEditor.state.doc.nodeAt(pos)
    dragHandle?.options.onNodeChange({editor: activeEditor, node, pos})
    expect(dragHandle?.options.getReferencedVirtualElement()).toBeNull()
  })

  test.each([
    ['on a page', false, true],
    ['inside a synced block', true, false]
  ])('the menu offers Turn into Page %s', (_where, isNested, canCreateSubPage) => {
    mockPageViewerGrant = 'owner'
    const activeEditor = makeEditorWith({isNested}, p('word'))
    const dragHandle = activeEditor.extensionManager.extensions.find(
      ({name}) => name === 'dragHandle'
    )
    const pos = activeEditor.state.doc.child(0).nodeSize
    dragHandle?.options.onNodeChange({
      editor: activeEditor,
      node: activeEditor.state.doc.nodeAt(pos),
      pos
    })
    const handle = activeEditor.view.dom.parentElement!.querySelector('.drag-handle')!
    handle.dispatchEvent(new MouseEvent('click', {bubbles: true}))
    expect(mockMenuProps.at(-1)).toMatchObject({canCreateSubPage})
    handle.dispatchEvent(new MouseEvent('click', {bubbles: true}))
    mockPageViewerGrant = null
  })

  test('hides on the meta Turn into sends', () => {
    const activeEditor = makeEditor(p('word'))
    const handle = activeEditor.view.dom.parentElement?.querySelector<HTMLElement>('.drag-handle')
    expect(handle?.style.visibility).toBe('')
    activeEditor.commands.setMeta('hideDragHandle', true)
    expect(handle?.style.visibility).toBe('hidden')
  })
})
