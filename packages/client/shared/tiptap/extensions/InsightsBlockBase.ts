import {Node} from '@tiptap/react'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insightsBlock: {
      setInsights: () => ReturnType
    }
  }
}

export const InsightsBlockBase = Node.create({
  name: 'insightsBlock',

  isolating: true,

  defining: true,

  group: 'block',

  draggable: true,

  selectable: true,

  inline: false,

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`
      }
    ]
  },

  renderHTML() {
    return ['div', {'data-type': this.name}]
  }
})
