import {type Editor, Extension} from '@tiptap/core'
import {isNodeRangeSelection} from '@tiptap/extension-node-range'
import {
  type EditorState,
  Plugin,
  PluginKey,
  type Selection,
  type Transaction
} from '@tiptap/pm/state'
import {Decoration, DecorationSet, type EditorView} from '@tiptap/pm/view'
import {ySyncPluginKey} from '@tiptap/y-tiptap'
import {
  copyAsPlainLinks,
  createBlockSelection,
  extendBlockSelection,
  getAdjacentBlockUnit,
  getBlockRangeAtCaret,
  getBlockRangeOfSelection,
  getCaretAfterBlocks,
  getSelectedBlockRange,
  getTextCaretNear,
  isBlockRun,
  isRunCollapsedOntoNeighbor
} from '../blockSelection/blockSelectionState'
import type {BlockRange} from '../blockSelection/blockUnits'

const isActiveSuggestion = (pluginState: unknown) =>
  typeof pluginState === 'object' &&
  pluginState !== null &&
  'active' in pluginState &&
  pluginState.active === true &&
  'range' in pluginState &&
  'query' in pluginState

const isSuggestionOpen = (state: EditorState) =>
  state.plugins.some((plugin) => isActiveSuggestion(plugin.getState(state)))

const isTypedCharacter = (event: KeyboardEvent) =>
  event.key.length === 1 && !event.ctrlKey && !event.metaKey

const isComposition = (event: KeyboardEvent) =>
  event.isComposing || event.key === 'Process' || event.key === 'Dead' || event.keyCode === 229

const leaveForComposition = (view: EditorView) => {
  const range = view.editable ? getSelectedBlockRange(view.state) : null
  if (!range) return
  view.dispatch(view.state.tr.setSelection(getCaretAfterBlocks(view.state.doc, range)))
}

const keepBlockSelectionValid = (tr: Transaction, state: EditorState) => {
  if (!tr.docChanged) return
  const isRemote = !!tr.getMeta(ySyncPluginKey)?.isChangeOrigin
  const fallback = () => {
    const {from} = state.selection
    const pos = Math.min(isRemote ? from : tr.mapping.map(from), tr.doc.content.size)
    return getTextCaretNear(tr.doc.resolve(pos))
  }
  let selection: Selection
  try {
    selection = tr.selection
  } catch (error) {
    if (!isNodeRangeSelection(state.selection)) throw error
    tr.setSelection(fallback())
    return
  }
  if (!isNodeRangeSelection(selection)) return
  const range = getBlockRangeOfSelection(selection)
  const oldRange = isRemote ? getSelectedBlockRange(state) : null
  if (
    !range ||
    !isBlockRun(tr.doc, range) ||
    (oldRange && isRunCollapsedOntoNeighbor(state.doc, oldRange, tr.doc, range))
  ) {
    tr.setSelection(fallback())
  }
}

const EDITABLE_ELSEWHERE =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

const isEditableElsewhere = (view: EditorView, target: EventTarget | null) => {
  if (!(target instanceof Element)) return false
  const editable = target.closest(EDITABLE_ELSEWHERE)
  return !!editable && editable !== view.dom
}

const copyReadOnlyBlocks = (view: EditorView, event: ClipboardEvent) => {
  const {selection} = view.state
  const data = event.clipboardData
  if (view.editable || event.defaultPrevented || !data || !isNodeRangeSelection(selection)) return
  const doc = view.dom.ownerDocument
  if (doc.getSelection()?.isCollapsed === false) return
  if (isEditableElsewhere(view, event.target) || isEditableElsewhere(view, doc.activeElement))
    return
  const {dom, text} = view.serializeForClipboard(selection.content())
  event.preventDefault()
  data.clearData()
  data.setData('text/html', dom.innerHTML)
  data.setData('text/plain', text)
}

type BlockCommand = (props: {editor: Editor; range: BlockRange}) => boolean

const onBlockSelection =
  (command: BlockCommand) =>
  ({editor}: {editor: Editor}) => {
    if (!editor.isEditable) return false
    const range = getSelectedBlockRange(editor.state)
    return range ? command({editor, range}) : false
  }

const leaveBlockSelection: BlockCommand = ({editor, range}) => {
  const {state, view} = editor
  view.dispatch(state.tr.setSelection(getCaretAfterBlocks(state.doc, range)))
  return true
}

export const deleteBlocks: BlockCommand = ({editor, range}) => {
  const {state, view} = editor
  const tr = state.tr.deleteRange(range.from, range.to)
  const pos = Math.min(tr.mapping.map(range.from), tr.doc.content.size)
  view.dispatch(tr.setSelection(getTextCaretNear(tr.doc.resolve(pos))).scrollIntoView())
  return true
}

const selectAdjacentBlock =
  (dir: 1 | -1): BlockCommand =>
  ({editor, range}) => {
    const {state, view} = editor
    const unit = getAdjacentBlockUnit(state.doc, range, dir)
    if (unit)
      view.dispatch(state.tr.setSelection(createBlockSelection(state.doc, unit)).scrollIntoView())
    return true
  }

const extendSelection =
  (dir: 1 | -1): BlockCommand =>
  ({editor}) => {
    const {state, view} = editor
    if (!isNodeRangeSelection(state.selection)) return false
    const next = extendBlockSelection(state.doc, state.selection, dir)
    if (next) view.dispatch(state.tr.setSelection(next).scrollIntoView())
    return true
  }

export const duplicateBlocks: BlockCommand = ({editor, range}) => {
  const {state, view} = editor
  const copy = copyAsPlainLinks(state.doc.slice(range.from, range.to).content)
  const tr = state.tr.insert(range.to, copy)
  const copyRange = {from: range.to, to: range.to + copy.size, depth: range.depth}
  view.dispatch(tr.setSelection(createBlockSelection(tr.doc, copyRange)).scrollIntoView())
  return true
}

export const BlockSelection = Extension.create({
  name: 'blockSelection',
  priority: 1100,

  addKeyboardShortcuts() {
    return {
      Escape: ({editor}) => {
        if (!editor.isEditable) return false
        const {state, view} = editor
        const selected = getSelectedBlockRange(state)
        if (selected) return leaveBlockSelection({editor, range: selected})
        if (isSuggestionOpen(state)) return false
        const unit = getBlockRangeAtCaret(state)
        if (!unit) return false
        view.dispatch(state.tr.setSelection(createBlockSelection(state.doc, unit)))
        return true
      },
      Enter: onBlockSelection(leaveBlockSelection),
      Delete: onBlockSelection(deleteBlocks),
      Backspace: onBlockSelection(deleteBlocks),
      'Mod-d': onBlockSelection(duplicateBlocks),
      ArrowUp: onBlockSelection(selectAdjacentBlock(-1)),
      ArrowDown: onBlockSelection(selectAdjacentBlock(1)),
      'Shift-ArrowUp': onBlockSelection(extendSelection(-1)),
      'Shift-ArrowDown': onBlockSelection(extendSelection(1))
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('blockSelection'),
        view: (editorView) => {
          const doc = editorView.dom.ownerDocument
          const onCopy = (event: ClipboardEvent) => copyReadOnlyBlocks(editorView, event)
          doc.addEventListener('copy', onCopy)
          return {destroy: () => doc.removeEventListener('copy', onCopy)}
        },
        filterTransaction: (tr, state) => {
          keepBlockSelectionValid(tr, state)
          return true
        },
        props: {
          decorations: ({doc, selection}) => {
            if (!isNodeRangeSelection(selection)) return null
            return DecorationSet.create(
              doc,
              selection.ranges.map(({$from, $to}) =>
                Decoration.node($from.pos, $to.pos, {class: 'block-selected'})
              )
            )
          },
          attributes: (state): Record<string, string> =>
            isNodeRangeSelection(state.selection) ? {class: 'has-block-selection'} : {},
          handleTextInput: (view) => view.editable && isNodeRangeSelection(view.state.selection),
          handleKeyDown: (view, event) => {
            if (!view.editable || !isNodeRangeSelection(view.state.selection)) return false
            if (!isComposition(event)) return isTypedCharacter(event)
            leaveForComposition(view)
            return false
          },
          handleDOMEvents: {
            compositionstart: (view) => {
              leaveForComposition(view)
              return false
            }
          }
        }
      })
    ]
  }
})
