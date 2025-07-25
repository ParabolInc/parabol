import {generateText} from '@tiptap/core'
import {mergeAttributes, Node} from '@tiptap/react'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

export interface TaskBlockAttrs {
  id: string
  status: string
  preferredName: string
  avatar: string
  service?: string
  content: string
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
  }
})
