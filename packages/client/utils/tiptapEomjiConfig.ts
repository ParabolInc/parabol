import {MentionNodeAttrs, MentionOptions} from '@tiptap/extension-mention'
import {ReactRenderer} from '@tiptap/react'
import tippy, {Instance, Props} from 'tippy.js'
import MentionDropdown from '../components/MentionDropdown'

export const tiptapEmojiConfig: Partial<MentionOptions<any, MentionNodeAttrs>> = {
  suggestion: {
    char: ':',
    items: async () => {
      return []
    },

    // Using radix-ui isn't possible here because radix-ui will steal focus from the editor when it opens the portal
    // radix-ui also requires a trigger/anchor, which is why we use tippy
    render: () => {
      type GetReferenceClientRect = () => DOMRect
      let component: ReactRenderer<any, any> | undefined
      let popup: Instance<Props>

      return {
        onStart: (props) => {
          component = new ReactRenderer(MentionDropdown, {
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
