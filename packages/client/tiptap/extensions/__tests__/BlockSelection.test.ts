import './installHappyDom'
import {Editor, Extension, type JSONContent} from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import {isNodeRangeSelection} from '@tiptap/extension-node-range'
import {NodeSelection, PluginKey, TextSelection} from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import * as Y from 'yjs'
import type Atmosphere from '../../../Atmosphere'
import {TiptapLinkExtension} from '../../../components/TipTapEditor/TiptapLinkExtension'
import {
  destroyEditors,
  extensions,
  h,
  li,
  link,
  p,
  rangeOf,
  seed,
  toggle
} from '../../blockMove/__tests__/blockMoveTestHelpers'
import {posInText, textsIn} from '../../blockSelection/__tests__/blockSelectionTestHelpers'
import {getSelectedBlockRange, selectBlockRange} from '../../blockSelection/blockSelectionState'
import {getBlockUnitAt, normalizeBlockRange} from '../../blockSelection/blockUnits'
import {BlockSelection} from '../BlockSelection'
import {PageDragHandle} from '../PageDragHandle'
import {keepUnownedPageLinksPlugin} from '../pageLinkBlock/keepUnownedPageLinksPlugin'
import {happyWindow} from './installHappyDom'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../blockMove/blockDragSession', () => ({
  endBlockDrag: jest.fn(),
  startBlockDrag: jest.fn()
}))
jest.mock('../../../hooks/usePageViewerAccess', () => ({
  __esModule: true,
  lookupPageViewerGrant: () => null
}))

const pageExtensions = [
  ...extensions.map((extension) =>
    extension.name === 'starterKit' ? extension.configure({link: false}) : extension
  ),
  TiptapLinkExtension,
  BlockSelection,
  PageDragHandle.configure({atmosphere: {} as Atmosphere, pageId: 'page:1'})
]

let editors: Editor[] = []
const track = (editor: Editor) => {
  editors.push(editor)
  return editor
}
const makeEditor = (...blocks: JSONContent[]) =>
  track(
    new Editor({
      element: document.createElement('div'),
      extensions: pageExtensions,
      content: {type: 'doc', content: [h(1, 'Title'), ...blocks]}
    })
  )

const isMac = /Mac|iP(hone|[oa]d)/.test(navigator.platform)
const press = (editor: Editor, key: string, modifiers: {shift?: boolean; mod?: boolean} = {}) => {
  const event = new KeyboardEvent('keydown', {
    key,
    shiftKey: !!modifiers.shift,
    metaKey: !!modifiers.mod && isMac,
    ctrlKey: !!modifiers.mod && !isMac,
    bubbles: true,
    cancelable: true
  })
  editor.view.dom.dispatchEvent(event)
  return event
}
const typeText = (editor: Editor, text: string) => {
  const {from, to} = editor.state.selection
  const handled = editor.view.someProp('handleTextInput', (f) =>
    f(editor.view, from, to, text, () => editor.state.tr.insertText(text, from, to))
  )
  if (!handled) editor.view.dispatch(editor.state.tr.insertText(text, from, to))
}

const caretIn = (editor: Editor, text: string, offset = 0) => {
  editor.commands.setTextSelection(posInText(editor, text) + offset)
}
const selectTexts = (editor: Editor, first: string, last = first) => {
  const range = normalizeBlockRange(
    editor.state.doc,
    posInText(editor, first),
    posInText(editor, last)
  )
  if (!range) throw new Error(`No block range from "${first}" to "${last}"`)
  selectBlockRange(editor, range)
}
const selectedTexts = (editor: Editor) => {
  const range = getSelectedBlockRange(editor.state)
  return range ? textsIn(editor, range) : null
}
const blockTexts = (editor: Editor) => {
  const texts: string[] = []
  editor.state.doc.forEach((node, _offset, index) => {
    if (index > 0) texts.push(node.textContent)
  })
  return texts
}

afterEach(() => {
  editors.forEach((editor) => {
    if (!editor.isDestroyed) editor.destroy()
  })
  editors = []
  destroyEditors()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

describe('selectBlockRange', () => {
  test('the selection ranges are exactly the sibling nodes of the run', () => {
    const editor = makeEditor(p('alpha'), {
      type: 'bulletList',
      content: [li('one'), li('two'), li('three')]
    })
    const range = normalizeBlockRange(
      editor.state.doc,
      posInText(editor, 'one'),
      posInText(editor, 'two')
    )!
    selectBlockRange(editor, range)
    const {selection} = editor.state
    expect(isNodeRangeSelection(selection)).toBe(true)
    expect(selection.ranges.map((r) => [r.$from.pos, r.$to.pos])).toEqual([
      [range.from, getBlockUnitAt(editor.state.doc, posInText(editor, 'one'))!.to],
      [getBlockUnitAt(editor.state.doc, posInText(editor, 'two'))!.from, range.to]
    ])
    expect(getSelectedBlockRange(editor.state)).toEqual(range)
    expect(selectedTexts(editor)).toEqual(['one', 'two'])
  })

  test('a caret or text selection is not a block selection', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    caretIn(editor, 'alpha')
    expect(getSelectedBlockRange(editor.state)).toBeNull()
  })
})

describe('Escape', () => {
  test('Escape selects the block the caret is in, Escape again clears', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    caretIn(editor, 'beta', 2)
    press(editor, 'Escape')
    expect(selectedTexts(editor)).toEqual(['beta'])
    press(editor, 'Escape')
    expect(getSelectedBlockRange(editor.state)).toBeNull()
    const {selection} = editor.state
    expect(selection.empty).toBe(true)
    expect(selection.$from.parent.textContent).toBe('beta')
    expect(selection.$from.parentOffset).toBe(4)
  })

  test('Escape on a list item selects just that item', () => {
    const editor = makeEditor({type: 'bulletList', content: [li('one'), li('two')]})
    caretIn(editor, 'two')
    press(editor, 'Escape')
    expect(selectedTexts(editor)).toEqual(['two'])
  })

  test('Escape with a text selection across blocks selects those blocks', () => {
    const editor = makeEditor(p('alpha'), p('beta'), p('gamma'))
    editor.commands.setTextSelection({
      from: posInText(editor, 'alpha') + 1,
      to: posInText(editor, 'beta') + 1
    })
    press(editor, 'Escape')
    expect(selectedTexts(editor)).toEqual(['alpha', 'beta'])
  })

  test('Escape in the title selects nothing', () => {
    const editor = makeEditor(p('alpha'))
    caretIn(editor, 'Title')
    press(editor, 'Escape')
    expect(getSelectedBlockRange(editor.state)).toBeNull()
  })

  test.each([
    ['a slash menu', 200],
    ['a mention menu', 101]
  ])('Escape in %s closes the menu and selects nothing', (_name, priority) => {
    const escapes: string[] = []
    let exits = 0
    const pluginKey = new PluginKey(`testSuggestion${priority}`)
    const TestSuggestion = Extension.create({
      name: `testSuggestion${priority}`,
      priority,
      addProseMirrorPlugins() {
        return [
          Suggestion({
            editor: this.editor,
            char: '/',
            pluginKey,
            items: () => ['Text'],
            render: () => ({
              onKeyDown: ({event}) => {
                escapes.push(event.key)
                return true
              },
              onExit: () => {
                exits++
              }
            })
          })
        ]
      }
    })
    const editor = track(
      new Editor({
        element: document.createElement('div'),
        extensions: [...pageExtensions, TestSuggestion],
        content: {type: 'doc', content: [h(1, 'Title'), p('alpha'), {type: 'paragraph'}]}
      })
    )
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    editor.commands.insertContent('/')
    expect(pluginKey.getState(editor.state).active).toBe(true)
    press(editor, 'Escape')
    expect(escapes).toEqual(['Escape'])
    expect(exits).toBe(1)
    expect(getSelectedBlockRange(editor.state)).toBeNull()
  })
})

describe('Shift+Arrow keys', () => {
  test('Shift+ArrowDown grows and Shift+ArrowUp shrinks', () => {
    const editor = makeEditor(p('alpha'), p('beta'), p('gamma'))
    selectTexts(editor, 'alpha')
    press(editor, 'ArrowDown', {shift: true})
    expect(selectedTexts(editor)).toEqual(['alpha', 'beta'])
    press(editor, 'ArrowDown', {shift: true})
    expect(selectedTexts(editor)).toEqual(['alpha', 'beta', 'gamma'])
    press(editor, 'ArrowUp', {shift: true})
    expect(selectedTexts(editor)).toEqual(['alpha', 'beta'])
    press(editor, 'ArrowUp', {shift: true})
    expect(selectedTexts(editor)).toEqual(['alpha'])
  })

  test('shrinking past the anchor flips direction', () => {
    const editor = makeEditor(p('alpha'), p('beta'), p('gamma'))
    selectTexts(editor, 'beta')
    press(editor, 'ArrowUp', {shift: true})
    expect(selectedTexts(editor)).toEqual(['alpha', 'beta'])
    press(editor, 'ArrowDown', {shift: true})
    expect(selectedTexts(editor)).toEqual(['beta'])
    press(editor, 'ArrowDown', {shift: true})
    expect(selectedTexts(editor)).toEqual(['beta', 'gamma'])
  })

  test('Shift+ArrowUp never reaches the title', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    selectTexts(editor, 'alpha')
    press(editor, 'ArrowUp', {shift: true})
    expect(selectedTexts(editor)).toEqual(['alpha'])
  })

  test('growing out of a list takes the whole list', () => {
    const editor = makeEditor(
      p('alpha'),
      {type: 'bulletList', content: [li('one'), li('two')]},
      p('gamma')
    )
    selectTexts(editor, 'two')
    press(editor, 'ArrowDown', {shift: true})
    expect(selectedTexts(editor)).toEqual(['onetwo', 'gamma'])
  })
})

describe('ArrowUp and ArrowDown', () => {
  test('ArrowDown selects just the next block, ArrowUp the one above', () => {
    const editor = makeEditor(p('alpha'), p('beta'), p('gamma'))
    selectTexts(editor, 'alpha', 'beta')
    press(editor, 'ArrowDown')
    expect(selectedTexts(editor)).toEqual(['gamma'])
    press(editor, 'ArrowUp')
    expect(selectedTexts(editor)).toEqual(['beta'])
  })

  test('arrows walk into and out of a list in document order', () => {
    const editor = makeEditor(
      p('alpha'),
      {type: 'bulletList', content: [li('one'), li('two')]},
      p('gamma')
    )
    selectTexts(editor, 'alpha')
    press(editor, 'ArrowDown')
    expect(selectedTexts(editor)).toEqual(['one'])
    press(editor, 'ArrowDown')
    press(editor, 'ArrowDown')
    expect(selectedTexts(editor)).toEqual(['gamma'])
    press(editor, 'ArrowUp')
    expect(selectedTexts(editor)).toEqual(['two'])
  })

  test('ArrowUp skips the children of a closed toggle', () => {
    const closed = {...toggle('summary', p('hidden')), attrs: {open: false}}
    const editor = makeEditor(p('alpha'), closed, p('gamma'))
    selectTexts(editor, 'gamma')
    press(editor, 'ArrowUp')
    expect(selectedTexts(editor)).toEqual(['summaryhidden'])
  })

  test('ArrowUp at the first block keeps the selection', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    selectTexts(editor, 'alpha')
    press(editor, 'ArrowUp')
    expect(selectedTexts(editor)).toEqual(['alpha'])
  })
})

describe('acting on a block selection', () => {
  test.each(['Delete', 'Backspace'])('%s removes every selected block', (key) => {
    const editor = makeEditor(p('alpha'), p('beta'), p('gamma'))
    selectTexts(editor, 'alpha', 'beta')
    press(editor, key)
    expect(blockTexts(editor)).toEqual(['gamma'])
    expect(getSelectedBlockRange(editor.state)).toBeNull()
  })

  test('Delete removes selected list items', () => {
    const editor = makeEditor({type: 'bulletList', content: [li('one'), li('two'), li('three')]})
    selectTexts(editor, 'one', 'two')
    press(editor, 'Delete')
    expect(blockTexts(editor)).toEqual(['three', ''])
  })

  test('Mod-d duplicates the run below it and selects the copy', () => {
    const editor = makeEditor(p('alpha'), p('beta'), p('gamma'))
    selectTexts(editor, 'alpha', 'beta')
    press(editor, 'd', {mod: true})
    expect(blockTexts(editor)).toEqual(['alpha', 'beta', 'alpha', 'beta', 'gamma'])
    const range = getSelectedBlockRange(editor.state)!
    expect(textsIn(editor, range)).toEqual(['alpha', 'beta'])
    expect(editor.state.doc.resolve(range.from).index()).toBe(3)
  })

  test('Mod-d copies a child page as a plain link', () => {
    const editor = makeEditor(p('alpha'), toggle('summary', link(7, 'Child', true)))
    selectTexts(editor, 'alpha', 'summary')
    press(editor, 'd', {mod: true})
    const canonical: boolean[] = []
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'pageLinkBlock') canonical.push(node.attrs.canonical)
    })
    expect(canonical).toEqual([true, false])
  })

  test('Mod-d and Delete without a block selection still act on the caret block', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    caretIn(editor, 'alpha')
    press(editor, 'd', {mod: true})
    expect(blockTexts(editor)).toEqual(['alpha', 'alpha', 'beta'])
    const {doc, tr} = editor.state
    editor.view.dispatch(tr.setSelection(NodeSelection.create(doc, doc.child(0).nodeSize)))
    press(editor, 'Delete')
    expect(blockTexts(editor)).toEqual(['alpha', 'beta'])
  })

  test('Delete puts back a child page the user cannot trash', () => {
    const KeepUnownedLinks = Extension.create({
      name: 'keepUnownedLinks',
      addProseMirrorPlugins: () => [keepUnownedPageLinksPlugin(() => 'editor')]
    })
    const editor = track(
      new Editor({
        element: document.createElement('div'),
        extensions: [...pageExtensions, KeepUnownedLinks],
        content: {
          type: 'doc',
          content: [h(1, 'Title'), p('alpha'), link(7, 'Child', true), p('beta'), p('gamma')]
        }
      })
    )
    selectTexts(editor, 'alpha', 'beta')
    press(editor, 'Delete')
    const links: {pageCode: number; canonical: boolean}[] = []
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'pageLinkBlock') {
        links.push({pageCode: node.attrs.pageCode, canonical: node.attrs.canonical})
      }
    })
    expect(links).toEqual([{pageCode: 7, canonical: true}])
    expect(blockTexts(editor)).toEqual(['', 'gamma'])
  })

  test.each([
    ['Process', {key: 'Process'}],
    ['Dead', {key: 'Dead'}],
    ['composing', {key: 'é', isComposing: true}],
    ['keyCode 229', {key: 'Unidentified', keyCode: 229}]
  ])('a composition keydown (%s) leaves the selection for plain text', (_name, init) => {
    const editor = makeEditor(p('alpha'), p('beta'), p('gamma'))
    selectTexts(editor, 'alpha', 'beta')
    const event = new KeyboardEvent('keydown', {...init, bubbles: true, cancelable: true})
    editor.view.dom.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(blockTexts(editor)).toEqual(['alpha', 'beta', 'gamma'])
    const {selection} = editor.state
    expect(getSelectedBlockRange(editor.state)).toBeNull()
    expect(selection.empty).toBe(true)
    expect(selection.$from.parent.textContent).toBe('beta')
    expect(selection.$from.parentOffset).toBe(4)
  })

  test('compositionstart leaves the selection for plain text', () => {
    const editor = makeEditor(p('alpha'), p('beta'), p('gamma'))
    selectTexts(editor, 'alpha', 'beta')
    editor.view.dom.dispatchEvent(new Event('compositionstart', {bubbles: true}))
    expect(getSelectedBlockRange(editor.state)).toBeNull()
    expect(editor.state.selection.$from.parent.textContent).toBe('beta')
  })

  test('typing a letter does nothing to a block selection', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    selectTexts(editor, 'alpha', 'beta')
    const event = press(editor, 'x')
    expect(event.defaultPrevented).toBe(true)
    typeText(editor, 'x')
    expect(blockTexts(editor)).toEqual(['alpha', 'beta'])
    expect(selectedTexts(editor)).toEqual(['alpha', 'beta'])
  })

  test('Enter leaves the selection with the caret at the end of the last block', () => {
    const editor = makeEditor(p('alpha'), p('beta'), p('gamma'))
    selectTexts(editor, 'alpha', 'beta')
    press(editor, 'Enter')
    expect(blockTexts(editor)).toEqual(['alpha', 'beta', 'gamma'])
    const {selection} = editor.state
    expect(getSelectedBlockRange(editor.state)).toBeNull()
    expect(selection.empty).toBe(true)
    expect(selection.$from.parent.textContent).toBe('beta')
    expect(selection.$from.parentOffset).toBe(4)
  })

  test('keys do nothing on a page that is not editable', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    selectTexts(editor, 'alpha')
    editor.setEditable(false)
    editor.commands.keyboardShortcut('ArrowDown')
    editor.commands.keyboardShortcut('Escape')
    expect(blockTexts(editor)).toEqual(['alpha', 'beta'])
    expect(selectedTexts(editor)).toEqual(['alpha'])
  })
})

describe('a run that ends in an atom', () => {
  const selectThroughLink = (editor: Editor, first: string) => {
    const from = getBlockUnitAt(editor.state.doc, posInText(editor, first))!.from
    selectBlockRange(editor, {from, to: rangeOf(editor, 'pageLinkBlock', 0).to, depth: 0})
  }
  const linkCount = (editor: Editor) => {
    let count = 0
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'pageLinkBlock') count++
    })
    return count
  }

  test('Enter leaves a text caret, and typing a letter keeps the link', () => {
    const editor = makeEditor(p('alpha'), p('beta'), link(7, 'Child', false), p('gamma'))
    selectThroughLink(editor, 'alpha')
    press(editor, 'Enter')
    expect(editor.state.selection).toBeInstanceOf(TextSelection)
    typeText(editor, 'x')
    expect(linkCount(editor)).toBe(1)
    expect(blockTexts(editor)).toEqual(['alpha', 'betax', '', 'gamma'])
  })

  test('Escape twice reaches a caret, never a selected link', () => {
    const editor = makeEditor(p('alpha'), link(7, 'Child', false), p('gamma'))
    selectThroughLink(editor, 'alpha')
    press(editor, 'Escape')
    expect(editor.state.selection).toBeInstanceOf(TextSelection)
    press(editor, 'Escape')
    expect(selectedTexts(editor)).toEqual(['alpha'])
    press(editor, 'Escape')
    expect(editor.state.selection).toBeInstanceOf(TextSelection)
    expect(editor.state.selection).not.toBeInstanceOf(NodeSelection)
  })

  test('Delete before a link leaves a text caret and keeps the link', () => {
    const editor = makeEditor(p('alpha'), p('beta'), link(7, 'Child', false), p('gamma'))
    selectTexts(editor, 'beta')
    press(editor, 'Delete')
    expect(editor.state.selection).toBeInstanceOf(TextSelection)
    expect(linkCount(editor)).toBe(1)
  })
})

describe('copying on a read-only page', () => {
  const copyOn = (target: EventTarget) => {
    const data = new Map<string, string>()
    const event = new Event('copy', {bubbles: true, cancelable: true})
    Object.defineProperty(event, 'clipboardData', {
      value: {
        clearData: () => data.clear(),
        setData: (type: string, value: string) => data.set(type, value),
        getData: (type: string) => data.get(type) ?? ''
      }
    })
    target.dispatchEvent(event)
    return {data, event}
  }

  test('a read-only editor never takes a tabindex, so a viewer cannot focus it', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    editor.setEditable(false)
    expect(editor.view.dom.hasAttribute('tabindex')).toBe(false)
    editor.setEditable(true)
    editor.setEditable(false)
    expect(editor.view.dom.hasAttribute('tabindex')).toBe(false)
  })

  test('copy anywhere on the page puts the selected blocks on the clipboard', () => {
    const editor = makeEditor(p('alpha'), p('beta'), p('gamma'))
    editor.setEditable(false)
    selectTexts(editor, 'alpha', 'beta')
    const {data, event} = copyOn(document)
    expect(event.defaultPrevented).toBe(true)
    expect(data.get('text/plain')).toContain('alpha')
    expect(data.get('text/plain')).toContain('beta')
    expect(data.get('text/plain')).not.toContain('gamma')
    expect(data.get('text/html')).toContain('<p>beta</p>')
  })

  test('copy on the page body still puts the selected blocks on the clipboard', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    editor.setEditable(false)
    selectTexts(editor, 'alpha', 'beta')
    const {data, event} = copyOn(document.body)
    expect(event.defaultPrevented).toBe(true)
    expect(data.get('text/plain')).toContain('beta')
  })

  test('copy from a textarea leaves the clipboard alone', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    editor.setEditable(false)
    selectTexts(editor, 'alpha', 'beta')
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    const {data, event} = copyOn(textarea)
    expect(event.defaultPrevented).toBe(false)
    expect(data.size).toBe(0)
    textarea.remove()
  })

  test('copy from another editable region leaves the clipboard alone', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    editor.setEditable(false)
    selectTexts(editor, 'alpha', 'beta')
    const comment = document.createElement('div')
    comment.setAttribute('contenteditable', 'true')
    const line = document.createElement('p')
    comment.appendChild(line)
    document.body.appendChild(comment)
    const {data, event} = copyOn(line)
    expect(event.defaultPrevented).toBe(false)
    expect(data.size).toBe(0)
    comment.remove()
  })

  test('copy while focus is in a textarea leaves the clipboard alone', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    editor.setEditable(false)
    selectTexts(editor, 'alpha', 'beta')
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()
    const {data} = copyOn(document.body)
    expect(data.size).toBe(0)
    textarea.remove()
  })

  test('copy leaves the clipboard alone on an editable page', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    selectTexts(editor, 'alpha', 'beta')
    const {data, event} = copyOn(document)
    expect(event.defaultPrevented).toBe(false)
    expect(data.size).toBe(0)
  })

  test('copy leaves the clipboard alone without a block selection', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    editor.setEditable(false)
    caretIn(editor, 'alpha')
    const {data, event} = copyOn(document)
    expect(event.defaultPrevented).toBe(false)
    expect(data.size).toBe(0)
  })

  test('copy of text the viewer selected elsewhere is not replaced by the blocks', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    editor.setEditable(false)
    selectTexts(editor, 'alpha', 'beta')
    const elsewhere = document.createElement('p')
    elsewhere.textContent = 'a comment'
    document.body.appendChild(elsewhere)
    document.getSelection()!.selectAllChildren(elsewhere)
    const {data, event} = copyOn(elsewhere)
    expect(event.defaultPrevented).toBe(false)
    expect(data.size).toBe(0)
    document.getSelection()!.removeAllRanges()
    elsewhere.remove()
  })

  test('the listener is removed when the editor is destroyed', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    editor.setEditable(false)
    selectTexts(editor, 'alpha', 'beta')
    editor.destroy()
    const {data} = copyOn(document)
    expect(data.size).toBe(0)
  })
})

describe('leaving a block selection', () => {
  test('clicking into text clears the block selection', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    selectTexts(editor, 'alpha', 'beta')
    caretIn(editor, 'alpha', 2)
    expect(getSelectedBlockRange(editor.state)).toBeNull()
  })

  test('a text selection across blocks stays a text selection', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    editor.commands.setTextSelection({
      from: posInText(editor, 'alpha') + 1,
      to: posInText(editor, 'beta') + 2
    })
    expect(editor.state.selection).toBeInstanceOf(TextSelection)
    expect(getSelectedBlockRange(editor.state)).toBeNull()
  })
})

describe('rendering', () => {
  test('selected blocks carry the block-selected class', () => {
    const editor = makeEditor(p('alpha'), p('beta'), p('gamma'))
    selectTexts(editor, 'alpha', 'beta')
    const selected = editor.view.dom.querySelectorAll('.block-selected')
    expect(Array.from(selected).map((el) => el.textContent)).toEqual(['alpha', 'beta'])
    expect(editor.view.dom.classList.contains('has-block-selection')).toBe(true)
    caretIn(editor, 'gamma')
    expect(editor.view.dom.querySelectorAll('.block-selected')).toHaveLength(0)
    expect(editor.view.dom.classList.contains('has-block-selection')).toBe(false)
  })

  test('a read-only page still shows a block selection', () => {
    const editor = makeEditor(p('alpha'), p('beta'))
    editor.setEditable(false)
    selectTexts(editor, 'alpha', 'beta')
    expect(editor.view.dom.querySelectorAll('.block-selected')).toHaveLength(2)
  })
})

describe('a change under a block selection', () => {
  test('deleting the list around selected items does not throw', () => {
    const editor = makeEditor(
      p('alpha'),
      {type: 'bulletList', content: [li('one'), li('two')]},
      p('gamma')
    )
    selectTexts(editor, 'one', 'two')
    const list = rangeOf(editor, 'bulletList', 0)
    expect(() => editor.view.dispatch(editor.state.tr.delete(list.from, list.to))).not.toThrow()
    expect(blockTexts(editor)).toEqual(['alpha', 'gamma'])
    expect(getSelectedBlockRange(editor.state)).toBeNull()
  })

  test('the caret stays next to a local edit that removes the selection', () => {
    const editor = makeEditor(
      p('alpha'),
      p('beta'),
      {type: 'bulletList', content: [li('one'), li('two')]},
      p('gamma'),
      p('delta')
    )
    selectTexts(editor, 'one', 'two')
    const from = editor.state.doc.child(0).nodeSize
    const list = rangeOf(editor, 'bulletList', 0)
    editor.view.dispatch(editor.state.tr.delete(from, list.to))
    expect(blockTexts(editor)).toEqual(['gamma', 'delta'])
    expect(getSelectedBlockRange(editor.state)).toBeNull()
    expect(editor.state.selection.$from.parent.textContent).toBe('gamma')
  })
})

describe('collaboration', () => {
  const makeCollabEditor = (ydoc: Y.Doc) =>
    track(
      new Editor({
        element: document.createElement('div'),
        extensions: [
          ...extensions.map((extension) =>
            extension.name === 'starterKit' ? extension.configure({undoRedo: false}) : extension
          ),
          Collaboration.configure({document: ydoc}),
          BlockSelection
        ]
      })
    )
  const remoteEdit = (ydoc: Y.Doc, edit: (frag: Y.XmlFragment) => void) => {
    const remote = new Y.Doc()
    Y.applyUpdate(remote, Y.encodeStateAsUpdate(ydoc))
    edit(remote.getXmlFragment('default'))
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(remote, Y.encodeStateVector(ydoc)))
  }

  test('a remote change elsewhere keeps the block selection', () => {
    const frag = seed(h(1, 'Title'), p('alpha'), p('beta'), p('gamma'))
    const editor = makeCollabEditor(frag.doc!)
    selectTexts(editor, 'alpha', 'beta')
    remoteEdit(frag.doc!, (remoteFrag) => {
      ;((remoteFrag.get(3) as Y.XmlElement).get(0) as Y.XmlText).insert(0, 'new ')
    })
    expect(blockTexts(editor)).toEqual(['alpha', 'beta', 'new gamma'])
    expect(selectedTexts(editor)).toEqual(['alpha', 'beta'])
  })

  test('a remote delete of the selected list does not throw', () => {
    const frag = seed(
      h(1, 'Title'),
      p('alpha'),
      {type: 'bulletList', content: [li('one'), li('two')]},
      p('gamma')
    )
    const editor = makeCollabEditor(frag.doc!)
    selectTexts(editor, 'one', 'two')
    expect(() =>
      remoteEdit(frag.doc!, (remoteFrag) => {
        remoteFrag.delete(2, 1)
      })
    ).not.toThrow()
    expect(blockTexts(editor)).toEqual(['alpha', 'gamma'])
    expect(getSelectedBlockRange(editor.state)).toBeNull()
    expect(editor.state.selection).toBeInstanceOf(TextSelection)
  })

  test('a remote delete of every selected block never selects the title', () => {
    const frag = seed(h(1, 'Title'), p('alpha'), p('beta'))
    const editor = makeCollabEditor(frag.doc!)
    selectTexts(editor, 'alpha', 'beta')
    remoteEdit(frag.doc!, (remoteFrag) => {
      remoteFrag.delete(1, 2)
    })
    expect(blockTexts(editor)).toEqual([''])
    expect(editor.view.dom.querySelectorAll('h1.block-selected')).toHaveLength(0)
    expect(getSelectedBlockRange(editor.state)).toBeNull()
    expect(editor.state.selection).toBeInstanceOf(TextSelection)
  })

  test('a remote delete of every selected block leaves a caret, not the next block selected', () => {
    const frag = seed(h(1, 'Title'), p('alpha'), p('beta'), p('gamma'), p('delta'))
    const editor = makeCollabEditor(frag.doc!)
    selectTexts(editor, 'alpha', 'beta')
    remoteEdit(frag.doc!, (remoteFrag) => {
      remoteFrag.delete(1, 2)
    })
    expect(blockTexts(editor)).toEqual(['gamma', 'delta'])
    expect(getSelectedBlockRange(editor.state)).toBeNull()
    expect(editor.state.selection).toBeInstanceOf(TextSelection)
  })

  test('a remote edit inside the only selected block keeps it selected', () => {
    const frag = seed(h(1, 'Title'), p('alpha'), p('beta'))
    const editor = makeCollabEditor(frag.doc!)
    selectTexts(editor, 'alpha')
    remoteEdit(frag.doc!, (remoteFrag) => {
      ;((remoteFrag.get(1) as Y.XmlElement).get(0) as Y.XmlText).insert(0, 'new ')
    })
    expect(selectedTexts(editor)).toEqual(['new alpha'])
  })
})
