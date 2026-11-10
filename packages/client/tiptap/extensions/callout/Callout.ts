import {EditorState, TextSelection} from '@tiptap/pm/state'
import {Mapping} from '@tiptap/pm/transform'
import type {CalloutTone} from '../../../shared/tiptap/calloutTones'
import {CalloutBase} from '../../../shared/tiptap/extensions/CalloutBase'
import {calloutInputRule} from './calloutInputRule'
import {handleCalloutBackspace, handleCalloutEnter} from './calloutKeyboard'
import {unwrapCallout} from './unwrapCallout'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attrs?: {tone?: CalloutTone}) => ReturnType
      setCalloutTone: (pos: number, tone: CalloutTone) => ReturnType
      setCalloutEmoji: (pos: number, emoji: string | null) => ReturnType
      toggleCalloutTitle: (pos: number) => ReturnType
      unsetCallout: (pos: number) => ReturnType
    }
  }
}

export const Callout = CalloutBase.extend({
  addCommands() {
    return {
      setCallout:
        (attrs) =>
        ({commands}) =>
          commands.wrapIn(this.name, attrs),
      setCalloutTone:
        (pos, tone) =>
        ({tr, dispatch}) => {
          if (tr.doc.nodeAt(pos)?.type !== this.type) return false
          if (dispatch) tr.setNodeAttribute(pos, 'tone', tone)
          return true
        },
      setCalloutEmoji:
        (pos, emoji) =>
        ({tr, dispatch}) => {
          if (tr.doc.nodeAt(pos)?.type !== this.type) return false
          if (dispatch) tr.setNodeAttribute(pos, 'emoji', emoji)
          return true
        },
      toggleCalloutTitle:
        (pos) =>
        ({tr, dispatch, state}) => {
          const callout = tr.doc.nodeAt(pos)
          const {calloutTitle, paragraph} = state.schema.nodes
          if (callout?.type !== this.type || !calloutTitle || !paragraph) return false
          if (!dispatch) return true
          const title = callout.firstChild
          if (title?.type !== calloutTitle) {
            tr.insert(pos + 1, calloutTitle.create())
            tr.setSelection(TextSelection.create(tr.doc, pos + 2))
          } else if (title.content.size > 0) {
            tr.setNodeMarkup(pos + 1, paragraph)
          } else {
            tr.delete(pos + 1, pos + 1 + title.nodeSize)
          }
          return true
        },
      unsetCallout:
        (pos) =>
        ({tr, dispatch}) => {
          const current = EditorState.create({doc: tr.doc, selection: tr.selection})
          const unwrapped = unwrapCallout(current, pos)
          if (!unwrapped) return false
          if (dispatch) {
            unwrapped.steps.forEach((step) => tr.step(step))
            tr.setSelection(unwrapped.selection.map(tr.doc, new Mapping()))
          }
          return true
        }
    }
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({editor}) => handleCalloutEnter(editor),
      Backspace: ({editor}) => handleCalloutBackspace(editor)
    }
  },

  addInputRules() {
    return [calloutInputRule(this.type)]
  }
})
