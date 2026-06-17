import {mergeAttributes, Node} from '@tiptap/core'

export interface PopoverMentionAttrs {
  // the visible inline text
  label: string
  // a stringified TipTap document rendered in a popover when the label is hovered
  content: string
}

// An inline token that renders `label` and reveals a TipTap document in a hover popover.
export const PopoverMentionBase = Node.create({
  name: 'popoverMention',

  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      label: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-label') ?? '',
        renderHTML: (attrs) => ({'data-label': attrs.label})
      },
      content: {
        default: ''
      }
    }
  },

  parseHTML() {
    return [{tag: `span[data-type="${this.name}"]`}]
  },

  renderHTML({HTMLAttributes, node}) {
    return [
      'span',
      mergeAttributes({'data-type': this.name}, HTMLAttributes),
      (node.attrs as PopoverMentionAttrs).label
    ]
  },

  renderText({node}) {
    return (node.attrs as PopoverMentionAttrs).label
  }
})
