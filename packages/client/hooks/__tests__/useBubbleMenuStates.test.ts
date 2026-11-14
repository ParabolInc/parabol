import '../../tiptap/extensions/__tests__/installHappyDom'
import {TextSelection} from '@tiptap/pm/state'
import type {Editor} from '@tiptap/react'
import {destroyEditors, makeEditor, p} from '../../tiptap/blockMove/__tests__/blockMoveTestHelpers'
import {posInText} from '../../tiptap/blockSelection/__tests__/blockSelectionTestHelpers'
import {selectBlockRange} from '../../tiptap/blockSelection/blockSelectionState'
import {normalizeBlockRange} from '../../tiptap/blockSelection/blockUnits'
import {happyWindow} from '../../tiptap/extensions/__tests__/installHappyDom'
import {getShouldShow} from '../useBubbleMenuStates'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../tiptap/isCustomNodeSelected', () => ({isCustomNodeSelected: () => false}))

const focusedEditor = () => {
  const editor = makeEditor(p('alpha'), p('beta'))
  document.body.appendChild(editor.view.dom)
  editor.view.dom.focus()
  return editor as unknown as Editor
}

afterEach(() => {
  document.body.innerHTML = ''
  destroyEditors()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

describe('getShouldShow', () => {
  test('shows for a text selection', () => {
    const editor = focusedEditor()
    const {doc} = editor.state
    const from = posInText(editor, 'alpha')
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(doc, from, from + 3)))
    expect(getShouldShow(editor)).toBe(true)
  })

  test('hides over a block selection', () => {
    const editor = focusedEditor()
    const range = normalizeBlockRange(
      editor.state.doc,
      posInText(editor, 'alpha'),
      posInText(editor, 'beta')
    )!
    selectBlockRange(editor, range)
    expect(getShouldShow(editor)).toBe(false)
  })
})
