import './installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import type {DragHandleRule} from '@tiptap/extension-drag-handle'
import {isNodeRangeSelection} from '@tiptap/extension-node-range'
import {Slice} from '@tiptap/pm/model'
import {NodeSelection, TextSelection} from '@tiptap/pm/state'
import {ReactRenderer} from '@tiptap/react'
import type Atmosphere from '../../../Atmosphere'
import {serverTipTapExtensions} from '../../../shared/tiptap/serverTipTapExtensions'
import {endBlockDrag, startBlockDrag} from '../../blockMove/blockDragSession'
import {createBlockSelection, getSelectedBlockRange} from '../../blockSelection/blockSelectionState'
import {BlockSelection} from '../BlockSelection'
import {PageDragHandle} from '../PageDragHandle'
import {
  findLinkPositions,
  mountNested,
  syncedLink
} from '../pageLinkBlock/__tests__/syncedBlockTestHarness'
import {happyWindow} from './installHappyDom'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../blockMove/blockDragSession', () => ({
  endBlockDrag: jest.fn(),
  startBlockDrag: jest.fn()
}))
jest.mock('../../../hooks/usePageViewerAccess', () => ({
  __esModule: true,
  lookupPageViewerGrant: () => mockPageViewerGrant,
  lookupPageViewerAccess: () => 'owner'
}))
jest.mock('@tiptap/react', () => ({
  ...jest.requireActual('@tiptap/react'),
  ReactRenderer: jest.fn()
}))
jest.mock('../DragHandleMenu', () => ({__esModule: true, default: () => null}))
let mockPageViewerGrant: string | null = null
const mockAtmosphere = {} as Atmosphere
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
      BlockSelection,
      PageDragHandle.configure({atmosphere: mockAtmosphere, pageId: 'page:1', isNested})
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

beforeEach(() => {
  jest.mocked(ReactRenderer).mockImplementation((_component, {props}) => {
    mockMenuProps.push(props as Record<string, unknown>)
    return {element: document.createElement('div'), destroy: jest.fn()} as unknown as ReactRenderer
  })
})

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

describe('the Mod-d shortcut', () => {
  test('on a selected synced block duplicates its content as plain blocks', () => {
    const activeEditor = makeEditor(p('Above'), syncedLink, p('Below'))
    const [linkPos] = findLinkPositions(activeEditor)
    mountNested(activeEditor, linkPos!, ['Sev 1: page the on-call lead.'])
    const {doc, tr} = activeEditor.state
    activeEditor.view.dispatch(tr.setSelection(NodeSelection.create(doc, linkPos!)))
    activeEditor.commands.keyboardShortcut('Mod-d')
    const blocks: string[] = []
    activeEditor.state.doc.forEach((node) => blocks.push(node.textContent || node.type.name))
    expect(blocks).toEqual([
      'Title',
      'Above',
      'pageLinkBlock',
      'Sev 1: page the on-call lead.',
      'Below'
    ])
    expect(findLinkPositions(activeEditor)).toHaveLength(1)
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

describe('many blocks', () => {
  const li = (text: string): JSONContent => ({type: 'listItem', content: [p(text)]})
  const blockAt = (activeEditor: Editor, text: string) => {
    let found = {from: -1, to: -1}
    activeEditor.state.doc.descendants((node, pos, parent) => {
      if (found.from >= 0) return false
      const isUnit = parent?.type.name === 'doc' || parent?.type.name === 'bulletList'
      if (isUnit && node.textContent === text) found = {from: pos, to: pos + node.nodeSize}
      return true
    })
    return found
  }
  const handleOf = (activeEditor: Editor) =>
    activeEditor.view.dom.parentElement?.querySelector<HTMLElement>('.drag-handle')!
  const hover = (activeEditor: Editor, text: string) => {
    const dragHandle = activeEditor.extensionManager.extensions.find(
      ({name}) => name === 'dragHandle'
    )
    const {from} = blockAt(activeEditor, text)
    dragHandle?.options.onNodeChange({
      editor: activeEditor,
      node: activeEditor.state.doc.nodeAt(from),
      pos: from
    })
  }
  const clickHandle = (activeEditor: Editor, shiftKey = false) => {
    handleOf(activeEditor).dispatchEvent(
      new MouseEvent('click', {shiftKey, bubbles: true, cancelable: true})
    )
  }
  const putCaretIn = (activeEditor: Editor, text: string) => {
    const {state, view} = activeEditor
    const pos = blockAt(activeEditor, text).from
    view.dispatch(state.tr.setSelection(TextSelection.near(state.doc.resolve(pos + 1))))
  }
  const selectBlocks = (activeEditor: Editor, first: string, last: string) => {
    const {state, view} = activeEditor
    const from = blockAt(activeEditor, first).from
    const range = {from, to: blockAt(activeEditor, last).to, depth: state.doc.resolve(from).depth}
    view.dispatch(state.tr.setSelection(createBlockSelection(state.doc, range)))
    return range
  }
  const selectedTexts = (activeEditor: Editor) => {
    const range = getSelectedBlockRange(activeEditor.state)
    if (!range) return null
    const texts: string[] = []
    activeEditor.state.doc.nodesBetween(range.from, range.to, (node, pos) => {
      if (pos < range.from) return true
      texts.push(node.textContent)
      return false
    })
    return texts
  }
  const startDrag = (activeEditor: Editor, text: string) => {
    hover(activeEditor, text)
    const event = new Event('dragstart', {cancelable: true})
    const dataTransfer = {clearData: jest.fn(), setDragImage: jest.fn(), setData: jest.fn()}
    Object.assign(event, {dataTransfer})
    handleOf(activeEditor).dispatchEvent(event)
  }
  const dropAt = (activeEditor: Editor, pos: number) => {
    jest.spyOn(activeEditor.view, 'posAtCoords').mockReturnValue({pos, inside: -1})
    const event = new Event('drop', {bubbles: true, cancelable: true})
    Object.assign(event, {
      clientX: 0,
      clientY: 0,
      dataTransfer: {getData: () => '', files: [], types: []}
    })
    activeEditor.view.dom.dispatchEvent(event)
  }
  const texts = (activeEditor: Editor) => {
    const all: string[] = []
    activeEditor.state.doc.descendants((node) => {
      if (node.type.name === 'paragraph' && node.textContent) all.push(node.textContent)
    })
    return all
  }
  const menuProps = () => jest.mocked(ReactRenderer).mock.calls.at(-1)?.[1].props

  describe('shift-clicking a handle', () => {
    test('stops the browser extending its own selection, until the editor is gone', () => {
      const activeEditor = makeEditor(p('one'))
      const handle = handleOf(activeEditor)
      const press = (shiftKey: boolean) => {
        const event = new MouseEvent('mousedown', {shiftKey, bubbles: true, cancelable: true})
        handle.dispatchEvent(event)
        return event.defaultPrevented
      }
      expect(press(true)).toBe(true)
      expect(press(false)).toBe(false)
      activeEditor.destroy()
      editor = undefined
      expect(press(true)).toBe(false)
    })

    test('selects from the block the caret is in through that block', () => {
      const activeEditor = makeEditor(p('one'), p('two'), p('three'), p('four'))
      putCaretIn(activeEditor, 'one')
      hover(activeEditor, 'three')
      clickHandle(activeEditor, true)
      expect(selectedTexts(activeEditor)).toEqual(['one', 'two', 'three'])
      expect(ReactRenderer).not.toHaveBeenCalled()
    })

    test('keeps the anchor block when shift-clicking again', () => {
      const activeEditor = makeEditor(p('one'), p('two'), p('three'), p('four'))
      putCaretIn(activeEditor, 'three')
      hover(activeEditor, 'one')
      clickHandle(activeEditor, true)
      expect(selectedTexts(activeEditor)).toEqual(['one', 'two', 'three'])
      hover(activeEditor, 'two')
      clickHandle(activeEditor, true)
      expect(selectedTexts(activeEditor)).toEqual(['two', 'three'])
      hover(activeEditor, 'four')
      clickHandle(activeEditor, true)
      expect(selectedTexts(activeEditor)).toEqual(['three', 'four'])
    })

    test('grows to the whole list when the run leaves it', () => {
      const activeEditor = makeEditor(p('one'), {
        type: 'bulletList',
        content: [li('a'), li('b')]
      })
      putCaretIn(activeEditor, 'one')
      hover(activeEditor, 'b')
      clickHandle(activeEditor, true)
      expect(selectedTexts(activeEditor)).toEqual(['one', 'ab'])
    })
  })

  describe('clicking a handle', () => {
    test('on a selected block opens the menu for the whole selection', () => {
      const activeEditor = makeEditor(p('one'), p('two'), p('three'), p('four'))
      const range = selectBlocks(activeEditor, 'one', 'three')
      hover(activeEditor, 'two')
      clickHandle(activeEditor)
      expect(menuProps()?.selection).toEqual({range, count: 3})
    })

    test('on a block outside the selection opens the menu for that block', () => {
      const activeEditor = makeEditor(p('one'), p('two'), p('three'), p('four'))
      selectBlocks(activeEditor, 'one', 'two')
      hover(activeEditor, 'four')
      clickHandle(activeEditor)
      expect(menuProps()?.selection).toBeNull()
    })

    test('hands the menu the page and atmosphere so it can offer Move to…', () => {
      const activeEditor = makeEditor(p('one'), p('two'))
      hover(activeEditor, 'two')
      clickHandle(activeEditor)
      expect(menuProps()?.pageId).toBe('page:1')
      expect(menuProps()?.atmosphere).toBe(mockAtmosphere)
    })

    test('on the one selected block opens the menu for that block', () => {
      const activeEditor = makeEditor(p('one'), p('two'))
      selectBlocks(activeEditor, 'two', 'two')
      hover(activeEditor, 'two')
      clickHandle(activeEditor)
      expect(menuProps()?.selection).toBeNull()
    })
  })

  describe('dragging a selected block', () => {
    test('drags the whole selection and keeps it selected', () => {
      const activeEditor = makeEditor(p('one'), p('two'), p('three'), p('four'))
      const range = selectBlocks(activeEditor, 'one', 'three')
      startDrag(activeEditor, 'two')
      const {dragging, state} = activeEditor.view
      expect(isNodeRangeSelection(state.selection)).toBe(true)
      expect(getSelectedBlockRange(state)).toEqual(range)
      expect(dragging?.move).toBe(true)
      expect(dragging?.slice.eq(state.doc.slice(range.from, range.to))).toBe(true)
      expect(jest.mocked(startBlockDrag).mock.calls[0]?.[1]).toMatchObject({count: 3})
    })

    test('reorders within the page with each block exactly once, still selected', () => {
      const activeEditor = makeEditor(p('one'), p('two'), p('three'), p('four'), p('five'))
      selectBlocks(activeEditor, 'one', 'three')
      startDrag(activeEditor, 'three')
      dropAt(activeEditor, blockAt(activeEditor, 'four').to)
      expect(texts(activeEditor)).toEqual(['four', 'one', 'two', 'three', 'five'])
      expect(selectedTexts(activeEditor)).toEqual(['one', 'two', 'three'])
    })

    test('reorders list items inside their list', () => {
      const activeEditor = makeEditor({
        type: 'bulletList',
        content: [li('a'), li('b'), li('c'), li('d')]
      })
      const range = selectBlocks(activeEditor, 'a', 'b')
      startDrag(activeEditor, 'a')
      expect(getSelectedBlockRange(activeEditor.state)).toEqual(range)
      dropAt(activeEditor, blockAt(activeEditor, 'c').to)
      const list = activeEditor.state.doc.child(1)
      expect(list.type.name).toBe('bulletList')
      expect(list.content.content.map((item) => item.textContent)).toEqual(['c', 'a', 'b', 'd'])
      expect(selectedTexts(activeEditor)).toEqual(['a', 'b'])
    })

    test('dragging a block outside the selection moves only that block', () => {
      const activeEditor = makeEditor(p('one'), p('two'), p('three'), p('four'))
      const oldRun = selectBlocks(activeEditor, 'one', 'two')
      startDrag(activeEditor, 'three')
      dropAt(activeEditor, blockAt(activeEditor, 'four').to)
      expect(texts(activeEditor)).toEqual(['one', 'two', 'four', 'three'])
      expect(getSelectedBlockRange(activeEditor.state)).not.toEqual(oldRun)
      expect(selectedTexts(activeEditor)).not.toEqual(['one', 'two'])
    })

    test('keeps a collaborator edit made inside the run mid-drag', () => {
      const activeEditor = makeEditor(p('one'), p('two'), p('three'), p('four'))
      selectBlocks(activeEditor, 'one', 'three')
      startDrag(activeEditor, 'two')
      const {state, view} = activeEditor
      view.dispatch(state.tr.insertText(' edited', blockAt(activeEditor, 'two').to - 1))
      const between = blockAt(activeEditor, 'two edited').to
      view.dispatch(
        activeEditor.state.tr.insert(between, activeEditor.schema.nodeFromJSON(p('inserted')))
      )
      dropAt(activeEditor, blockAt(activeEditor, 'four').to)
      expect(texts(activeEditor)).toEqual(['four', 'one', 'two edited', 'inserted', 'three'])
    })

    test('deletes no unrelated block when the run is gone by the drop', () => {
      const activeEditor = makeEditor(p('one'), p('two'), {type: 'horizontalRule'}, p('four'))
      selectBlocks(activeEditor, 'one', 'two')
      startDrag(activeEditor, 'one')
      const {from} = blockAt(activeEditor, 'one')
      const {to} = blockAt(activeEditor, 'two')
      activeEditor.view.dispatch(activeEditor.state.tr.delete(from, to))
      dropAt(activeEditor, blockAt(activeEditor, 'four').to)
      const types: string[] = []
      activeEditor.state.doc.forEach((node) => types.push(node.type.name))
      expect(types).toContain('horizontalRule')
      expect(texts(activeEditor)).toEqual(['four', 'one', 'two'])
    })

    test('a single dropped block is not turned into a block selection', () => {
      const activeEditor = makeEditor(p('one'), p('two'), p('three'))
      startDrag(activeEditor, 'one')
      dropAt(activeEditor, blockAt(activeEditor, 'two').to)
      expect(texts(activeEditor)).toEqual(['two', 'one', 'three'])
      expect(isNodeRangeSelection(activeEditor.state.selection)).toBe(false)
    })
  })
})
