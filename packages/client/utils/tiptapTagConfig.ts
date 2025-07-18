import {MentionNodeAttrs, MentionOptions} from '@tiptap/extension-mention'
import {PluginKey} from '@tiptap/pm/state'
import {TaskTagDropdown} from '../components/TaskTagDropdown'
import renderSuggestion from '../tiptap/extensions/renderSuggestion'

const tags = [
  {
    id: 'private',
    label: 'Only you will be able to see this task'
  },
  {
    id: 'archived',
    label: 'Hidden from your main board'
  }
]

export const tiptapTagConfig: Partial<MentionOptions<any, MentionNodeAttrs>> = {
  // renderText does not fire, bug in TipTap? Fallback to using more verbose renderHTML
  renderHTML({options, node}) {
    return ['span', options.HTMLAttributes, `#${node.attrs.id}`]
  },
  deleteTriggerWithBackspace: true,
  suggestion: {
    pluginKey: new PluginKey('tag'),
    char: '#',
    items: async ({query}) => {
      if (!query) return tags
      return tags.filter((tag) => tag.id.startsWith(query.toLowerCase()))
    },

    // Using radix-ui isn't possible here because radix-ui will steal focus from the editor when it opens the portal
    // radix-ui also requires a trigger/anchor
    render: renderSuggestion(TaskTagDropdown)
  }
}
