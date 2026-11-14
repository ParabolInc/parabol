import './installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import type {DragHandleRule} from '@tiptap/extension-drag-handle'
import {Slice} from '@tiptap/pm/model'
import {NodeSelection} from '@tiptap/pm/state'
import type Atmosphere from '../../../Atmosphere'
import {serverTipTapExtensions} from '../../../shared/tiptap/serverTipTapExtensions'
import {endBlockDrag} from '../../blockMove/blockDragSession'
import {PageDragHandle} from '../PageDragHandle'
import {happyWindow} from './installHappyDom'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../blockMove/blockDragSession', () => ({
  endBlockDrag: jest.fn(),
  startBlockDrag: jest.fn()
}))
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
  jest.clearAllMocks()
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

  test('keeps a callout title with its callout', () => {
    const {state, extensionManager} = makeEditor({
      type: 'callout',
      content: [{type: 'calloutTitle', content: [{type: 'text', text: 'Heads up'}]}, p('body')]
    })
    const dragHandle = extensionManager.extensions.find(({name}) => name === 'dragHandle')
    const rules: DragHandleRule[] = dragHandle?.options.nested.rules
    const resolveText = (text: string) => {
      let textPos = -1
      state.doc.descendants((node, pos) => {
        if (node.text === text) textPos = pos
      })
      return state.doc.resolve(textPos)
    }
    const scoreAt = (text: string, depth: number) => {
      const $pos = resolveText(text)
      const node = $pos.node(depth)
      return Math.max(
        ...rules.map(({evaluate}) =>
          evaluate({$pos, depth, node} as Parameters<DragHandleRule['evaluate']>[0])
        )
      )
    }
    expect(resolveText('Heads up').node(2).type.name).toBe('calloutTitle')
    expect(scoreAt('Heads up', 1)).toBe(0)
    expect(scoreAt('Heads up', 2)).toBe(1000)
    expect(scoreAt('body', 2)).toBe(0)
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

  test('a refused title drag reaches no later dragstart listener', () => {
    const activeEditor = makeEditor(p('word'))
    const dragHandle = activeEditor.extensionManager.extensions.find(
      ({name}) => name === 'dragHandle'
    )
    dragHandle?.options.onNodeChange({
      editor: activeEditor,
      node: activeEditor.state.doc.nodeAt(0),
      pos: 0
    })
    const handle = activeEditor.view.dom.parentElement?.querySelector<HTMLElement>('.drag-handle')!
    const laterListener = jest.fn()
    handle.addEventListener('dragstart', laterListener)
    const event = new Event('dragstart', {cancelable: true})
    Object.assign(event, {dataTransfer: {}})
    handle.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(endBlockDrag).toHaveBeenCalledTimes(1)
    expect(laterListener).not.toHaveBeenCalled()
    expect(activeEditor.view.dragging).toBeNull()
  })

  test('dragend on the handle clears the drag so a second block can be dragged', () => {
    const activeEditor = makeEditor(p('one'), p('two'))
    const dragHandle = activeEditor.extensionManager.extensions.find(
      ({name}) => name === 'dragHandle'
    )
    const handle = activeEditor.view.dom.parentElement?.querySelector<HTMLElement>('.drag-handle')!
    const startDrag = (pos: number) => {
      dragHandle?.options.onNodeChange({
        editor: activeEditor,
        node: activeEditor.state.doc.nodeAt(pos),
        pos
      })
      const event = new Event('dragstart', {cancelable: true})
      const dataTransfer = {clearData: jest.fn(), setDragImage: jest.fn(), setData: jest.fn()}
      Object.assign(event, {dataTransfer})
      handle.dispatchEvent(event)
    }
    const firstPos = activeEditor.state.doc.child(0).nodeSize
    startDrag(firstPos)
    expect(activeEditor.view.dragging).toBeTruthy()
    handle.dispatchEvent(new Event('dragend'))
    expect(activeEditor.view.dragging).toBeNull()
    startDrag(firstPos + activeEditor.state.doc.child(1).nodeSize)
    expect(activeEditor.view.dragging).toBeTruthy()
  })

  test('hides on the meta Turn into sends', () => {
    const activeEditor = makeEditor(p('word'))
    const handle = activeEditor.view.dom.parentElement?.querySelector<HTMLElement>('.drag-handle')
    expect(handle?.style.visibility).toBe('')
    activeEditor.commands.setMeta('hideDragHandle', true)
    expect(handle?.style.visibility).toBe('hidden')
  })
})

describe('drops on page targets', () => {
  const dropOn = (activeEditor: Editor, attribute: string) => {
    const target = document.createElement('div')
    target.setAttribute(attribute, 'page:2')
    const inner = target.appendChild(document.createElement('span'))
    const event = {target: inner} as unknown as DragEvent
    return activeEditor.view.someProp('handleDrop', (handleDrop) =>
      handleDrop(activeEditor.view, event, Slice.empty, true)
    )
  }

  test('inside the editor are left to the target', () => {
    expect(dropOn(makeEditor(p('a')), 'data-drop-in')).toBe(true)
  })

  test('on a refused target are swallowed too', () => {
    expect(dropOn(makeEditor(p('a')), 'data-drop-refused')).toBe(true)
  })

  test('elsewhere are left to ProseMirror', () => {
    const activeEditor = makeEditor(p('a'))
    const event = {target: document.createElement('div')} as unknown as DragEvent
    const claimed = activeEditor.view.someProp('handleDrop', (handleDrop) =>
      handleDrop(activeEditor.view, event, Slice.empty, true)
    )
    expect(claimed).toBeFalsy()
  })
})
