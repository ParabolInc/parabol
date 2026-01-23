import {Mention} from '@tiptap/extension-mention'

export const MentionTaskTag = Mention.extend({
  name: 'taskTag',
  renderHTML({HTMLAttributes, node}) {
    return ['span', HTMLAttributes, `#${node.attrs.id}`]
  }
})
