import type {CommandProps} from '@tiptap/core'
import {Extension} from '@tiptap/core'
import type {Mark} from '@tiptap/pm/model'
import type {EditorState, Transaction} from '@tiptap/pm/state'
import {Plugin, PluginKey, TextSelection} from '@tiptap/pm/state'
import './types'

function insertMarkAndPosition(
  markType: string,
  state: EditorState,
  tr: Transaction,
  dispatch: ((tr: Transaction) => void) | undefined
): boolean {
  const {selection, schema} = state
  const {$from} = selection
  const pos = $from.pos

  // Check if cursor is in a mark of this type
  const hasMark = $from.marks().some((mark: Mark) => mark.type.name === markType)

  // Also check the next position (edge case: cursor at start of marked text)
  const nextPos = pos + 1
  const hasMarkNext =
    nextPos < state.doc.content.size &&
    state.doc
      .resolve(nextPos)
      .marks()
      .some((m: Mark) => m.type.name === markType)

  const isInMark = hasMark || hasMarkNext

  if (!dispatch) return true

  if (isInMark) {
    // Insert a zero-width space at cursor position to exit the mark
    const zeroWidthSpace = '\u200B'
    tr.insertText(zeroWidthSpace, pos)

    // Remove the mark from the inserted zero-width space
    // Without this, the zero-width space inherits the mark and cursor stays in marked region
    const markSchema = schema.marks[markType]
    if (markSchema) {
      const mark = markSchema.create()
      tr.removeMark(pos, pos + 1, mark)
    }

    // Position cursor after the zero-width space (now truly outside the mark)
    const newPos = pos + 1
    tr.setSelection(TextSelection.create(tr.doc, newPos))

    dispatch(tr)
    return true
  } else {
    // CASE 2: Not in marked region - create a marked span
    const markSchema = schema.marks[markType]

    if (!markSchema) return false

    const mark = markSchema.create()

    // Insert zero-width space with mark
    const zeroWidthSpace = '\u200B'
    tr.insertText(zeroWidthSpace, pos)
    tr.addMark(pos, pos + 1, mark)

    // Position cursor at the marked position (will be inside the mark for typing)
    tr.setSelection(TextSelection.create(tr.doc, pos + 1))

    dispatch(tr)
    return true
  }
}

export const CollaborationFriendlyFormatting = Extension.create({
  name: 'collaborationFriendlyFormatting',

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBoldWithMarks(),
      'Mod-i': () => this.editor.commands.toggleItalicWithMarks(),
      'Mod-u': () => this.editor.commands.toggleUnderlineWithMarks()
    }
  },

  addCommands() {
    return {
      toggleBoldWithMarks:
        () =>
        ({commands, state, tr, dispatch}: CommandProps) => {
          const {selection} = state

          // If there's a selection, use normal toggle behavior
          if (!selection.empty) {
            return commands.toggleBold()
          }

          // No selection: insert mark nodes and position cursor
          return insertMarkAndPosition('bold', state, tr, dispatch)
        },

      toggleItalicWithMarks:
        () =>
        ({commands, state, tr, dispatch}: CommandProps) => {
          const {selection} = state

          if (!selection.empty) {
            return commands.toggleItalic()
          }

          return insertMarkAndPosition('italic', state, tr, dispatch)
        },

      toggleUnderlineWithMarks:
        () =>
        ({commands, state, tr, dispatch}: CommandProps) => {
          const {selection} = state

          if (!selection.empty) {
            return commands.toggleUnderline()
          }

          return insertMarkAndPosition('underline', state, tr, dispatch)
        }
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('collaborationFriendlyFormattingCleanup'),

        /**
         * Clean up zero-width spaces that are no longer needed
         * This runs after each transaction to prevent accumulation
         */
        appendTransaction(_transactions, _oldState, newState) {
          const tr = newState.tr
          let modified = false

          // Find lone zero-width spaces (not between real content)
          newState.doc.descendants((node, pos) => {
            if (node.isText && node.text) {
              // Look for zero-width space that's alone or at boundaries
              const text = node.text

              // Check if it's ONLY a zero-width space
              if (text === '\u200B') {
                // Only remove if there's actual content after it AND that content has the same marks
                // (user has started typing with the mark applied)
                const $pos = newState.doc.resolve(pos + 1)
                const after = $pos.nodeAfter

                if (after && after.isText && after.text && after.text !== '\u200B') {
                  // Check if the zero-width space and the following text have the same marks
                  const zwsMarks = node.marks.map((m: Mark) => m.type.name).sort()
                  const afterMarks = after.marks.map((m: Mark) => m.type.name).sort()
                  const sameMarks =
                    zwsMarks.length === afterMarks.length &&
                    zwsMarks.every((mark: string, i: number) => mark === afterMarks[i])

                  if (sameMarks) {
                    // The text after has the same marks - user has successfully used the placeholder
                    tr.delete(pos, pos + 1)
                    modified = true
                  }
                }
              }
            }
          })

          return modified ? tr : null
        }
      })
    ]
  }
})
