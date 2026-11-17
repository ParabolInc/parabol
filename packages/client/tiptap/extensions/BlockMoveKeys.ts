import {Extension} from '@tiptap/core'
import type Atmosphere from '../../Atmosphere'
import {moveBlocksBy} from '../blockMove/moveBlocksBy'
import {openMoveToPageMenu} from '../blockMove/openMoveToPageMenu'
import {getBlockRangeAtCaret, getSelectedBlockRange} from '../blockSelection/blockSelectionState'

type Options = {atmosphere: Atmosphere; pageId: string}

export const BlockMoveKeys = Extension.create<Options>({
  name: 'blockMoveKeys',

  addKeyboardShortcuts() {
    const {atmosphere, pageId} = this.options
    return {
      'Mod-Shift-ArrowUp': ({editor}) => editor.isEditable && moveBlocksBy(editor, 'up'),
      'Mod-Shift-ArrowDown': ({editor}) => editor.isEditable && moveBlocksBy(editor, 'down'),
      'Mod-Shift-p': ({editor}) => {
        if (!editor.isEditable) return false
        const {state, view} = editor
        const range = getSelectedBlockRange(state) ?? getBlockRangeAtCaret(state)
        if (!range) return false
        const {top, bottom, left} = view.coordsAtPos(range.from + 1)
        const anchorRect = {top, left, width: 1, height: bottom - top}
        openMoveToPageMenu({editor, range, anchorRect, pageId, atmosphere})
        return true
      }
    }
  }
})
