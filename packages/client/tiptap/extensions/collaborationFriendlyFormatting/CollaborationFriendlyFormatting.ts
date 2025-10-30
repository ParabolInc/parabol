import type {CommandProps} from '@tiptap/core'
import {Extension} from '@tiptap/core'
import type {Mark} from '@tiptap/pm/model'
import type {EditorState} from '@tiptap/pm/state'
import {Plugin, PluginKey} from '@tiptap/pm/state'
import './types'

interface PendingMark {
  markType: string
  action: 'add' | 'remove'
}

interface PendingMarksState {
  marks: PendingMark[]
  position: number | null
  storedMarks: readonly Mark[]
  justSet: boolean
}

const pendingMarksKey = new PluginKey<PendingMarksState>('pendingMarks')

function createToggleMarkCommand(markType: string, toggleCommand: (commands: any) => boolean) {
  return () =>
    ({commands, state, tr, dispatch}: CommandProps) => {
      const {selection} = state

      if (!selection.empty) return toggleCommand(commands)
      if (!dispatch) return true

      const pendingState = pendingMarksKey.getState(state)
      const currentMarks = pendingState?.marks || []
      const pos = selection.$from.pos
      const inMark = isInMark(state, markType, tr)
      const pendingIndex = currentMarks.findIndex((m) => m.markType === markType)

      const newMarks: PendingMark[] =
        pendingIndex !== -1
          ? currentMarks.filter((m) => m.markType !== markType)
          : [...currentMarks, {markType, action: inMark ? 'remove' : 'add'}]

      tr.setMeta(pendingMarksKey, {
        marks: newMarks,
        position: pos,
        storedMarks: tr.storedMarks || selection.$from.marks()
      })

      dispatch(tr)
      return true
    }
}

function isInMark(state: EditorState, markType: string, tr: any): boolean {
  const {$from} = state.selection
  const pos = $from.pos

  const hasMark = $from.marks().some((mark: Mark) => mark.type.name === markType)
  const storedMarks = tr.storedMarks || $from.marks()
  const hasStoredMark = storedMarks.some((mark: Mark) => mark.type.name === markType)

  const nextPos = pos + 1
  const hasMarkNext =
    nextPos < state.doc.content.size &&
    state.doc
      .resolve(nextPos)
      .marks()
      .some((m: Mark) => m.type.name === markType)

  return hasMark || hasStoredMark || hasMarkNext
}

export const CollaborationFriendlyFormatting = Extension.create({
  name: 'collaborationFriendlyFormatting',

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-i': () => this.editor.commands.toggleItalic(),
      'Mod-u': () => this.editor.commands.toggleUnderline()
    }
  },

  addCommands() {
    return {
      toggleBold: createToggleMarkCommand('bold', (commands) => commands.toggleBold()),
      toggleItalic: createToggleMarkCommand('italic', (commands) => commands.toggleItalic()),
      toggleUnderline: createToggleMarkCommand('underline', (commands) =>
        commands.toggleUnderline()
      )
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pendingMarksKey,

        state: {
          init(): PendingMarksState {
            return {marks: [], position: null, storedMarks: [], justSet: false}
          },

          apply(tr, value): PendingMarksState {
            const meta = tr.getMeta(pendingMarksKey)
            if (meta !== undefined) return {...meta, justSet: true}

            if (value.justSet) return {...value, justSet: false}

            if (tr.selectionSet && !tr.getMeta('pointer')) {
              const oldPos = value.position
              const newPos = tr.selection.from
              if (oldPos !== null && oldPos !== newPos)
                return {marks: [], position: null, storedMarks: [], justSet: false}
            }

            return value
          }
        },

        appendTransaction(transactions, _oldState, newState) {
          const pendingState = pendingMarksKey.getState(newState)
          if (!pendingState || pendingState.marks.length === 0) return null

          let textInserted = false
          let insertPos = -1
          let insertedLength = 0

          for (const tr of transactions) {
            tr.steps.forEach((step: any) => {
              if (step.slice?.content?.firstChild?.isText) {
                textInserted = true
                insertPos = step.from
                insertedLength = step.slice.content.firstChild.text.length
              }
            })
          }

          if (textInserted && insertPos === pendingState.position) {
            const tr = newState.tr
            const {schema} = newState

            const baseMarkTypes = new Set(pendingState.storedMarks.map((mark) => mark.type.name))
            const finalMarkTypes = new Set(baseMarkTypes)

            for (const pendingMark of pendingState.marks) {
              if (pendingMark.action === 'add') finalMarkTypes.add(pendingMark.markType)
              else finalMarkTypes.delete(pendingMark.markType)
            }

            const allMarkTypes = ['bold', 'italic', 'underline']
            for (const markType of allMarkTypes) {
              const markSchema = schema.marks[markType]
              if (markSchema)
                tr.removeMark(insertPos, insertPos + insertedLength, markSchema.create())
            }

            for (const markType of finalMarkTypes) {
              const markSchema = schema.marks[markType]
              if (markSchema) tr.addMark(insertPos, insertPos + insertedLength, markSchema.create())
            }

            tr.setMeta(pendingMarksKey, {
              marks: [],
              position: null,
              storedMarks: [],
              justSet: false
            })
            return tr
          }

          return null
        }
      })
    ]
  }
})
