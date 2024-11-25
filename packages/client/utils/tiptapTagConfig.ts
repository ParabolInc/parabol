import {MentionNodeAttrs, MentionOptions} from '@tiptap/extension-mention'
import {PluginKey} from '@tiptap/pm/state'
import {ReactRenderer} from '@tiptap/react'
import tippy, {Instance, Props} from 'tippy.js'
import {TaskTagDropdown} from '../components/TaskTagDropdown'

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
    // radix-ui also requires a trigger/anchor, which is why we use tippy
    render: () => {
      type GetReferenceClientRect = () => DOMRect
      let component: ReactRenderer<any, any> | undefined
      let popup: Instance<Props>

      return {
        onStart: (props) => {
          component = new ReactRenderer(TaskTagDropdown, {
            props,
            editor: props.editor
          })
          if (!props.clientRect) return
          popup = tippy(document.body, {
            animation: false,
            getReferenceClientRect: props.clientRect as GetReferenceClientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start'
          })
        },

        onUpdate(props) {
          component?.updateProps(props)
          if (!props.clientRect) return
          popup?.setProps({
            getReferenceClientRect: props.clientRect as GetReferenceClientRect
          })
        },

        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup?.hide()
            return true
          }
          return component?.ref?.onKeyDown(props)
        },

        onExit() {
          popup?.destroy()
          component?.destroy()
        }
      }
    }
  }
}
