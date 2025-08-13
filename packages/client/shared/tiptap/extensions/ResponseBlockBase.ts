import {generateText} from '@tiptap/core'
import {mergeAttributes, Node, ReactNodeViewRenderer} from '@tiptap/react'
import {ResponseBlockView} from '../../../tiptap/extensions/insightsBlock/ResponseBlockView'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

export interface ResponseBlockAttrs {
  id: string
  preferredName: string
  avatar: string
  content: string
}

export const ResponseBlockBase = Node.create({
  name: 'responseBlock',

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
    const attrs = node.attrs as ResponseBlockAttrs
    const {content, preferredName} = attrs
    const plaintextContent = generateText(JSON.parse(content), serverTipTapExtensions)
    return `${preferredName}: ${plaintextContent}`
  },
  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(ResponseBlockView)
  }
})
