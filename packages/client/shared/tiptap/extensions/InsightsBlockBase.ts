import {mergeAttributes, Node} from '@tiptap/react'
import ms from 'ms'

export const InsightsBlockBase = Node.create({
  name: 'insightsBlock',

  isolating: true,

  defining: true,

  group: 'block',

  content: 'block*',

  draggable: true,

  selectable: true,

  inline: false,

  addAttributes() {
    return {
      id: {
        default: () => crypto.randomUUID(),
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => ({
          'data-id': attributes.id
        })
      },

      editing: {
        default: true,
        parseHTML: (element) => {
          return element.getAttribute('data-editing') === '' ? true : false
        },
        renderHTML: (attributes) => {
          return {
            'data-editing': attributes.editing ? '' : undefined
          }
        }
      },
      teamIds: {
        default: [],
        parseHTML: (element) => {
          return element.getAttribute('data-team-ids')?.split(',') ?? []
        },
        renderHTML: ({teamIds}) => ({
          'data-team-ids': teamIds.length ? teamIds.join(',') : undefined
        })
      },
      meetingTypes: {
        default: ['retrospective'],
        parseHTML: (element) => element.getAttribute('data-meeting-types')?.split(',') ?? [],
        renderHTML: ({meetingTypes}) => ({
          'data-meeting-types': meetingTypes.length ? meetingTypes.join(',') : undefined
        })
      },
      after: {
        default: () => new Date(Date.now() - ms('12w')).toISOString(),
        parseHTML: (element) =>
          new Date(element.getAttribute('data-after') as string).toISOString(),
        renderHTML: (attributes) => ({
          'data-after': attributes.after
        })
      },
      before: {
        default: () => new Date().toISOString(),
        parseHTML: (element) =>
          new Date(element.getAttribute('data-before') as string).toISOString(),
        renderHTML: (attributes) => ({
          'data-before': attributes.before
        })
      },
      meetingIds: {
        default: [],
        parseHTML: (element) => element.getAttribute('data-meeting-ids')?.split(',') ?? [],
        renderHTML: ({meetingIds}) => ({
          'data-meeting-ids': meetingIds.length ? meetingIds.join(',') : undefined
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
      },
      prompt: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-prompt'),
        renderHTML: (attributes) => ({
          'data-prompt': attributes.prompt
        })
      },
      error: {
        parseHTML: (element) => element.getAttribute('data-error'),
        renderHTML: (attributes) => ({
          'data-error': attributes.error
        })
      }
    }
  },
  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`
      }
    ]
  },

  renderHTML({HTMLAttributes}) {
    return ['div', mergeAttributes(HTMLAttributes, {'data-type': this.name}), 0]
  }
})
