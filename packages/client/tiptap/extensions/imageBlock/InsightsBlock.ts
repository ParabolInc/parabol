import {ReactNodeViewRenderer} from '@tiptap/react'
import ms from 'ms'
import type {MeetingTypeEnum} from '../../../__generated__/ExportToCSVQuery.graphql'
import {InsightsBlockBase} from '../../../shared/tiptap/extensions/InsightsBlockBase'
import {InsightsBlockView} from '../imageUpload/InsightsBlockView'

export interface InsightsBlockAttrs {
  teamIds: string[]
  meetingTypes: MeetingTypeEnum[]
  startAt: string
  endAt: string
  meetingIds: string[]
  title: string
}

export const InsightsBlock = InsightsBlockBase.extend({
  addAttributes() {
    return {
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
      startAt: {
        default: () => new Date(Date.now() - ms('12w')).toISOString(),
        parseHTML: (element) => new Date(element.getAttribute('data-start-at') as string),
        renderHTML: (attributes: InsightsBlockAttrs) => ({
          'data-start-at': attributes.startAt
        })
      },
      endAt: {
        default: () => new Date().toISOString(),
        parseHTML: (element) => new Date(element.getAttribute('data-end-at') as string),
        renderHTML: (attributes: InsightsBlockAttrs) => ({
          'data-end-at': attributes.endAt
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
      }
    }
  },
  addCommands() {
    return {
      setInsights:
        () =>
        ({commands}) => {
          return commands.insertContent({type: 'insightsBlock', text: 'Dirty title'})
        }
    }
  },

  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(InsightsBlockView)
  }
})
