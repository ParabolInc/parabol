import {TextSelection} from '@tiptap/pm/state'
import {ReactNodeViewRenderer} from '@tiptap/react'
import ms from 'ms'
import type {MeetingTypeEnum} from '../../../__generated__/ExportToCSVQuery.graphql'
import {InsightsBlockBase} from '../../../shared/tiptap/extensions/InsightsBlockBase'
import {InsightsBlockView} from './InsightsBlockView'

export interface InsightsBlockAttrs {
  editing: boolean
  teamIds: string[]
  meetingTypes: MeetingTypeEnum[]
  after: string
  before: string
  meetingIds: string[]
  title: string
  id: string
  hash: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insightsBlock: {
      setInsights: () => ReturnType
      exitNode: () => ReturnType
    }
  }
}
export const InsightsBlock = InsightsBlockBase.extend({
  addAttributes() {
    return {
      editing: {
        default: true,
        parseHTML: (element) => element.getAttribute('editing'),
        renderHTML: (attributes) => ({
          editing: attributes.editing
        })
      },
      teamIds: {
        default: [],
        parseHTML: (element) => element.getAttribute('data-team-ids')!.split(','),
        renderHTML: (attributes) => ({
          'data-team-ids': attributes.teamIds.join(',')
        })
      },
      meetingTypes: {
        default: ['retrospective'],
        parseHTML: (element) => element.getAttribute('data-meeting-types'),
        renderHTML: (attributes) => ({
          'data-meeting-types': attributes.meetingTypes
        })
      },
      after: {
        default: () => new Date(Date.now() - ms('12w')).toISOString(),
        parseHTML: (element) => new Date(element.getAttribute('data-after') as string),
        renderHTML: (attributes: InsightsBlockAttrs) => ({
          'data-after': attributes.after
        })
      },
      before: {
        default: () => new Date().toISOString(),
        parseHTML: (element) => new Date(element.getAttribute('data-before') as string),
        renderHTML: (attributes: InsightsBlockAttrs) => ({
          'data-before': attributes.before
        })
      },
      meetingIds: {
        default: [],
        parseHTML: (element) => element.getAttribute('data-meeting-ids'),
        renderHTML: (attributes) => ({
          'data-meeting-ids': attributes.meetingIds
        })
      },
      title: {
        default: 'Latest Team Insights',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => ({
          'data-title': attributes.title
        })
      },
      hash: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-hash'),
        renderHTML: (attributes) => ({
          'data-hash': attributes.hash
        })
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
