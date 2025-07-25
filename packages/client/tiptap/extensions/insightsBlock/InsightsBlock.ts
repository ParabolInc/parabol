import {Node} from '@tiptap/pm/model'
import {TextSelection} from '@tiptap/pm/state'
import {ReactNodeViewRenderer} from '@tiptap/react'
import type {MarkdownNodeSpec} from 'tiptap-markdown'
import type {MeetingTypeEnum} from '../../../__generated__/ExportToCSVQuery.graphql'
import {InsightsBlockBase} from '../../../shared/tiptap/extensions/InsightsBlockBase'
import {InsightsBlockView} from './InsightsBlockView'

export interface InsightsBlockAttrs {
  editing: boolean
  error?: 'disabled' | 'nodata'
  teamIds: string[]
  meetingTypes: MeetingTypeEnum[]
  after: string
  before: string
  meetingIds: string[]
  title: string
  id: string
  hash: string
  prompt: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insightsBlock: {
      setInsights: () => ReturnType
      exitNode: () => ReturnType
    }
  }
  interface Storage {
    markdown: {
      serializer: {
        serialize: (node: Node) => string
      }
    }
  }
}
export const InsightsBlock = InsightsBlockBase.extend<any, {markdown: MarkdownNodeSpec}>({
  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          state.renderContent(node)
        }
      }
    }
  },
  addCommands() {
    return {
      setInsights:
        () =>
        ({editor, commands}) => {
          const {to} = editor.state.selection
          const size = editor.state.doc.content.size
          const content = [{type: 'insightsBlock'}]
          if (size - to <= 1) {
            content.push({type: 'paragraph'})
          }
          return commands.insertContent(content)
        },
      exitNode:
        () =>
        ({state, dispatch}) => {
          const {selection, doc} = state
          const {$head} = selection
          // depth === 0 when cursor is at gapcursor at bottom of node
          const nextNodePos = $head.depth === 0 ? null : $head.after()
          const nextNode = nextNodePos ? doc.nodeAt(nextNodePos) : $head.nodeBefore

          // Check if there is a next node and it is an `insightsBlock`
          if (!(nextNode?.type.name === 'insightsBlock' && doc.lastChild === nextNode && dispatch))
            return false
          const insertPos = doc.nodeSize - 2
          const tr = state.tr.insert(insertPos, state.schema.nodes.paragraph!.create())
          tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos + 1))) // Move cursor into the new paragraph
          dispatch(tr)
          return true
        }
    }
  },

  addKeyboardShortcuts() {
    return {
      ArrowDown: () => {
        return this.editor.commands.exitNode()
      }
    }
  },

  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(InsightsBlockView)
  }
})
