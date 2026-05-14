import {createBlockMarkdownSpec, generateText} from '@tiptap/core'
import {mergeAttributes, Node} from '@tiptap/react'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

export interface TaskBlockAttrs {
  id: string
  status: string
  preferredName: string
  avatar: string
  service?: string
  content: string
  // Snapshot of the retro discussion this task was created in, captured at meeting-end
  // time so summary pages render a stable backlink even after the underlying meeting
  // is renamed. All three fields are present together or all absent.
  retroMeetingName?: string
  retroTopicTitle?: string
  retroUrl?: string
}

export const TaskBlockBase = Node.create({
  name: 'taskBlock',

  isolating: true,

  defining: true,

  group: 'block',
  inline: false,
  atom: true,

  addAttributes() {
    return {
      id: {
        default: () => crypto.randomUUID(),
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => ({
          'data-id': attributes.id
        })
      },
      status: {
        default: 'active',
        parseHTML: (element) => element.getAttribute('data-status'),
        renderHTML: (attributes) => ({
          'data-status': attributes.status
        })
      },
      preferredName: {
        parseHTML: (element) => element.getAttribute('data-preferredname'),
        renderHTML: (attributes) => ({
          'data-preferredname': attributes.preferredName
        })
      },
      avatar: {
        parseHTML: (element) => element.getAttribute('data-avatar'),
        renderHTML: (attributes) => ({
          'data-avatar': attributes.avatar
        })
      },
      service: {
        parseHTML: (element) => element.getAttribute('data-service'),
        renderHTML: (attributes) => ({
          'data-service': attributes.service
        })
      },
      retroMeetingName: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-retro-meeting-name') ?? undefined,
        renderHTML: (attributes) =>
          attributes.retroMeetingName
            ? {'data-retro-meeting-name': attributes.retroMeetingName}
            : {}
      },
      retroTopicTitle: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-retro-topic-title') ?? undefined,
        renderHTML: (attributes) =>
          attributes.retroTopicTitle ? {'data-retro-topic-title': attributes.retroTopicTitle} : {}
      },
      retroUrl: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-retro-url') ?? undefined,
        renderHTML: (attributes) =>
          attributes.retroUrl ? {'data-retro-url': attributes.retroUrl} : {}
      },
      content: {
        default: ''
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
    return ['div', mergeAttributes(HTMLAttributes, {'data-type': this.name})]
  },
  renderText({node}) {
    const attrs = node.attrs as TaskBlockAttrs
    const {content} = attrs
    const plaintextContent = generateText(JSON.parse(content), serverTipTapExtensions)
    return `Task: ${plaintextContent}`
  },
  ...createBlockMarkdownSpec({
    nodeName: 'taskBlock'
  })
})
