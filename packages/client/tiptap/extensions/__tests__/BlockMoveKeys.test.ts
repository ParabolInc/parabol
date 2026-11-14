import './installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import type Atmosphere from '../../../Atmosphere'
import {extensions, h, p} from '../../blockMove/__tests__/blockMoveTestHelpers'
import {openMoveToPageMenu} from '../../blockMove/openMoveToPageMenu'
import {posInText} from '../../blockSelection/__tests__/blockSelectionTestHelpers'
import {selectBlockRange} from '../../blockSelection/blockSelectionState'
import {normalizeBlockRange} from '../../blockSelection/blockUnits'
import {BlockMoveKeys} from '../BlockMoveKeys'
import {happyWindow} from './installHappyDom'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../blockMove/openMoveToPageMenu', () => ({openMoveToPageMenu: jest.fn()}))

const atmosphere = {} as Atmosphere
let editor: Editor | undefined
const makeEditor = (...blocks: JSONContent[]) => {
  const activeEditor = new Editor({
    element: document.createElement('div'),
    extensions: [...extensions, BlockMoveKeys.configure({atmosphere, pageId: 'page:1'})],
    content: {type: 'doc', content: [h(1, 'Title'), ...blocks]}
  })
  jest
    .spyOn(activeEditor.view, 'coordsAtPos')
    .mockReturnValue({top: 100, bottom: 124, left: 40, right: 41})
  editor = activeEditor
  return activeEditor
}
const runOf = (activeEditor: Editor, first: string, last: string) =>
  normalizeBlockRange(
    activeEditor.state.doc,
    posInText(activeEditor, first),
    posInText(activeEditor, last)
  )

const isMac = /Mac|iP(hone|[oa]d)/.test(navigator.platform)
const pressModShiftP = (activeEditor: Editor) => {
  const event = new KeyboardEvent('keydown', {
    key: 'P',
    keyCode: 80,
    shiftKey: true,
    metaKey: isMac,
    ctrlKey: !isMac,
    bubbles: true,
    cancelable: true
  })
  activeEditor.view.dom.dispatchEvent(event)
  return event
}

afterEach(() => {
  jest.clearAllMocks()
  editor?.destroy()
  editor = undefined
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

test('⌘⇧P opens the picker on the selected run', () => {
  const activeEditor = makeEditor(p('a'), p('b'), p('c'), p('d'))
  const range = runOf(activeEditor, 'b', 'c')!
  selectBlockRange(activeEditor, range)
  const event = pressModShiftP(activeEditor)
  expect(event.defaultPrevented).toBe(true)
  expect(openMoveToPageMenu).toHaveBeenCalledWith({
    editor: activeEditor,
    range,
    anchorRect: {top: 100, left: 40, width: 1, height: 24},
    pageId: 'page:1',
    atmosphere
  })
  expect(activeEditor.view.coordsAtPos).toHaveBeenCalledWith(range.from + 1)
})

test('⌘⇧P with a text selection across two blocks opens on both blocks', () => {
  const activeEditor = makeEditor(p('a'), p('b'), p('c'))
  activeEditor.commands.setTextSelection({
    from: posInText(activeEditor, 'a'),
    to: posInText(activeEditor, 'b')
  })
  pressModShiftP(activeEditor)
  expect(openMoveToPageMenu).toHaveBeenCalledWith(
    expect.objectContaining({range: runOf(activeEditor, 'a', 'b')})
  )
})

test('⌘⇧P with the caret in a block opens on that block', () => {
  const activeEditor = makeEditor(p('a'), p('b'))
  activeEditor.commands.setTextSelection(posInText(activeEditor, 'b'))
  pressModShiftP(activeEditor)
  expect(openMoveToPageMenu).toHaveBeenCalledWith(
    expect.objectContaining({range: runOf(activeEditor, 'b', 'b')})
  )
})

test('⌘⇧P in the title does nothing', () => {
  const activeEditor = makeEditor(p('a'))
  activeEditor.commands.setTextSelection(2)
  const event = pressModShiftP(activeEditor)
  expect(openMoveToPageMenu).not.toHaveBeenCalled()
  expect(event.defaultPrevented).toBe(false)
})

test('⌘⇧P in a read-only editor does nothing', () => {
  const activeEditor = makeEditor(p('a'))
  activeEditor.commands.setTextSelection(posInText(activeEditor, 'a'))
  activeEditor.setEditable(false)
  const event = pressModShiftP(activeEditor)
  expect(openMoveToPageMenu).not.toHaveBeenCalled()
  expect(event.defaultPrevented).toBe(false)
})
